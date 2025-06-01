import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Item } from 'src/items/entities/item.entity';
export declare class OrderService {
    private readonly repo;
    private readonly itemsRepo;
    private readonly assignmentsRepo;
    constructor(repo: Repository<Order>, itemsRepo: Repository<Item>, assignmentsRepo: Repository<Assignment>);
    create(dto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, dto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<void>;
    associateItem(orderId: string, itemId: string): Promise<Item>;
    associateAssignment(orderId: string, assignmentId: string): Promise<Assignment>;
}
