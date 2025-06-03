import { useEffect, useRef } from "react";
import locationService from "../modules/location/services/locationService";
import type { Location } from "../modules/location/types/Location";

const DeliveryTracking = ({ userId }: { userId: string }) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const sendLocation = () => {
      if (!navigator.geolocation) {
        console.error("Geolocalización no soportada");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const payload: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          try {
            console.log(payload);
            console.log(userId);
            await locationService.create(payload, userId);
            console.log("Ubicación enviada:", JSON.stringify(payload));
          } catch (err) {
            console.error("Error al enviar ubicación", err);
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    };

    sendLocation();

    intervalRef.current = window.setInterval(sendLocation, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId]);

  return (
    <div>
      <h2>Rastreo en tiempo real activo</h2>
      <p>Enviando ubicación cada 30 segundos...</p>
    </div>
  );
};

export default DeliveryTracking;
