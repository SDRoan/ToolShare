"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { BorrowRequestChatMessage } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateTime, getFirstName } from "@/lib/utils";
import {
  borrowRequestChatMessageSchema,
  type BorrowRequestChatMessageFormValues
} from "@/lib/validators";
import type { BorrowRequestStatus } from "@/types/database";

type BorrowRequestChatProps = {
  requestId: string;
  viewerId: string;
  partnerName: string;
  requestStatus: BorrowRequestStatus;
  initialMessages: BorrowRequestChatMessage[];
};

async function fetchBorrowRequestMessages(supabase: ReturnType<typeof createClient>, requestId: string) {
  const { data, error } = await supabase
    .from("borrow_request_messages")
    .select(
      "id, request_id, sender_id, message, created_at, sender:profiles!borrow_request_messages_sender_id_fkey(full_name, neighborhood, avatar_url)"
    )
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    return null;
  }

  return (data ?? []).map((message) => normalizeBorrowRequestChatMessage(message));
}

function normalizeBorrowRequestChatMessage(message: any): BorrowRequestChatMessage {
  const sender = Array.isArray(message.sender) ? (message.sender[0] ?? null) : (message.sender ?? null);

  return {
    ...message,
    sender
  } as BorrowRequestChatMessage;
}

export function BorrowRequestChat({
  requestId,
  viewerId,
  partnerName,
  requestStatus,
  initialMessages
}: BorrowRequestChatProps) {
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState(initialMessages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canSend = requestStatus !== "declined" && requestStatus !== "cancelled" && requestStatus !== "returned";

  const form = useForm<BorrowRequestChatMessageFormValues>({
    resolver: zodResolver(borrowRequestChatMessageSchema),
    defaultValues: {
      message: ""
    }
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    let isActive = true;

    async function syncMessages() {
      const nextMessages = await fetchBorrowRequestMessages(supabase, requestId);

      if (isActive && nextMessages) {
        setMessages(nextMessages);
      }
    }

    void syncMessages();

    const intervalId = window.setInterval(() => {
      void syncMessages();
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [requestId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function onSubmit(values: BorrowRequestChatMessageFormValues) {
    if (!canSend) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("borrow_request_messages").insert({
      request_id: requestId,
      sender_id: viewerId,
      message: values.message.trim()
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    form.reset();

    const nextMessages = await fetchBorrowRequestMessages(supabase, requestId);

    if (nextMessages) {
      setMessages(nextMessages);
    }
  }

  return (
    <section className="flex min-h-[40rem] flex-col rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Conversation</div>
          <h2 className="mt-2 font-display text-3xl text-ink">Chat with {partnerName}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use this space for pickup details, quick questions, and return coordination.
          </p>
        </div>
        <div className="rounded-full bg-canvas px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Refreshes every few seconds
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-hidden rounded-[2rem] bg-canvas">
        <div className="flex h-full max-h-[32rem] min-h-[20rem] flex-col overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === viewerId;

                return (
                  <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")} key={message.id}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-[1.75rem] px-4 py-3 shadow-sm",
                        isOwnMessage ? "bg-teal-600 text-white" : "bg-white text-ink"
                      )}
                    >
                      <div
                        className={cn(
                          "text-xs font-semibold uppercase tracking-[0.18em]",
                          isOwnMessage ? "text-teal-100" : "text-teal-700"
                        )}
                      >
                        {isOwnMessage ? "You" : getFirstName(message.sender?.full_name || partnerName)} •{" "}
                        {formatDateTime(message.created_at)}
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7">{message.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-md">
                <div className="font-display text-3xl text-ink">No messages yet</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Start the conversation with a pickup time, a quick question, or any details that will help this borrow go
                  smoothly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <form className="mt-6 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="text-sm font-medium text-slate-700" htmlFor="chat-message">
          Message
        </label>
        <textarea
          className="min-h-32 w-full rounded-[1.75rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          disabled={!canSend || isSubmitting}
          id="chat-message"
          placeholder={
            canSend
              ? "Example: I can meet near the library at 6:30 PM if that works for you."
              : "This request is closed, so this conversation is now read only."
          }
          {...form.register("message")}
        />
        {form.formState.errors.message ? (
          <p className="text-sm text-rose-600">{form.formState.errors.message.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {canSend ? "Messages stay inside the app for both borrower and owner." : "You can still read the conversation history here."}
          </p>
          <button
            className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={!canSend || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
