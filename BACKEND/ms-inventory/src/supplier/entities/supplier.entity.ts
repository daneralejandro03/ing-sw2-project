import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm';
import { Provision } from '../../provision/entities/provision.entity';

@Entity({ name: 'suppliers' })
export class Supplier {
    @PrimaryGeneratedColumn({ name: '_idSupplier', type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => Provision, provision => provision.supplier, {
        cascade: true,
    })
    provision: Provision[];
}
