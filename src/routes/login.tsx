import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionWordmark } from "@/components/brand/logo";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { BRAND } from "@/lib/navigation";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — CERION Platform Access" },
      {
        name: "description",
        content:
          "Secure sign-in for the CERION classroom environment and energy monitoring platform. Accounts are provisioned by your administrator.",
      },
      { property: "og:title", content: "Sign in — CERION Platform Access" },
      {
        property: "og:description",
        content: "Secure sign-in for the CERION classroom environment and energy monitoring platform.",
      },
    ],
  }),
  component: LoginPage,
});

const GENERIC_ERROR = "Email or password is incorrect.";

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard", replace: true });
  }, [authLoading, user, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError("Authentication is not configured yet. Contact your administrator.");
      return;
    }
    if (!email.trim() || !password) {
      setError(GENERIC_ERROR);
      return;
    }

    setSubmitting(true);
    try {
      const auth = getFirebaseAuth();
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate({ to: "/dashboard", replace: true });
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" aria-label="CERION home">
          <CerionWordmark subtitle="Platform Access" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <section className="hidden lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Secure access
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground">
              Welcome back to {BRAND.name}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {BRAND.slogan} Sign in to monitor classroom environmental quality and electricity
              consumption from a single operations console.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {[
                "Administrator-provisioned accounts only",
                "Session persistence with remember me",
                "Role-aware operations console",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="w-full">
            <div className="surface-card mx-auto w-full max-w-md rounded-2xl border border-border p-6 shadow-sm sm:p-8">
              <div className="lg:hidden">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to your CERION console.</p>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the credentials issued by your administrator.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      maxLength={255}
                      placeholder="name@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      maxLength={128}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                      className="h-11 rounded-xl pl-9 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                    disabled={submitting}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                    Remember me
                  </Label>
                </div>

                {error && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl text-sm font-semibold">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-5 text-center">
                <p className="text-xs text-muted-foreground">
                  Accounts are created by the administrator. Public registration is not available.
                </p>
                <Link
                  to="/"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
