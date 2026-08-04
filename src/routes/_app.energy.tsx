import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Battery,
  CircleDollarSign,
  Gauge,
  Leaf,
  LineChart,
  PieChart,
  Plug,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  ChartCard,
  ClassroomSelector,
  MetricCard,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/energy")({
  head: () => ({
    meta: [
      { title: "Energy — CERION" },
      {
        name: "description",
        content: "Electricity consumption monitoring interface for classrooms in CERION.",
      },
      { property: "og:title", content: "Energy — CERION" },
      { property: "og:description", content: "Voltage, current, power and consumption monitoring for schools." },
    ],
  }),
  component: EnergyPage,
});

const PRIMARY = [
  { title: "Voltage", icon: Plug, unit: "V" },
  { title: "Current", icon: Activity, unit: "A" },
  { title: "Power", icon: Zap, unit: "W" },
  { title: "Energy Today", icon: Battery, unit: "kWh" },
];

const SECONDARY = [
  { title: "Daily Usage", icon: BarChart3, unit: "kWh" },
  { title: "Weekly Usage", icon: BarChart3, unit: "kWh" },
  { title: "Monthly Usage", icon: BarChart3, unit: "kWh" },
  { title: "Estimated Electricity Cost", icon: CircleDollarSign },
  { title: "Carbon Footprint", icon: Leaf, unit: "kg CO₂e" },
  { title: "Peak Usage", icon: TrendingUp, unit: "W" },
  { title: "Energy Efficiency Score", icon: Gauge },
  { title: "Estimated Savings", icon: CircleDollarSign },
];

function EnergyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Energy"
        title="Electricity monitoring"
        description="Live electrical measurements and consumption analytics for every monitored classroom."
        actions={
          <>
            <ClassroomSelector />
            <StatusBadge label="Waiting for PZEM connection" tone="warning" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRIMARY.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            icon={metric.icon}
            unit={metric.unit}
            status="No energy data"
          />
        ))}
      </div>

      <section aria-labelledby="energy-summary" className="space-y-4">
        <h2 id="energy-summary" className="text-lg font-semibold tracking-tight">
          Consumption summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECONDARY.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              icon={metric.icon}
              unit={metric.unit}
              status="Waiting for PZEM connection"
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="energy-charts" className="space-y-4">
        <h2 id="energy-charts" className="text-lg font-semibold tracking-tight">
          Energy analytics
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Real-time Power" icon={LineChart} description="Awaiting data integration" />
          <ChartCard title="Daily Energy" icon={BarChart3} variant="bars" description="Awaiting data integration" />
          <ChartCard title="Weekly Comparison" icon={BarChart3} variant="bars" description="Awaiting data integration" />
          <ChartCard title="Monthly Trend" icon={LineChart} description="Awaiting data integration" />
          <ChartCard
            title="Energy by Device Category"
            icon={PieChart}
            variant="donut"
            description="Awaiting data integration"
          />
          <SectionCard title="Integration note" icon={Plug}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Energy values, cost estimation and carbon footprint calculations will be produced once the
              electrical sensing hardware and data pipeline are connected in a later development phase.
            </p>
          </SectionCard>
        </div>
      </section>
    </>
  );
}
