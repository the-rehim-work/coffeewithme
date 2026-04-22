"use client";

import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

const LIBRARIES: ("places")[] = ["places"];

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a0f0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a0f0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c8956c" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d4a06a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9c5a1a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#2d1f17" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b3f2a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#3d2a1e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2d1507" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#6b3f2a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4a2515" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f5e6d3" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2d1f17" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9c5a1a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d0805" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a2515" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0d0805" }],
  },
];

interface MapPickerProps {
  lat?: number;
  lng?: number;
  locationName?: string;
  readonly?: boolean;
  onSelect?: (lat: number, lng: number, name: string) => void;
}

export default function MapPicker({
  lat,
  lng,
  locationName,
  readonly = false,
  onSelect,
}: MapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const defaultCenter = marker ?? { lat: 40.7128, lng: -74.006 };

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (readonly || !e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarker({ lat: newLat, lng: newLng });

      geocoderRef.current?.geocode(
        { location: { lat: newLat, lng: newLng } },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            const name = results[0].formatted_address
              .split(",")
              .slice(0, 2)
              .join(", ")
              .trim();
            onSelect?.(newLat, newLng, name);
          } else {
            onSelect?.(
              newLat,
              newLng,
              `${newLat.toFixed(5)}, ${newLng.toFixed(5)}`
            );
          }
        }
      );
    },
    [readonly, onSelect]
  );

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const newLat = place.geometry.location.lat();
    const newLng = place.geometry.location.lng();
    const name =
      place.name ||
      place.formatted_address?.split(",").slice(0, 2).join(", ") ||
      "";

    setMarker({ lat: newLat, lng: newLng });
    map?.panTo({ lat: newLat, lng: newLng });
    map?.setZoom(15);
    onSelect?.(newLat, newLng, name);
  }, [map, onSelect]);

  if (!isLoaded) {
    return (
      <div
        className="w-full rounded-2xl bg-dark-elevated border border-dark-border flex items-center justify-center"
        style={{ height: readonly ? 240 : 320 }}
      >
        <span className="text-coffee-700 text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!readonly && (
        <Autocomplete
          onLoad={(ac) => {
            autocompleteRef.current = ac;
          }}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a coffee shop, address, or place…"
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-coffee-100 placeholder-coffee-700 focus:outline-none focus:border-coffee-500 transition-colors text-sm"
          />
        </Autocomplete>
      )}

      {locationName && (
        <p className="text-coffee-400 text-sm flex items-center gap-2">
          <span className="text-coffee-500">📍</span>
          {locationName}
        </p>
      )}

      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: readonly ? 240 : 320,
          borderRadius: "1rem",
          border: "1px solid #3d2a1e",
          overflow: "hidden",
        }}
        center={defaultCenter}
        zoom={marker ? 15 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          styles: DARK_MAP_STYLE,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: !readonly,
          gestureHandling: readonly ? "none" : "auto",
        }}
      >
        {marker && (
          <Marker
            position={marker}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#c8956c",
              fillOpacity: 1,
              strokeColor: "#f5e6d3",
              strokeWeight: 2.5,
            }}
          />
        )}
      </GoogleMap>

      {!readonly && (
        <p className="text-coffee-700 text-xs text-center">
          Search above or click anywhere on the map
        </p>
      )}
    </div>
  );
}
