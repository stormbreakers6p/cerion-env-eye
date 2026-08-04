import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface PageHeaderProps {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  actions?: ReactNode | undefined;
}

export interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  value?: string | number | undefined;
  unit?: string | undefined;
  status?: string | undefined;
  trend?: string | undefined;
  loading?: boolean | undefined;
  connected?: boolean | undefined;
}

export interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  description?: string | undefined;
  variant?: "line" | "bars" | "donut" | undefined;
  height?: number | undefined;
  loading?: boolean | undefined;
}

export interface GaugeCardProps {
  title: string;
  icon: LucideIcon;
  unit?: string | undefined;
  value?: string | number | undefined;
  hint?: string | undefined;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode | undefined;
  compact?: boolean | undefined;
}

/** Optional device shape reserved for future integration. No data is provided in Version 1. */
export interface DeviceSummary {
  id?: string | undefined;
  name?: string | undefined;
  type?: string | undefined;
  classroom?: string | undefined;
  online?: boolean | undefined;
  signal?: number | undefined;
  battery?: number | undefined;
  firmware?: string | undefined;
  lastUpdate?: string | undefined;
  sensors?: string[] | undefined;
}

/** Optional alert shape reserved for future integration. */
export interface AlertSummary {
  id?: string | undefined;
  title?: string | undefined;
  severity?: "critical" | "warning" | "normal" | undefined;
  classroom?: string | undefined;
  timestamp?: string | undefined;
  message?: string | undefined;
}

export type IconComponent = ComponentType<{ className?: string }>;
