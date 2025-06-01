import { Order } from 'src/orders/entities/order.entity';
export declare enum Type {
    ATTEMPTED = "attempted",
    ASSIGNED = "assigned",
    REJECTED = "rejected",
    UNASSIGNED = "unassigned"
}
export declare class Assignment {
    id: string;
    date: Date;
    status: Type;
    note: string;
    userDeliveryUser: string;
    orderId: string;
    order: Order;
}
