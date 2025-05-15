import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Type } from '../enumeration/type.enumeration';

@Entity({ name: 'motions' })
export class Motion {
    @PrimaryGeneratedColumn({ name: '_idMotion', type: 'int' })
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'enum', enum: Type })
    type: Type;

    @Column({ type: 'int' })
    amount: number;

    @ManyToOne(() => Inventory, inventory => inventory.motions, { nullable: false, onDelete: 'CASCADE' })
    inventory: Inventory;
}
