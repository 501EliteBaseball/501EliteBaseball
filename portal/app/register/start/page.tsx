"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  MailCheck,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RegisterStartPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    if (mode === "signup") {
      const { error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      setLoading(false);

      if (error) {
        setStatus(error.message);
        return;
      }

      setConfirmationEmail(email);
      return;
    }

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setStatus(error.message);
      return;
    }

    if (!data.session) {
      setLoading(false);
      setStatus("Sign-in succeeded, but no browser session was created.");
      return;
    }

    window.location.assign("/registration/parent");
  }

  if (confirmationEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10 text-slate-950">
        <section className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_32px_100px_rgba(18,62,116,0.14)] sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="h-10 w-10" aria-hidden="true" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Account created successfully
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950">
            Check your email
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            We sent a verification link to
          </p>
          <p className="mt-1 break-all text-lg font-bold text-[#123E74]">
            {confirmationEmail}
          </p>

          <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6 text-left">
            <p className="font-semibold text-slate-900">Your next step</p>
            <p className="mt-2 leading-7 text-slate-600">
              Open the email from 501 Elite, select the verification link, and
              then sign in to continue your family registration.
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            The message may take a minute to arrive. Check your spam or junk
            folder if you do not see it.
          </p>

          <a
            href="/login"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-semibold shadow-lg transition hover:bg-[#0E3260]"
            style={{ color: "#ffffff" }}
          >
            I verified my email — sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => {
              setConfirmationEmail("");
              setPassword("");
            }}
            className="mt-5 text-sm font-semibold text-[#123E74] hover:underline"
          >
            Use a different email address
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10 text-slate-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <a
          href="https://www.501elitebaseball.com"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to 501 Elite Baseball
        </a>

        <h1 className="text-3xl font-black text-slate-900">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-600">
          {mode === "signup"
            ? "Your family registration starts here."
            : "Sign in to continue your registration."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="registration-email" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              id="registration-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#123E74]"
            />
          </div>

          <div>
            <label htmlFor="registration-password" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              id="registration-password"
              type="password"
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#123E74]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-semibold transition hover:bg-[#0E3260] disabled:opacity-50"
            style={{ color: "#ffffff" }}
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create Family Account" : "Parent Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {status ? (
          <p className="mt-5 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">{status}</p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setStatus("");
            setMode((current) => (current === "signup" ? "signin" : "signup"));
          }}
          className="mt-8 w-full text-sm font-medium text-[#123E74]"
        >
          {mode === "signup"
            ? "Already have an account? Parent sign in"
            : "Need an account? Create one"}
        </button>

        <div className="mt-8 flex flex-col gap-3 text-center">
          <a href="/register" className="text-sm text-slate-500 hover:text-slate-700">
            Back to registration overview
          </a>
          <a href="/staff/login" className="text-sm font-semibold text-[#123E74] hover:underline">
            Coaches &amp; executives sign in
          </a>
        </div>
      </div>
    </main>
  );
}
