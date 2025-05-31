import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

export enum Type {
  ATTEMPTED = 'attempted',
  ASSIGNED = 'assigned',
  REJECTED = 'rejected',
  UNASSIGNED = 'unassigned',
}

@Entity({ name: 'assignments' })
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column({
    type: 'enum',
    enum: Type,
  })
  status: Type;

  @Column()
  note: string;

  @Column()
  userDeliveryUser: string;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
