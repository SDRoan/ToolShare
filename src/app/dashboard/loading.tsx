export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="h-4 w-32 animate-pulse rounded-full bg-teal-100" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-10 w-36 animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-white/85 shadow-soft" />
        ))}
      </div>
    </div>
  );
}
