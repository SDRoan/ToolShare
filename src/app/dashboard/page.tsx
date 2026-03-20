import { DashboardTabs } from "@/components/dashboard-tabs";
import { SetupNotice } from "@/components/setup-notice";
import { getDashboardData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getFirstName } from "@/lib/utils";

type DashboardPageProps = {
  searchParams?: {
    tab?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Dashboard Needs Supabase Setup" />
      </div>
    );
  }

  const data = await getDashboardData();
  const initialTab =
    searchParams?.tab === "requests" || searchParams?.tab === "incoming" || searchParams?.tab === "listings"
      ? searchParams.tab
      : "listings";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Your dashboard</div>
            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              Welcome back, {getFirstName(data.profile?.full_name || data.user.email)}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Manage your shared items, keep track of borrow requests, and stay on top of new neighbor activity.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-canvas px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Listings</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{data.myListings.length}</div>
            </div>
            <div className="rounded-[1.5rem] bg-canvas px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Sent requests</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{data.myRequests.length}</div>
            </div>
            <div className="rounded-[1.5rem] bg-canvas px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Unread incoming</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{data.unreadIncomingCount}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <DashboardTabs
          incomingRequests={data.incomingRequests}
          initialTab={initialTab}
          myListings={data.myListings}
          myRequests={data.myRequests}
          unreadIncomingCount={data.unreadIncomingCount}
        />
      </section>
    </div>
  );
}
