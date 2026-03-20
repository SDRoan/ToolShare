"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { BorrowRequestWithListing, IncomingRequest } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateRange, getFirstName, getStatusClasses } from "@/lib/utils";

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
};

type TabKey = DashboardTabsProps["initialTab"];

export function DashboardTabs({
  initialTab,
  myListings,
  myRequests,
  incomingRequests,
  unreadIncomingCount
}: DashboardTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [localIncomingRequests, setLocalIncomingRequests] = useState(incomingRequests);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadIncomingCount);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const supabase = createClient();

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

  async function updateIncomingRequest(requestId: string, status: "accepted" | "declined") {
    setPendingActionId(`${requestId}:${status}`);

    const { error } = await supabase.from("borrow_requests").update({ status }).eq("id", requestId);

    setPendingActionId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLocalIncomingRequests((current) =>
      current.map((request) => (request.id === requestId ? { ...request, status } : request))
    );

    toast.success(status === "accepted" ? "Request accepted." : "Request declined.");
    router.refresh();
  }

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "listings", label: "My Listings", count: myListings.length },
    { key: "requests", label: "My Requests", count: myRequests.length },
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
        myRequests.length > 0 ? (
          <div className="space-y-4">
            {myRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
                      Request sent
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">
                      {request.listing?.title || "Listing removed"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Owner: {getFirstName(request.listing?.owner?.full_name)} • {formatDateRange(request.start_date, request.end_date)}
                    </p>
                    {request.message ? <p className="mt-3 text-sm text-slate-500">“{request.message}”</p> : null}
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", getStatusClasses(request.status))}>
                    {request.status}
                  </span>
                </div>
                {request.listing ? (
                  <div className="mt-5">
                    <Link
                      className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                      href={`/listings/${request.listing.id}`}
                    >
                      View listing
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
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
            {localIncomingRequests.map((request) => (
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
                      {getFirstName(request.requester?.full_name)} requested this from {formatDateRange(request.start_date, request.end_date)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Neighborhood: {request.requester?.neighborhood || "Unknown"}
                    </p>
                    {request.message ? <p className="mt-3 text-sm text-slate-500">“{request.message}”</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", getStatusClasses(request.status))}>
                      {request.status}
                    </span>
                    {request.status === "pending" ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={pendingActionId === `${request.id}:accepted`}
                          onClick={() => updateIncomingRequest(request.id, "accepted")}
                          type="button"
                        >
                          {pendingActionId === `${request.id}:accepted` ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={pendingActionId === `${request.id}:declined`}
                          onClick={() => updateIncomingRequest(request.id, "declined")}
                          type="button"
                        >
                          {pendingActionId === `${request.id}:declined` ? "Declining..." : "Decline"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
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
