import { BrowseMapExplorer } from "@/components/browse-map-explorer";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { ToolRequestCard } from "@/components/tool-request-card";
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
  const { listings, neighborhoods, toolRequests } = await getBrowsePageData(filters);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Browse the library</div>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Find what your neighborhood can lend</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Search shared items, explore exact pickup points, and browse neighbor request posts when someone needs a
              tool the community can help with.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/listings/new"
            >
              Share an item
            </Link>
            <Link
              className="inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              href="/requests/new"
            >
              Request a tool
            </Link>
          </div>
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft">
          {listings.length} {listings.length === 1 ? "shared item" : "shared items"}
        </span>
        <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
          {toolRequests.length} {toolRequests.length === 1 ? "borrow request" : "borrow requests"}
        </span>
      </div>

      <section className="mt-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Shared items</div>
            <h2 className="mt-3 font-display text-4xl text-ink">Browse tools already available nearby</h2>
          </div>
        </div>
        {listings.length > 0 ? (
          <BrowseMapExplorer listings={listings} />
        ) : (
          <EmptyState
            actionHref="/signup"
            actionLabel="Be the first to share"
            description="No tools listed yet for those filters. Reset the search or add something helpful to get the library moving."
            title="Nothing matched this search"
          />
        )}
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Borrow requests</div>
            <h2 className="mt-3 font-display text-4xl text-ink">See what neighbors are hoping to borrow</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Request posts live in this same browse area so lenders can spot local needs, reply with comments, and
              share photos or videos of tools they can offer.
            </p>
          </div>
          <Link
            className="inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            href="/requests/new"
          >
            Post a borrow request
          </Link>
        </div>

        {toolRequests.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {toolRequests.map((request) => (
              <ToolRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              actionHref="/requests/new"
              actionLabel="Post the first request"
              description="No one has posted a borrow request for these filters yet. Ask for what you need and let neighbors respond with offers."
              title="No borrow requests yet"
            />
          </div>
        )}
      </section>
    </div>
  );
}
