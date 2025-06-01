import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { CreateItemDto } from 'src/items/dto/create-item.dto';
import { CreateAssignmentDto } from 'src/assignments/dto/create-assignment.dto';
export declare class UpdateOrderDto {
    status?: boolean;
    totalAmount?: number;
    currency?: string;
    address1?: string;
    address2?: string;
    city?: string;
    department?: string;
    postalCode?: string;
    instructions?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    userGuest?: string;
    userDeliveryDriver?: string;
    items?: CreateItemDto[];
    assignments?: CreateAssignmentDto[];
}
