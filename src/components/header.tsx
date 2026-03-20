import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { getFirstName } from "@/lib/utils";

import { SignOutButton } from "./sign-out-button";

type HeaderProps = {
  user: User | null;
  profile: {
    full_name: string;
    neighborhood: string | null;
  } | null;
  unreadIncomingCount: number;
};

export function Header({ user, profile, unreadIncomingCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-soft">
              TS
            </div>
            <div>
              <div className="font-display text-2xl text-ink">ToolShare</div>
              <div className="text-xs uppercase tracking-[0.25em] text-teal-700">Neighborhood Lending Library</div>
            </div>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-slate-700">
          <Link
            className="rounded-full px-4 py-2 transition hover:bg-teal-50 hover:text-teal-700"
            href="/browse"
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                className="rounded-full px-4 py-2 transition hover:bg-teal-50 hover:text-teal-700"
                href="/listings/new"
              >
                Share an item
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-teal-800 transition hover:bg-teal-100"
                href="/dashboard"
              >
                Dashboard
                {unreadIncomingCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {unreadIncomingCount}
                  </span>
                ) : null}
              </Link>
              <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-left text-xs text-slate-500 sm:block">
                <div className="font-semibold text-slate-700">
                  {getFirstName(profile?.full_name || user.user_metadata.full_name || user.email)}
                </div>
                <div>{profile?.neighborhood || "Local member"}</div>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="rounded-full px-4 py-2 transition hover:bg-teal-50 hover:text-teal-700"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700"
                href="/signup"
              >
                Join free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
