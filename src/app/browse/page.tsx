import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SetupNotice } from "@/components/setup-notice";
import { CATEGORIES } from "@/lib/constants";
import { getBrowsePageData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type BrowsePageProps = {
  searchParams?: {
    q?: string;
    category?: string;
    neighborhood?: string;
  };
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Browse Needs Supabase Setup" />
      </div>
    );
  }

  const filters = {
    q: searchParams?.q || "",
    category: searchParams?.category || "",
    neighborhood: searchParams?.neighborhood || ""
  };
  const { listings, neighborhoods } = await getBrowsePageData(filters);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Browse the library</div>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Find what your neighborhood can lend</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Search by keyword, narrow by category, and filter by neighborhood to find the right item close by.
            </p>
          </div>
          <Link
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            href="/listings/new"
          >
            Share an item
          </Link>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1.3fr,0.8fr,0.8fr,auto]" method="GET">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            defaultValue={filters.q}
            name="q"
            placeholder="Search tools, ladders, projectors..."
            type="search"
          />

          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            defaultValue={filters.category}
            name="category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            defaultValue={filters.neighborhood}
            name="neighborhood"
          >
            <option value="">All neighborhoods</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              type="submit"
            >
              Search
            </button>
            <Link
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/browse"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          {listings.length} {listings.length === 1 ? "item" : "items"} available in the library
        </p>
      </div>

      <section className="mt-6">
        {listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref="/signup"
            actionLabel="Be the first to share"
            description="No tools listed yet for those filters. Reset the search or add something helpful to get the library moving."
            title="Nothing matched this search"
          />
        )}
      </section>
    </div>
  );
}
