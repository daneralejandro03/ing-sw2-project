import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  // --------------------------------------------
  // Relación ManyToOne con Order; crea columna orderId
  // --------------------------------------------
  @ManyToOne(() => Order, (order) => order.items, { eager: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  // --------------------------------------------
  // productId es number que viene de Inventario
  // --------------------------------------------
  @Column({ type: 'int' })
  productId: number;
}
