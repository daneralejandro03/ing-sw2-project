import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
export declare class ItemsService {
    private readonly repo;
    constructor(repo: Repository<Item>);
    create(dto: CreateItemDto): Promise<Item>;
    findAll(): Promise<Item[]>;
    findOne(id: string): Promise<Item>;
    update(id: string, dto: UpdateItemDto): Promise<Item>;
    remove(id: string): Promise<void>;
}
