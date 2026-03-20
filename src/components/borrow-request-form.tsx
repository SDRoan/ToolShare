"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { borrowRequestSchema, type BorrowRequestFormValues } from "@/lib/validators";

type BorrowRequestFormProps = {
  listingId: string;
  ownerId: string;
  viewerId: string | null;
  isAvailable: boolean;
};

export function BorrowRequestForm({ listingId, ownerId, viewerId, isAvailable }: BorrowRequestFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<BorrowRequestFormValues>({
    resolver: zodResolver(borrowRequestSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      message: ""
    }
  });

  if (!viewerId) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Want to borrow this?</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Create an account or log in first so the owner can review your dates and message.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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

  if (viewerId === ownerId) {
    return (
      <div className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6">
        <h2 className="font-display text-3xl text-ink">This one is yours</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          You can update availability, photos, or description details from the edit screen.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          href={`/listings/${listingId}/edit`}
        >
          Edit listing
        </Link>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Currently unavailable</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This listing is temporarily unavailable. Check back soon or browse other nearby items.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          href="/browse"
        >
          Browse more items
        </Link>
      </div>
    );
  }

  async function onSubmit(values: BorrowRequestFormValues) {
    setIsSubmitting(true);

    const { error } = await supabase.from("borrow_requests").insert({
      listing_id: listingId,
      requester_id: viewerId,
      start_date: values.startDate,
      end_date: values.endDate,
      message: values.message || null
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    form.reset();
    toast.success("Request sent to the owner.");
    router.refresh();
  }

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
      <h2 className="font-display text-3xl text-ink">Send a borrow request</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Pick the dates you need it and add a short note so the owner has context.
      </p>

      <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="start-date">
              Start date
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="start-date"
              min={new Date().toISOString().split("T")[0]}
              type="date"
              {...form.register("startDate")}
            />
            {form.formState.errors.startDate ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.startDate.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="end-date">
              End date
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="end-date"
              min={form.watch("startDate") || new Date().toISOString().split("T")[0]}
              type="date"
              {...form.register("endDate")}
            />
            {form.formState.errors.endDate ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.endDate.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="message">
            Message (optional)
          </label>
          <textarea
            className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            id="message"
            placeholder="I’m planning a Saturday project and can return it cleaned by Sunday evening."
            {...form.register("message")}
          />
          {form.formState.errors.message ? (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.message.message}</p>
          ) : null}
        </div>

        <button
          className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Sending request..." : "Send request"}
        </button>
      </form>
    </div>
  );
}
