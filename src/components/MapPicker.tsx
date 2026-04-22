"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    country?: string;
    osm_value?: string;
  };
}

interface MapPickerProps {
  lat?: number;
  lng?: number;
  locationName?: string;
  readonly?: boolean;
  onSelect?: (lat: number, lng: number, name: string) => void;
}

function buildMarkerIcon() {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;
      background:#c8956c;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2.5px solid #f5e6d3;
      box-shadow:0 2px 10px rgba(0,0,0,0.6)">
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    className: "",
  });
}

function formatSuggestion(f: PhotonFeature): string {
  const p = f.properties;
  const parts = [
    p.name,
    p.street && p.housenumber ? `${p.street} ${p.housenumber}` : p.street,
    p.city,
    p.country,
  ].filter(Boolean);
  return parts.slice(0, 3).join(", ");
}

function formatShortName(f: PhotonFeature): string {
  const p = f.properties;
  return [p.name || p.street, p.city].filter(Boolean).slice(0, 2).join(", ");
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

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultLat = lat ?? 40.7128;
  const defaultLng = lng ?? -74.006;

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: lat ? 15 : 12,
      zoomControl: true,
      scrollWheelZoom: !readonly,
      dragging: !readonly,
      touchZoom: !readonly,
      doubleClickZoom: !readonly,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], {
        icon: buildMarkerIcon(),
      }).addTo(map);
    }

    if (!readonly) {
      map.on("click", async (e) => {
        const { lat: lt, lng: ln } = e.latlng;
        placeMarker(map, lt, ln);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lt}&lon=${ln}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address;
          const name = [
            addr?.road || addr?.pedestrian,
            addr?.city || addr?.town || addr?.village,
          ]
            .filter(Boolean)
            .join(", ") || data.display_name?.split(",").slice(0, 2).join(", ");
          onSelect?.(lt, ln, name);
        } catch {
          onSelect?.(lt, ln, `${lt.toFixed(5)}, ${ln.toFixed(5)}`);
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

  function placeMarker(map: L.Map, lt: number, ln: number) {
    if (markerRef.current) {
      markerRef.current.setLatLng([lt, ln]);
    } else {
      markerRef.current = L.marker([lt, ln], {
        icon: buildMarkerIcon(),
      }).addTo(map);
    }
  }

  // Debounced Photon autocomplete
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSuggestions([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setShowDropdown(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=6&lang=en`
          );
          const data = await res.json();
          setSuggestions(data.features ?? []);
          setShowDropdown(true);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  const selectSuggestion = useCallback(
    (f: PhotonFeature) => {
      const [ln, lt] = f.geometry.coordinates;
      const name = formatShortName(f);
      const map = mapInstanceRef.current;
      if (!map) return;

      map.flyTo([lt, ln], 15, { duration: 0.8 });
      placeMarker(map, lt, ln);
      onSelect?.(lt, ln, name);
      setQuery(formatSuggestion(f));
      setShowDropdown(false);
      setSuggestions([]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const PLACE_ICONS: Record<string, string> = {
    cafe: "☕",
    restaurant: "🍽️",
    bar: "🍺",
    fast_food: "🍔",
    hotel: "🏨",
    park: "🌳",
    default: "📍",
  };

  return (
    <div className="space-y-3">
      {!readonly && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search for a café, address, or place…"
              autoComplete="off"
              className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-4 pr-10 py-3 text-coffee-100 placeholder-coffee-700 focus:outline-none focus:border-coffee-500 transition-colors text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <svg
                  className="w-4 h-4 text-coffee-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-coffee-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </div>

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl">
              {suggestions.map((f, i) => {
                const icon =
                  PLACE_ICONS[f.properties.osm_value ?? ""] ??
                  PLACE_ICONS.default;
                const full = formatSuggestion(f);
                const short = f.properties.name;
                const sub = full
                  .replace(short ? short + ", " : "", "")
                  .slice(0, 60);
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectSuggestion(f)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-dark-elevated transition-colors border-b border-dark-border last:border-0"
                  >
                    <span className="text-base mt-0.5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-coffee-100 text-sm font-medium truncate">
                        {short || sub}
                      </p>
                      {short && (
                        <p className="text-coffee-600 text-xs truncate mt-0.5">
                          {sub}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {locationName && (
        <p className="text-coffee-400 text-sm flex items-center gap-2">
          <span>📍</span>
          <span className="truncate">{locationName}</span>
        </p>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-dark-border"
        style={{ height: readonly ? 240 : 320 }}
      />

      {!readonly && (
        <p className="text-coffee-800 text-xs text-center">
          Search above or click on the map to pick a location
        </p>
      )}
    </div>
  );
}
