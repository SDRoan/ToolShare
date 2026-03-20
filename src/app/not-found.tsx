import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <div className="rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-medium text-teal-700">
        Listing not found
      </div>
      <h1 className="mt-6 font-display text-4xl text-ink sm:text-5xl">This neighborly lead ran cold.</h1>
      <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
        The listing might have been removed or the link is out of date. You can keep browsing and find another
        item nearby.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          href="/browse"
        >
          Browse listings
        </Link>
        <Link
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
          href="/dashboard"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
