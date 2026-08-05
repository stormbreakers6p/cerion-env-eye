import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RoleProvider, useRole } from "@/hooks/useRole";
import { useI18n } from "@/lib/i18n";
import { canAccessRoute } from "@/lib/rbac";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: ProtectedLayout,
});

function Forbidden() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-md space-y-3">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <p className="text-4xl font-bold">{t("forbidden.code")}</p>
        <h1 className="text-xl font-semibold">{t("forbidden.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("forbidden.description")}</p>
        <Button asChild className="h-11 rounded-xl">
          <Link to="/dashboard">{t("forbidden.back")}</Link>
        </Button>
      </div>
    </div>
  );
}

function Guarded() {
  const { role, loading } = useRole();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!canAccessRoute(role, pathname)) return <Forbidden />;

  return <Outlet />;
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("shell.checkingSession")}
        </div>
      </div>
    );
  }

  return (
    <RoleProvider>
      <AppShell>
        <Guarded />
      </AppShell>
    </RoleProvider>
  );
}
