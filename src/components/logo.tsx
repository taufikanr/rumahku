import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { tile: "size-7 rounded-lg", svg: 18, text: "text-base" },
  md: { tile: "size-9 rounded-xl", svg: 22, text: "text-xl" },
  lg: { tile: "size-12 rounded-2xl", svg: 30, text: "text-2xl" },
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
      className={cn(
        "inline-flex items-center justify-center bg-primary text-primary-foreground shadow-sm shadow-primary/30",
        s.tile,
        className,
      )}
      aria-hidden
    >
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 4 28 13.2V26a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V13.2L16 4Z"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="m11.5 17.2 3.2 3.2 6-6.4"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
          Rumah<span className="text-primary">Ku</span>
        </span>
      )}
    </span>
  );
}
