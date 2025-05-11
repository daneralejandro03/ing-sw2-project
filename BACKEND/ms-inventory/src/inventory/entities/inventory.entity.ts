import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('inventory')
@Unique(['store', 'product'])
export class Inventory {
    @PrimaryGeneratedColumn({ name: '_idInventory', type: 'int' })
    id: number;

    @ManyToOne(() => Store, store => store.inventory, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @ManyToOne(() => Product, product => product.inventory, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    product: Product;
}
