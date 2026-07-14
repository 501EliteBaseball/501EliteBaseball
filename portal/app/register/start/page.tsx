"use client";

import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
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
      const { error } = await supabaseBrowser.auth.signUp({ email, password });
      setLoading(false);

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("Check your email to verify your account.");
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
        <h1 className="text-3xl font-black text-slate-900">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-600">
          {mode === "signup"
            ? "Your family account starts here."
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
            style={{ color: "#ffffff" }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123E74] py-4 font-semibold transition hover:bg-[#0E3260] disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Continue" : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {status ? (
          <p className="mt-5 text-center text-sm text-red-600">{status}</p>
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
            ? "Already have an account? Sign in"
            : "Need an account? Create one"}
        </button>

        <div className="mt-8 text-center">
          <a href="/register" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back
          </a>
        </div>
      </div>
    </main>
  );
}
