export class CreateAssignmentDto {
    date: string;             
    status: 'attempted' | 'assigned' | 'rejected' | 'unassigned';
    note?: string;
    userDeliveryUser: string; 
    orderId: string;          
  }