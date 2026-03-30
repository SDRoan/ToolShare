"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { BorrowRequestWithListing, IncomingRequest } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import type { BorrowRequestStatus } from "@/types/database";
import {
  cn,
  datesOverlap,
  formatBorrowLifecycleStatus,
  formatDateTime,
  formatDateRange,
  getBorrowLifecycleStatus,
  getBorrowRequestReminder,
  getFirstName,
  getStatusClasses
} from "@/lib/utils";

import { BorrowRequestReviewForm } from "./borrow-request-review-form";
import { EmptyState } from "./empty-state";

type DashboardTabsProps = {
  initialTab: "listings" | "requests" | "incoming";
  myListings: Array<{
    id: string;
    title: string;
    neighborhood: string;
    category: string;
    photo_url: string | null;
    is_available: boolean;
    created_at: string;
  }>;
  myRequests: BorrowRequestWithListing[];
  incomingRequests: IncomingRequest[];
  unreadIncomingCount: number;
  viewerId: string;
};

type TabKey = DashboardTabsProps["initialTab"];

function buildBorrowRequestPatch(status: BorrowRequestStatus) {
  const timestamp = new Date().toISOString();

  switch (status) {
    case "borrowed":
      return { status, picked_up_at: timestamp };
    case "returned":
      return { status, returned_at: timestamp };
    case "cancelled":
      return { status, cancelled_at: timestamp };
    default:
      return { status };
  }
}

function getBorrowRequestActivityLine(request: {
  cancelled_at?: string | null;
  picked_up_at?: string | null;
  returned_at?: string | null;
}) {
  if (request.returned_at) {
    return `Returned ${formatDateTime(request.returned_at)}`;
  }

  if (request.picked_up_at) {
    return `Picked up ${formatDateTime(request.picked_up_at)}`;
  }

  if (request.cancelled_at) {
    return `Cancelled ${formatDateTime(request.cancelled_at)}`;
  }

  return null;
}

