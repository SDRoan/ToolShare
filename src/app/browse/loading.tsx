export default function BrowseLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="h-4 w-40 animate-pulse rounded-full bg-teal-100" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-soft">
            <div className="h-52 animate-pulse rounded-[1.5rem] bg-teal-100" />
            <div className="mt-4 h-4 w-20 animate-pulse rounded-full bg-teal-100" />
            <div className="mt-3 h-6 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
