import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Item } from 'src/items/entities/item.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.UNASSIGNED,
  })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 3,
  })
  currency: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  address1: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address2?: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  department: string;

  @Column({
    type: 'int',
  })
  postalCode: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  instructions?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'varchar',
    length: 36,
  })
  userGuestId: string;

  @Column({
    type: 'int',
  })
  storeId: number;

  @OneToMany(() => Item, (item) => item.order, { cascade: true })
  items: Item[];

  @OneToMany(() => Assignment, (assignment) => assignment.order, { cascade: true })
  assignments: Assignment[];
}
