import { redirect } from "next/navigation";

import { CATEGORIES } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { BorrowRequestStatus, ListingCategory } from "@/types/database";

type OwnerSummary = {
  full_name: string | null;
  neighborhood?: string | null;
  avatar_url?: string | null;
};

export type ListingWithOwner = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  photo_url: string | null;
  neighborhood: string;
  is_available: boolean;
  created_at: string;
  owner: OwnerSummary | null;
};

export type BorrowRequestWithListing = {
  id: string;
  listing_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: BorrowRequestStatus;
  created_at: string;
  listing: {
    id: string;
    title: string;
    photo_url: string | null;
    neighborhood: string;
    owner_id: string;
    is_available: boolean;
    owner: OwnerSummary | null;
  } | null;
};

export type IncomingRequest = {
  id: string;
  listing_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: BorrowRequestStatus;
  created_at: string;
  listings: {
    id: string;
    title: string;
    photo_url: string | null;
    neighborhood: string;
    owner_id: string;
    is_available: boolean;
  } | null;
  requester: OwnerSummary | null;
};

function takeFirst<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeOwner(owner: OwnerSummary | OwnerSummary[] | null | undefined): OwnerSummary | null {
  return takeFirst(owner);
}

function normalizeListing(listing: any): ListingWithOwner | null {
  if (!listing) {
    return null;
  }

  return {
    ...listing,
    owner: normalizeOwner(listing.owner)
  } as ListingWithOwner;
}

function normalizeBorrowRequestWithListing(request: any): BorrowRequestWithListing {
  const listing = takeFirst(request.listing);

  return {
    ...request,
    listing: listing
      ? {
          ...listing,
          owner: normalizeOwner(listing.owner)
        }
      : null
  } as BorrowRequestWithListing;
}

function normalizeIncomingRequest(request: any): IncomingRequest {
  return {
    ...request,
    listings: takeFirst(request.listings),
    requester: normalizeOwner(request.requester)
  } as IncomingRequest;
}

export async function getHeaderSessionData() {
  if (!hasSupabaseEnv()) {
    return {
      user: null,
      profile: null,
      unreadIncomingCount: 0
    };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      unreadIncomingCount: 0
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, neighborhood, avatar_url, incoming_requests_seen_at, created_at")
    .eq("id", user.id)
    .maybeSingle();

  let unreadIncomingCount = 0;

  if (profile) {
    const { count } = await supabase
      .from("borrow_requests")
      .select("id, listings!inner(owner_id)", { count: "exact", head: true })
      .eq("listings.owner_id", user.id)
      .gt("created_at", profile.incoming_requests_seen_at);

    unreadIncomingCount = count ?? 0;
  }

  return {
    user,
    profile,
    unreadIncomingCount
  };
}

export async function getBrowsePageData(filters: {
  q?: string;
  category?: string;
  neighborhood?: string;
}) {
  const supabase = createClient();
  const category = CATEGORIES.includes(filters.category as ListingCategory)
    ? (filters.category as ListingCategory)
    : undefined;
  const neighborhood = filters.neighborhood?.trim() || undefined;
  const q = filters.q?.trim().replace(/,/g, " ") || undefined;

  let query = supabase
    .from("listings")
    .select(
      "id, owner_id, title, description, category, photo_url, neighborhood, is_available, created_at, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url)"
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (neighborhood) {
    query = query.eq("neighborhood", neighborhood);
  }

  const [{ data: listings }, { data: neighborhoodRows }] = await Promise.all([
    query,
    supabase.from("listings").select("neighborhood").order("neighborhood")
  ]);

  const neighborhoods = Array.from(
    new Set((neighborhoodRows ?? []).map((row) => row.neighborhood).filter(Boolean))
  ) as string[];

  return {
    listings: (listings ?? []).map((listing) => normalizeListing(listing)).filter(Boolean) as ListingWithOwner[],
    neighborhoods
  };
}

export async function getListingPageData(listingId: string) {
  const supabase = createClient();
  const [listingResult, authResult] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, owner_id, title, description, category, photo_url, neighborhood, is_available, created_at, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("id", listingId)
      .maybeSingle(),
    supabase.auth.getUser()
  ]);

  return {
    listing: normalizeListing(listingResult.data),
    viewer: authResult.data.user
  };
}

export async function getDashboardData() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, neighborhood, avatar_url, incoming_requests_seen_at, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const [myListingsResult, myRequestsResult, incomingRequestsResult, unreadResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, owner_id, title, description, category, photo_url, neighborhood, is_available, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("borrow_requests")
      .select(
        "id, listing_id, requester_id, start_date, end_date, message, status, created_at, listing:listings!borrow_requests_listing_id_fkey(id, title, photo_url, neighborhood, owner_id, is_available, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url))"
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("borrow_requests")
      .select(
        "id, listing_id, requester_id, start_date, end_date, message, status, created_at, listings!inner(id, title, photo_url, neighborhood, owner_id, is_available), requester:profiles!borrow_requests_requester_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("listings.owner_id", user.id)
      .order("created_at", { ascending: false }),
    profile
      ? supabase
          .from("borrow_requests")
          .select("id, listings!inner(owner_id)", { count: "exact", head: true })
          .eq("listings.owner_id", user.id)
          .gt("created_at", profile.incoming_requests_seen_at)
      : Promise.resolve({ count: 0 })
  ]);

  return {
    user,
    profile,
    myListings: myListingsResult.data ?? [],
    myRequests: (myRequestsResult.data ?? []).map((request) => normalizeBorrowRequestWithListing(request)),
    incomingRequests: (incomingRequestsResult.data ?? []).map((request) => normalizeIncomingRequest(request)),
    unreadIncomingCount: unreadResult.count ?? 0
  };
}

export async function getEditableListing(listingId: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, owner_id, title, description, category, photo_url, neighborhood, is_available, created_at")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .maybeSingle();

  return { user, listing };
}
