export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-full bg-teal-100" />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-soft"
          >
            <div className="h-48 animate-pulse rounded-[1.5rem] bg-teal-100" />
            <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-teal-100" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-6 h-10 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
