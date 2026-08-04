import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, CheckCircle2, Clock, Filter, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClassroomSelector,
  DateRangeSelector,
  DisabledAction,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  SectionCard,
  SelectShell,
} from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — CERION" },
      { name: "description", content: "Alert centre interface for classroom environmental and energy thresholds." },
      { property: "og:title", content: "Alerts — CERION" },
      { property: "og:description", content: "Critical, warning and normal alert monitoring for schools." },
    ],
  }),
  component: AlertsPage,
});

const SUMMARY = [
  { label: "Critical", icon: ShieldAlert },
  { label: "Warning", icon: AlertTriangle },
  { label: "Normal", icon: CheckCircle2 },
  { label: "Total events", icon: Bell },
];

const TABS = [
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "normal", label: "Normal" },
];

function AlertsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Monitoring"
        title="Alerts"
        description="Threshold events across environmental and electrical monitoring."
        actions={
          <>
            <DisabledAction>
              <Button variant="outline" className="h-11 rounded-xl" disabled>
                <Filter className="mr-2 h-4 w-4" /> Clear filters
              </Button>
            </DisabledAction>
            <DisabledAction>
              <Button className="h-11 rounded-xl" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as reviewed
              </Button>
            </DisabledAction>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((item) => (
          <div key={item.label} className="surface-card hover-lift p-5">
            <item.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
            <p className="text-3xl font-semibold tabular-nums text-foreground">0</p>
          </div>
        ))}
      </div>

      <FilterBar>
        <SearchInput placeholder="Search alerts" className="min-w-[12rem] flex-1" />
        <SelectShell placeholder="All severities" ariaLabel="Filter by severity" options={["Critical", "Warning", "Normal"]} />
        <DateRangeSelector />
        <ClassroomSelector className="h-11" />
      </FilterBar>

      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList className="h-11 rounded-xl">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg px-4">
              {tab.label} <span className="ml-2 text-xs text-muted-foreground">0</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <SectionCard title={`${tab.label} alerts`} icon={Bell}>
              <EmptyState
                icon={Bell}
                title="No alerts available"
                description="Alerts will appear after devices are connected and thresholds are configured."
              />
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Alert timeline" icon={Clock}>
          <EmptyState icon={Clock} title="No alerts recorded" description="A chronological timeline appears once alert events exist." compact />
        </SectionCard>
        <SectionCard title="Notification centre" icon={Bell}>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="Notification delivery becomes available after system integration."
            compact
          />
        </SectionCard>
      </div>
    </>
  );
}
