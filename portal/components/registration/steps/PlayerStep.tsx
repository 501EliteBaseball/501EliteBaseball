"use client";

import type { Dispatch, SetStateAction } from "react";

export type PlayerForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  date_of_birth: string;
  gender: string;
  school: string;
  grade: string;
  jersey_number_preference: string;
  bats: string;
  throws: string;
};

type PlayerStepProps = {
  player: PlayerForm;
  setPlayer: Dispatch<SetStateAction<PlayerForm>>;
  formErrors: Record<string, string>;
};

export default function PlayerStep({
  player,
  setPlayer,
  formErrors,
}: PlayerStepProps) {
  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-[#123E74] focus:bg-white focus:ring-4 focus:ring-[#123E74]/10";

  const getInputClassName = (hasError: boolean) =>
    `${inputClassName} ${
      hasError
        ? "border-[#D7193F] focus:border-[#D7193F] focus:ring-[#D7193F]/10"
        : ""
    }`;

  const errorClassName = "text-sm font-medium text-[#D7193F]";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="player-first-name"
            className="text-sm font-semibold text-slate-700"
          >
            First name
          </label>
          <input
            id="player-first-name"
            name="playerFirstName"
            type="text"
            autoComplete="given-name"
            value={player.first_name}
            onChange={(event) =>
              setPlayer({
                ...player,
                first_name: event.target.value,
              })
            }
            aria-invalid={Boolean(formErrors.first_name)}
            aria-describedby={
              formErrors.first_name ? "player-first-name-error" : undefined
            }
            className={getInputClassName(Boolean(formErrors.first_name))}
          />
          {formErrors.first_name ? (
            <p
              id="player-first-name-error"
              role="alert"
              className={errorClassName}
            >
              {formErrors.first_name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="player-middle-name"
            className="text-sm font-semibold text-slate-700"
          >
            Middle name
            <span className="ml-1 font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="player-middle-name"
            name="playerMiddleName"
            type="text"
            autoComplete="additional-name"
            value={player.middle_name}
            onChange={(event) =>
              setPlayer({
                ...player,
                middle_name: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="player-last-name"
            className="text-sm font-semibold text-slate-700"
          >
            Last name
          </label>
          <input
            id="player-last-name"
            name="playerLastName"
            type="text"
            autoComplete="family-name"
            value={player.last_name}
            onChange={(event) =>
              setPlayer({
                ...player,
                last_name: event.target.value,
              })
            }
            aria-invalid={Boolean(formErrors.last_name)}
            aria-describedby={
              formErrors.last_name ? "player-last-name-error" : undefined
            }
            className={getInputClassName(Boolean(formErrors.last_name))}
          />
          {formErrors.last_name ? (
            <p
              id="player-last-name-error"
              role="alert"
              className={errorClassName}
            >
              {formErrors.last_name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="player-preferred-name"
            className="text-sm font-semibold text-slate-700"
          >
            Preferred name
            <span className="ml-1 font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="player-preferred-name"
            name="playerPreferredName"
            type="text"
            value={player.preferred_name}
            onChange={(event) =>
              setPlayer({
                ...player,
                preferred_name: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="player-date-of-birth"
            className="text-sm font-semibold text-slate-700"
          >
            Date of birth
          </label>
          <input
            id="player-date-of-birth"
            name="playerDateOfBirth"
            type="date"
            value={player.date_of_birth}
            onChange={(event) =>
              setPlayer({
                ...player,
                date_of_birth: event.target.value,
              })
            }
            aria-invalid={Boolean(formErrors.date_of_birth)}
            aria-describedby={
              formErrors.date_of_birth
                ? "player-date-of-birth-error"
                : undefined
            }
            className={getInputClassName(Boolean(formErrors.date_of_birth))}
          />
          {formErrors.date_of_birth ? (
            <p
              id="player-date-of-birth-error"
              role="alert"
              className={errorClassName}
            >
              {formErrors.date_of_birth}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="player-gender"
            className="text-sm font-semibold text-slate-700"
          >
            Gender
          </label>
          <input
            id="player-gender"
            name="playerGender"
            type="text"
            value={player.gender}
            onChange={(event) =>
              setPlayer({
                ...player,
                gender: event.target.value,
              })
            }
            aria-invalid={Boolean(formErrors.gender)}
            aria-describedby={
              formErrors.gender ? "player-gender-error" : undefined
            }
            className={getInputClassName(Boolean(formErrors.gender))}
          />
          {formErrors.gender ? (
            <p id="player-gender-error" role="alert" className={errorClassName}>
              {formErrors.gender}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="player-school"
            className="text-sm font-semibold text-slate-700"
          >
            School
          </label>
          <input
            id="player-school"
            name="playerSchool"
            type="text"
            value={player.school}
            onChange={(event) =>
              setPlayer({
                ...player,
                school: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="player-grade"
            className="text-sm font-semibold text-slate-700"
          >
            Grade
          </label>
          <input
            id="player-grade"
            name="playerGrade"
            type="text"
            value={player.grade}
            onChange={(event) =>
              setPlayer({
                ...player,
                grade: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="player-jersey-number"
          className="text-sm font-semibold text-slate-700"
        >
          Jersey number preference
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="player-jersey-number"
          name="playerJerseyNumber"
          type="text"
          inputMode="numeric"
          value={player.jersey_number_preference}
          onChange={(event) =>
            setPlayer({
              ...player,
              jersey_number_preference: event.target.value,
            })
          }
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="player-bats"
            className="text-sm font-semibold text-slate-700"
          >
            Bats
          </label>
          <input
            id="player-bats"
            name="playerBats"
            type="text"
            placeholder="Right, left, or switch"
            value={player.bats}
            onChange={(event) =>
              setPlayer({
                ...player,
                bats: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="player-throws"
            className="text-sm font-semibold text-slate-700"
          >
            Throws
          </label>
          <input
            id="player-throws"
            name="playerThrows"
            type="text"
            placeholder="Right or left"
            value={player.throws}
            onChange={(event) =>
              setPlayer({
                ...player,
                throws: event.target.value,
              })
            }
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
