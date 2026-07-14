"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  string
> = {
  primary:
    "bg-[#123E74] text-white shadow-sm hover:bg-[#0F3563] active:scale-[0.98] focus-visible:ring-[#123E74]",

  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] focus-visible:ring-slate-300",

  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-slate-300",

  danger:
    "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500",
};

const sizeClasses: Record<
  NonNullable<ButtonProps["size"]>,
  string
> = {
  sm: "h-9 px-3 text-sm",

  md: "h-11 px-5 text-sm",

  lg: "h-12 px-6 text-base",

  icon: "h-11 w-11 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-xl font-semibold",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-4",
          "disabled:pointer-events-none",
          "disabled:opacity-50",
          "select-none",
          "whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}

        {children}

        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
