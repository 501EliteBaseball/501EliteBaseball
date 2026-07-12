import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(215,25,63,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc,_#eef4ff)] px-6 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[36px] border border-white/80 bg-white/85 p-8 shadow-[0_32px_120px_rgba(18,62,116,0.12)] backdrop-blur sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
        <section className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#123E74]/15 bg-[#123E74]/5 px-3 py-2 text-sm font-medium text-[#123E74]">
            <Sparkles className="h-4 w-4" />
            501 Elite OS
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              A polished parent portal for every 501 Elite Baseball moment.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Keep schedules, payments, and family updates in one secure place with a modern sign-in experience designed for today’s parents.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f335f]"
            >
              Create parent account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123E74] hover:text-[#123E74]"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D7193F]/10 text-[#D7193F]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Secure access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Supabase-backed sessions protect every family dashboard experience.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#123E74]/10 text-[#123E74]">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Parent-first workflow</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Register, sign in, and manage access from one streamlined entry point.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
