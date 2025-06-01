// src/geo-assignment/entities/geo-assignment.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
} from 'typeorm';
import { Route } from '../../route/entities/route.entity';

@Entity({ name: 'geo_assignments' })
export class GeoAssignment {
    @PrimaryGeneratedColumn({ type: 'int' })
    geoAssignmentId: number;

    /**
     * ID de la asignación que vive en ms-Orders.
     * Lo guardamos como VARCHAR(36) para poder almacenar UUIDs.
     */
    @Column({ type: 'varchar', length: 36, unique: true, nullable: false })
    assignmentId: string;

    /**
     * Distancia (en metros) desde la ubicación actual del repartidor
     * hasta el almacén (pickup).
     */
    @Column({ type: 'double', nullable: false })
    distanceToPickup: number;

    /**
     * Distancia (en metros) desde el almacén (pickup) hasta la dirección
     * final del cliente (drop-off).
     */
    @Column({ type: 'double', nullable: false })
    distanceToDrop: number;

    /**
     * Fecha de creación del registro.
     */
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    /**
     * Relación 1:1 con Route.
     * - cascade: true  → al guardar un GeoAssignment, se guarda la Route que tenga asignada en memoria.
     * - eager: true    → al leer un GeoAssignment, TypeORM traerá automáticamente el Route asociado.
     * 
     * NOTA: NO colocamos @JoinColumn acá, para que la FK quede únicamente en la tabla "routes".
     */
    @OneToOne(() => Route, (route) => route.geoAssignment, {
        cascade: true,
        eager: true,
    })
    route: Route;
}
