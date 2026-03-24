"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toolRequestSchema, type ToolRequestFormValues } from "@/lib/validators";

type ToolRequestFormProps = {
  initialNeighborhood?: string | null;
  userId: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const migrationHint =
    "Your database is missing the request-post tables. Run `supabase/migrations/003_add_tool_requests.sql` in Supabase, then try again.";

  if (error instanceof Error && error.message.trim()) {
    if (error.message.includes("public.tool_requests")) {
      return migrationHint;
    }

    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    if (error.message.includes("public.tool_requests")) {
      return migrationHint;
    }

    return error.message;
  }

  return fallback;
}

export function ToolRequestForm({ initialNeighborhood, userId }: ToolRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<ToolRequestFormValues>({
    resolver: zodResolver(toolRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Tools",
      neighborhood: initialNeighborhood ?? "",
      neededBy: ""
    }
  });

  async function onSubmit(values: ToolRequestFormValues) {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("tool_requests")
        .insert({
          requester_id: userId,
          title: values.title,
          description: values.description,
          category: values.category,
          neighborhood: values.neighborhood,
          needed_by: values.neededBy || null
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      toast.success("Your request post is live.");
      router.push(`/requests/${data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong while creating your request post."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft sm:p-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Borrow request</div>
        <h1 className="mt-3 font-display text-4xl text-ink">Ask neighbors for a tool</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Describe what you need, where you are, and when you hope to borrow it. Other members can reply with comments
          and share photos or videos of the tool they can offer.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="title">
              Request title
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="title"
              placeholder="Need a ladder for a weekend paint job"
              type="text"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="needed-by">
              Needed by
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="needed-by"
              min={new Date().toISOString().split("T")[0]}
              type="date"
              {...form.register("neededBy")}
            />
            <p className="mt-2 text-xs text-slate-500">Optional. Add a target date if your request is time-sensitive.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="neighborhood">
              Neighborhood
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="neighborhood"
              placeholder="Sunnyside"
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
            What do you need help with?
          </label>
          <textarea
            className="mt-2 min-h-40 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            id="description"
            placeholder="Explain the project, the kind of tool you’re looking for, how long you need it, and anything neighbors should know before offering one."
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <button
          className="inline-flex rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Posting request..." : "Post request"}
        </button>
      </form>
    </div>
  );
}
