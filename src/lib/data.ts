import { redirect } from "next/navigation";

import { CATEGORIES } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { BorrowRequestStatus, ListingCategory, ToolRequestCommentMediaKind } from "@/types/database";

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
  pickup_latitude: number | null;
  pickup_longitude: number | null;
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
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    owner_id: string;
    is_available: boolean;
    owner: OwnerSummary | null;
  } | null;
  review: BorrowRequestReview | null;
};

export type BorrowRequestConversation = {
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
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    owner_id: string;
    is_available: boolean;
    owner: OwnerSummary | null;
  } | null;
  requester: OwnerSummary | null;
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
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    owner_id: string;
    is_available: boolean;
  } | null;
  requester: OwnerSummary | null;
};

export type ToolRequestWithRequester = {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  neighborhood: string;
  needed_by: string | null;
  created_at: string;
  requester: OwnerSummary | null;
  comment_count: number;
};

export type ToolRequestCommentWithAuthor = {
  id: string;
  request_id: string;
  author_id: string;
  parent_comment_id: string | null;
  message: string;
  media_url: string | null;
  media_kind: ToolRequestCommentMediaKind | null;
  created_at: string;
  author: OwnerSummary | null;
  replies: ToolRequestCommentWithAuthor[];
};

export type BorrowRequestChatMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender: OwnerSummary | null;
};

export type BorrowRequestReview = {
  id: string;
  request_id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: OwnerSummary | null;
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
      : null,
    review: null
  } as BorrowRequestWithListing;
}

function normalizeBorrowRequestConversation(request: any): BorrowRequestConversation | null {
  if (!request) {
    return null;
  }

  const listing = takeFirst(request.listing);

  return {
    ...request,
    listing: listing
      ? {
          ...listing,
          owner: normalizeOwner(listing.owner)
        }
      : null,
    requester: normalizeOwner(request.requester)
  } as BorrowRequestConversation;
}

function normalizeIncomingRequest(request: any): IncomingRequest {
  return {
    ...request,
    listings: takeFirst(request.listings),
    requester: normalizeOwner(request.requester)
  } as IncomingRequest;
}

function normalizeToolRequest(request: any, commentCount = 0): ToolRequestWithRequester | null {
  if (!request) {
    return null;
  }

  return {
    ...request,
    requester: normalizeOwner(request.requester),
    comment_count: commentCount
  } as ToolRequestWithRequester;
}

function normalizeToolRequestComment(comment: any): ToolRequestCommentWithAuthor {
  return {
    ...comment,
    author: normalizeOwner(comment.author),
    replies: []
  } as ToolRequestCommentWithAuthor;
}

function normalizeBorrowRequestChatMessage(message: any): BorrowRequestChatMessage {
  return {
    ...message,
    sender: normalizeOwner(message.sender)
  } as BorrowRequestChatMessage;
}

function normalizeBorrowRequestReview(review: any): BorrowRequestReview {
  return {
    ...review,
    reviewer: normalizeOwner(review.reviewer)
  } as BorrowRequestReview;
}

function getReviewSummary(reviews: Array<{ rating: number }>) {
  if (reviews.length === 0) {
    return {
      averageRating: null,
      reviewCount: 0
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
    reviewCount: reviews.length
  };
}

function buildToolRequestCommentTree(comments: ToolRequestCommentWithAuthor[]) {
  const commentMap = new Map<string, ToolRequestCommentWithAuthor>();
  const rootComments: ToolRequestCommentWithAuthor[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: []
    });
  });

  commentMap.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parentComment = commentMap.get(comment.parent_comment_id);

      if (parentComment) {
        parentComment.replies.push(comment);
        return;
      }
    }

    rootComments.push(comment);
  });

  return rootComments;
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
      "id, owner_id, title, description, category, photo_url, neighborhood, pickup_latitude, pickup_longitude, is_available, created_at, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url)"
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

  let toolRequestQuery = supabase
    .from("tool_requests")
    .select(
      "id, requester_id, title, description, category, neighborhood, needed_by, created_at, requester:profiles!tool_requests_requester_id_fkey(full_name, neighborhood, avatar_url)"
    )
    .order("created_at", { ascending: false });

  if (q) {
    toolRequestQuery = toolRequestQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (category) {
    toolRequestQuery = toolRequestQuery.eq("category", category);
  }

  if (neighborhood) {
    toolRequestQuery = toolRequestQuery.eq("neighborhood", neighborhood);
  }

  const [{ data: listings }, { data: toolRequests }, { data: listingNeighborhoodRows }, { data: requestNeighborhoodRows }, { data: toolRequestCommentRows }] = await Promise.all([
    query,
    toolRequestQuery,
    supabase.from("listings").select("neighborhood").order("neighborhood"),
    supabase.from("tool_requests").select("neighborhood").order("neighborhood"),
    supabase.from("tool_request_comments").select("request_id")
  ]);

  const commentCounts = new Map<string, number>();

  (toolRequestCommentRows ?? []).forEach((comment) => {
    commentCounts.set(comment.request_id, (commentCounts.get(comment.request_id) ?? 0) + 1);
  });

  const neighborhoods = Array.from(
    new Set(
      [...(listingNeighborhoodRows ?? []), ...(requestNeighborhoodRows ?? [])].map((row) => row.neighborhood).filter(Boolean)
    )
  ) as string[];

  return {
    listings: (listings ?? []).map((listing) => normalizeListing(listing)).filter(Boolean) as ListingWithOwner[],
    toolRequests: (toolRequests ?? [])
      .map((request) => normalizeToolRequest(request, commentCounts.get(request.id) ?? 0))
      .filter(Boolean) as ToolRequestWithRequester[],
    neighborhoods
  };
}

