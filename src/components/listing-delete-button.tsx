"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { getStoragePathFromUrl } from "@/lib/utils";

type ListingDeleteButtonProps = {
  className?: string;
  listingId: string;
  ownerId: string;
  photoUrl?: string | null;
  redirectTo: string;
  viewerId: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export function ListingDeleteButton({
  className = "rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60",
  listingId,
  ownerId,
  photoUrl,
  redirectTo,
  viewerId
}: ListingDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  if (viewerId !== ownerId) {
    return null;
  }

  async function maybeDeletePhoto() {
    const existingPath = getStoragePathFromUrl(photoUrl);

    if (!existingPath) {
      return;
    }

    await supabase.storage.from("listing-photos").remove([existingPath]);
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this listing? Any related borrow requests will also be removed.");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase.from("listings").delete().eq("id", listingId).eq("owner_id", viewerId);

      if (error) {
        throw error;
      }

      await maybeDeletePhoto();
      toast.success("Listing deleted.");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete this listing."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button className={className} disabled={isDeleting} onClick={handleDelete} type="button">
      {isDeleting ? "Deleting..." : "Delete listing"}
    </button>
  );
}
