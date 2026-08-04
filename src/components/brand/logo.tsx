import { cn } from "@/lib/utils";

export function CerionLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center rounded-xl bg-brand-gradient", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none">
        <path
          d="M24 9.5A9.5 9.5 0 1 0 24 22.5"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="24" cy="16" r="2.6" fill="white" />
      </svg>
    </span>
  );
}

export function CerionWordmark({
  className,
  size = 32,
  subtitle,
}: {
  className?: string;
  size?: number;
  subtitle?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <CerionLogo size={size} />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-bold tracking-[0.14em] text-foreground">CERION</span>
        {subtitle && (
          <span className="block truncate text-[11px] font-medium text-muted-foreground">{subtitle}</span>
        )}
      </span>
    </span>
  );
}
