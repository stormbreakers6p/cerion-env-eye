import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/cerion/kit";
import { useRole } from "@/hooks/useRole";
import { useI18n } from "@/lib/i18n";
import { MANAGEMENT_SECTIONS, ROLE_PERMISSIONS, hasPermission } from "@/lib/rbac";
import { readAuditLog } from "@/lib/audit";

export const Route = createFileRoute("/_app/management")({
  head: () => ({
    meta: [
      { title: "Management — CERION" },
      { name: "description", content: "Role-aware management of schools, users, classrooms and devices in CERION." },
      { property: "og:title", content: "Management — CERION" },
      { property: "og:description", content: "Manage schools, people, classrooms and devices by role." },
    ],
  }),
  component: ManagementPage,
});

function ManagementPage() {
  const { role } = useRole();
  const { t } = useI18n();
  const sections = role ? MANAGEMENT_SECTIONS[role] : [];
  const allowed = sections.filter((section) => hasPermission(role, section.permission));
  const [active, setActive] = useState(allowed[0]?.key ?? "");
  const audit = readAuditLog();

  const current = allowed.find((section) => section.key === active) ?? allowed[0];

  return (
    <>
      <PageHeader
        eyebrow={t("management.eyebrow")}
        title={t("management.title")}
        description={t("management.description")}
        actions={<StatusBadge label={role ? t(`role.${role}`) : "—"} tone="info" />}
      />

      {role === "owner" && (
        <SectionCard title={t("common.selectSchool")} icon={ShieldCheck}>
          <p className="text-sm text-muted-foreground">{t("common.selectSchoolHint")}</p>
          <div className="mt-3">
            <StatusBadge label={t("common.noSchoolSelected")} tone="warning" />
          </div>
        </SectionCard>
      )}

      <div className="flex flex-wrap gap-2">
        {allowed.map((section) => (
          <Button
            key={section.key}
            variant={current?.key === section.key ? "default" : "outline"}
            className="h-10 rounded-xl"
            onClick={() => setActive(section.key)}
          >
            {t(section.labelKey)}
          </Button>
        ))}
      </div>

      {current && (
        <SectionCard title={t(current.labelKey)} icon={ShieldCheck}>
          {current.key === "users" ? (
            <UserManager />
          ) : current.key === "teachers" ? (
            <UserManager roleFilter={["teacher"]} />
          ) : current.key === "viewers" ? (
            <UserManager roleFilter={["viewer"]} />
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title={t("management.emptyTitle")}
              description={t("management.emptyDescription")}
            />
          )}
        </SectionCard>
      )}


      <SectionCard title={t("management.permissions")} icon={ShieldCheck}>
        <div className="flex flex-wrap gap-2">
          {(role ? ROLE_PERMISSIONS[role] : []).map((permission) => (
            <StatusBadge key={permission} label={permission} />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={t("management.auditTitle")}
        icon={ClipboardList}
        description={t("management.auditDescription")}
      >
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("management.auditEmpty")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {audit.map((entry) => (
              <li key={entry.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-border p-3">
                <span className="font-medium">{entry.action}</span>
                <span className="text-muted-foreground">{entry.detail}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.actor} · {new Date(entry.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
