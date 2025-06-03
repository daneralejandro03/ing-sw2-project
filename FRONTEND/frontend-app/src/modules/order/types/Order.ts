export type OrderStatus = 'attempted' | 'assigned' | 'rejected' | 'unassigned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'cash';

export interface Order {
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  address1: string;
  address2: string;
  city: string;
  department: string;
  postalCode: number;
  instructions: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}
