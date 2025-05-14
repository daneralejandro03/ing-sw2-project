import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Category } from '../../category/entities/category.entity';
import { Provision } from '../../provision/entities/provision.entity';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn({ name: '_idProduct', type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'float' })
    unitPrice: number;

    @Column({ type: 'int' })
    stock: number;

    @Column({ type: 'int' })
    levelReorder: number;

    @Column({ type: 'text' })
    sku: string;

    @Column({ type: 'text' })
    barcode: string;

    @Column({ type: 'timestamp' })
    dateEntry: Date;

    @Column({ type: 'timestamp', nullable: true })
    expirationDate: Date;

    @Column({ type: 'float' })
    weightKg: number;

    @Column({ type: 'float' })
    lengthCm: number;

    @Column({ type: 'float' })
    widthCm: number;

    @Column({ type: 'float' })
    heightCm: number;

    @Column({ type: 'boolean', default: false })
    isFragile: boolean;

    @Column({ name: 'requiresRefrigeration', type: 'boolean', default: false })
    requiresRefurbishment: boolean;

    @Column({ type: 'varchar', length: 50 })
    status: string;

    @OneToMany(() => Inventory, inventory => inventory.product, {
        cascade: true,
    })
    inventory: Inventory[];

    @ManyToOne(() => Category, category => category.products, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @OneToMany(() => Provision, provision => provision.product, {
        cascade: true,
    })
    provision: Provision[];

}
