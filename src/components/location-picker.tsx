"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_MAP_VIEW, OPEN_FREE_MAP_STYLE_URL } from "@/lib/constants";

type PickupLocation = {
  latitude: number;
  longitude: number;
} | null;

type MapLibreModule = typeof import("maplibre-gl");

type LocationPickerProps = {
  error?: string;
  neighborhood?: string;
  value: PickupLocation;
  onChange: (value: PickupLocation) => void;
};

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

export function LocationPicker({ error, neighborhood, value, onChange }: LocationPickerProps) {
  const initialValueRef = useRef(value);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markerRef = useRef<import("maplibre-gl").Marker | null>(null);
  const maplibreRef = useRef<MapLibreModule | null>(null);
  const onChangeRef = useRef(onChange);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const maplibre = await import("maplibre-gl");

      if (!isMounted || !containerRef.current) {
        return;
      }

      maplibreRef.current = maplibre;

      const initialCenter: [number, number] = initialValueRef.current
        ? [initialValueRef.current.longitude, initialValueRef.current.latitude]
        : [DEFAULT_MAP_VIEW.longitude, DEFAULT_MAP_VIEW.latitude];

      const map = new maplibre.Map({
        container: containerRef.current,
        style: OPEN_FREE_MAP_STYLE_URL,
        center: initialCenter,
        zoom: initialValueRef.current ? 13 : DEFAULT_MAP_VIEW.zoom
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      map.on("click", (event) => {
        const nextValue = {
          latitude: roundCoordinate(event.lngLat.lat),
          longitude: roundCoordinate(event.lngLat.lng)
        };

        onChangeRef.current(nextValue);
      });

      map.once("load", () => {
        if (isMounted) {
          setIsMapReady(true);
        }
      });
      mapRef.current = map;
    }

    void initializeMap();

    return () => {
      isMounted = false;
      setIsMapReady(false);
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;

    if (!isMapReady || !map || !maplibre) {
      return;
    }

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const lngLat: [number, number] = [value.longitude, value.latitude];

    if (!markerRef.current) {
      markerRef.current = new maplibre.Marker({
        color: "#117565"
      })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    map.easeTo({
      center: lngLat,
      zoom: Math.max(map.getZoom(), 13),
      duration: 600
    });
  }, [isMapReady, value]);

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support geolocation.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextValue = {
          latitude: roundCoordinate(position.coords.latitude),
          longitude: roundCoordinate(position.coords.longitude)
        };

        onChange(nextValue);
        setIsLocating(false);
        toast.success("Location pin added to your listing.");
      },
      () => {
        setIsLocating(false);
        toast.error("We couldn’t access your location. You can still click the map to drop a pin.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-canvas p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Exact pickup point</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Choose the exact pickup point that should appear on the browse map. You can use your current location or
            click anywhere on the map to place the pin precisely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLocating}
            onClick={handleUseCurrentLocation}
            type="button"
          >
            {isLocating ? "Locating..." : "Use current location"}
          </button>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Click the map to move the pin
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-soft">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>{neighborhood?.trim() ? `${neighborhood} pickup area` : "Pickup area map"}</span>
          <span>{value ? "Pinned" : "No pin yet"}</span>
        </div>
        <div className="h-80 w-full" ref={containerRef} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>Use the exact handoff point you want borrowers to see. A nearby public meetup spot works too.</p>
        {value ? (
          <p className="rounded-full bg-white px-3 py-1 font-medium text-teal-700">
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </p>
        ) : (
          <p className="rounded-full bg-white px-3 py-1 font-medium text-rose-600">Exact pickup pin required</p>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}
