import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Cloud,
  Cpu,
  Droplets,
  Gauge,
  LineChart,
  PieChart,
  Sparkles,
  Thermometer,
  Users,
  Wifi,
} from "lucide-react";
import {
  ChartCard,
  ClassroomSelector,
  EmptyState,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CERION" },
      {
        name: "description",
        content: "Executive overview of classroom environmental quality in CERION.",
      },
      { property: "og:title", content: "Dashboard — CERION" },
      { property: "og:description", content: "Executive overview of classroom environmental conditions in CERION." },
    ],
  }),
  component: DashboardPage,
});

const METRICS = [
  { title: "Temperature", icon: Thermometer, unit: "°C" },
  { title: "Humidity", icon: Droplets, unit: "%" },
  { title: "CO₂", icon: Cloud, unit: "ppm" },
  { title: "VOC", icon: Sparkles, unit: "ppb" },
  { title: "AQI", icon: Gauge },
  { title: "Pressure", icon: Gauge, unit: "hPa" },
  { title: "Gas Resistance", icon: Activity, unit: "kΩ" },
  { title: "Occupancy", icon: Users },
];

const CHARTS = [
  { title: "Temperature Trend", icon: LineChart, variant: "line" as const },
  { title: "Humidity Trend", icon: LineChart, variant: "line" as const },
  { title: "CO₂ Trend", icon: LineChart, variant: "line" as const },
  { title: "VOC Trend", icon: LineChart, variant: "line" as const },
  { title: "AQI Trend", icon: LineChart, variant: "line" as const },
  { title: "Pressure Trend", icon: LineChart, variant: "line" as const },
  { title: "Gas Resistance Trend", icon: LineChart, variant: "line" as const },
  { title: "Daily Air Quality Summary", icon: BarChart3, variant: "bars" as const },
  { title: "Air Quality Distribution", icon: PieChart, variant: "donut" as const },
];

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <p className="text-sm font-medium tabular-nums text-foreground">
        {now ? now.toLocaleTimeString() : "--:--:--"}
      </p>
      <p className="text-xs text-muted-foreground">
        {now ? now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}
      </p>
    </div>
  );
}

function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Welcome to CERION"
        description="Your classroom environmental command centre. Live values appear once devices are integrated."
        actions={
          <>
            <ClassroomSelector />
            <Clock />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionCard title="System status" icon={Activity}>
          <StatusBadge label="Waiting for system integration" tone="warning" />
          <p className="mt-3 text-sm text-muted-foreground">
            CERION is running in interface prototype mode.
          </p>
        </SectionCard>
        <SectionCard title="Last connection" icon={Wifi}>
          <p className="text-2xl font-semibold text-muted-foreground/70">—</p>
          <p className="mt-2 text-sm text-muted-foreground">No device has connected yet.</p>
        </SectionCard>
        <SectionCard title="Monitored classrooms" icon={Users}>
          <p className="text-2xl font-semibold text-muted-foreground/70">—</p>
          <p className="mt-2 text-sm text-muted-foreground">Select a classroom to begin.</p>
        </SectionCard>
      </div>

      <section aria-labelledby="metrics-heading" className="space-y-4">
        <h2 id="metrics-heading" className="text-lg font-semibold tracking-tight">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {METRICS.map((metric) => (
            <MetricCard key={metric.title} title={metric.title} icon={metric.icon} unit={metric.unit} />
          ))}
        </div>
      </section>

      <section aria-labelledby="charts-heading" className="space-y-4">
        <h2 id="charts-heading" className="text-lg font-semibold tracking-tight">
          Trends
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {CHARTS.map((chart) => (
            <ChartCard
              key={chart.title}
              title={chart.title}
              icon={chart.icon}
              variant={chart.variant}
              description="Awaiting data integration"
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent alerts" icon={Bell}>
          <EmptyState
            icon={Bell}
            title="No alerts available"
            description="Alerts will appear here after devices are connected and thresholds are configured."
          />
        </SectionCard>
        <SectionCard title="Device overview" icon={Cpu}>
          <EmptyState
            icon={Cpu}
            title="No devices connected"
            description="Connected CERION devices will appear here with status, signal and firmware details."
          />
        </SectionCard>
      </div>
    </>
  );
}
