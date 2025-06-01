import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly orderRepo;
    private readonly httpService;
    constructor(orderRepo: Repository<Order>, httpService: HttpService);
    create(userGuestId: string, storeId: number, createOrderDto: CreateOrderDto, authToken: string): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateData: Partial<CreateOrderDto>, authToken: string): Promise<Order>;
    remove(id: string): Promise<void>;
}
