export class CreateAssignmentDto {
  date: string;
  status: 'attempted' | 'assigned' | 'rejected' | 'unassigned';
  note?: string;
  userDeliveryDriver: string;
  orderId: string;
}