export function DashboardTabs({
  initialTab,
  myListings,
  myRequests,
  incomingRequests,
  unreadIncomingCount,
  viewerId
}: DashboardTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [localMyRequests, setLocalMyRequests] = useState(myRequests);
  const [localIncomingRequests, setLocalIncomingRequests] = useState(incomingRequests);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadIncomingCount);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setLocalMyRequests(myRequests);
  }, [myRequests]);

  useEffect(() => {
    setLocalIncomingRequests(incomingRequests);
  }, [incomingRequests]);

  useEffect(() => {
    setLocalUnreadCount(unreadIncomingCount);
  }, [unreadIncomingCount]);

  useEffect(() => {
    let isMounted = true;

    async function markRead() {
      if (activeTab !== "incoming" || localUnreadCount === 0) {
        return;
      }

      const response = await fetch("/api/notifications/read", {
        method: "POST"
      });

      if (!response.ok || !isMounted) {
        return;
      }

      setLocalUnreadCount(0);
      router.refresh();
    }

    void markRead();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localUnreadCount, router]);

  async function updateBorrowerRequest(request: BorrowRequestWithListing, nextStatus: BorrowRequestStatus) {
    const patch = buildBorrowRequestPatch(nextStatus);
    setPendingActionId(`${request.id}:${nextStatus}`);

    const { error } = await supabase.from("borrow_requests").update(patch).eq("id", request.id).eq("requester_id", viewerId);

    setPendingActionId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLocalMyRequests((current) =>
      current.map((item) => (item.id === request.id ? { ...item, ...patch } : item))
    );

    toast.success(nextStatus === "cancelled" ? "Request cancelled." : "Borrow marked returned.");
    router.refresh();
  }

  async function updateIncomingRequest(request: IncomingRequest, nextStatus: BorrowRequestStatus) {
    const patch = buildBorrowRequestPatch(nextStatus);
    setPendingActionId(`${request.id}:${nextStatus}`);

    const { error } = await supabase.from("borrow_requests").update(patch).eq("id", request.id);

    if (!error && nextStatus === "accepted") {
      const overlappingPendingIds = localIncomingRequests
        .filter(
          (item) =>
            item.id !== request.id &&
            item.listing_id === request.listing_id &&
            item.status === "pending" &&
            datesOverlap(item.start_date, item.end_date, request.start_date, request.end_date)
        )
        .map((item) => item.id);

      if (overlappingPendingIds.length > 0) {
        await supabase
          .from("borrow_requests")
          .update({ status: "declined" })
          .in("id", overlappingPendingIds);
      }
    }

    setPendingActionId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLocalIncomingRequests((current) =>
      current.map((item) => {
        if (item.id === request.id) {
          return { ...item, ...patch };
        }

        if (
          nextStatus === "accepted" &&
          item.listing_id === request.listing_id &&
          item.status === "pending" &&
          datesOverlap(item.start_date, item.end_date, request.start_date, request.end_date)
        ) {
          return { ...item, status: "declined" as const };
        }

        return item;
      })
    );

    const successMessageByStatus: Record<BorrowRequestStatus, string> = {
      accepted: "Request accepted.",
      borrowed: "Borrow marked picked up.",
      returned: "Borrow marked returned.",
      declined: "Request declined.",
      cancelled: "Request updated.",
      pending: "Request updated."
    };

    toast.success(successMessageByStatus[nextStatus]);
    router.refresh();
  }

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "listings", label: "My Listings", count: myListings.length },
    { key: "requests", label: "My Requests", count: localMyRequests.length },
    { key: "incoming", label: "Incoming Requests", count: localIncomingRequests.length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              activeTab === tab.key
                ? "bg-teal-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
            )}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs",
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              {tab.count}
            </span>
            {tab.key === "incoming" && localUnreadCount > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                {localUnreadCount} new
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === "listings" ? (
        myListings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myListings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-soft"
              >
                <div className="h-48 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-teal-50 to-canvas">
                  {listing.photo_url ? (
                    <div className="relative h-full w-full">
                      <Image
                        alt={listing.title}
                        className="object-cover"
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                        src={listing.photo_url}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-teal-800">
                      No photo yet
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{listing.category}</div>
                    <h3 className="mt-2 text-xl font-semibold text-ink">{listing.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{listing.neighborhood}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      listing.is_available ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {listing.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                    href={`/listings/${listing.id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                    href={`/listings/${listing.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref="/listings/new"
            actionLabel="Share your first item"
            description="No tools listed yet. Add something useful so neighbors can borrow it when they need a hand."
            title="Your library is still empty"
          />
        )
      ) : null}

      {activeTab === "requests" ? (
        localMyRequests.length > 0 ? (
          <div className="space-y-4">
            {localMyRequests.map((request) => {
              const lifecycleStatus = getBorrowLifecycleStatus(request.status, request.end_date, request.returned_at);
              const reminder = getBorrowRequestReminder(
                request.status,
                request.start_date,
                request.end_date,
                request.returned_at
              );
              const activityLine = getBorrowRequestActivityLine(request);
              const canCancel = request.status === "pending" || request.status === "accepted";
              const canMarkReturned = request.status === "borrowed" || lifecycleStatus === "overdue";

              return (
                <article
                  key={request.id}
                  className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Request sent</div>
                      <h3 className="mt-2 text-2xl font-semibold text-ink">
                        {request.listing?.title || "Listing removed"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Owner: {getFirstName(request.listing?.owner?.full_name)} •{" "}
                        {formatDateRange(request.start_date, request.end_date)}
                      </p>
                      {request.message ? <p className="mt-3 text-sm text-slate-500">“{request.message}”</p> : null}
                      {activityLine ? <p className="mt-3 text-sm font-medium text-slate-500">{activityLine}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {reminder ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                          {reminder}
                        </span>
                      ) : null}
                      <span
                        className={cn("rounded-full px-3 py-1 text-sm font-semibold", getStatusClasses(lifecycleStatus))}
                      >
                        {formatBorrowLifecycleStatus(lifecycleStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4">
                    <Link
                      className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                      href={`/messages/${request.id}`}
                    >
                      Open chat
                    </Link>
                    {request.listing ? (
                      <Link
                        className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                        href={`/listings/${request.listing.id}`}
                      >
                        View listing
                      </Link>
                    ) : null}
                    {canCancel ? (
                      <button
                        className="text-sm font-semibold text-rose-700 transition hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={pendingActionId === `${request.id}:cancelled`}
                        onClick={() => updateBorrowerRequest(request, "cancelled")}
                        type="button"
                      >
                        {pendingActionId === `${request.id}:cancelled` ? "Cancelling..." : "Cancel request"}
                      </button>
                    ) : null}
                    {canMarkReturned ? (
                      <button
                        className="text-sm font-semibold text-teal-700 transition hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={pendingActionId === `${request.id}:returned`}
                        onClick={() => updateBorrowerRequest(request, "returned")}
                        type="button"
                      >
                        {pendingActionId === `${request.id}:returned` ? "Saving..." : "Mark returned"}
                      </button>
                    ) : null}
                  </div>

                  <BorrowRequestReviewForm
                    endDate={request.end_date}
                    initialReview={request.review}
                    listingId={request.listing_id}
                    requestId={request.id}
                    returnedAt={request.returned_at}
                    status={request.status}
                    viewerId={viewerId}
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            actionHref="/browse"
            actionLabel="Browse available items"
            description="You haven’t sent any borrow requests yet. Explore the library and request what you need for your next project."
            title="No requests yet"
          />
        )
      ) : null}

      {activeTab === "incoming" ? (
        localIncomingRequests.length > 0 ? (
          <div className="space-y-4">
            {localIncomingRequests.map((request) => {
              const lifecycleStatus = getBorrowLifecycleStatus(request.status, request.end_date, request.returned_at);
              const reminder = getBorrowRequestReminder(
                request.status,
                request.start_date,
                request.end_date,
                request.returned_at
              );
              const activityLine = getBorrowRequestActivityLine(request);
              const canMarkPickedUp = request.status === "accepted";
              const canMarkReturned = request.status === "borrowed" || lifecycleStatus === "overdue";

              return (
                <article
                  key={request.id}
                  className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
                        Incoming request
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-ink">{request.listings?.title || "Listing removed"}</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {getFirstName(request.requester?.full_name)} requested this from{" "}
                        {formatDateRange(request.start_date, request.end_date)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Neighborhood: {request.requester?.neighborhood || "Unknown"}
                      </p>
                      {request.message ? <p className="mt-3 text-sm text-slate-500">“{request.message}”</p> : null}
                      {activityLine ? <p className="mt-3 text-sm font-medium text-slate-500">{activityLine}</p> : null}
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="flex flex-wrap justify-end gap-2">
                        {reminder ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                            {reminder}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-semibold",
                            getStatusClasses(lifecycleStatus)
                          )}
                        >
                          {formatBorrowLifecycleStatus(lifecycleStatus)}
                        </span>
                      </div>
                      <Link
                        className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                        href={`/messages/${request.id}`}
                      >
                        Open chat
                      </Link>
                      {request.status === "pending" ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={pendingActionId === `${request.id}:accepted`}
                            onClick={() => updateIncomingRequest(request, "accepted")}
                            type="button"
                          >
                            {pendingActionId === `${request.id}:accepted` ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={pendingActionId === `${request.id}:declined`}
                            onClick={() => updateIncomingRequest(request, "declined")}
                            type="button"
                          >
                            {pendingActionId === `${request.id}:declined` ? "Declining..." : "Decline"}
                          </button>
                        </div>
                      ) : null}
                      {canMarkPickedUp ? (
                        <button
                          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={pendingActionId === `${request.id}:borrowed`}
                          onClick={() => updateIncomingRequest(request, "borrowed")}
                          type="button"
                        >
                          {pendingActionId === `${request.id}:borrowed` ? "Saving..." : "Mark picked up"}
                        </button>
                      ) : null}
                      {canMarkReturned ? (
                        <button
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={pendingActionId === `${request.id}:returned`}
                          onClick={() => updateIncomingRequest(request, "returned")}
                          type="button"
                        >
                          {pendingActionId === `${request.id}:returned` ? "Saving..." : "Mark returned"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            actionHref="/listings/new"
            actionLabel="Add another listing"
            description="No incoming requests right now. Listing more useful items is the fastest way to bring fresh activity into your library."
            title="Your inbox is quiet"
          />
        )
      ) : null}
    </div>
  );
}
