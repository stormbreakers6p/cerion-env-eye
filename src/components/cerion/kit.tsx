import type { ReactNode } from "react";
import { Circle, Search, SlidersHorizontal, Calendar, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NOT_CONNECTED, NO_DATA, PLACEHOLDER_VALUE, INTEGRATION_NOTICE } from "@/lib/navigation";
import type {
  ChartCardProps,
  DeviceSummary,
  EmptyStateProps,
  GaugeCardProps,
  MetricCardProps,
  PageHeaderProps,
  StatusTone,
} from "@/types/components";

/* ------------------------------------------------------------------ layout */

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 animate-rise">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: {
  title?: string | undefined;
  description?: string | undefined;
  icon?: React.ComponentType<{ className?: string }> | undefined;
  actions?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-[18px] w-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>}
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ status */

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  danger: "bg-danger/12 text-danger border-danger/30",
  info: "bg-info/12 text-info border-info/30",
};

export function StatusBadge({
  label,
  tone = "neutral",
  dot = true,
  className,
}: {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <Circle className="h-2 w-2 fill-current" aria-hidden="true" />}
      {label}
    </span>
  );
}

export function IntegrationStatus({
  label,
  status = NOT_CONNECTED,
  tone = "neutral",
}: {
  label: string;
  status?: string;
  tone?: StatusTone;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-3">
      <span className="min-w-0 truncate text-sm font-medium text-foreground">{label}</span>
      <StatusBadge label={status} tone={tone} />
    </div>
  );
}

/* -------------------------------------------------------------- placeholder */

export function MetricPlaceholder({ className }: { className?: string }) {
  return (
    <span className={cn("text-3xl font-semibold tabular-nums text-muted-foreground/70", className)}>
      {PLACEHOLDER_VALUE}
    </span>
  );
}

export function MetricCard({
  title,
  icon: Icon,
  value,
  unit,
  status = NO_DATA,
  trend,
  loading = false,
  connected = false,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />;

  return (
    <article className="surface-card hover-lift group p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary/15">
          <Icon className="h-5 w-5" />
        </span>
        <StatusBadge label={connected ? "Live" : NOT_CONNECTED} tone={connected ? "success" : "neutral"} />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        {value !== undefined && value !== null && value !== "" ? (
          <span className="text-3xl font-semibold tabular-nums text-foreground">{value}</span>
        ) : (
          <MetricPlaceholder />
        )}
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{trend ?? status}</p>
      <Sparkline />
    </article>
  );
}

function Sparkline() {
  return (
    <div
      className="mt-4 h-10 rounded-lg border border-dashed border-border bg-muted/30"
      role="img"
      aria-label="Sparkline area, no data connected"
    >
      <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="h-full w-full opacity-40">
        <line
          x1="0"
          y1="20"
          x2="120"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 5"
          className="text-muted-foreground"
        />
      </svg>
    </div>
  );
}

export function ChartPlaceholder({ variant = "line", height = 200 }: { variant?: ChartCardProps["variant"] | undefined; height?: number | undefined }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-dashed border-border bg-muted/25"
      style={{ height }}
      role="img"
      aria-label="Empty chart area, data will appear after system integration"
    >
      <div className="absolute inset-0 grid-fade opacity-70" />
      {variant === "line" && (
        <svg className="absolute inset-0 h-full w-full text-primary/40" preserveAspectRatio="none" viewBox="0 0 300 120">
          <path
            d="M0 90 C 40 70, 60 96, 100 74 S 170 40, 210 62 260 44, 300 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {variant === "bars" && (
        <div className="absolute inset-0 flex items-end justify-around gap-2 p-5">
          {[38, 62, 48, 74, 56, 82, 44].map((h, i) => (
            <span
              key={i}
              className="w-full max-w-8 rounded-t-md border border-dashed border-primary/30 bg-primary/8"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )}
      {variant === "donut" && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-28 w-28 place-items-center rounded-full border-[10px] border-dashed border-primary/30">
            <span className="text-lg font-semibold text-muted-foreground/70">{PLACEHOLDER_VALUE}</span>
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-3">
        <span className="rounded-full border border-border bg-card/85 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
          Data will appear after system integration
        </span>
      </div>
    </div>
  );
}

export function ChartCard({ title, icon: Icon, description, variant = "line", height = 200, loading = false }: ChartCardProps) {
  return (
    <SectionCard title={title} description={description} icon={Icon}>
      {loading ? <Skeleton className="w-full rounded-xl" style={{ height }} /> : <ChartPlaceholder variant={variant} height={height} />}
    </SectionCard>
  );
}

export function GaugePlaceholder({ unit }: { unit?: string | undefined }) {
  return (
    <div className="relative mx-auto grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="10"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className="stroke-primary/35"
        />
      </svg>
      <div className="relative text-center">
        <span className="block text-3xl font-semibold text-muted-foreground/70">{PLACEHOLDER_VALUE}</span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

export function GaugeCard({ title, icon: Icon, unit, value, hint = "Waiting for sensor connection" }: GaugeCardProps) {
  return (
    <article className="surface-card hover-lift p-5 text-center">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
        </span>
        <StatusBadge label={NO_DATA} />
      </div>
      <div className="mt-4">
        {value ? (
          <span className="text-3xl font-semibold text-foreground">{value}</span>
        ) : (
          <GaugePlaceholder unit={unit} />
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </article>
  );
}

export function HeatMapPlaceholder({ rows = 4, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="img"
        aria-label="Classroom heat map grid, no sensor values connected"
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div
            key={i}
            className="grid aspect-square place-items-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground/60 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {PLACEHOLDER_VALUE}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Zone values appear once classroom sensors are mapped and connected.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- empty states */

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-rise flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center",
        compact ? "py-8" : "py-14",
      )}
      role="status"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-soft)]">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DisabledAction({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex", className)} tabIndex={0} aria-describedby="integration-notice">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent id="integration-notice">{INTEGRATION_NOTICE}</TooltipContent>
    </Tooltip>
  );
}

/* ---------------------------------------------------------------- skeletons */

export function MetricCardSkeleton() {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-16" />
      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </div>
  );
}

export function ChartCardSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="surface-card p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ShimmerBar({ className }: { className?: string | undefined }) {
  return <div className={cn("shimmer h-2 rounded-full bg-muted", className)} />;
}

