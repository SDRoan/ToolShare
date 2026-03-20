export default function ListingLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[2.25rem] border border-white/70 bg-white/85 p-5 shadow-soft sm:p-6">
          <div className="h-[28rem] animate-pulse rounded-[2rem] bg-teal-100" />
          <div className="mt-6 h-4 w-32 animate-pulse rounded-full bg-teal-100" />
          <div className="mt-4 h-12 w-2/3 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 h-24 animate-pulse rounded-[1.5rem] bg-slate-100" />
        </div>
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
            <div className="h-8 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="mt-6 h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="mt-4 h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="mt-4 h-28 animate-pulse rounded-[1.5rem] bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
