import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionWordmark } from "@/components/brand/logo";
import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseErrorMessage, isCancelledPopup, loginWithEmail, requestPasswordReset, signInWithGoogle } from "@/lib/auth";
import { BRAND } from "@/lib/navigation";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — CERION Platform Access" },
      {
        name: "description",
        content: "Secure sign-in for the CERION classroom environmental monitoring platform. Accounts are provisioned by your administrator.",
      },
      { property: "og:title", content: "Sign in — CERION Platform Access" },
      { property: "og:description", content: "Secure sign-in for the CERION classroom environmental monitoring platform." },
    ],
  }),
  component: LoginPage,
});

const GENERIC_ERROR = "Email or password is incorrect.";
const RESET_CONFIRMATION = "If an account exists for that address, a password reset email has been sent.";

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    if (!isFirebaseConfigured) {
      setError("Authentication is not configured yet. Contact your administrator.");
      return;
    }
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle(remember);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      if (!isCancelledPopup(err)) setError(firebaseErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard", replace: true });
  }, [authLoading, user, navigate]);

  function changeMode(next: "login" | "reset") {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!isFirebaseConfigured) {
      setError("Authentication is not configured yet. Contact your administrator.");
      return;
    }

    if (mode === "reset") {
      if (!email.trim()) {
        setError("Enter your account email address.");
        return;
      }
      setSubmitting(true);
      try {
        await requestPasswordReset(email);
      } catch {
        // Keep the response non-enumerating so account existence is not disclosed.
      } finally {
        setNotice(RESET_CONFIRMATION);
        setSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError(GENERIC_ERROR);
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(email, password, remember);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
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
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <section className="hidden lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Secure access</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground">Welcome back to {BRAND.name}</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {BRAND.slogan} Sign in to monitor classroom air quality, comfort and environmental conditions from a single operations console.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {["Administrator-provisioned accounts only", "Verified email required", "Role-aware operations console"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary"><ShieldCheck className="h-4 w-4" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="w-full">
            <div className="surface-card mx-auto w-full max-w-md rounded-2xl border border-border p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                {mode === "reset" && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><KeyRound className="h-5 w-5" /></span>}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{mode === "login" ? "Welcome back" : "Reset your password"}</h1>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {mode === "login" ? "Use the credentials issued by your administrator." : "Enter your account email and we will send reset instructions."}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={submitting || googleSubmitting}
                className="mt-6 h-11 w-full rounded-xl text-sm font-semibold"
              >
                {googleSubmitting ? (
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

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" autoComplete="email" inputMode="email" maxLength={255} placeholder="name@school.edu" value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting || googleSubmitting} className="h-11 rounded-xl pl-9" />
                  </div>
                </div>

                {mode === "login" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" onClick={() => changeMode("reset")} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={128} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting || googleSubmitting} className="h-11 rounded-xl pl-9 pr-11" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" checked={remember} onCheckedChange={(value) => setRemember(value === true)} disabled={submitting || googleSubmitting} />
                      <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me</Label>
                    </div>
                  </>
                )}

                {error && <p role="alert" aria-live="polite" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}
                {notice && <p role="status" aria-live="polite" className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-foreground">{notice}</p>}

                <Button type="submit" disabled={submitting || googleSubmitting} className="h-11 w-full rounded-xl text-sm font-semibold">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> {mode === "login" ? "Signing in…" : "Sending…"}</> : mode === "login" ? "Sign In" : "Send reset email"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-5 text-center">
                {mode === "reset" ? (
                  <button type="button" onClick={() => changeMode("login")} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to sign in</button>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground">Need an account? Contact your CERION school administrator for access.</p>
                )}
                <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
