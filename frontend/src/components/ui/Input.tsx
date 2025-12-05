"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId =
      id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition ring-1 ring-transparent focus:ring-primary ${
            error ? "border-red-400" : "border-slate-200"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