/* ------------------------------------------------------------------ inputs */

export function SearchInput({
  placeholder = "Search",
  label,
  className,
}: {
  placeholder?: string | undefined;
  label?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      {label && (
        <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      )}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-11 rounded-xl pl-9" placeholder={placeholder} aria-label={label ?? placeholder} />
    </div>
  );
}

export function SelectShell({
  placeholder,
  options,
  icon: Icon,
  ariaLabel,
  className,
}: {
  placeholder: string;
  options: string[];
  icon?: React.ComponentType<{ className?: string }> | undefined;
  ariaLabel: string;
  className?: string | undefined;
}) {
  return (
    <Select>
      <SelectTrigger className={cn("h-11 min-w-[9rem] rounded-xl", className)} aria-label={ariaLabel}>
        {Icon && <Icon className="mr-1 h-4 w-4 text-muted-foreground" />}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((option) => (
          <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, "-")}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ClassroomSelector({ className }: { className?: string | undefined }) {
  return (
    <Select>
      <SelectTrigger className={cn("h-10 min-w-[10rem] rounded-xl", className)} aria-label="Select classroom">
        <School className="mr-1 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Select classroom" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <div className="px-3 py-6 text-center text-xs text-muted-foreground">
          No classrooms configured yet.
        </div>
      </SelectContent>
    </Select>
  );
}

export function DateRangeSelector({ className }: { className?: string | undefined }) {
  return (
    <DisabledAction className={className}>
      <Button variant="outline" className="h-11 justify-start gap-2 rounded-xl text-muted-foreground" disabled>
        <Calendar className="h-4 w-4" />
        Select date range
      </Button>
    </DisabledAction>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="surface-card flex flex-wrap items-end gap-3 p-4">
      <span className="hidden items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:flex">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ tables */

export function DataTableShell({
  columns,
  emptyMessage,
  children,
}: {
  columns: string[];
  emptyMessage: string;
  children?: ReactNode;
}) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children ?? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- devices */

export function DeviceCard({ device }: { device?: DeviceSummary }) {
  if (!device) return null;
  return (
    <article className="surface-card hover-lift p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{device.name ?? PLACEHOLDER_VALUE}</h3>
          <p className="truncate text-xs text-muted-foreground">{device.type ?? PLACEHOLDER_VALUE}</p>
        </div>
        <StatusBadge
          label={device.online ? "Online" : "Offline"}
          tone={device.online ? "success" : "neutral"}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {[
          ["Classroom", device.classroom],
          ["Wi-Fi", device.signal !== undefined ? `${device.signal}%` : undefined],
          ["Battery", device.battery !== undefined ? `${device.battery}%` : undefined],
          ["Firmware", device.firmware],
          ["Last update", device.lastUpdate],
          ["Sensors", device.sensors?.join(", ")],
        ].map(([label, value]) => (
          <div key={label as string} className="min-w-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="truncate font-medium text-foreground">{(value as string) ?? PLACEHOLDER_VALUE}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
