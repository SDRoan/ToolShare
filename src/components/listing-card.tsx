import Image from "next/image";
import Link from "next/link";

import type { ListingWithOwner } from "@/lib/data";
import { cn, getFirstName } from "@/lib/utils";

type ListingCardProps = {
  listing: ListingWithOwner;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-soft transition hover:-translate-y-1 hover:border-teal-200"
      href={`/listings/${listing.id}`}
    >
      <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-teal-50 to-canvas">
        {listing.photo_url ? (
          <Image
            alt={listing.title}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            src={listing.photo_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-teal-800">
            No photo yet
          </div>
        )}
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
            listing.is_available ? "bg-teal-600 text-white" : "bg-slate-900/75 text-white"
          )}
        >
          {listing.is_available ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{listing.category}</div>
          <h3 className="mt-2 text-xl font-semibold text-ink">{listing.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Shared by {getFirstName(listing.owner?.full_name)} in {listing.neighborhood}
          </p>
        </div>
      </div>
    </Link>
  );
}
