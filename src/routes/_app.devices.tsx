import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Plus, RotateCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DisabledAction,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchInput,
  SectionCard,
  SelectShell,
  StatusBadge,
} from "@/components/cerion/kit";
import { PLACEHOLDER_VALUE } from "@/lib/navigation";

export const Route = createFileRoute("/_app/devices")({
  head: () => ({
    meta: [
      { title: "Devices — CERION" },
      { name: "description", content: "Device management interface for CERION sensor nodes and gateways." },
      { property: "og:title", content: "Devices — CERION" },
      { property: "og:description", content: "Manage connected CERION sensor nodes, gateways and firmware." },
    ],
  }),
  component: DevicesPage,
});

function DeviceDetailsDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 rounded-xl">
          Device details
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Device details</SheetTitle>
          <SheetDescription>Detailed device information appears after a device is connected.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 pb-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {["Device name", "Device type", "Classroom", "Online status", "Wi-Fi signal", "Battery", "Firmware", "Last update"].map(
              (label) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="truncate font-medium">{PLACEHOLDER_VALUE}</dd>
                </div>
              ),
            )}
          </dl>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Sensor list</p>
            <p className="text-sm font-medium">No sensors registered</p>
          </div>
          <DisabledAction className="w-full">
            <Button variant="outline" className="h-11 w-full rounded-xl" disabled>
              <RotateCw className="mr-2 h-4 w-4" /> Restart device
            </Button>
          </DisabledAction>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DevicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fleet"
        title="Devices"
        description="Monitor CERION sensor nodes, gateways and their integration status."
        actions={
          <>
            <DeviceDetailsDrawer />
            <DisabledAction>
              <Button className="h-11 rounded-xl" disabled>
                <Plus className="mr-2 h-4 w-4" /> Add device
              </Button>
            </DisabledAction>
          </>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Search devices" className="min-w-[12rem] flex-1" />
        <SelectShell placeholder="All statuses" ariaLabel="Filter by status" options={["Online", "Offline", "Unassigned"]} />
        <SelectShell
          placeholder="All device types"
          ariaLabel="Filter by device type"
          options={["Sensor node", "Gateway", "Air quality node"]}
        />
      </FilterBar>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total devices", icon: Cpu },
          { label: "Online", icon: Wifi },
          { label: "Offline", icon: Cpu },
        ].map((item) => (
          <div key={item.label} className="surface-card p-5">
            <item.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
            <p className="text-3xl font-semibold text-muted-foreground/70">—</p>
          </div>
        ))}
      </div>

      <SectionCard
        title="Device grid"
        icon={Cpu}
        actions={<StatusBadge label="Not connected" />}
      >
        <EmptyState
          icon={Cpu}
          title="No devices connected"
          description="Connect a CERION device to begin. Registered sensor nodes and gateways will appear here as cards."
          action={
            <DisabledAction>
              <Button className="h-11 rounded-xl" disabled>
                <Plus className="mr-2 h-4 w-4" /> Add device
              </Button>
            </DisabledAction>
          }
        />
      </SectionCard>
    </>
  );
}
