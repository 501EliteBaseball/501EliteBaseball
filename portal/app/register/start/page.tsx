"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RegisterStartPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      setStatus("Check your email to verify your account, then sign in to begin registration.");
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
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-semibold text-white transition hover:bg-[#0E3260] disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create Family Account" : "Parent Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {status ? (
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-700">{status}</p>
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
