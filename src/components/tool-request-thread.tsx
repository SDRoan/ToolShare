"use client";

import Image from "next/image";
import { useState } from "react";

import type { ToolRequestCommentWithAuthor } from "@/lib/data";
import { cn, formatDate, getFirstName } from "@/lib/utils";

import { ToolRequestCommentForm } from "./tool-request-comment-form";

type ToolRequestThreadProps = {
  comments: ToolRequestCommentWithAuthor[];
  requestId: string;
  viewerId: string | null;
};

type ToolRequestCommentCardProps = {
  comment: ToolRequestCommentWithAuthor;
  depth?: number;
  requestId: string;
  viewerId: string | null;
};

function ToolRequestCommentMedia({ comment }: { comment: ToolRequestCommentWithAuthor }) {
  if (!comment.media_url) {
    return null;
  }

  return (
    <div className="mt-5 max-w-xl overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-soft">
      {comment.media_kind === "video" ? (
        <video className="max-h-80 w-full bg-canvas object-contain" controls preload="metadata" src={comment.media_url}>
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="relative h-64 w-full bg-canvas sm:h-72">
          <Image
            alt="Tool shared in reply"
            className="object-contain"
            fill
            sizes="(min-width: 1024px) 36rem, 100vw"
            src={comment.media_url}
          />
        </div>
      )}
    </div>
  );
}

function ToolRequestCommentCard({ comment, depth = 0, requestId, viewerId }: ToolRequestCommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const isNested = depth > 0;

  return (
    <article
      className={cn(
        "rounded-[2rem] border p-5 shadow-soft",
        isNested ? "border-teal-100 bg-white/95" : "border-slate-100 bg-canvas/85"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
            {getFirstName(comment.author?.full_name)}
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{comment.message}</p>
        </div>
        <div className="text-sm text-slate-500">{formatDate(comment.created_at)}</div>
      </div>

      <ToolRequestCommentMedia comment={comment} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
          onClick={() => setIsReplying((value) => !value)}
          type="button"
        >
          {isReplying ? "Hide reply" : "Reply"}
        </button>
        {comment.replies.length > 0 ? (
          <span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
            {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </span>
        ) : null}
      </div>

      {isReplying ? (
        <div className="mt-4">
          <ToolRequestCommentForm
            buttonLabel="Post reply"
            compact
            heading="Reply to comment"
            onCancel={() => setIsReplying(false)}
            parentCommentId={comment.id}
            placeholder={`Reply to ${getFirstName(comment.author?.full_name)}...`}
            requestId={requestId}
            successMessage="Reply posted to the thread."
            viewerId={viewerId}
          />
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="mt-5 space-y-4 border-l border-teal-100 pl-4 sm:pl-5">
          {comment.replies.map((reply) => (
            <ToolRequestCommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              requestId={requestId}
              viewerId={viewerId}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ToolRequestThread({ comments, requestId, viewerId }: ToolRequestThreadProps) {
  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <ToolRequestCommentCard key={comment.id} comment={comment} requestId={requestId} viewerId={viewerId} />
      ))}
    </div>
  );
}
