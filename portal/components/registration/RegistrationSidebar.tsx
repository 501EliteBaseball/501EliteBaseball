import { CheckCircle2, ClipboardList } from "lucide-react";

type StepKey =
  | "parent"
  | "family"
  | "player"
  | "emergency"
  | "medical"
  | "uniform"
  | "review"
  | "complete";

type StepConfig = {
  title: string;
  description: string;
  number: number;
};

type RegistrationSidebarProps = {
  step: StepKey;
  stepOrder: StepKey[];
  stepConfig: Record<StepKey, StepConfig>;
};

export default function RegistrationSidebar({
  step,
  stepOrder,
  stepConfig,
}: RegistrationSidebarProps) {
  return (
    <aside className="relative w-full overflow-hidden rounded-[30px] bg-[linear-gradient(155deg,#173F73_0%,#0B2548_58%,#081C36_100%)] p-5 text-white shadow-[0_24px_70px_rgba(8,28,54,0.34)] sm:p-6 lg:max-w-[340px]">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#D7193F]/20 blur-3xl"
      />

      <div className="relative">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/70">
            501 Elite OS
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
            Getting started
          </h1>

          <p className="mt-2 text-sm leading-6 text-blue-100/75">
            Everything saves automatically as you go.
          </p>
        </div>

        <div className="mt-7 rounded-[26px] border border-white/15 bg-white/10 p-5 shadow-inner shadow-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>

            <span className="font-semibold">
              {stepConfig[step].number}/8
            </span>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_18px_rgba(255,91,124,0.7)] transition-all duration-700"
              style={{
                width: `${Math.min(
                  (stepConfig[step].number / 8) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-4 text-sm leading-6 text-blue-50">
            {stepConfig[step].description}
          </p>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          {stepOrder.map((item) => {
            const config = stepConfig[item];

            const active = item === step;

            const done = stepConfig[step].number > config.number;

            return (
              <div
                key={item}
                className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                  active
                    ? "border-white/20 bg-white/15 shadow-lg shadow-black/10"
                    : done
                    ? "border-transparent bg-white/[0.06] text-white"
                    : "border-transparent bg-transparent text-blue-100/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ClipboardList className="h-4 w-4" />
                  )}

                  {config.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
