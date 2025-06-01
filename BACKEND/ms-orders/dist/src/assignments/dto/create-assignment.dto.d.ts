import { OrderStatus } from 'src/shared/enums/order-status.enum';
export declare class CreateAssignmentDto {
    status: OrderStatus;
    note: string;
    date: Date;
}
