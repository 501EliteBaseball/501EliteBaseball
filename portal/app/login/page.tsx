"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { getRegistrationResumePath } from "@/lib/registration/registration-resume";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

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

    setStatus("Opening your saved registration…");
    const destination = await getRegistrationResumePath(data.session.user.id);
    window.location.assign(destination);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-8 rounded-[32px] bg-white p-8 shadow-[0_32px_100px_rgba(18,62,116,0.12)]">
        <a
          href="https://www.501elitebaseball.com"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to 501 Elite Baseball
        </a>

        <section className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#D7193F]/10 text-[#D7193F] shadow-sm shadow-[#D7193F]/10">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-sm uppercase tracking-[0.35em] text-[#123E74]">501 Elite OS</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Parent sign in</h1>
          <p className="text-sm leading-6 text-slate-600">Access player registration, family information, releases, and required documents.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#123E74] focus-within:ring-2 focus-within:ring-[#123E74]/20">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-base text-slate-950 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#123E74] focus-within:ring-2 focus-within:ring-[#123E74]/20">
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-base text-slate-950 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 text-sm font-semibold text-white transition hover:bg-[#0f335f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Parent Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center">
            <a href="/forgot-password" className="text-sm font-medium text-[#123E74] hover:underline">Forgot password?</a>
          </div>

          {status ? <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{status}</div> : null}
        </form>

        <section className="rounded-3xl border border-[#123E74]/20 bg-blue-50/70 p-5 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-[#123E74]" />
          <h2 className="mt-2 font-semibold text-slate-900">Coaches &amp; executives</h2>
          <p className="mt-1 text-sm text-slate-600">Use the secure staff entrance for authorized team access.</p>
          <a
            href="/staff/login"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#123E74] bg-white px-5 text-sm font-semibold text-[#123E74] transition hover:bg-[#123E74] hover:text-white"
          >
            Staff Sign In
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-700">
          New family? <a href="/register" className="font-semibold text-[#D7193F] hover:underline">Create a family account</a>.
        </div>
      </div>
    </main>
  );
}
