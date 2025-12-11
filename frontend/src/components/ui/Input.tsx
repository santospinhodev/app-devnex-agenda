"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  variant?: "default" | "auth";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className = "", id, variant = "default", ...props },
    ref
  ) => {
    const inputId =
      id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

    const baseClasses = "w-full outline-none transition";

    const variants = {
      default: `
        rounded-lg border bg-white px-3 py-2 text-sm
        text-slate-900
        border-slate-200
        focus:ring-primary focus:ring-2
      `,
      auth: `
        rounded-full border px-4 py-2 text-sm
        bg-[#142d4b] 
        text-white 
        placeholder-white/60
        border-[#fae101]
        focus:border-[#fae101]
        focus:ring-0
      `,
    } as const;

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={
            variant === "auth"
              ? "text-sm font-medium text-white"
              : "text-sm font-medium text-slate-700"
          }
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          data-variant={variant}
          className={`
            ${baseClasses}
            ${variants[variant]}
            ${error ? "border-red-400" : ""}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
