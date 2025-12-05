export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  } as const;

  return (
    <div
      aria-label="Devnex Solutions"
      className={`font-black tracking-[0.3em] text-primary ${sizes[size]}`}
    >
      DEVNEX
    </div>
  );
}
