import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function MapView({ driverPos, storePos, dropPos }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [directions, setDirections] = useState(null);

  useEffect(() => {
  if (!isLoaded) return;  
  if (!driverPos || !storePos) return;

  const directionsService = new window.google.maps.DirectionsService();

  directionsService.route(
    {
      origin: storePos,
      destination: driverPos,
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        console.error("Error fetching directions", result);
      }
    }
  );
}, [driverPos, storePos, isLoaded]);


  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={storePos || driverPos}
      zoom={13}
    >
      {storePos && <Marker position={storePos} label="Tienda" />}
      {driverPos && <Marker position={driverPos} label="Conductor" />}

      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
