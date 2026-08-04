import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  value?: string | number;
  unit?: string;
  status?: string;
  trend?: string;
  loading?: boolean;
  connected?: boolean;
}

export interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  variant?: "line" | "bars" | "donut";
  height?: number;
  loading?: boolean;
}

export interface GaugeCardProps {
  title: string;
  icon: LucideIcon;
  unit?: string;
  value?: string | number;
  hint?: string;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

/** Optional device shape reserved for future integration. No data is provided in Version 1. */
export interface DeviceSummary {
  id?: string;
  name?: string;
  type?: string;
  classroom?: string;
  online?: boolean;
  signal?: number;
  battery?: number;
  firmware?: string;
  lastUpdate?: string;
  sensors?: string[];
}

/** Optional alert shape reserved for future integration. */
export interface AlertSummary {
  id?: string;
  title?: string;
  severity?: "critical" | "warning" | "normal";
  classroom?: string;
  timestamp?: string;
  message?: string;
}

export type IconComponent = ComponentType<{ className?: string }>;
