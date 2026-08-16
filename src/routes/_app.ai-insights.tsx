import { createFileRoute } from "@tanstack/react-router";
import { Gauge, Leaf, LineChart, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DisabledAction, EmptyState, PageHeader, SectionCard, ShimmerBar } from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — CERION" },
      { name: "description", content: "CERION AI assistant interface for classroom environmental recommendations." },
      { property: "og:title", content: "AI Insights — CERION" },
      { property: "og:description", content: "AI-powered recommendations for classroom environmental quality." },
    ],
  }),
  component: AiInsightsPage,
});

const SUGGESTIONS = [
  "How is classroom air quality trending?",
  "Which classroom has the highest CO₂ levels?",
  "How can we improve thermal comfort?",
  "Which room needs better ventilation?",
];

function AiInsightsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="CERION AI"
        description="Contextual recommendations and predicted trends, generated once CERION is connected to data."
      />

      <SectionCard className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-primary-foreground shadow-[var(--shadow-lift)]">
            <Sparkles className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">CERION Assistant</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              AI insights will appear after CERION is connected to environmental sensor data.
            </p>
          </div>
          <div className="w-full max-w-md space-y-2">
            <ShimmerBar />
            <ShimmerBar className="w-4/5" />
            <ShimmerBar className="w-3/5" />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Environmental recommendations" icon={Leaf}>
          <EmptyState icon={Leaf} title="No insights yet" description="Environmental guidance appears after sensor integration." compact />
        </SectionCard>
        <SectionCard title="Air quality recommendations" icon={Gauge}>
          <EmptyState icon={Gauge} title="No insights yet" description="Air quality guidance appears after sensor integration." compact />
        </SectionCard>
        <SectionCard title="Predicted trends" icon={LineChart}>
          <EmptyState icon={LineChart} title="No predictions yet" description="Forecasts require historical data records." compact />
        </SectionCard>
      </div>

      <SectionCard title="Ask CERION" icon={Sparkles} description="Conversational interface preview">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <span
              key={suggestion}
              className="rounded-full border border-dashed border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground"
            >
              {suggestion}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input className="h-12 rounded-xl" placeholder="Ask CERION a question" aria-label="Ask CERION" disabled />
          <DisabledAction>
            <Button className="h-12 w-full rounded-xl sm:w-auto" disabled>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </DisabledAction>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">AI integration is not available in Version 1.</p>
      </SectionCard>
    </>
  );
}
