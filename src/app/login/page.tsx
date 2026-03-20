import { AuthForm } from "@/components/auth-form";
import { SetupNotice } from "@/components/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Login Needs Supabase Setup" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
      <div className="hidden rounded-[2.5rem] border border-white/70 bg-ink p-8 text-white shadow-soft lg:block">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200">ToolShare</div>
        <h2 className="mt-4 font-display text-5xl leading-tight">Borrow smarter with the people already nearby.</h2>
        <p className="mt-5 max-w-lg text-sm leading-7 text-teal-50/90">
          Sign in to manage listings, respond to requests, and keep neighborhood sharing simple.
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
