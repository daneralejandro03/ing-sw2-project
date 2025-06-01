import { Order } from 'src/orders/entities/order.entity';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
export declare class Assignment {
    id: string;
    date: Date;
    status: OrderStatus;
    note: string;
    userDeliveryDriver: string;
    order: Order;
}
