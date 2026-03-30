import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

import { BorrowRequestForm } from "@/components/borrow-request-form";
import { ListingDeleteButton } from "@/components/listing-delete-button";
import { ListingAvailabilityCalendar } from "@/components/listing-availability-calendar";
import { SetupNotice } from "@/components/setup-notice";
import { getListingPageData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { formatDate, formatRating, getFirstName } from "@/lib/utils";

type ListingPageProps = {
  params: {
    id: string;
  };
};

export default async function ListingPage({ params }: ListingPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Listing Pages Need Supabase Setup" />
      </div>
    );
  }

  const { listing, viewer, reviews, reviewSummary, blockedRanges } = await getListingPageData(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 p-5 shadow-soft sm:p-6">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-50 to-canvas">
            {listing.photo_url ? (
              <div className="relative h-[22rem] sm:h-[28rem]">
                <Image
                  alt={listing.title}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  src={listing.photo_url}
                />
              </div>
            ) : (
              <div className="flex h-[22rem] items-center justify-center text-center text-lg font-semibold text-teal-800 sm:h-[28rem]">
                No photo uploaded yet
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
              {listing.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${listing.is_available ? "bg-teal-600 text-white" : "bg-slate-900/75 text-white"}`}
            >
              {listing.is_available ? "Available now" : "Temporarily unavailable"}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl text-ink sm:text-5xl">{listing.title}</h1>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{listing.description}</p>

          <div className="mt-8 grid gap-4 rounded-[2rem] bg-canvas p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Owner</div>
              <div className="mt-2 text-base font-semibold text-ink">{getFirstName(listing.owner?.full_name)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Neighborhood</div>
              <div className="mt-2 text-base font-semibold text-ink">{listing.neighborhood}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Posted</div>
              <div className="mt-2 text-base font-semibold text-ink">{formatDate(listing.created_at)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Rating</div>
              <div className="mt-2 text-base font-semibold text-ink">
                {reviewSummary.averageRating !== null ? `${formatRating(reviewSummary.averageRating)}/5` : "No ratings yet"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {reviewSummary.reviewCount === 0
                  ? "Be the first borrower to leave feedback."
                  : `${reviewSummary.reviewCount} ${reviewSummary.reviewCount === 1 ? "review" : "reviews"}`}
              </div>
            </div>
          </div>

          <ListingAvailabilityCalendar blockedRanges={blockedRanges} />

          <section className="mt-8 rounded-[2rem] bg-canvas p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Borrower feedback</div>
                <h2 className="mt-2 font-display text-3xl text-ink">
                  {reviewSummary.averageRating !== null
                    ? `${formatRating(reviewSummary.averageRating)}/5 from neighbors`
                    : "No reviews yet"}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-600">
                Reviews are written by borrowers after an accepted request has ended.
              </p>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.5rem] border border-white/70 bg-white px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{getFirstName(review.reviewer?.full_name)}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatDate(review.created_at)}</div>
                      </div>
                      <div className="inline-flex rounded-full bg-teal-600 px-3 py-1 text-sm font-semibold text-white">
                        {review.rating}/5
                      </div>
                    </div>
                    {review.comment ? <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">“{review.comment}”</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-teal-200 bg-white/70 px-5 py-6 text-sm leading-7 text-slate-600">
                This item has not been reviewed yet. Once a borrower completes an accepted request, they can rate the experience
                here.
              </div>
            )}
          </section>

          {viewer?.id === listing.owner_id ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                href={`/listings/${listing.id}/edit`}
              >
                Edit listing
              </Link>
              <ListingDeleteButton
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                listingId={listing.id}
                ownerId={listing.owner_id}
                photoUrl={listing.photo_url}
                redirectTo="/browse"
                viewerId={viewer.id}
              />
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <BorrowRequestForm
            blockedRanges={blockedRanges}
            isAvailable={listing.is_available}
            listingId={listing.id}
            ownerId={listing.owner_id}
            viewerId={viewer?.id ?? null}
          />

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
            <h2 className="font-display text-3xl text-ink">Borrowing tips</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li>Include a short message with your project, event, or timing.</li>
              <li>Keep pickup and return details in your messages after the request is accepted.</li>
              <li>Return items clean and on time so the library stays easy to trust.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
