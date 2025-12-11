import Image from "next/image";
import LogoSvg from "@/public/Logo.svg";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  } as const;

  const sizePixels = {
    sm: 180,
    md: 260,
    lg: 480,
  } as const;

  return (
    <div
      aria-label="Devnex Solutions"
      className={`font-black tracking-[0.3em] text-primary ${sizeClasses[size]}`}
    >
      <Image
        src={LogoSvg}
        alt="Devnex Solutions"
        width={sizePixels[size]}
        height={sizePixels[size]}
        priority
      />
    </div>
  );
}
