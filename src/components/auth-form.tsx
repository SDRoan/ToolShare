"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { safeRedirect } from "@/lib/utils";
import { loginSchema, signupSchema, type LoginFormValues, type SignupFormValues } from "@/lib/validators";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";
  const next = safeRedirect(searchParams.get("next"));
  const supabase = createClient();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      neighborhood: "",
      email: "",
      password: ""
    }
  });

  async function handleLogin(values: LoginFormValues) {
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back to ToolShare.");
    router.push(next);
    router.refresh();
  }

  async function handleSignup(values: SignupFormValues) {
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: values.fullName,
          neighborhood: values.neighborhood
        }
      }
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Your account is ready. Welcome to the library.");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.success("Check your email to confirm your account, then log in.");
    router.push("/login");
  }

  return (
    <div className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 p-8 shadow-soft sm:p-10">
      <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
        {isLogin ? "Welcome back" : "Join your neighborhood"}
      </div>
      <h1 className="mt-6 font-display text-4xl text-ink">{isLogin ? "Log in to ToolShare" : "Create your account"}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {isLogin
          ? "Pick up where you left off, review requests, and keep your listings current."
          : "Start sharing tools, outdoor gear, kitchen items, and more with people nearby."}
      </p>

      {isLogin ? (
        <form className="mt-8 space-y-5" onSubmit={loginForm.handleSubmit(handleLogin)}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="login-email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="login-email"
              placeholder="you@example.com"
              type="email"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email ? (
              <p className="mt-2 text-sm text-rose-600">{loginForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="login-password">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="login-password"
              placeholder="Your password"
              type="password"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password ? (
              <p className="mt-2 text-sm text-rose-600">{loginForm.formState.errors.password.message}</p>
            ) : null}
          </div>

          <button
            className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={signupForm.handleSubmit(handleSignup)}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-name">
              Full name
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="signup-name"
              placeholder="Jordan Rivera"
              type="text"
              {...signupForm.register("fullName")}
            />
            {signupForm.formState.errors.fullName ? (
              <p className="mt-2 text-sm text-rose-600">{signupForm.formState.errors.fullName.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-neighborhood">
              Neighborhood
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="signup-neighborhood"
              placeholder="Prospect Heights"
              type="text"
              {...signupForm.register("neighborhood")}
            />
            {signupForm.formState.errors.neighborhood ? (
              <p className="mt-2 text-sm text-rose-600">{signupForm.formState.errors.neighborhood.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="signup-email"
              placeholder="you@example.com"
              type="email"
              {...signupForm.register("email")}
            />
            {signupForm.formState.errors.email ? (
              <p className="mt-2 text-sm text-rose-600">{signupForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="signup-password">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              id="signup-password"
              placeholder="At least 6 characters"
              type="password"
              {...signupForm.register("password")}
            />
            {signupForm.formState.errors.password ? (
              <p className="mt-2 text-sm text-rose-600">{signupForm.formState.errors.password.message}</p>
            ) : null}
          </div>

          <button
            className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-slate-500">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-teal-700 hover:text-teal-800" href={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
