import { Order } from 'src/orders/entities/order.entity';
export declare class Item {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    order: Order;
    productId: number;
}
