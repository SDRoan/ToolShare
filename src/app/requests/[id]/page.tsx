import Link from "next/link";
import { notFound } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { ToolRequestCommentForm } from "@/components/tool-request-comment-form";
import { ToolRequestThread } from "@/components/tool-request-thread";
import { getToolRequestPageData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { formatDate, getFirstName } from "@/lib/utils";

type ToolRequestPageProps = {
  params: {
    id: string;
  };
};

export default async function ToolRequestPage({ params }: ToolRequestPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Request Posts Need Supabase Setup" />
      </div>
    );
  }

  const { toolRequest, comments, viewer } = await getToolRequestPageData(params.id);

  if (!toolRequest) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
              {toolRequest.category}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Borrow request
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl text-ink sm:text-5xl">{toolRequest.title}</h1>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{toolRequest.description}</p>

          <div className="mt-8 grid gap-4 rounded-[2rem] bg-canvas p-5 sm:grid-cols-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Requested by</div>
              <div className="mt-2 text-base font-semibold text-ink">{getFirstName(toolRequest.requester?.full_name)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Neighborhood</div>
              <div className="mt-2 text-base font-semibold text-ink">{toolRequest.neighborhood}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Needed by</div>
              <div className="mt-2 text-base font-semibold text-ink">
                {toolRequest.needed_by ? formatDate(toolRequest.needed_by) : "Flexible"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Replies</div>
              <div className="mt-2 text-base font-semibold text-ink">{toolRequest.comment_count}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/browse"
            >
              Back to browse
            </Link>
            {viewer?.id === toolRequest.requester_id ? (
              <span className="rounded-full bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                This is your request post
              </span>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <ToolRequestCommentForm requestId={toolRequest.id} viewerId={viewer?.id ?? null} />

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
            <h2 className="font-display text-3xl text-ink">Helpful replies work best</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li>Share the condition, size, or model of the tool you can offer.</li>
              <li>Attach a quick photo or video if it helps the requester decide faster.</li>
              <li>Mention timing or pickup details so the conversation can move quickly.</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Replies</div>
            <h2 className="mt-3 font-display text-4xl text-ink">Neighbors offering help</h2>
          </div>
          <span className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-slate-700">
            {toolRequest.comment_count} {toolRequest.comment_count === 1 ? "reply" : "replies"}
          </span>
        </div>

        {comments.length > 0 ? (
          <div className="mt-8">
            <ToolRequestThread comments={comments} requestId={toolRequest.id} viewerId={viewer?.id ?? null} />
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-slate-200 bg-canvas/70 px-6 py-10 text-center text-sm leading-7 text-slate-600">
            No one has replied yet. Be the first neighbor to comment and offer a tool.
          </div>
        )}
      </section>
    </div>
  );
}
