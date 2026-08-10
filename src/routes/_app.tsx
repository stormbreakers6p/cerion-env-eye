import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { Loader2, LogOut, MailCheck, RefreshCw, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RoleProvider, useRole } from "@/hooks/useRole";
import { useI18n } from "@/lib/i18n";
import { canAccessRoute } from "@/lib/rbac";
import { firebaseErrorMessage, sendVerification } from "@/lib/auth";

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

function VerificationRequired() {
  const { user, refreshUser, signOut } = useAuth();
  const [busyAction, setBusyAction] = useState<"send" | "refresh" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    if (!user) return;
    setBusyAction("send");
    setError(null);
    setMessage(null);
    try {
      await sendVerification(user);
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setBusyAction(null);
    }
  }

  async function refresh() {
    setBusyAction("refresh");
    setError(null);
    setMessage(null);
    try {
      await refreshUser();
      setMessage("Email status refreshed. If you just verified, the console will open automatically.");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <section className="surface-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-sm sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary"><MailCheck className="h-6 w-6" /></span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Account verification</p>
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground">Verify your email to continue</h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          A verified email is required before accessing classroom and operational data. Follow the link sent to <span className="font-medium text-foreground">{user?.email ?? "your email address"}</span>, then refresh your status.
        </p>
        {message && <p role="status" className="mt-5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-foreground">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={refresh} disabled={busyAction !== null} className="h-11 flex-1 rounded-xl">
            {busyAction === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh status
          </Button>
          <Button onClick={resend} disabled={busyAction !== null} variant="outline" className="h-11 flex-1 rounded-xl">
            {busyAction === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />} Resend email
          </Button>
        </div>
        <Button onClick={signOut} disabled={busyAction !== null} variant="ghost" className="mt-3 h-11 w-full rounded-xl text-muted-foreground"><LogOut className="h-4 w-4" /> Sign out</Button>
      </section>
    </main>
  );
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

  if (!user.emailVerified) return <VerificationRequired />;

  return (
    <RoleProvider>
      <AppShell>
        <Guarded />
      </AppShell>
    </RoleProvider>
  );
}
