import type { ReactNode } from "react";

type RegistrationShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function RegistrationShell({
  sidebar,
  children,
}: RegistrationShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4F7FC] px-3 py-4 text-slate-950 sm:px-6 sm:py-8 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#123E74]/10 blur-3xl" />

        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#D7193F]/8 blur-3xl" />

        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-4 rounded-[36px] border border-white/80 bg-white/65 p-3 shadow-[0_40px_140px_rgba(18,62,116,0.18)] backdrop-blur-2xl sm:gap-6 sm:p-5 lg:min-h-[760px] lg:flex-row lg:p-6">
        {sidebar}

        <section className="min-w-0 flex-1">
          <div className="flex min-h-full flex-col rounded-[30px] border border-white/90 bg-white/85 p-4 shadow-[0_20px_70px_rgba(18,62,116,0.10)] backdrop-blur-xl sm:p-7 lg:p-9">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
