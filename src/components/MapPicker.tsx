"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

function createMarkerEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 22px;
    height: 22px;
    cursor: pointer;
  `;
  el.innerHTML = `
    <div style="
      width:22px;height:22px;
      background:#c8956c;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2.5px solid #f5e6d3;
      box-shadow:0 3px 14px rgba(0,0,0,0.55);
    "></div>`;
  return el;
}

function formatSuggestion(f: PhotonFeature): string {
  const p = f.properties;
  return [
    p.name,
    p.street && p.housenumber ? `${p.street} ${p.housenumber}` : p.street,
    p.city,
    p.country,
  ]
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
}

function formatShortName(f: PhotonFeature): string {
  const p = f.properties;
  return [p.name || p.street, p.city].filter(Boolean).slice(0, 2).join(", ");
}

const PLACE_ICONS: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  bar: "🍺",
  fast_food: "🍔",
  hotel: "🏨",
  park: "🌳",
  shop: "🛍️",
  default: "📍",
};

export default function MapPicker({
  lat,
  lng,
  locationName,
  readonly = false,
  onSelect,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultLng = lng ?? -74.006;
  const defaultLat = lat ?? 40.7128;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [defaultLng, defaultLat],
      zoom: lat ? 15 : 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    if (!readonly) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    }

    map.on("load", () => {
      if (lat && lng) {
        const marker = new maplibregl.Marker({ element: createMarkerEl(), anchor: "bottom" })
          .setLngLat([lng, lat])
          .addTo(map);
        markerRef.current = marker;
      }
    });

    if (!readonly) {
      map.getCanvas().style.cursor = "crosshair";

      map.on("click", async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;

        if (markerRef.current) {
          markerRef.current.setLngLat([clickLng, clickLat]);
        } else {
          markerRef.current = new maplibregl.Marker({
            element: createMarkerEl(),
            anchor: "bottom",
          })
            .setLngLat([clickLng, clickLat])
            .addTo(map);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${clickLat}&lon=${clickLng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address;
          const name =
            [
              addr?.road || addr?.pedestrian || addr?.amenity,
              addr?.city || addr?.town || addr?.village,
            ]
              .filter(Boolean)
              .join(", ") ||
            data.display_name?.split(",").slice(0, 2).join(", ") ||
            `${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`;
          onSelect?.(clickLat, clickLng, name);
        } catch {
          onSelect?.(clickLat, clickLng, `${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`);
        }
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSearch(true);
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
        setLoadingSearch(false);
      }
    }, 280);
  }, []);

  const selectSuggestion = useCallback(
    (f: PhotonFeature) => {
      const [sLng, sLat] = f.geometry.coordinates;
      const name = formatShortName(f);
      const map = mapRef.current;
      if (!map) return;

      map.flyTo({ center: [sLng, sLat], zoom: 15, duration: 900, essential: true });

      if (markerRef.current) {
        markerRef.current.setLngLat([sLng, sLat]);
      } else {
        markerRef.current = new maplibregl.Marker({
          element: createMarkerEl(),
          anchor: "bottom",
        })
          .setLngLat([sLng, sLat])
          .addTo(map);
      }

      onSelect?.(sLat, sLng, name);
      setQuery(formatSuggestion(f));
      setShowDropdown(false);
      setSuggestions([]);
    },
    [onSelect]
  );

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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
              placeholder="Search for a café, address, or neighbourhood…"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-4 pr-10 py-3 text-coffee-100 placeholder-coffee-700 focus:outline-none focus:border-coffee-500 transition-colors text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {loadingSearch ? (
                <svg className="w-4 h-4 text-coffee-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl">
              {suggestions.map((f, i) => {
                const icon = PLACE_ICONS[f.properties.osm_value ?? ""] ?? PLACE_ICONS.default;
                const full = formatSuggestion(f);
                const short = f.properties.name;
                const sub = full.replace(short ? short + ", " : "", "").slice(0, 64);
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectSuggestion(f)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-dark-elevated transition-colors border-b border-dark-border last:border-0"
                  >
                    <span className="text-base mt-0.5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-coffee-100 text-sm font-medium truncate">{short || sub}</p>
                      {short && sub && (
                        <p className="text-coffee-600 text-xs truncate mt-0.5">{sub}</p>
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
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-dark-border"
        style={{ height: readonly ? 240 : 320 }}
      />

      {!readonly && (
        <p className="text-coffee-800 text-xs text-center">
          Search above or click anywhere on the map
        </p>
      )}
    </div>
  );
}
