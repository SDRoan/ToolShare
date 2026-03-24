import Link from "next/link";

import type { ToolRequestWithRequester } from "@/lib/data";
import { formatDate, getFirstName } from "@/lib/utils";

type ToolRequestCardProps = {
  request: ToolRequestWithRequester;
};

export function ToolRequestCard({ request }: ToolRequestCardProps) {
  return (
    <Link
      className="group flex h-full flex-col rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_60px_rgba(18,49,38,0.12)]"
      href={`/requests/${request.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{request.category}</div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-ink">{request.title}</h3>
        </div>
        {request.needed_by ? (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            Needed by {formatDate(request.needed_by)}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Open request</span>
        )}
      </div>

      <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{request.description}</p>

      <div className="mt-5 grid gap-3 rounded-[1.4rem] bg-canvas/90 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-teal-700">Requested by</span>
          <span className="text-right font-medium text-ink">{getFirstName(request.requester?.full_name)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-teal-700">Neighborhood</span>
          <span className="text-right font-medium text-ink">{request.neighborhood}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
          {request.comment_count} {request.comment_count === 1 ? "reply" : "replies"}
        </span>
        <span className="text-sm font-semibold text-teal-700 transition group-hover:text-teal-800">Open post</span>
      </div>
    </Link>
  );
}
