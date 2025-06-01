import { Type as AssignmentType } from '../entities/assignment.entity';
export declare class UpdateAssignmentDto {
    date?: string;
    status?: AssignmentType;
    note?: string;
    userDeliveryUser?: string;
    orderId?: string;
}
