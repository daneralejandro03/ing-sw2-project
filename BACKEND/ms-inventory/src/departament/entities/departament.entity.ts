import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'departaments' })
export class Departament {
    @PrimaryGeneratedColumn({ name: '_idDepartment', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => City, city => city.departament, {
        cascade: true,
        onDelete: 'SET NULL',
    })
    citys: City[];
}
