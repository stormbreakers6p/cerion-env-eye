import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LogIn, ShieldCheck, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionWordmark } from "@/components/brand/logo";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseErrorMessage, isCancelledPopup, signInWithGoogle } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Request access — CERION Platform" },
      { name: "description", content: "CERION accounts are securely provisioned by authorized school administrators." },
      { property: "og:title", content: "Request access — CERION Platform" },
      { property: "og:description", content: "Contact your school administrator to request CERION platform access." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    if (!isFirebaseConfigured) {
      setError("Authentication is not configured yet. Contact your administrator.");
      return;
    }
    setBusy(true);
    try {
      await signInWithGoogle(true);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      if (!isCancelledPopup(err)) setError(firebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]" />
      <header className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" aria-label="CERION home"><CerionWordmark subtitle="Platform Access" /></Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <section className="surface-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-sm sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary"><UserRoundCog className="h-6 w-6" /></span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Administrator-provisioned access</p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground">CERION registration is managed by your school</h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Public account creation is disabled to protect classroom and operational data. Ask your CERION school administrator to create your account and assign the appropriate access role.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Already provisioned?</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Use the sign-in link below. New accounts must verify their email before entering the operations console.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={busy}
              className="h-11 w-full rounded-xl text-sm font-semibold"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
                </svg>
              )}
              Continue with Google
            </Button>
            {error && (
              <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 flex-1 rounded-xl"><Link to="/login"><LogIn className="h-4 w-4" /> Sign in</Link></Button>
            <Button asChild variant="outline" className="h-11 flex-1 rounded-xl"><Link to="/"><ArrowLeft className="h-4 w-4" /> Back to home</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
