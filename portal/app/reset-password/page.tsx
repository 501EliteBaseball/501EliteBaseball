"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [checkingLink, setCheckingLink] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSessionReady(Boolean(session));
      setCheckingLink(false);
    });

    void supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSessionReady(Boolean(data.session));
      setCheckingLink(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (password.length < 8) {
      setStatus("Your new password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setStatus("The passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabaseBrowser.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setStatus(error.message);
      return;
    }

    await supabaseBrowser.auth.signOut();
    setLoading(false);
    setComplete(true);
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

        {complete ? (
          <section className="space-y-6 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700">Password updated</p>
              <h1 className="text-3xl font-semibold sm:text-4xl">You’re ready to sign in.</h1>
              <p className="text-sm leading-6 text-slate-600">Your new password is active and your reset session has been securely closed.</p>
            </div>
            <a
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-semibold text-white transition hover:bg-[#0f335f]"
            >
              Continue to parent sign in
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>
        ) : (
          <>
            <section className="space-y-3 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#123E74]/10 text-[#123E74]">
                <LockKeyhole className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D7193F]">Secure account recovery</p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Create a new password</h1>
              <p className="text-sm leading-6 text-slate-600">Choose a password with at least 8 characters.</p>
            </section>

            {checkingLink ? (
              <div className="rounded-3xl bg-slate-50 px-5 py-4 text-center text-sm text-slate-600">
                Verifying your secure reset link…
              </div>
            ) : sessionReady ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-[#123E74] focus:bg-white focus:ring-2 focus:ring-[#123E74]/20"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm new password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-[#123E74] focus:bg-white focus:ring-2 focus:ring-[#123E74]/20"
                    placeholder="Enter it again"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D7193F] px-6 font-semibold text-white transition hover:bg-[#b21431] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating password…" : "Save new password"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                {status ? <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{status}</div> : null}
              </form>
            ) : (
              <div className="space-y-4 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-800">
                <p>This reset link is invalid or has expired.</p>
                <a href="/forgot-password" className="inline-flex font-semibold underline">
                  Request a new reset link
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
