import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import locationService from "../../location/services/locationService";
import storeService from "../../storeModule/services/storeService";
import MapView from "../../../components/MapView";
import { Loader2, Store, MapPin } from "lucide-react";

interface RouteState {
  driverId: string;
  storeId: string;
  storePos: { lat: number; lng: number };
}

interface StoreData {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const OrderTrackingView: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: RouteState };
  const { driverId, storeId, storePos } = state;

  const [driverPos, setDriverPos] = useState(storePos);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await storeService.get(storeId);
        setStoreData(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al traer la tienda:", error);
        setError("No se pudo cargar la información de la tienda");
        setIsLoading(false);
      }
    };
    fetchStore();
  }, [storeId]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const locs = await locationService.getLocationsByUserId(driverId);
        if (locs.length) {
          const last = locs[locs.length - 1];
          setDriverPos({ lat: last.latitude, lng: last.longitude });
        }
      } catch (error) {
        console.error("Error al obtener la ubicación del repartidor:", error);
      }
    };
    fetch();
    const iv = setInterval(fetch, 15000);
    return () => clearInterval(iv);
  }, [driverId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Seguimiento de Orden #{orderId}
            </h1>
            <br />
            {storeData && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Store className="h-5 w-5" />
                <span>{storeData.name}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="mt-2 text-gray-600">Cargando información...</p>
                </div>
              </div>
            ) : (
              storeData && (
                <div className="space-y-6">
                  {/* Info de Tienda */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Store className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h3 className="font-medium text-blue-900">
                          Información de la Tienda
                        </h3>
                        <p className="text-blue-700 mt-1">
                          {storeData.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map Container — Aumentado a h-[85vh] md:h-[90vh] */}
                  <div className="h-[85vh] md:h-[90vh]">
                    <MapView
                      driverPos={driverPos}
                      storePos={{
                        lat: storeData.latitude,
                        lng: storeData.longitude,
                      }}
                    />
                  </div>

                  {/* Tracking Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <p className="text-gray-600">
                        Actualizando ubicación cada 15 segundos
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingView;
