import Image from "next/image";
import Link from "next/link";

import type { ListingWithOwner } from "@/lib/data";
import { cn, getFirstName } from "@/lib/utils";

type ListingCardProps = {
  listing: ListingWithOwner;
  isSelected?: boolean;
  onFocus?: () => void;
  onMouseEnter?: () => void;
};

export function ListingCard({ listing, isSelected = false, onFocus, onMouseEnter }: ListingCardProps) {
  const hasPickupPin = listing.pickup_latitude !== null && listing.pickup_longitude !== null;
  const ownerName = getFirstName(listing.owner?.full_name);

  return (
    <Link
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-4 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_60px_rgba(18,49,38,0.12)]",
        isSelected && "border-teal-300 ring-2 ring-teal-100 shadow-[0_18px_50px_rgba(17,117,101,0.16)]"
      )}
      href={`/listings/${listing.id}`}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-white via-teal-50 to-canvas">
        {listing.photo_url ? (
          <Image
            alt={listing.title}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            src={listing.photo_url}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-[1.4rem] bg-white/90 px-6 py-4 shadow-soft">
              <div className="text-4xl font-semibold uppercase tracking-[0.18em] text-ink">
                {listing.category.slice(0, 2)}
              </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{listing.category}</div>
          </div>
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur",
              listing.is_available ? "bg-teal-600 text-white" : "bg-slate-900/80 text-white"
            )}
          >
            {listing.is_available ? "Available" : "Unavailable"}
          </span>

          {isSelected ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm backdrop-blur">
              Active pin
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{listing.category}</div>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">{listing.title}</h3>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[1.4rem] bg-canvas/90 p-4 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-teal-700">Shared by</span>
            <span className="text-right font-medium text-ink">{ownerName}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-teal-700">Neighborhood</span>
            <span className="text-right font-medium text-ink">{listing.neighborhood}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {hasPickupPin ? (
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
              Exact pickup pin
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Pickup point needed
            </span>
          )}

          <span className="text-sm font-semibold text-teal-700 transition group-hover:text-teal-800">View details</span>
        </div>
      </div>
    </Link>
  );
}
