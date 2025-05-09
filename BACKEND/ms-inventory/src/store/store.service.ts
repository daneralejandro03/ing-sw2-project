import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Store } from './entities/store.entity';
import { City } from '../city/entities/city.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UserClientService } from '../user-client/user-client.service';
import { UserTokenDto } from '../user-client/dto/user-token.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(City) private readonly cityRepo: Repository<City>,
    private readonly userClient: UserClientService,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateStoreDto, token: string): Promise<Store> {
    const {
      name,
      address,
      postalCode,
      length,
      latitude,
      capacity,
      state,
      cityId,
      userId,
    } = dto;

    if (capacity <= 0) {
      throw new BadRequestException('Capacity debe ser un número positivo');
    }

    const city = await this.cityRepo.findOne({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException(`City #${cityId} not found`);
    }

    await this.userClient.verifyUserExists(userId, token);

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const store = runner.manager.create(Store, {
        name,
        address,
        postalCode,
        length,
        latitude,
        capacity,
        state,
        city,
        userId,
      });
      const saved = await runner.manager.save(store);

      await this.userClient.addStoreToUser(userId, saved.id, token);

      await runner.commitTransaction();
      return saved;
    } catch (err) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException('Error creando la tienda: ' + err);
    } finally {
      await runner.release();
    }
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepo.find();
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['city'],
    });
    if (!store) throw new NotFoundException(`Store #${id} not found`);
    return store;
  }

  async update(
    id: number,
    dto: UpdateStoreDto,
  ): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    if (dto.cityId) {
      const city = await this.cityRepo.findOne({ where: { id: dto.cityId } });
      if (!city) throw new NotFoundException(`City #${dto.cityId} not found`);
      store.city = city;
    }
    return this.storeRepo.save(store);
  }

  async remove(id: number, token: string): Promise<void> {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store #${id} not found`);
    }

    const runner: QueryRunner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      await this.userClient.removeStoreFromUser(store.userId, id, token);

      const result = await runner.manager.delete(Store, id);
      if (result.affected === 0) {
        throw new NotFoundException(`Store #${id} not found`);
      }

      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      throw new InternalServerErrorException(`Error eliminando la tienda: ${err}`);
    } finally {
      await runner.release();
    }
  }

  async findAllUsers(token: string): Promise<UserTokenDto[]> {
    const users = await this.userClient.findAll(token);
    return users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
    }));
  }
}
