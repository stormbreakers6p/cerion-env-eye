import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogIn, ShieldCheck, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionWordmark } from "@/components/brand/logo";

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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 flex-1 rounded-xl"><Link to="/login"><LogIn className="h-4 w-4" /> Sign in</Link></Button>
            <Button asChild variant="outline" className="h-11 flex-1 rounded-xl"><Link to="/"><ArrowLeft className="h-4 w-4" /> Back to home</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
