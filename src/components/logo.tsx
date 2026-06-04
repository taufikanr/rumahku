import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "size-7", text: "text-base" },
  md: { box: "size-9", text: "text-xl" },
  lg: { box: "size-12", text: "text-2xl" },
} as const;

export function LogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: keyof typeof sizeMap;
}) {
  const s = sizeMap[size];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", s.box, className)}
      aria-hidden
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={452}
        height={438}
        className="size-full object-contain"
        priority
      />
    </span>
  );
}

export function Logo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: keyof typeof sizeMap;
  showText?: boolean;
}) {
  const s = sizeMap[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn(
            "font-heading font-extrabold tracking-tight leading-none",
            s.text,
          )}
        >
          Rumah<span className="text-brand-teal">Ku</span>
        </span>
      )}
    </span>
  );
}
