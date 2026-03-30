"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type ToolRequestDeleteButtonProps = {
  requestId: string;
  requesterId: string;
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

export function ToolRequestDeleteButton({ requestId, requesterId, viewerId }: ToolRequestDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  if (viewerId !== requesterId) {
    return null;
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this request post? All replies on it will also be removed.");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase.from("tool_requests").delete().eq("id", requestId).eq("requester_id", viewerId);

      if (error) {
        throw error;
      }

      toast.success("Request deleted.");
      router.push("/browse");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete this request."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? "Deleting..." : "Delete request"}
    </button>
  );
}
