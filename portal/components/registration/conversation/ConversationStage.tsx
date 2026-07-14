"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ConversationStageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  question: number;
  totalQuestions: number;
  children: ReactNode;
  continueLabel?: string;
  backLabel?: string;
  canGoBack?: boolean;
  isFinalQuestion?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
};

export default function ConversationStage({
  eyebrow,
  title,
  description,
  question,
  totalQuestions,
  children,
  continueLabel = "Continue",
  backLabel = "Back",
  canGoBack = true,
  isFinalQuestion = false,
  onBack,
  onContinue,
}: ConversationStageProps) {
  const progressItems = Array.from(
    { length: totalQuestions },
    (_, index) => index,
  );

  return (
    <div className="mx-auto flex min-h-[560px] w-full max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div
          aria-label={`Question ${question + 1} of ${totalQuestions}`}
          className="flex items-center gap-2"
        >
          {progressItems.map((item) => {
            const isActive = item <= question;

            return (
              <span
                key={item}
                aria-hidden="true"
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  isActive
                    ? "w-9 bg-gradient-to-r from-[#FF5B7C] to-[#D7193F] shadow-[0_0_12px_rgba(215,25,63,0.28)]"
                    : "w-4 bg-slate-200",
                ].join(" ")}
              />
            );
          })}
        </div>

        <p className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          {question + 1} of {totalQuestions}
        </p>
      </div>

      <div
        key={question}
        className="flex flex-1 animate-in flex-col justify-center fade-in slide-in-from-right-5 duration-500"
      >
        {eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
            {description}
          </p>
        ) : null}

        <div className="mt-10">{children}</div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || !onBack}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#123E74] disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>

        {onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className={[
              "inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 text-sm font-bold text-white transition duration-300",
              "hover:-translate-y-0.5 active:translate-y-0",
              isFinalQuestion
                ? "bg-gradient-to-br from-[#D7193F] to-[#AF102E] shadow-[0_16px_34px_rgba(215,25,63,0.28)]"
                : "bg-gradient-to-br from-[#173F73] to-[#0B2954] shadow-[0_16px_34px_rgba(18,62,116,0.30)]",
            ].join(" ")}
          >
            {continueLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}