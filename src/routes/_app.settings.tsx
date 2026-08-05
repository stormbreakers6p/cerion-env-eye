import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe, Info, LayoutDashboard, Plug, School, ShieldCheck, SlidersHorizontal, Palette, Table2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRole } from "@/hooks/useRole";
import { ROLES } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  DisabledAction,
  IntegrationStatus,
  PageHeader,
  SectionCard,
  SelectShell,
  StatusBadge,
} from "@/components/cerion/kit";
import { useTheme, type ThemeMode } from "@/components/theme/theme-provider";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CERION" },
      { name: "description", content: "Appearance, notification and integration settings for the CERION interface." },
      { property: "og:title", content: "Settings — CERION" },
      { property: "og:description", content: "Configure CERION appearance, preferences and integrations." },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const NOTIFICATIONS = ["Critical alerts", "Warning alerts", "Device offline", "Daily summary", "Weekly report"];
const SCHOOL_FIELDS = ["School name", "Address", "Contact", "Administrator"];
const THRESHOLDS = ["Temperature", "Humidity", "CO₂", "VOC", "AQI", "Power"];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const { role, setRoleOverride } = useRole();

  return (
    <>
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
        actions={
          <DisabledAction>
            <Button className="h-11 rounded-xl" disabled>
              {t("settings.save")}
            </Button>
          </DisabledAction>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("settings.theme")} icon={Palette} description={t("settings.themeHint")}>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((option) => (
              <Button
                key={option.value}
                variant={theme === option.value ? "default" : "outline"}
                className="h-11 rounded-xl"
                onClick={() => setTheme(option.value)}
              >
                {t(`settings.${option.value}`)}
              </Button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t("common.language")} icon={Globe} description={t("settings.languageHint")}>
          <div className="flex flex-wrap gap-2">
            {(["en", "vi"] as const).map((value) => (
              <Button
                key={value}
                variant={locale === value ? "default" : "outline"}
                className="h-11 rounded-xl"
                onClick={() => setLocale(value)}
              >
                {value === "en" ? t("common.english") : t("common.vietnamese")}
              </Button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t("role.preview")} icon={ShieldCheck} description={t("role.previewHint")}>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((value) => (
              <Button
                key={value}
                variant={role === value ? "default" : "outline"}
                className="h-11 rounded-xl"
                onClick={() => setRoleOverride(value)}
              >
                {t(`role.${value}`)}
              </Button>
            ))}
          </div>
        </SectionCard>


        <SectionCard title="Notifications" icon={Bell}>
          <div className="space-y-3">
            {NOTIFICATIONS.map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <Label htmlFor={item} className="text-sm font-normal">
                  {item}
                </Label>
                <Switch id={item} disabled aria-label={item} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="School information" icon={School}>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCHOOL_FIELDS.map((field) => (
              <div key={field} className="min-w-0">
                <Label htmlFor={field} className="text-xs text-muted-foreground">
                  {field}
                </Label>
                <Input id={field} className="mt-1.5 h-11 rounded-xl" placeholder="Not provided" disabled />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Dashboard preferences" icon={LayoutDashboard}>
          <div className="space-y-3">
            {["Compact metric cards", "Show sparklines", "Auto-refresh dashboard"].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <Label htmlFor={item} className="text-sm font-normal">
                  {item}
                </Label>
                <Switch id={item} disabled aria-label={item} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Alert thresholds" icon={SlidersHorizontal}>
          <div className="grid gap-3 sm:grid-cols-2">
            {THRESHOLDS.map((field) => (
              <div key={field} className="min-w-0">
                <Label htmlFor={`threshold-${field}`} className="text-xs text-muted-foreground">
                  {field}
                </Label>
                <Input id={`threshold-${field}`} className="mt-1.5 h-11 rounded-xl" placeholder="—" disabled />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Data display" icon={Table2}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectShell placeholder="Metric units" ariaLabel="Select unit system" options={["Metric", "Imperial"]} />
            <SelectShell placeholder="Time format" ariaLabel="Select time format" options={["24-hour", "12-hour"]} />
          </div>
        </SectionCard>

        <SectionCard title="System integration" icon={Plug}>
          <div className="space-y-2.5">
            {["Firebase", "ESP32", "AI service", "Database"].map((service) => (
              <IntegrationStatus key={service} label={service} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="About CERION" icon={Info}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          CERION is a premium AI-powered IoT platform concept designed to help schools monitor classroom
          environments and energy consumption. Version 1 demonstrates the future visual interface before
          hardware and data systems are connected.
        </p>
        <Separator className="my-4" />
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label="Version 1.0" />
          <StatusBadge label="Interface Prototype" />
          <span className="text-xs text-muted-foreground">Smarter Classrooms, Greener Future.</span>
        </div>
      </SectionCard>
    </>
  );
}
