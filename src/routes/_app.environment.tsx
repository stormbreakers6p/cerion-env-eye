import { createFileRoute } from "@tanstack/react-router";
import {
  Cloud,
  Droplets,
  Gauge,
  Grid3x3,
  HeartPulse,
  LineChart,
  Lightbulb,
  Sparkles,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  ChartCard,
  ClassroomSelector,
  EmptyState,
  GaugeCard,
  HeatMapPlaceholder,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/environment")({
  head: () => ({
    meta: [
      { title: "Environment — CERION" },
      {
        name: "description",
        content: "Classroom air quality, comfort and environmental monitoring interface in CERION.",
      },
      { property: "og:title", content: "Environment — CERION" },
      { property: "og:description", content: "Air quality, comfort index and classroom health monitoring." },
    ],
  }),
  component: EnvironmentPage,
});

const GAUGES = [
  { title: "Temperature", icon: Thermometer, unit: "°C" },
  { title: "Humidity", icon: Droplets, unit: "%" },
  { title: "CO₂", icon: Cloud, unit: "ppm" },
  { title: "VOC", icon: Sparkles, unit: "ppb" },
  { title: "AQI", icon: Gauge },
];

function EnvironmentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Environment"
        title="Environmental monitoring"
        description="Air quality, thermal comfort and classroom health indicators across the school."
        actions={<ClassroomSelector />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Monitored zones", hint: "No zones mapped" },
          { label: "Active sensors", hint: "Waiting for sensor connection" },
          { label: "Air quality state", hint: "No data" },
          { label: "Comfort state", hint: "No data" },
        ].map((item) => (
          <div key={item.label} className="surface-card hover-lift p-5">
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-muted-foreground/70">—</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="gauges-heading" className="space-y-4">
        <h2 id="gauges-heading" className="text-lg font-semibold tracking-tight">
          Sensor gauges
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {GAUGES.map((gauge) => (
            <GaugeCard key={gauge.title} title={gauge.title} icon={gauge.icon} unit={gauge.unit} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Comfort Index" icon={HeartPulse} description="Composite comfort rating">
          <div className="flex flex-col items-center py-4">
            <span className="text-5xl font-semibold text-muted-foreground/70">—</span>
            <StatusBadge label="Waiting for sensor connection" className="mt-4" />
          </div>
        </SectionCard>
        <SectionCard title="Classroom Health Score" icon={Wind} description="Overall environmental health">
          <div className="flex flex-col items-center py-4">
            <span className="text-5xl font-semibold text-muted-foreground/70">—</span>
            <StatusBadge label="No data" className="mt-4" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Classroom heat map" icon={Grid3x3} description="Zone-level environmental view">
        <HeatMapPlaceholder />
      </SectionCard>

      <section aria-labelledby="env-trends" className="space-y-4">
        <h2 id="env-trends" className="text-lg font-semibold tracking-tight">
          Environmental trends
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {["Temperature", "Humidity", "CO₂", "VOC", "AQI"].map((title) => (
            <ChartCard key={title} title={`${title} trend`} icon={LineChart} description="Awaiting data integration" />
          ))}
          <ChartCard title="Zone comparison" icon={Gauge} variant="bars" description="Awaiting data integration" />
        </div>
      </section>

      <SectionCard title="Recommended actions" icon={Lightbulb}>
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Recommendations will appear after environmental data is connected."
        />
      </SectionCard>
    </>
  );
}
