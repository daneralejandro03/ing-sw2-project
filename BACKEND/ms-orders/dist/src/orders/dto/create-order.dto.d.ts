import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
export declare class CreateOrderDto {
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    address1: string;
    address2?: string;
    city: string;
    department: string;
    postalCode: number;
    instructions?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
}
