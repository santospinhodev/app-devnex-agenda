import { HTMLAttributes } from "react";

const VARIANT_STYLES = {
  default: "rounded-xl border border-slate-200 bg-white",
  plain: "",
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANT_STYLES;
}

export function Card({
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const variantClasses = VARIANT_STYLES[variant];

  return <div className={`${variantClasses} ${className}`.trim()} {...props} />;
}
