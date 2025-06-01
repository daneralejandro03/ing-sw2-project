import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(userGuestId: string, storeId: number, authHeader: string, createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, authHeader: string, updateData: Partial<CreateOrderDto>): Promise<Order>;
    remove(id: string): Promise<void>;
}
