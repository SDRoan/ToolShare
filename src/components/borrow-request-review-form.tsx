"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { BorrowRequestReview } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, getBorrowLifecycleStatus } from "@/lib/utils";
import { borrowRequestReviewSchema, type BorrowRequestReviewFormValues } from "@/lib/validators";
import type { BorrowRequestStatus } from "@/types/database";

type BorrowRequestReviewFormProps = {
  requestId: string;
  listingId: string;
  viewerId: string;
  status: BorrowRequestStatus;
  endDate: string;
  returnedAt?: string | null;
  initialReview: BorrowRequestReview | null;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export function BorrowRequestReviewForm({
  requestId,
  listingId,
  viewerId,
  status,
  endDate,
  returnedAt,
  initialReview
}: BorrowRequestReviewFormProps) {
  const [supabase] = useState(() => createClient());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [review, setReview] = useState(initialReview);
  const lifecycleStatus = getBorrowLifecycleStatus(status, endDate, returnedAt);
  const isEligible = lifecycleStatus === "returned" || lifecycleStatus === "overdue";

  const form = useForm<BorrowRequestReviewFormValues>({
    resolver: zodResolver(borrowRequestReviewSchema),
    defaultValues: {
      rating: initialReview?.rating ?? 0,
      comment: initialReview?.comment ?? ""
    }
  });

  async function onSubmit(values: BorrowRequestReviewFormValues) {
    const isEditingExistingReview = Boolean(review);

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("borrow_request_reviews")
      .upsert(
        {
          request_id: requestId,
          listing_id: listingId,
          reviewer_id: viewerId,
          rating: values.rating,
          comment: values.comment || null
        },
        { onConflict: "request_id" }
      )
      .select("id, request_id, listing_id, reviewer_id, rating, comment, created_at")
      .single();

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setReview({
      ...data,
      reviewer: null
    });
    setIsEditing(false);
    toast.success(isEditingExistingReview ? "Review updated." : "Review saved.");
  }

  if ((lifecycleStatus === "pending" || lifecycleStatus === "declined" || lifecycleStatus === "cancelled") && !review) {
    return null;
  }

  if (!isEligible && !review) {
    return (
      <div className="mt-5 rounded-[1.5rem] bg-canvas px-4 py-4 text-sm text-slate-600">
        Reviews open after the borrow window ends on <span className="font-semibold text-ink">{formatDate(endDate)}</span>.
      </div>
    );
  }

  return (
    <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-canvas/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Your review</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Share how the borrow went so future neighbors know what to expect.
          </p>
        </div>
        {review && !isEditing ? (
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
            onClick={() => {
              form.reset({
                rating: review.rating,
                comment: review.comment ?? ""
              });
              setIsEditing(true);
            }}
            type="button"
          >
            Edit review
          </button>
        ) : null}
      </div>

      {review && !isEditing ? (
        <div className="mt-4 rounded-[1.5rem] bg-white px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-teal-600 px-3 py-1 text-sm font-semibold text-white">
              {review.rating}/5 rating
            </div>
            <div className="text-sm text-slate-500">Saved {formatDate(review.created_at)}</div>
          </div>
          {review.comment ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">“{review.comment}”</p> : null}
        </div>
      ) : isEligible ? (
        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-700">Rating</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {RATING_OPTIONS.map((rating) => {
                const isSelected = form.watch("rating") === rating;

                return (
                  <button
                    key={rating}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      isSelected
                        ? "bg-teal-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
                    )}
                    onClick={() => form.setValue("rating", rating, { shouldValidate: true })}
                    type="button"
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.rating ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.rating.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor={`review-${requestId}`}>
              Written review (optional)
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id={`review-${requestId}`}
              placeholder="Helpful details: Was pickup easy, was the item in good shape, and would you borrow it again?"
              {...form.register("comment")}
            />
            {form.formState.errors.comment ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.comment.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Only borrowers can review, and each completed request gets one review.</p>
            <div className="flex flex-wrap gap-3">
              {review ? (
                <button
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={() => {
                    form.reset({
                      rating: review.rating,
                      comment: review.comment ?? ""
                    });
                    setIsEditing(false);
                  }}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
              <button
                className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving..." : review ? "Update review" : "Save review"}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}
