import type { ReactNode } from "react";

type StepCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function StepCard({
  title,
  description,
  children,
}: StepCardProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {description}
            </p>
          )}
        </header>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
