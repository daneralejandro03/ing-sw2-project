import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'locations' })
@Index(['userId', 'createdAt'])

export class Location {
    @PrimaryGeneratedColumn({ type: 'int' })
    _locationId: number;

    @Column({ type: 'varchar', length: 50, nullable: false })
    userId: string;

    @Column({ type: 'double', nullable: false })
    latitude: number;

    @Column({ type: 'double', nullable: false })
    longitude: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
