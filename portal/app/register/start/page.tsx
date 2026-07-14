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

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    if (mode === "signup") {
      const { error } = await supabaseBrowser.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("Check your email to verify your account.");
      return;
    }

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    window.location.href = "/register/wizard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-600">
          {mode === "signup"
            ? "Your family account starts here."
            : "Sign in to continue your registration."}
        </p>

        <form
          onSubmit={submit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#123E74]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#123E74]"
            />
          </div>

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#123E74] py-4 font-semibold text-white transition hover:bg-[#0E3260] disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Continue" : "Sign In"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {status && (
          <p className="mt-5 text-center text-sm text-red-600">
            {status}
          </p>
        )}

        <button
          onClick={() =>
            setMode(mode === "signup" ? "signin" : "signup")
          }
          className="mt-8 w-full text-sm font-medium text-[#123E74]"
        >
          {mode === "signup"
            ? "Already have an account? Sign In"
            : "Need an account? Create one"}
        </button>

        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
        </div>
      </div>
    </main>
  );
}
