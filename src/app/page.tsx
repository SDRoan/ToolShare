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

      <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/85 px-6 py-12 shadow-soft backdrop-blur sm:px-10 lg:px-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            Neighborhood lending made simple
          </div>
          <h1 className="mt-6 font-display text-5xl leading-tight text-ink sm:text-6xl">ToolShare</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            ToolShare is a neighborhood platform where people can share useful items, request tools they need, chat
            inside the app, and build trust through reviews and ratings.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
              href="/signup"
            >
              Join ToolShare
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/login"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.75rem] bg-canvas px-5 py-5 text-left">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Browse</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Find tools and useful household items shared by people in your neighborhood.
            </p>
          </article>
          <article className="rounded-[1.75rem] bg-canvas px-5 py-5 text-left">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Request</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Send borrow requests with dates and a message, or post a tool request when nothing is listed yet.
            </p>
          </article>
          <article className="rounded-[1.75rem] bg-canvas px-5 py-5 text-left">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Chat</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use in-app chat to coordinate pickup, return timing, and other details in one place.
            </p>
          </article>
          <article className="rounded-[1.75rem] bg-canvas px-5 py-5 text-left">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Reviews</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Leave ratings and reviews after completed borrows so future neighbors can borrow with confidence.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
