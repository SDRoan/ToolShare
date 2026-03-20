type SetupNoticeProps = {
  title?: string;
  description?: string;
};

export function SetupNotice({
  title = "Connect Supabase To Continue",
  description = "ToolShare needs Supabase environment variables before auth, listings, and requests can work locally."
}: SetupNoticeProps) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-amber-200 bg-white/90 p-6 shadow-soft sm:p-8">
      <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Local setup needed
      </div>
      <h1 className="mt-5 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-[1.5rem] bg-canvas p-5">
          <div className="text-sm font-semibold text-ink">1. Create `.env.local`</div>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-ink px-4 py-4 text-sm text-teal-100">
            <code>{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}</code>
          </pre>
        </div>

        <div className="rounded-[1.5rem] bg-canvas p-5">
          <div className="text-sm font-semibold text-ink">2. Run the SQL migration in Supabase</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Use `supabase/migrations/001_init.sql` to create tables, RLS policies, the trigger, and the storage
            bucket.
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-canvas p-5">
          <div className="text-sm font-semibold text-ink">3. Restart the dev server</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            After saving `.env.local`, restart `npm run dev` and refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
}
