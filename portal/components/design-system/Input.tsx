"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div
        className={cn(
          "flex flex-col gap-2",
          fullWidth && "w-full"
        )}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-xl border bg-white transition-all duration-200",
            error
              ? "border-red-500 ring-2 ring-red-100"
              : "border-slate-200 hover:border-slate-300 focus-within:border-[#123E74] focus-within:ring-4 focus-within:ring-[#123E74]/10",
            disabled && "cursor-not-allowed bg-slate-100 opacity-60"
          )}
        >
          {leftIcon && (
            <div className="pointer-events-none pl-4 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "h-12 w-full bg-transparent",
              "rounded-xl",
              "px-4",
              leftIcon && "pl-3",
              rightIcon && "pr-10",
              "text-[15px] text-slate-900",
              "placeholder:text-slate-400",
              "outline-none",
              className
            )}
            {...props}
          />

          {error ? (
            <AlertCircle
              className="mr-3 h-5 w-5 shrink-0 text-red-500"
              strokeWidth={2}
            />
          ) : (
            rightIcon && (
              <div className="mr-3 flex items-center text-slate-400">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="flex items-center gap-1 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
