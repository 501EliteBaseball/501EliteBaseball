"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import ConversationStage from "@/components/registration/conversation/ConversationStage";

export type FamilyForm = {
  family_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

type FamilyStepProps = {
  family: FamilyForm;
  setFamily: Dispatch<SetStateAction<FamilyForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
};

const questionContent = [
  {
    eyebrow: "Let’s meet the household",
    title: "What should we call your family?",
    description:
      "Most families simply use their last name, such as “The Thomas Family.”",
  },
  {
    eyebrow: "Great",
    title: "Where does your family call home?",
    description:
      "This helps us maintain accurate team and emergency records.",
  },
  {
    eyebrow: "Almost there",
    title: "Finish your home address.",
    description: "Just the city, state, and ZIP code remain.",
  },
  {
    eyebrow: "Home base confirmed",
    title: "Your family details are ready.",
    description:
      "Take a quick look below. You can go back if anything needs to be changed.",
  },
] as const;

const inputClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

const labelClassName =
  "text-xs font-bold uppercase tracking-[0.2em] text-slate-400";

const errorClassName = "mt-3 text-sm font-semibold text-[#D7193F]";

export default function FamilyStep({
  family,
  setFamily,
  question,
  setQuestion,
}: FamilyStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const currentQuestion = questionContent[question] ?? questionContent[0];

  function updateFamily(field: keyof FamilyForm, value: string) {
    setFamily((current) => ({
      ...current,
      [field]: value,
    }));

    if (localErrors[field]) {
      setLocalErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  }

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 0 && !family.family_name.trim()) {
      errors.family_name = "Please enter the name you use for your family.";
    }

    if (question === 1 && !family.address_line_1.trim()) {
      errors.address_line_1 = "Please enter your street address.";
    }

    if (question === 2) {
      if (!family.city.trim()) {
        errors.city = "Please enter your city.";
      }

      if (!family.state.trim()) {
        errors.state = "Please enter your state.";
      }

      if (!family.postal_code.trim()) {
        errors.postal_code = "Please enter your ZIP code.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 3));
  }

  function goBack() {
    setLocalErrors({});
    setQuestion((current) => Math.max(current - 1, 0));
  }

  function handleEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    advance();
  }

  return (
    <ConversationStage
      eyebrow={currentQuestion.eyebrow}
      title={currentQuestion.title}
      description={currentQuestion.description}
      question={question}
      totalQuestions={questionContent.length}
      canGoBack={question > 0}
      onBack={question > 0 ? goBack : undefined}
      onContinue={question < 3 ? advance : undefined}
    >
      {question === 0 ? (
        <div className="max-w-xl">
          <label htmlFor="family-name" className={labelClassName}>
            Family name
          </label>

          <input
            id="family-name"
            type="text"
            autoComplete="organization"
            autoFocus
            value={family.family_name}
            onChange={(event) =>
              updateFamily("family_name", event.target.value)
            }
            onKeyDown={handleEnter}
            placeholder="The Thomas Family"
            className={inputClassName}
          />

          {localErrors.family_name ? (
            <p className={errorClassName}>{localErrors.family_name}</p>
          ) : null}
        </div>
      ) : null}

      {question === 1 ? (
        <div className="max-w-xl space-y-7">
          <div>
            <label htmlFor="address-line-1" className={labelClassName}>
              Street address
            </label>

            <input
              id="address-line-1"
              type="text"
              autoComplete="address-line1"
              autoFocus
              value={family.address_line_1}
              onChange={(event) =>
                updateFamily("address_line_1", event.target.value)
              }
              placeholder="123 Ballpark Lane"
              className={inputClassName}
            />

            {localErrors.address_line_1 ? (
              <p className={errorClassName}>
                {localErrors.address_line_1}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="address-line-2" className={labelClassName}>
              Apartment, suite, or unit
              <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">
                Optional
              </span>
            </label>

            <input
              id="address-line-2"
              type="text"
              autoComplete="address-line2"
              value={family.address_line_2}
              onChange={(event) =>
                updateFamily("address_line_2", event.target.value)
              }
              placeholder="Unit 4"
              className={inputClassName}
            />
          </div>
        </div>
      ) : null}

      {question === 2 ? (
        <div className="grid gap-8 sm:grid-cols-[1.4fr_0.65fr_0.9fr]">
          <div>
            <label htmlFor="family-city" className={labelClassName}>
              City
            </label>

            <input
              id="family-city"
              type="text"
              autoComplete="address-level2"
              autoFocus
              value={family.city}
              onChange={(event) => updateFamily("city", event.target.value)}
              placeholder="Hot Springs"
              className={inputClassName}
            />

            {localErrors.city ? (
              <p className={errorClassName}>{localErrors.city}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="family-state" className={labelClassName}>
              State
            </label>

            <input
              id="family-state"
              type="text"
              autoComplete="address-level1"
              maxLength={2}
              value={family.state}
              onChange={(event) =>
                updateFamily("state", event.target.value.toUpperCase())
              }
              placeholder="AR"
              className={inputClassName}
            />

            {localErrors.state ? (
              <p className={errorClassName}>{localErrors.state}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="family-postal-code" className={labelClassName}>
              ZIP code
            </label>

            <input
              id="family-postal-code"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              value={family.postal_code}
              onChange={(event) =>
                updateFamily("postal_code", event.target.value)
              }
              placeholder="71901"
              className={inputClassName}
            />

            {localErrors.postal_code ? (
              <p className={errorClassName}>{localErrors.postal_code}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {question === 3 ? (
        <div className="max-w-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-6">
            <p className="text-lg font-semibold text-slate-950">
              {family.family_name}
            </p>

            <p className="mt-3 leading-7 text-slate-500">
              {family.address_line_1}
              {family.address_line_2
                ? `, ${family.address_line_2}`
                : ""}
              <br />
              {family.city}, {family.state} {family.postal_code}
            </p>

            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Family details complete
            </p>
          </div>
        </div>
      ) : null}
    </ConversationStage>
  );
}