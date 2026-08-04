import {
  Activity,
  BarChart3,
  Bell,
  Cpu,
  Gauge,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  description: string;
};

export const APP_NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, description: "Executive overview" },
  { label: "Environment", to: "/environment", icon: Gauge, description: "Air & comfort" },
  { label: "Energy", to: "/energy", icon: Zap, description: "Electricity monitoring" },
  { label: "Devices", to: "/devices", icon: Cpu, description: "Connected hardware" },
  { label: "Alerts", to: "/alerts", icon: Bell, description: "Threshold events" },
  { label: "History", to: "/history", icon: History, description: "Recorded readings" },
  { label: "Reports", to: "/reports", icon: BarChart3, description: "Periodic summaries" },
  { label: "AI Insights", to: "/ai-insights", icon: Sparkles, description: "CERION assistant" },
  { label: "Settings", to: "/settings", icon: Settings, description: "Platform preferences" },
  { label: "Profile", to: "/profile", icon: User, description: "Account details" },
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
