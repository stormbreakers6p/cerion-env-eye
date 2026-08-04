import { createFileRoute } from "@tanstack/react-router";
import { Activity, IdCard, Mail, Phone, School, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisabledAction, EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/cerion/kit";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CERION" },
      { name: "description", content: "Profile interface for the CERION platform prototype." },
      { property: "og:title", content: "Profile — CERION" },
      { property: "og:description", content: "View and edit CERION profile details." },
    ],
  }),
  component: ProfilePage,
});

const FIELDS = [
  { label: "Name", placeholder: "Name not provided", icon: User },
  { label: "School", placeholder: "School not provided", icon: School },
  { label: "Role", placeholder: "Role not configured", icon: IdCard },
  { label: "Email", placeholder: "Email not provided", icon: Mail },
  { label: "Phone", placeholder: "Phone not provided", icon: Phone },
];

function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Profile details for the CERION interface prototype."
        actions={
          <>
            <DisabledAction>
              <Button variant="outline" className="h-11 rounded-xl" disabled>
                Cancel
              </Button>
            </DisabledAction>
            <DisabledAction>
              <Button variant="outline" className="h-11 rounded-xl" disabled>
                Edit profile
              </Button>
            </DisabledAction>
            <DisabledAction>
              <Button className="h-11 rounded-xl" disabled>
                Save changes
              </Button>
            </DisabledAction>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard>
          <div className="flex flex-col items-center py-4 text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full border border-dashed border-border bg-muted/40">
              <User className="h-9 w-9 text-muted-foreground" />
            </span>
            <p className="mt-4 text-base font-semibold">Name not provided</p>
            <p className="text-sm text-muted-foreground">Role not configured</p>
            <StatusBadge label="Not connected" className="mt-4" />
          </div>
        </SectionCard>

        <SectionCard title="Account information" icon={IdCard}>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.label} className="min-w-0">
                <Label htmlFor={field.label} className="text-xs text-muted-foreground">
                  {field.label}
                </Label>
                <Input id={field.label} className="mt-1.5 h-11 rounded-xl" placeholder={field.placeholder} disabled />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Activity summary" icon={Activity}>
        <EmptyState
          icon={Activity}
          title="No activity recorded"
          description="Activity history becomes available after the platform is connected to data."
          compact
        />
      </SectionCard>
    </>
  );
}
