// src/route/entities/route.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { GeoAssignment } from '../../geo-assignment/entities/geo-assignment.entity';
import { Segment } from '../../segment/entities/segment.entity';

@Entity({ name: 'routes' })
export class Route {
    @PrimaryGeneratedColumn({ type: 'int' })
    routeId: number;

    /**
     * Clave foránea a geo_assignments.geoAssignmentId.
     * - unique: true  → asegura 1:1 (un GeoAssignment solo puede tener una Route).
     * - nullable: false → siempre debe existir un GeoAssignment asociado.
     */
    @Column({ type: 'int', unique: true, nullable: false })
    geoAssignmentId: number;

    /**
     * Latitud y longitud de origen (normalmente el almacén).
     */
    @Column({ type: 'double', nullable: false })
    originLat: number;

    @Column({ type: 'double', nullable: false })
    originLng: number;

    /**
     * Latitud y longitud de destino (dirección del cliente).
     */
    @Column({ type: 'double', nullable: false })
    destinationLat: number;

    @Column({ type: 'double', nullable: false })
    destinationLng: number;

    /**
     * Distancia total de la ruta en metros (Google Directions o Haversine).
     */
    @Column({ type: 'double', nullable: false })
    distanceMeters: number;

    /**
     * Duración total estimada (en segundos).
     */
    @Column({ type: 'int', nullable: false })
    durationSeconds: number;

    /**
     * ID del almacén de donde parte la ruta (storeId).
     */
    @Column({ type: 'int', nullable: false })
    pickupFromStore: number;

    /**
     * Fecha de creación automática.
     */
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    /**
     * Relación 1:1 → Un Route “pertenece” a un GeoAssignment.
     * El @JoinColumn indica que la columna geoAssignmentId de esta tabla
     * es la FK que apunta a geo_assignments.geoAssignmentId.
     * onDelete: 'CASCADE' → si se borra el GeoAssignment, la Route se borra automáticamente.
     */
    @OneToOne(() => GeoAssignment, (geo) => geo.route, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'geoAssignmentId',           // la columna en esta tabla
        referencedColumnName: 'geoAssignmentId', // la PK de geo_assignments
    })
    geoAssignment: GeoAssignment;

    /**
     * Relación 1:N con Segment.
     * - cascade: false (no se insertan/actualizan segmentos desde Route).
     * - eager: true   (al leer la ruta, trae también sus segmentos).
     */
    @OneToMany(() => Segment, (segment) => segment.route, {
        cascade: false,
        eager: true,
    })
    segments: Segment[];
}
