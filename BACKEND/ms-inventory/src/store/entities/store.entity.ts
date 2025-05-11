import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { City } from '../../city/entities/city.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity({ name: 'stores' })
export class Store {
    @PrimaryGeneratedColumn({ name: '_idStore', type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 200 })
    address: string;

    @Column({ name: 'postalCode', type: 'varchar', length: 20 })
    postalCode: string;

    @Column({ type: 'float' })
    length: number;

    @Column({ type: 'float' })
    latitude: number;

    @Column({ type: 'int' })
    capacity: number;

    @Column({ type: 'varchar', length: 20 })
    state: string;

    @ManyToOne(() => City, city => city.stores, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'cityId' })
    city: City;

    @Column({ type: 'varchar', length: 50 })
    userId: string;


    @OneToMany(() => Inventory, inventory => inventory.store, { cascade: true })
    inventory: Inventory[];

}
