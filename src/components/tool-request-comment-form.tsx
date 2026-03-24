"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { slugifyFileName } from "@/lib/utils";
import { toolRequestCommentSchema, type ToolRequestCommentFormValues } from "@/lib/validators";

type ToolRequestCommentFormProps = {
  buttonLabel?: string;
  compact?: boolean;
  heading?: string;
  onCancel?: () => void;
  parentCommentId?: string | null;
  placeholder?: string;
  requestId: string;
  successMessage?: string;
  viewerId: string | null;
};

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string) {
  const migrationHint =
    "Your database is missing the request-post reply schema. Run `supabase/migrations/003_add_tool_requests.sql` and `004_add_tool_request_comment_replies.sql` in Supabase, then try again.";

  if (error instanceof Error && error.message.trim()) {
    if (
      error.message.includes("public.tool_request_comments") ||
      error.message.includes("public.tool_requests") ||
      error.message.includes("parent_comment_id")
    ) {
      return migrationHint;
    }

    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    if (
      error.message.includes("public.tool_request_comments") ||
      error.message.includes("public.tool_requests") ||
      error.message.includes("parent_comment_id")
    ) {
      return migrationHint;
    }

    return error.message;
  }

  return fallback;
}

export function ToolRequestCommentForm({
  buttonLabel = "Post reply",
  compact = false,
  heading,
  onCancel,
  parentCommentId = null,
  placeholder,
  requestId,
  successMessage = "Reply posted.",
  viewerId
}: ToolRequestCommentFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const supabase = createClient();

  const form = useForm<ToolRequestCommentFormValues>({
    resolver: zodResolver(toolRequestCommentSchema),
    defaultValues: {
      message: ""
    }
  });

  if (!viewerId) {
    return (
      <div
        className={
          compact
            ? "rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft"
            : "rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft"
        }
      >
        <h2 className={compact ? "text-lg font-semibold text-ink" : "font-display text-3xl text-ink"}>
          {parentCommentId ? "Log in to reply" : "Want to offer a tool?"}
        </h2>
        <p className={compact ? "mt-2 text-sm leading-6 text-slate-600" : "mt-3 text-sm leading-7 text-slate-600"}>
          Log in to reply with a comment and optionally attach a photo or video of what you can share.
        </p>
        <div className={compact ? "mt-4 flex flex-wrap gap-3" : "mt-6 flex flex-wrap gap-3"}>
          <Link
            className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            href={`/login?next=${encodeURIComponent(pathname)}`}
          >
            Log in
          </Link>
          <Link
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            href={`/signup?next=${encodeURIComponent(pathname)}`}
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function uploadMedia(file: File) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("Upload an image or video file.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error("Media files must be 20MB or smaller.");
    }

    const filePath = `${viewerId}/${crypto.randomUUID()}-${slugifyFileName(file.name)}`;
    const { error } = await supabase.storage.from("tool-request-media").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("tool-request-media").getPublicUrl(filePath);

    return {
      mediaKind: isVideo ? "video" : "image",
      mediaUrl: data.publicUrl
    } as const;
  }

  async function onSubmit(values: ToolRequestCommentFormValues) {
    const trimmedMessage = values.message?.trim() || "";

    if (!trimmedMessage && !selectedFile) {
      form.setError("message", {
        message: "Add a reply or attach a photo/video before posting."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedMedia = selectedFile ? await uploadMedia(selectedFile) : null;
      const { error } = await supabase.from("tool_request_comments").insert({
        request_id: requestId,
        author_id: viewerId,
        parent_comment_id: parentCommentId,
        message: trimmedMessage || "Shared a tool option.",
        media_url: uploadedMedia?.mediaUrl ?? null,
        media_kind: uploadedMedia?.mediaKind ?? null
      });

      if (error) {
        throw error;
      }

      form.reset();
      setSelectedFile(null);
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong while posting your reply."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft"
          : "rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft"
      }
    >
      <h2 className={compact ? "text-lg font-semibold text-ink" : "font-display text-3xl text-ink"}>
        {heading ?? (parentCommentId ? "Reply to this comment" : "Offer help on this request")}
      </h2>
      <p className={compact ? "mt-2 text-sm leading-6 text-slate-600" : "mt-3 text-sm leading-7 text-slate-600"}>
        {parentCommentId
          ? "Reply directly to this comment so the conversation stays threaded."
          : "Comment with what you can lend and optionally attach a photo or short video of the tool you want to share."}
      </p>

      <form className={compact ? "mt-4 space-y-4" : "mt-6 space-y-5"} onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="reply-message">
            {parentCommentId ? "Reply" : "Comment"}
          </label>
          <textarea
            className={
              compact
                ? "mt-2 min-h-24 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                : "mt-2 min-h-32 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            }
            id="reply-message"
            placeholder={
              placeholder ??
              (parentCommentId
                ? "I can help with this too. Here’s what I have available..."
                : "I have a step ladder you could borrow this weekend. It’s in good shape and I’m in Sunnyside too.")
            }
            {...form.register("message")}
          />
          {form.formState.errors.message ? (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.message.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="reply-media">
            Photo or video
          </label>
          <input
            accept="image/*,video/*"
            className={
              compact
                ? "mt-2 block w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700"
                : "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700"
            }
            id="reply-media"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <p className="mt-2 text-xs text-slate-500">
            {selectedFile
              ? `Attached: ${selectedFile.name}`
              : "Optional. Images and videos up to 20MB are supported."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className={compact ? "rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70" : "w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Posting..." : buttonLabel}
          </button>
          {compact && onCancel ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
