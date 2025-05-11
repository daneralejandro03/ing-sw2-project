import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';

@Entity({ name: 'provisions' })
@Unique(['product', 'supplier'])
export class Provision {
    @PrimaryGeneratedColumn({ name: '_idProvision', type: 'int' })
    id: number;

    @ManyToOne(() => Product, product => product.provision, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @ManyToOne(() => Supplier, supplier => supplier.provision, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'supplierId' })
    supplier: Supplier;

}
