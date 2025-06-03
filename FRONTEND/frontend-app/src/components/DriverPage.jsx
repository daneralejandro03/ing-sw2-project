import React, { useEffect, useState } from "react";
import MapView from "./MapView";

const DriverPage = () => {
  // Posición iniciales (puedes cambiar a la real)
  const storePos = { lat: 5.0466, lng: -75.4856 };
  const dropPos = { lat: 5.0540, lng: -75.4885 };

  // Estado con posición actual del repartidor
  const [driverPos, setDriverPos] = useState({ lat: 5.0470, lng: -75.4895 });

  useEffect(() => {
  if (!navigator.geolocation) {
    console.error("Geolocalización no soportada");
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      setDriverPos({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error("Error obteniendo ubicación:", error);
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);


  return <MapView driverPos={driverPos} storePos={storePos} dropPos={dropPos} />;
};

export default DriverPage;
