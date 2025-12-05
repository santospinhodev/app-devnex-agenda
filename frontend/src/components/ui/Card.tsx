import { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-white/60 bg-white shadow-card ${className}`}
      {...props}
    />
  );
}
