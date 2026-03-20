import Link from "next/link";

import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function HomePage() {
  const isConfigured = hasSupabaseEnv();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      {!isConfigured ? (
        <div className="mb-6 rounded-[1.75rem] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-800 shadow-soft">
          ToolShare is running locally, but Supabase is not connected yet. Add your keys to `.env.local`, run the
          SQL migration, and restart the dev server to enable auth and data features.
        </div>
      ) : null}

      <section className="grid items-center gap-10 overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 px-6 py-12 shadow-soft backdrop-blur sm:px-10 lg:grid-cols-[1.1fr,0.9fr] lg:px-14 lg:py-16">
        <div>
          <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            Community-powered borrowing
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-tight text-ink sm:text-6xl">
            Share the tools you own. Borrow what you need next door.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ToolShare helps neighbors lend drills, ladders, kitchen gear, sports equipment, and other useful items
            without the hassle of group chats or spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              href="/signup"
            >
              Join ToolShare
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/browse"
            >
              Browse items
            </Link>
          </div>
          <div className="mt-10 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-3xl bg-canvas px-4 py-4">
              <div className="font-semibold text-ink">Lend with confidence</div>
              <p className="mt-2">Control availability, approve requests, and keep everything in one dashboard.</p>
            </div>
            <div className="rounded-3xl bg-canvas px-4 py-4">
              <div className="font-semibold text-ink">Keep it local</div>
              <p className="mt-2">Filter by neighborhood so pickups stay quick, easy, and nearby.</p>
            </div>
            <div className="rounded-3xl bg-canvas px-4 py-4">
              <div className="font-semibold text-ink">Borrow more, buy less</div>
              <p className="mt-2">Stretch budgets, reduce waste, and turn underused gear into a shared resource.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-300/30 via-emerald-200/20 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-soft">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="text-sm uppercase tracking-[0.3em] text-teal-200">How it works</div>
              <div className="mt-6 space-y-5">
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-teal-100">1. Share an item</div>
                  <p className="mt-2 text-sm text-teal-50/90">
                    Post a photo, add a description, and tell neighbors where pickup happens.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-teal-100">2. Review requests</div>
                  <p className="mt-2 text-sm text-teal-50/90">
                    Incoming borrow requests land in your dashboard with dates and a note from the requester.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-teal-100">3. Keep it moving</div>
                  <p className="mt-2 text-sm text-teal-50/90">
                    Update availability anytime so the library stays fresh, accurate, and useful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-soft">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">For lenders</div>
          <h2 className="mt-4 font-display text-3xl text-ink">Put spare gear to work</h2>
          <p className="mt-3 text-slate-600">
            Old hedge trimmers, folding tables, camping stoves, and mixers can all help someone nearby.
          </p>
        </article>
        <article className="rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-soft">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">For borrowers</div>
          <h2 className="mt-4 font-display text-3xl text-ink">Find what you need fast</h2>
          <p className="mt-3 text-slate-600">
            Search by keyword, filter by category, and request dates that work for your project or event.
          </p>
        </article>
        <article className="rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-soft">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">For communities</div>
          <h2 className="mt-4 font-display text-3xl text-ink">Build trust through sharing</h2>
          <p className="mt-3 text-slate-600">
            ToolShare creates lightweight, practical opportunities for neighbors to help one another every week.
          </p>
        </article>
      </section>
    </div>
  );
}
