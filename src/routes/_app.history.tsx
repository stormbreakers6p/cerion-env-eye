import { createFileRoute } from "@tanstack/react-router";
import { Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClassroomSelector,
  DataTableShell,
  DateRangeSelector,
  DisabledAction,
  FilterBar,
  PageHeader,
  SearchInput,
  SelectShell,
} from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "History — CERION" },
      { name: "description", content: "Historical classroom environmental and energy records in CERION." },
      { property: "og:title", content: "History — CERION" },
      { property: "og:description", content: "Browse recorded classroom environmental and energy readings." },
    ],
  }),
  component: HistoryPage,
});

const COLUMNS = [
  "Date",
  "Time",
  "Classroom",
  "Temperature",
  "Humidity",
  "CO₂",
  "VOC",
  "AQI",
  "Power",
  "Energy",
  "Occupancy",
  "Status",
];

function HistoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Historical data"
        description="Recorded environmental and electrical readings for review and comparison."
        actions={
          <DisabledAction>
            <Button variant="outline" className="h-11 rounded-xl" disabled>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </DisabledAction>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Search records" className="min-w-[12rem] flex-1" />
        <DateRangeSelector />
        <ClassroomSelector className="h-11" />
        <SelectShell
          placeholder="All sensor types"
          ariaLabel="Filter by sensor type"
          options={["Temperature", "Humidity", "CO₂", "VOC", "AQI", "Energy"]}
        />
      </FilterBar>

      <DataTableShell columns={COLUMNS} emptyMessage="No historical data available." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          <History className="mr-1 inline h-3.5 w-3.5" /> Showing 0 of 0 records
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 rounded-xl" disabled>
            Previous
          </Button>
          <Button variant="outline" className="h-10 rounded-xl" disabled>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
