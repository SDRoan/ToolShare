"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_MAP_VIEW, OPEN_FREE_MAP_STYLE_URL } from "@/lib/constants";
import type { ListingWithOwner } from "@/lib/data";
import { cn, getFirstName } from "@/lib/utils";

import { ListingCard } from "./listing-card";

type MapLibreModule = typeof import("maplibre-gl");

type BrowseMapExplorerProps = {
  listings: ListingWithOwner[];
};

function hasMapPin(listing: ListingWithOwner) {
  return listing.pickup_latitude !== null && listing.pickup_longitude !== null;
}

function createPopupContent(listing: ListingWithOwner) {
  const container = document.createElement("div");
  container.style.padding = "1rem";
  container.style.maxWidth = "18rem";

  const category = document.createElement("div");
  category.textContent = listing.category;
  category.style.fontSize = "0.75rem";
  category.style.letterSpacing = "0.2em";
  category.style.textTransform = "uppercase";
  category.style.color = "#0e5e52";
  category.style.fontWeight = "700";

  const title = document.createElement("div");
  title.textContent = listing.title;
  title.style.marginTop = "0.5rem";
  title.style.fontSize = "1.1rem";
  title.style.fontWeight = "700";
  title.style.color = "#123126";

  const meta = document.createElement("div");
  meta.textContent = `Shared by ${getFirstName(listing.owner?.full_name)} in ${listing.neighborhood}`;
  meta.style.marginTop = "0.5rem";
  meta.style.fontSize = "0.9rem";
  meta.style.lineHeight = "1.5";
  meta.style.color = "#475569";

  container.append(category, title, meta);
  return container;
}

function fitMapToPinnedListings(
  map: import("maplibre-gl").Map,
  maplibre: MapLibreModule,
  listings: ListingWithOwner[]
) {
  if (listings.length === 0) {
    return;
  }

  const bounds = new maplibre.LngLatBounds();

  listings.forEach((listing) => {
    bounds.extend([listing.pickup_longitude as number, listing.pickup_latitude as number]);
  });

  map.fitBounds(bounds, {
    padding: 56,
    maxZoom: listings.length === 1 ? 13.5 : 12.5,
    duration: 700
  });
}

