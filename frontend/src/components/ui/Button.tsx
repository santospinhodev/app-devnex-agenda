"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus-visible:outline-primary",

  outline:
    "border border-primary text-primary hover:bg-primary/10 focus-visible:outline-primary",

  auth: `
    bg-[#fae101] 
    text-[#0f1d37] 
    !rounded-full
    hover:bg-[#d8c100]
    focus-visible:outline-[#fae101]
  `,
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const styles = `${baseStyles} ${variants[variant]} ${className}`;

    return (
      <button
        ref={ref}
        className={styles}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
            aria-hidden
          />
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
