import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column('decimal')
  unitPrice: number;

  @Column('decimal')
  totalPrice: number;

  @ManyToOne(() => Order, (order) => order.id, { eager: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  product: string;
}
