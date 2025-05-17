import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity({ name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn({ name: '_idCategory', type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => Product, product => product.category, {
        cascade: true,
    })
    products: Product[];
}
