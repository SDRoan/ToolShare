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

export function getStatusClasses(status: "pending" | "accepted" | "declined") {
  switch (status) {
    case "accepted":
      return "bg-teal-100 text-teal-800";
    case "declined":
      return "bg-rose-100 text-rose-700";
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
