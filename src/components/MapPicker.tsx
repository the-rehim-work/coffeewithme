"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);

  const defaultLat = lat ?? 40.7128;
  const defaultLng = lng ?? -74.006;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const icon = L.divIcon({
      html: `<div style="background:#c8956c;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #f5e6d3;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      className: "",
    });

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: lat ? 14 : 12,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 19,
      }
    ).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }

    if (!readonly) {
      map.on("click", async (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon }).addTo(
            map
          );
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${clickLat}&lon=${clickLng}&format=json`
          );
          const data = await res.json();
          const name =
            data.display_name?.split(",").slice(0, 2).join(", ") ??
            `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`;
          onSelect?.(clickLat, clickLng, name);
        } catch {
          onSelect?.(
            clickLat,
            clickLng,
            `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`
          );
        }
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (s: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const lt = parseFloat(s.lat);
    const ln = parseFloat(s.lon);
    const map = mapInstanceRef.current;
    if (!map) return;

    const icon = L.divIcon({
      html: `<div style="background:#c8956c;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #f5e6d3;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      className: "",
    });

    map.flyTo([lt, ln], 15, { duration: 1 });

    if (markerRef.current) {
      markerRef.current.setLatLng([lt, ln]);
    } else {
      markerRef.current = L.marker([lt, ln], { icon }).addTo(map);
    }

    const name = s.display_name.split(",").slice(0, 2).join(", ");
    onSelect?.(lt, ln, name);
    setSuggestions([]);
    setSearch(name);
  };

  return (
    <div className="space-y-3">
      {!readonly && (
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search location..."
              className="flex-1 bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-coffee-100 placeholder-coffee-700 focus:outline-none focus:border-coffee-500 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="bg-coffee-800 hover:bg-coffee-700 text-coffee-100 px-4 py-3 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-dark-elevated border border-dark-border rounded-xl overflow-hidden shadow-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-sm text-coffee-200 hover:bg-dark-card transition-colors border-b border-dark-border last:border-0 truncate"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {locationName && (
        <p className="text-coffee-400 text-sm flex items-center gap-2">
          <span className="text-coffee-500">📍</span>
          {locationName}
        </p>
      )}
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-dark-border"
        style={{ height: readonly ? "240px" : "320px" }}
      />
      {!readonly && (
        <p className="text-coffee-700 text-xs text-center">
          Click on the map or search to set the meeting location
        </p>
      )}
    </div>
  );
}
