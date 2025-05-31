import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Item } from 'src/items/entities/item.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';


@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: boolean;

  @Column('decimal')
  totalAmount: number;

  @Column()
  currency: string;

  @Column()
  address1: string;

  @Column()
  address2: string;

  @Column()
  city: string;

  @Column()
  department: string;

  @Column()
  postalCode: string;

  @Column()
  instructions: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus
  })
  paymentStatus: PaymentStatus;

  @Column()
  userGuest: string;

  @Column()
  userDeliveryDriver: string;

  @OneToMany(() => Item, (item) => item.order, { cascade: true })
  items: Item[];

  @OneToMany(() => Assignment, (assignment) => assignment.order, { cascade: true })
  assignments: Assignment[];
}






