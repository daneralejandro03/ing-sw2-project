// src/segments/entities/segment.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Route } from '../../route/entities/route.entity';

@Entity({ name: 'segments' })
export class Segment {
    @PrimaryGeneratedColumn({ type: 'int' })
    segmentId: number;

    @Column({ type: 'int', nullable: false })
    sequence: number;

    @Column({ type: 'double', nullable: false })
    latitude: number;

    @Column({ type: 'double', nullable: false })
    longitude: number;

    /**
     * Cada Segment pertenece a exactamente un Route.
     * Desde el lado “1” (Route) ya definimos @OneToMany(() => Segment, …),
     * aquí en el lado “N” usamos @ManyToOne para apuntar a Route.
     *
     * onDelete: 'CASCADE' → si se elimina la ruta, sus segmentos se borran.
     * joinColumn `name: 'routeId'` crea la columna routes_fk (routeId) en la tabla segments.
     */
    @ManyToOne(() => Route, (route) => route.segments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'routeId', referencedColumnName: 'routeId' })
    route: Route;
}
