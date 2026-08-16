import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, FileDown, FileText, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisabledAction, EmptyState, PageHeader, SectionCard } from "@/components/cerion/kit";
import { PLACEHOLDER_VALUE } from "@/lib/navigation";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — CERION" },
      { name: "description", content: "Daily, weekly, monthly and yearly reporting interface in CERION." },
      { property: "og:title", content: "Reports — CERION" },
      { property: "og:description", content: "Environmental reporting summaries for schools." },
    ],
  }),
  component: ReportsPage,
});

const TABS = ["Daily", "Weekly", "Monthly", "Yearly"];

const SUMMARY = [
  "Environmental Score",
  "Air Quality Score",
  "Alert Statistics",
  "Top-performing Classroom",
  "Highest CO₂ Level",
  "Ventilation Index",
  "Comfort Index",
];

function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reporting"
        title="Reports"
        description="Periodic summaries of classroom environmental quality."
        actions={
          <>
            {[
              { label: "Export PDF", icon: FileText },
              { label: "Export CSV", icon: FileDown },
              { label: "Print Report", icon: Printer },
            ].map((action) => (
              <DisabledAction key={action.label}>
                <Button variant="outline" className="h-11 rounded-xl" disabled>
                  <action.icon className="mr-2 h-4 w-4" /> {action.label}
                </Button>
              </DisabledAction>
            ))}
            <DisabledAction>
              <Button className="h-11 rounded-xl" disabled>
                Generate Report
              </Button>
            </DisabledAction>
          </>
        }
      />

      <Tabs defaultValue="Daily" className="space-y-5">
        <TabsList className="h-11 rounded-xl">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg px-4">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-5">
            <section aria-label={`${tab} summary metrics`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SUMMARY.map((metric) => (
                <div key={metric} className="surface-card hover-lift p-5">
                  <p className="text-sm font-medium text-muted-foreground">{metric}</p>
                  <p className="mt-2 text-3xl font-semibold text-muted-foreground/70">{PLACEHOLDER_VALUE}</p>
                  <p className="mt-1 text-xs text-muted-foreground">No report generated</p>
                </div>
              ))}
            </section>

            <SectionCard title={`${tab} report`} icon={BarChart3}>
              <EmptyState
                icon={BarChart3}
                title="No report has been generated"
                description="Reports will be produced automatically once environmental data is connected."
              />
            </SectionCard>

            <SectionCard title="Recommendations" icon={Sparkles}>
              <EmptyState
                icon={Sparkles}
                title="No recommendations"
                description="Report recommendations appear after data integration."
                compact
              />
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
