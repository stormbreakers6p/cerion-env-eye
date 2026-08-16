import {
  Activity,
  BarChart3,
  Bell,
  Cpu,
  Gauge,
  History,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export type NavItem = {
  labelKey: string;
  descriptionKey: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Permission required to see and open this item. */
  permission?: Permission;
};

export const APP_NAV: NavItem[] = [
  { labelKey: "nav.dashboard", to: "/dashboard", icon: LayoutDashboard, descriptionKey: "nav.desc.dashboard", permission: "view.dashboard" },
  { labelKey: "nav.environment", to: "/environment", icon: Gauge, descriptionKey: "nav.desc.environment", permission: "view.environment" },
  { labelKey: "nav.devices", to: "/devices", icon: Cpu, descriptionKey: "nav.desc.devices", permission: "manage.devices" },
  { labelKey: "nav.alerts", to: "/alerts", icon: Bell, descriptionKey: "nav.desc.alerts", permission: "view.alerts" },
  { labelKey: "nav.history", to: "/history", icon: History, descriptionKey: "nav.desc.history", permission: "view.history" },
  { labelKey: "nav.reports", to: "/reports", icon: BarChart3, descriptionKey: "nav.desc.reports", permission: "view.reports" },
  { labelKey: "nav.ai", to: "/ai-insights", icon: Sparkles, descriptionKey: "nav.desc.ai", permission: "view.ai" },
  { labelKey: "nav.management", to: "/management", icon: ShieldCheck, descriptionKey: "nav.desc.management", permission: "management.access" },
  { labelKey: "nav.settings", to: "/settings", icon: Settings, descriptionKey: "nav.desc.settings", permission: "settings.view" },
  { labelKey: "nav.profile", to: "/profile", icon: User, descriptionKey: "nav.desc.profile" },
];

export const BRAND = {
  name: "CERION",
  slogan: "Smarter Classrooms, Greener Future.",
  version: "Version 1.0",
  statusIcon: Activity,
} as const;

export const NOT_CONNECTED = "Not connected";
export const NO_DATA = "No data";
export const PLACEHOLDER_VALUE = "—";
export const INTEGRATION_NOTICE = "Feature will be available after system integration.";
