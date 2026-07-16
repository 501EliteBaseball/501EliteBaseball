import { Clock3, Save, Smartphone } from "lucide-react";

type RegistrationWelcomeProps = {
  onBegin: () => void;
};

export default function RegistrationWelcome({
  onBegin,
}: RegistrationWelcomeProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl">
      <div className="mx-auto max-w-2xl text-center">

        <span className="inline-flex rounded-full bg-[#123E74]/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-[#123E74]">
          Welcome
        </span>

        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-950">
          Let&apos;s get your family registered.
        </h1>

        <p className="mt-6 text-xl leading-8 text-slate-600">
          Registration only takes a few minutes.
          Your progress is saved automatically,
          so you can stop anytime and continue later.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 p-5">
            <Clock3 className="h-8 w-8 text-[#D7193F]" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">
              About 5 Minutes
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <Save className="h-8 w-8 text-[#D7193F]" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">
              Autosaves
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <Smartphone className="h-8 w-8 text-[#D7193F]" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">
              Mobile Friendly
            </h3>
          </div>

        </div>

        <button
          onClick={onBegin}
          className="mt-12 inline-flex h-14 items-center rounded-full bg-[#123E74] px-10 text-lg font-semibold text-white transition hover:scale-[1.02]"
        >
          Let&apos;s Begin →
        </button>

      </div>
    </div>
  );
}
