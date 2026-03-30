import type { BorrowRequestStatus } from "@/types/database";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getFirstName(fullName?: string | null) {
  if (!fullName) {
    return "Neighbor";
  }

  return fullName.trim().split(/\s+/)[0] || "Neighbor";
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatRating(value: number) {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function datesOverlap(startDate: string, endDate: string, otherStartDate: string, otherEndDate: string) {
  return startDate <= otherEndDate && endDate >= otherStartDate;
}

export function slugifyFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStoragePathFromUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  const marker = "/object/public/listing-photos/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export type BorrowLifecycleStatus = BorrowRequestStatus | "overdue";

export function getBorrowLifecycleStatus(
  status: BorrowRequestStatus,
  endDate: string,
  returnedAt?: string | null
): BorrowLifecycleStatus {
  if ((status === "accepted" || status === "borrowed") && !returnedAt && endDate < getTodayDateValue()) {
    return "overdue";
  }

  return status;
}

export function formatBorrowLifecycleStatus(status: BorrowLifecycleStatus) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "borrowed":
      return "Borrowed";
    case "returned":
      return "Returned";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "overdue":
      return "Overdue";
    default:
      return "Pending";
  }
}

export function getBorrowRequestReminder(
  status: BorrowRequestStatus,
  startDate: string,
  endDate: string,
  returnedAt?: string | null
) {
  const lifecycleStatus = getBorrowLifecycleStatus(status, endDate, returnedAt);
  const today = getTodayDateValue();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowValue = tomorrow.toISOString().slice(0, 10);

  if (lifecycleStatus === "overdue") {
    return "Return overdue";
  }

  if (status === "accepted" && startDate === today) {
    return "Pickup today";
  }

  if (status === "accepted" && startDate === tomorrowValue) {
    return "Pickup tomorrow";
  }

  if (status === "borrowed" && endDate === today) {
    return "Return due today";
  }

  if (status === "borrowed" && endDate === tomorrowValue) {
    return "Return due tomorrow";
  }

  return null;
}

export function getStatusClasses(status: BorrowLifecycleStatus) {
  switch (status) {
    case "accepted":
      return "bg-teal-100 text-teal-800";
    case "borrowed":
      return "bg-sky-100 text-sky-800";
    case "returned":
      return "bg-slate-100 text-slate-700";
    case "declined":
      return "bg-rose-100 text-rose-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    case "overdue":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export function safeRedirect(target?: string | null) {
  if (!target || !target.startsWith("/")) {
    return "/dashboard";
  }

  return target;
}
