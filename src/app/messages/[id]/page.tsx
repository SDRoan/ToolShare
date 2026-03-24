import Link from "next/link";
import { notFound } from "next/navigation";

import { BorrowRequestChat } from "@/components/borrow-request-chat";
import { SetupNotice } from "@/components/setup-notice";
import { getBorrowRequestChatPageData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { cn, formatDateRange, getFirstName, getStatusClasses } from "@/lib/utils";

type MessagePageProps = {
  params: {
    id: string;
  };
};

export default async function MessagePage({ params }: MessagePageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Messages Need Supabase Setup" />
      </div>
    );
  }

  const { user, chatRequest, messages } = await getBorrowRequestChatPageData(params.id);

  if (!chatRequest) {
    notFound();
  }

  const isOwner = chatRequest.listing?.owner_id === user.id;
  const partnerName = isOwner
    ? getFirstName(chatRequest.requester?.full_name)
    : getFirstName(chatRequest.listing?.owner?.full_name);
  const backHref = isOwner ? "/dashboard?tab=incoming" : "/dashboard?tab=requests";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">In-app chat</div>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            Coordinate this borrow with {partnerName}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Keep everything for this request in one place, from first questions to pickup timing and return details.
          </p>
        </div>
        <Link
          className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
          href={backHref}
        >
          Back to dashboard
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <aside className="space-y-6">
          <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Request details</div>
                <h2 className="mt-2 font-display text-3xl text-ink">
                  {chatRequest.listing?.title || "Listing removed"}
                </h2>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", getStatusClasses(chatRequest.status))}>
                {chatRequest.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 rounded-[1.75rem] bg-canvas p-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Borrower</div>
                <div className="mt-2 text-base font-semibold text-ink">
                  {getFirstName(chatRequest.requester?.full_name)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Owner</div>
                <div className="mt-2 text-base font-semibold text-ink">
                  {getFirstName(chatRequest.listing?.owner?.full_name)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Requested dates</div>
                <div className="mt-2 text-base font-semibold text-ink">
                  {formatDateRange(chatRequest.start_date, chatRequest.end_date)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Neighborhood</div>
                <div className="mt-2 text-base font-semibold text-ink">
                  {chatRequest.listing?.neighborhood || "Unknown"}
                </div>
              </div>
            </div>

            {chatRequest.message ? (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-teal-200 bg-teal-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Original request note</div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">“{chatRequest.message}”</p>
              </div>
            ) : null}

            {chatRequest.listing ? (
              <Link
                className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                href={`/listings/${chatRequest.listing.id}`}
              >
                View listing
              </Link>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
            <h2 className="font-display text-3xl text-ink">How this chat works</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li>Use chat for timing, pickup spots, and return coordination.</li>
              <li>Both the borrower and the owner can access the conversation from the dashboard.</li>
              <li>Declined requests keep their message history, but the chat becomes read only.</li>
            </ul>
          </section>
        </aside>

        <BorrowRequestChat
          initialMessages={messages}
          partnerName={partnerName}
          requestId={chatRequest.id}
          requestStatus={chatRequest.status}
          viewerId={user.id}
        />
      </div>
    </div>
  );
}
