import React from "react";

export interface MapViewProps {
    driverPos: { lat: number; lng: number };
    storePos: { lat: number; lng: number };
}

declare const MapView: React.FC<MapViewProps>;
export default MapView;