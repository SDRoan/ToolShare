"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getStoragePathFromUrl, slugifyFileName } from "@/lib/utils";
import { listingSchema, type ListingFormValues } from "@/lib/validators";
import { ListingCategory } from "@/types/database";

type ListingFormProps = {
  mode: "create" | "edit";
  userId: string;
  listingId?: string;
  initialValues?: {
    title: string;
    description: string;
    category: ListingCategory;
    neighborhood: string;
    isAvailable: boolean;
    photoUrl?: string | null;
  };
};

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export function ListingForm({ mode, userId, listingId, initialValues }: ListingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const supabase = createClient();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "Tools",
      neighborhood: initialValues?.neighborhood ?? "",
      isAvailable: initialValues?.isAvailable ?? true
    }
  });

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Upload a JPG, PNG, WebP, or another image file.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error("Images must be 5MB or smaller.");
    }

    const filePath = `${userId}/${crypto.randomUUID()}-${slugifyFileName(file.name)}`;
    const { error } = await supabase.storage.from("listing-photos").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("listing-photos").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function maybeDeleteOldPhoto(photoUrl?: string | null) {
    const existingPath = getStoragePathFromUrl(photoUrl);

    if (!existingPath) {
      return;
    }

    await supabase.storage.from("listing-photos").remove([existingPath]);
  }

  async function onSubmit(values: ListingFormValues) {
    setIsSubmitting(true);

    try {
      let photoUrl = initialValues?.photoUrl ?? null;

      if (selectedFile) {
        const uploadedUrl = await uploadPhoto(selectedFile);

        if (initialValues?.photoUrl) {
          await maybeDeleteOldPhoto(initialValues.photoUrl);
        }

        photoUrl = uploadedUrl;
      }

      if (mode === "create") {
        const { data, error } = await supabase
          .from("listings")
          .insert({
            owner_id: userId,
            title: values.title,
            description: values.description,
            category: values.category,
            neighborhood: values.neighborhood,
            is_available: values.isAvailable,
            photo_url: photoUrl
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        toast.success("Your listing is live.");
        router.push(`/listings/${data.id}`);
        router.refresh();
        return;
      }

      const { error } = await supabase
        .from("listings")
        .update({
          title: values.title,
          description: values.description,
          category: values.category,
          neighborhood: values.neighborhood,
          is_available: values.isAvailable,
          photo_url: photoUrl
        })
        .eq("id", listingId)
        .eq("owner_id", userId);

      if (error) {
        throw error;
      }

      toast.success("Listing updated.");
      router.push(`/listings/${listingId}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while saving the listing.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!listingId) {
      return;
    }

    const confirmed = window.confirm("Delete this listing? Any related borrow requests will also be removed.");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase.from("listings").delete().eq("id", listingId).eq("owner_id", userId);

      if (error) {
        throw error;
      }

      await maybeDeleteOldPhoto(initialValues?.photoUrl);
      toast.success("Listing deleted.");
      router.push("/dashboard?tab=listings");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete this listing.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
            {mode === "create" ? "New listing" : "Edit listing"}
          </div>
          <h1 className="mt-3 font-display text-4xl text-ink">
            {mode === "create" ? "Share something helpful" : "Update your listing"}
          </h1>
        </div>
        {mode === "edit" ? (
          <button
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete listing"}
          </button>
        ) : null}
      </div>

      <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="title">
              Item name
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="title"
              placeholder="Cordless drill"
              type="text"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="neighborhood">
              Neighborhood
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="neighborhood"
              placeholder="Crown Heights"
              type="text"
              {...form.register("neighborhood")}
            />
            {form.formState.errors.neighborhood ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.neighborhood.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="description">
            Description
          </label>
          <textarea
            className="mt-2 min-h-36 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            id="description"
            placeholder="What is it, what condition is it in, and what should neighbors know before borrowing it?"
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="category"
              {...form.register("category")}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {form.formState.errors.category ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.category.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="photo">
              Photo
            </label>
            <input
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700"
              id="photo"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              type="file"
            />
            <p className="mt-2 text-xs text-slate-500">
              {selectedFile
                ? `Selected: ${selectedFile.name}`
                : initialValues?.photoUrl
                  ? "A photo is already attached. Upload a new image to replace it."
                  : "Optional. A clear photo helps neighbors decide faster."}
            </p>
          </div>
        </div>

        {initialValues?.photoUrl ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-canvas p-3">
            <div className="relative h-56 w-full overflow-hidden rounded-[1rem]">
              <Image
                alt={initialValues.title}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 56rem, 100vw"
                src={initialValues.photoUrl}
              />
            </div>
          </div>
        ) : null}

        <label className="flex items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-canvas px-4 py-4">
          <input className="mt-1 h-4 w-4 accent-teal-600" type="checkbox" {...form.register("isAvailable")} />
          <span>
            <span className="block text-sm font-semibold text-ink">Available to borrow right now</span>
            <span className="mt-1 block text-sm text-slate-600">
              Turn this off anytime if the item is already out, being repaired, or temporarily unavailable.
            </span>
          </span>
        </label>

        <button
          className="w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Publish listing" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
