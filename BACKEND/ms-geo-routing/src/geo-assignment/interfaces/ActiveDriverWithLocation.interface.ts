import { Location } from "src/location/entities/location.entity";

export interface ActiveDriverWithLocation {
    id: string;
    email: string;
    location: Location | null;
    distanceToStore?: number;
}