export function BrowseMapExplorer({ listings }: BrowseMapExplorerProps) {
  const mappedListings = useMemo(() => listings.filter(hasMapPin), [listings]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(mappedListings[0]?.id ?? listings[0]?.id ?? null);
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const maplibreRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef<Map<string, import("maplibre-gl").Marker>>(new Map());
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedListing =
    listings.find((listing) => listing.id === selectedListingId) ?? mappedListings[0] ?? listings[0] ?? null;

  useEffect(() => {
    const selectionStillExists = selectedListingId ? listings.some((listing) => listing.id === selectedListingId) : false;

    if ((!selectedListingId || !selectionStillExists) && (mappedListings[0] || listings[0])) {
      setSelectedListingId(mappedListings[0]?.id ?? listings[0]?.id ?? null);
    }
  }, [listings, mappedListings, selectedListingId]);

  useEffect(() => {
    let isMounted = true;
    const markers = markersRef.current;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const maplibre = await import("maplibre-gl");

      if (!isMounted || !containerRef.current) {
        return;
      }

      maplibreRef.current = maplibre;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: OPEN_FREE_MAP_STYLE_URL,
        center: [DEFAULT_MAP_VIEW.longitude, DEFAULT_MAP_VIEW.latitude],
        zoom: DEFAULT_MAP_VIEW.zoom
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
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
      markers.forEach((marker) => marker.remove());
      markers.clear();
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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    mappedListings.forEach((listing) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "toolshare-marker";
      markerElement.dataset.available = String(listing.is_available);
      markerElement.dataset.selected = "false";
      markerElement.setAttribute("aria-label", `View ${listing.title} on the map`);
      markerElement.addEventListener("click", () => {
        setSelectedListingId(listing.id);
        cardRefs.current[listing.id]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      });

      const marker = new maplibre.Marker({
        element: markerElement
      })
        .setLngLat([listing.pickup_longitude as number, listing.pickup_latitude as number])
        .setPopup(new maplibre.Popup({ offset: 16 }).setDOMContent(createPopupContent(listing)))
        .addTo(map);

      markersRef.current.set(listing.id, marker);
    });

    fitMapToPinnedListings(map, maplibre, mappedListings);
  }, [isMapReady, mappedListings]);

  useEffect(() => {
    markersRef.current.forEach((marker, listingId) => {
      const element = marker.getElement();
      element.dataset.selected = String(listingId === selectedListingId);
    });
  }, [selectedListingId]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;

    if (!isMapReady || !isMapOpen || !map || !maplibre) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      map.resize();

      if (!selectedListing || !hasMapPin(selectedListing)) {
        fitMapToPinnedListings(map, maplibre, mappedListings);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isMapOpen, isMapReady, mappedListings, selectedListing]);

  useEffect(() => {
    const map = mapRef.current;

    if (!isMapOpen || !isMapReady || !map || !selectedListing || !hasMapPin(selectedListing)) {
      return;
    }

    map.easeTo({
      center: [selectedListing.pickup_longitude as number, selectedListing.pickup_latitude as number],
      zoom: Math.max(map.getZoom(), 12),
      duration: 600
    });
  }, [isMapOpen, isMapReady, selectedListing]);

  async function handleLocateMe() {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support geolocation.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 12,
          duration: 800
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast.error("We couldn’t access your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        isMapOpen ? "xl:grid-cols-[1.05fr,0.95fr] xl:items-start" : "grid-cols-1"
      )}
    >
      <section className={cn("xl:sticky xl:top-24 xl:self-start", !isMapOpen && "hidden")}>
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-soft">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Map view</div>
              <h2 className="mt-2 font-display text-3xl text-ink">See exact pickup points nearby</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                {mappedListings.length} mapped {mappedListings.length === 1 ? "item" : "items"}
              </span>
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLocating}
                onClick={handleLocateMe}
                type="button"
              >
                {isLocating ? "Locating..." : "Use my location"}
              </button>
            </div>
          </div>

          <div className="h-[24rem] sm:h-[30rem] xl:h-[42rem]" ref={containerRef} />

          <div className="border-t border-slate-100 px-5 py-4">
            {selectedListing ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
                    {selectedListing.category}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">{selectedListing.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Shared by {getFirstName(selectedListing.owner?.full_name)} in {selectedListing.neighborhood}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    selectedListing.is_available ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {selectedListing.is_available ? "Available" : "Unavailable"}
                </span>
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-600">
                Older listings without a pickup pin still appear below. New listings should include the exact pickup
                point so the browse map stays complete.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 xl:self-start">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Result list</div>
              <h3 className="mt-2 font-display text-3xl text-ink">
                {isMapOpen ? "Pinned listings ready to browse" : "Browse shared items with more room"}
              </h3>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="rounded-full bg-canvas px-3 py-2 text-sm font-semibold text-slate-700">
                {listings.length} {listings.length === 1 ? "result" : "results"}
              </span>
              <span className="rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                {mappedListings.length} exact {mappedListings.length === 1 ? "pin" : "pins"}
              </span>
              <button
                aria-expanded={isMapOpen}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                onClick={() => setIsMapOpen((value) => !value)}
                type="button"
              >
                {isMapOpen ? "Hide map" : "Show map"}
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {isMapOpen
              ? "Each card stays synced with the map. Hover or focus a listing to spotlight its pin, then open the detail page for photos, description, and borrowing details."
              : "The map is tucked away so the item grid can expand. Open it anytime when you want to compare exact pickup points."}
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/72 p-3 shadow-soft sm:p-4">
          <div
            className={cn(
              "grid gap-5",
              isMapOpen
                ? "md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 xl:max-h-[46rem] xl:overflow-y-auto xl:pr-2"
                : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            )}
          >
            {listings.map((listing) => (
              <div
                key={listing.id}
                ref={(element) => {
                  cardRefs.current[listing.id] = element;
                }}
              >
                <ListingCard
                  isSelected={listing.id === selectedListingId}
                  listing={listing}
                  onFocus={() => setSelectedListingId(listing.id)}
                  onMouseEnter={() => setSelectedListingId(listing.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
