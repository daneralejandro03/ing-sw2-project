import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { Order } from 'src/orders/entities/order.entity';
export declare class ItemsService {
    private readonly itemRepo;
    private readonly orderRepo;
    private readonly httpService;
    constructor(itemRepo: Repository<Item>, orderRepo: Repository<Order>, httpService: HttpService);
    create(orderId: string, productId: number, createItemDto: CreateItemDto): Promise<Item>;
    findAll(): Promise<Item[]>;
    findOne(id: string): Promise<Item>;
    update(id: string, updateData: Partial<CreateItemDto>): Promise<Item>;
    remove(id: string): Promise<void>;
}
