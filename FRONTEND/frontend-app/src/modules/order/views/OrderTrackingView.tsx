import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import locationService from "../../location/services/locationService";
import storeService from "../../storeModule/services/storeService";
// @ts-ignore
import MapView from "../../../components/MapView";

interface RouteState {
  driverId: string;
  storeId: string;
  storePos: { lat: number; lng: number };
  // dropPos?: { lat: number; lng: number };
}

const OrderTrackingView: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: RouteState };
  const { driverId, storeId, storePos } = state;

  const [driverPos, setDriverPos] = useState(storePos);
  const [storeData, setStoreData] = useState<any>(null); // estado para info tienda

  useEffect(() => {
    // Traer info de la tienda al montar el componente
    const fetchStore = async () => {
      try {
        const response = await storeService.get(storeId);
        setStoreData(response);
        console.log("Tienda: ", response);
      } catch (error) {
        console.error("Error al traer la tienda:", error);
      }
    };
    fetchStore();
  }, [storeId]);

  useEffect(() => {
    const fetch = async () => {
      const locs = await locationService.getLocationsByUserId(driverId);
      if (locs.length) {
        const last = locs[locs.length - 1];
        setDriverPos({ lat: last.latitude, lng: last.longitude });
      }
    };
    fetch();
    const iv = setInterval(fetch, 15000);
    return () => clearInterval(iv);
  }, [driverId]);

 return (
  <div style={{ padding: 16 }}>
    <h2>Seguimiento Orden {orderId}</h2>
    {!storeData ? (
      <p>Cargando datos de la tienda...</p>
    ) : (
      <MapView
        driverPos={driverPos}
        storePos={{ lat: storeData.latitude, lng: storeData.longitude }}
      />
    )}
  </div>
);


};

export default OrderTrackingView;