export async function getListingPageData(listingId: string) {
  const supabase = createClient();
  const [listingResult, authResult, reviewsResult] = await Promise.all([
    supabase
      .from("listings")
      .select(
        "id, owner_id, title, description, category, photo_url, neighborhood, pickup_latitude, pickup_longitude, is_available, created_at, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("id", listingId)
      .maybeSingle(),
    supabase.auth.getUser(),
    supabase
      .from("borrow_request_reviews")
      .select(
        "id, request_id, listing_id, reviewer_id, rating, comment, created_at, reviewer:profiles!borrow_request_reviews_reviewer_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
  ]);

  const reviews = (reviewsResult.data ?? []).map((review) => normalizeBorrowRequestReview(review));

  return {
    listing: normalizeListing(listingResult.data),
    viewer: authResult.data.user,
    reviews,
    reviewSummary: getReviewSummary(reviews)
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
      .select("id, owner_id, title, description, category, photo_url, neighborhood, pickup_latitude, pickup_longitude, is_available, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("borrow_requests")
      .select(
        "id, listing_id, requester_id, start_date, end_date, message, status, created_at, listing:listings!borrow_requests_listing_id_fkey(id, title, photo_url, neighborhood, pickup_latitude, pickup_longitude, owner_id, is_available, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url))"
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("borrow_requests")
      .select(
        "id, listing_id, requester_id, start_date, end_date, message, status, created_at, listings!inner(id, title, photo_url, neighborhood, pickup_latitude, pickup_longitude, owner_id, is_available), requester:profiles!borrow_requests_requester_id_fkey(full_name, neighborhood, avatar_url)"
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

  const requestIds = (myRequestsResult.data ?? []).map((request) => request.id);
  const reviewsResult =
    requestIds.length > 0
      ? await supabase
          .from("borrow_request_reviews")
          .select("id, request_id, listing_id, reviewer_id, rating, comment, created_at")
          .in("request_id", requestIds)
      : { data: [] };
  const reviewByRequestId = new Map(
    (reviewsResult.data ?? []).map((review) => [review.request_id, normalizeBorrowRequestReview(review)])
  );

  return {
    user,
    profile,
    myListings: myListingsResult.data ?? [],
    myRequests: (myRequestsResult.data ?? []).map((request) => ({
      ...normalizeBorrowRequestWithListing(request),
      review: reviewByRequestId.get(request.id) ?? null
    })),
    incomingRequests: (incomingRequestsResult.data ?? []).map((request) => normalizeIncomingRequest(request)),
    unreadIncomingCount: unreadResult.count ?? 0
  };
}

export async function getBorrowRequestChatPageData(requestId: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/messages/${requestId}`);
  }

  const [requestResult, messagesResult] = await Promise.all([
    supabase
      .from("borrow_requests")
      .select(
        "id, listing_id, requester_id, start_date, end_date, message, status, created_at, listing:listings!borrow_requests_listing_id_fkey(id, title, photo_url, neighborhood, pickup_latitude, pickup_longitude, owner_id, is_available, owner:profiles!listings_owner_id_fkey(full_name, neighborhood, avatar_url)), requester:profiles!borrow_requests_requester_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("id", requestId)
      .maybeSingle(),
    supabase
      .from("borrow_request_messages")
      .select(
        "id, request_id, sender_id, message, created_at, sender:profiles!borrow_request_messages_sender_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
  ]);

  return {
    user,
    chatRequest: normalizeBorrowRequestConversation(requestResult.data),
    messages: (messagesResult.data ?? []).map((message) => normalizeBorrowRequestChatMessage(message))
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
    .select("id, owner_id, title, description, category, photo_url, neighborhood, pickup_latitude, pickup_longitude, is_available, created_at")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .maybeSingle();

  return { user, listing };
}

export async function getToolRequestPageData(requestId: string) {
  const supabase = createClient();
  const [requestResult, commentsResult, authResult] = await Promise.all([
    supabase
      .from("tool_requests")
      .select(
        "id, requester_id, title, description, category, neighborhood, needed_by, created_at, requester:profiles!tool_requests_requester_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("id", requestId)
      .maybeSingle(),
    supabase
      .from("tool_request_comments")
      .select(
        "id, request_id, author_id, parent_comment_id, message, media_url, media_kind, created_at, author:profiles!tool_request_comments_author_id_fkey(full_name, neighborhood, avatar_url)"
      )
      .eq("request_id", requestId)
      .order("created_at", { ascending: true }),
    supabase.auth.getUser()
  ]);

  return {
    toolRequest: normalizeToolRequest(requestResult.data, commentsResult.data?.length ?? 0),
    comments: buildToolRequestCommentTree(
      (commentsResult.data ?? []).map((comment) => normalizeToolRequestComment(comment))
    ),
    viewer: authResult.data.user
  };
}
