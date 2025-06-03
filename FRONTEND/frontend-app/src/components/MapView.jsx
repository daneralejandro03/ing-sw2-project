// src/components/MapView.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import { Truck, Store, Loader2 } from "lucide-react";

export default function MapView({ driverPos, storePos, dropPos }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const intervalRef = useRef(null);

  // Función para calcular ruta y actualizar distancia/duración
  const calculateRoute = () => {
    if (!window.google || !storePos || !driverPos) return;
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: storePos,
        destination: driverPos,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const route = result.routes[0].legs[0];
          setDistance(route.distance.text);
          setDuration(route.duration.text);
        } else {
          console.error("Error fetching directions", result);
        }
      }
    );
  };

  // Al cargar la librería y cuando cambien posiciones, calculamos ruta y arrancamos intervalo
  useEffect(() => {
    if (!isLoaded || !driverPos || !storePos) return;

    calculateRoute();

    // Limpiar cualquier intervalo previo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Recalcular cada 30 segundos
    intervalRef.current = setInterval(() => {
      calculateRoute();
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoaded, driverPos, storePos]);

  // Estado de error al cargar el mapa
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error loading map</p>
          <p>Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  // Estado de carga del mapa
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Estilos y opciones de mapa
  const mapContainerStyle = { width: "100%", height: "100%" };
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg h-full w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={storePos || driverPos}
        zoom={13}
        options={mapOptions}
      >
        {/* Marcador y ventana siempre visible de la Tienda */}
        {storePos && (
          <>
            <Marker
              position={storePos}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
                )}`,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16),
                backgroundColor: "#3B82F6",
              }}
            />
            <InfoWindow position={storePos}>
              <div className="flex items-center gap-2 py-1">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tienda</span>
              </div>
            </InfoWindow>
          </>
        )}

        {/* Marcador y ventana siempre visible del Repartidor */}
        {driverPos && (
          <>
            <Marker
              position={driverPos}
              icon={{
                url: `data:image/svg+xml,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path><path d="M6 12h.01"></path><path d="M18 12h.01"></path></svg>`
                )}`,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16),
                backgroundColor: "#22C55E",
              }}
            />
            <InfoWindow position={driverPos}>
              <div className="flex items-center gap-2 py-1">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Repartidor</span>
              </div>
            </InfoWindow>
          </>
        )}

        {/* Marcador del Destino (opcional) */}
        {dropPos && (
          <Marker
            position={dropPos}
            icon={{
              url: `data:image/svg+xml,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
              )}`,
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16),
              backgroundColor: "#EF4444",
            }}
          />
        )}

        {/* Renderizado de la ruta */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#3B82F6",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Panel de Distancia y Duración */}
      {distance && duration && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-600">Distancia</p>
              <p className="font-semibold">{distance}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-600">Duración</p>
              <p className="font-semibold">{duration}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Tienda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Repartidor</span>
          </div>
          {dropPos && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Destino</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
