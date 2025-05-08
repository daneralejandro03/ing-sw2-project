import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Departament } from '../../departament/entities/departament.entity';
import { Store } from '../../store/entities/store.entity';

@Entity({ name: 'citys' })
export class City {
    @PrimaryGeneratedColumn({ name: '_idCity', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @ManyToOne(() => Departament, departament => departament.citys, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'departamentId' })
    departament: Departament;

    @OneToMany(() => Store, store => store.city, {
        cascade: true,
        onDelete: 'SET NULL',
    })
    stores: Store[];
}
