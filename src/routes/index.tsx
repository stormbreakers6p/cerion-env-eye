import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Activity,
  BarChart3,
  Bell,
  Building2,
  Cloud,
  Cpu,
  Droplets,
  Gauge,
  Github,
  Leaf,
  History,
  Mail,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionLogo, CerionWordmark } from "@/components/brand/logo";
import { StatusBadge } from "@/components/cerion/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CERION — Smarter Classrooms, Greener Future" },
      {
        name: "description",
        content:
          "CERION is a premium AI-powered IoT platform concept for monitoring classroom air quality, comfort and environmental health in schools.",
      },
      { property: "og:title", content: "CERION — Smarter Classrooms, Greener Future" },
      {
        property: "og:description",
        content:
          "An AI-powered IoT platform concept helping schools build healthier, greener and smarter learning environments.",
      },
    ],
  }),
  component: Landing,
});

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
];

const FEATURES = [
  { icon: Wind, title: "Environmental Monitoring", body: "A unified view of classroom air quality and comfort across every monitored room." },
  { icon: Thermometer, title: "Temperature Monitoring", body: "Track thermal comfort ranges and detect rooms drifting outside healthy conditions." },
  { icon: Droplets, title: "Humidity Monitoring", body: "Understand moisture levels that influence concentration, comfort and building health." },
  { icon: Cloud, title: "CO₂ Monitoring", body: "Surface ventilation quality so classrooms stay alert, fresh and focused." },
  { icon: Sparkles, title: "VOC Monitoring", body: "Watch volatile organic compounds from cleaning products, furniture and materials." },
  { icon: Gauge, title: "AQI Monitoring", body: "A single air-quality index summarising the overall condition of each room." },
  { icon: Wind, title: "Pressure & Gas Monitoring", body: "Barometric pressure and gas-resistance readings from the BME688 sensor in each room." },
  { icon: Lightbulb, title: "AI Insights", body: "Contextual recommendations for ventilation, comfort and air quality." },
  { icon: Bell, title: "Automatic Alerts", body: "Threshold-based notifications for critical and warning conditions." },
  { icon: History, title: "Historical Data", body: "Long-term records for comparison, auditing and school reporting." },
  { icon: BarChart3, title: "Reports", body: "Daily, weekly, monthly and yearly summaries prepared for school leadership." },
  { icon: Cpu, title: "Device Monitoring", body: "Fleet visibility for connected sensor nodes, gateways and firmware." },
];

const FLOW = [
  { icon: Thermometer, title: "Sensors", body: "BME688 and MH-Z19E environmental sensing hardware in the classroom." },
  { icon: Cpu, title: "ESP32", body: "Edge controller collecting and transmitting sensor signals." },
  { icon: Cloud, title: "Cloud", body: "Secure ingestion and storage layer for time-series records." },
  { icon: LayoutDashboard, title: "CERION Dashboard", body: "The interface layer delivered in Version 1." },
  { icon: Sparkles, title: "Artificial Intelligence", body: "Analysis of patterns, anomalies and predicted trends." },
  { icon: Leaf, title: "Recommendations", body: "Actionable guidance for healthier and greener classrooms." },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Healthier classrooms", body: "Conditions that support wellbeing and concentration." },
  { icon: Wind, title: "Cleaner air", body: "Ventilation guidance grounded in measured air quality." },
  { icon: Cloud, title: "Better ventilation", body: "CO₂ visibility showing when a room needs fresh air." },
  { icon: Activity, title: "Real-time visibility", body: "A live operational picture for facility teams." },
  { icon: Sparkles, title: "Predictive insights", body: "Early signals before conditions become problems." },
  { icon: ShieldCheck, title: "Safer learning environment", body: "Rapid awareness of unsafe environmental conditions." },
  { icon: Building2, title: "Better learning conditions", body: "Comfort ranges tuned for study and focus." },
  { icon: Leaf, title: "Sustainable school operations", body: "A measurable path toward greener campuses." },
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden="true">
      <div className="absolute -inset-8 rounded-[3rem] bg-brand-gradient opacity-[0.12] blur-3xl" />
      <div
        className="surface-card relative overflow-hidden p-5"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div className="flex items-center justify-between">
          <CerionWordmark size={28} subtitle="Live interface preview" />
          <StatusBadge label="Not connected" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[Thermometer, Droplets, Cloud].map((Icon, i) => (
            <div key={i} className="rounded-xl border border-border bg-muted/30 p-3">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-2xl font-semibold text-muted-foreground/70">—</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/25 p-4">
          <div className="grid-fade h-28 w-full rounded-lg" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <Cloud className="h-4 w-4 text-primary" />
            <p className="mt-1 text-xs text-muted-foreground">CO₂</p>
            <p className="text-xl font-semibold text-muted-foreground/70">—</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <Leaf className="h-4 w-4 text-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Air quality</p>
            <p className="text-xl font-semibold text-muted-foreground/70">—</p>
          </div>
        </div>
      </div>

      <div
        className="surface-glass absolute -left-6 top-24 hidden rounded-2xl p-3 shadow-[var(--shadow-lift)] sm:block"
        style={{ animation: "cerion-float 6s ease-in-out infinite" }}
      >
        <Cpu className="h-5 w-5 text-primary" />
        <p className="mt-1 text-[11px] font-medium">IoT node</p>
      </div>
      <div
        className="surface-glass absolute -right-4 bottom-16 hidden rounded-2xl p-3 shadow-[var(--shadow-lift)] sm:block"
        style={{ animation: "cerion-float 7s ease-in-out 0.8s infinite" }}
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="mt-1 text-[11px] font-medium">AI layer</p>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border surface-glass">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
            <Link to="/" className="min-w-0" aria-label="CERION home">
              <CerionWordmark />
            </Link>
            <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Landing navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" className="hidden h-10 rounded-xl sm:inline-flex">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild className="h-10 rounded-xl">
                <Link to="/dashboard">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
            <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
              <div className="animate-rise min-w-0">
                <div className="flex items-center gap-3">
                  <CerionLogo size={44} />
                  <div>
                    <p className="text-lg font-bold tracking-[0.24em]">CERION</p>
                    <p className="text-sm text-primary">Smarter Classrooms, Greener Future.</p>
                  </div>
                </div>
                <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  Intelligent monitoring for the classrooms of{" "}
                  <span className="text-brand-gradient">tomorrow</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  CERION is an AI-powered IoT platform concept that helps schools understand classroom
                  air quality, comfort and environmental conditions — so learning spaces become
                  healthier, safer and more sustainable.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base">
                    <Link to="/dashboard">
                      Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6 text-base">
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Version 1.0 — interface prototype. Hardware and data integration arrive in a later phase.
                </p>
              </div>
              <HeroIllustration />
            </div>
          </section>

          {/* About */}
          <section id="about" className="scroll-mt-20 border-t border-border bg-muted/25">
            <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:py-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">About</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                A single platform for classroom environmental awareness
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "What CERION is",
                    body: "A premium AI-powered IoT platform concept designed for schools, combining environmental sensing and intelligent analysis in one interface.",
                  },
                  {
                    title: "Purpose of the platform",
                    body: "To give school leaders, teachers and facility teams a clear, trustworthy view of the conditions students learn in every day.",
                  },
                  {
                    title: "Why environment matters",
                    body: "Temperature, humidity, CO₂ and air quality directly affect concentration, health and comfort. Without measurement these conditions stay invisible.",
                  },
                  {
                    title: "Why measurement matters",
                    body: "Conditions that are measured can be improved. Continuous data is the first step toward healthier, more sustainable classrooms.",
                  },
                ].map((item) => (
                  <div key={item.title} className="surface-card hover-lift p-6">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                When the complete system is connected, CERION will support schools with continuous
                measurement, automatic alerting, historical reporting and AI-generated recommendations —
                all delivered through the interface presented here.
              </p>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="scroll-mt-20">
            <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:py-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Designed for every layer of a smart school
              </h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => (
                  <article key={feature.title} className="surface-card hover-lift group p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary/18">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/25">
            <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:py-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                From classroom sensors to actionable recommendations
              </h2>
              <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {FLOW.map((step, index) => (
                  <li key={step.title} className="surface-card hover-lift relative p-6">
                    <span className="absolute right-5 top-5 text-xs font-semibold text-muted-foreground/60">
                      0{index + 1}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-primary/6 p-5 text-sm text-muted-foreground">
                Version 1 demonstrates the CERION interface. Hardware and data integration will be
                implemented in a later development phase.
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section id="benefits" className="scroll-mt-20">
            <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:py-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Benefits</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Outcomes schools can build on
              </h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {BENEFITS.map((benefit) => (
                  <article key={benefit.title} className="surface-card hover-lift p-6">
                    <benefit.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-4 text-sm font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 pb-20 sm:px-6">
            <div className="mx-auto max-w-[1240px] overflow-hidden rounded-3xl border border-border bg-secondary px-6 py-16 text-center text-secondary-foreground sm:px-12">
              <CerionLogo size={52} className="mx-auto" />
              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore the CERION interface
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80 sm:text-base">
                Step inside the dashboard experience that will deliver classroom environmental
                intelligence once hardware integration is complete.
              </p>
              <Button asChild size="lg" className="mt-8 h-13 rounded-xl px-8 text-base">
                <Link to="/dashboard">
                  Open CERION Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-muted/25">
          <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
              <div className="min-w-0">
                <CerionWordmark subtitle="Smarter Classrooms, Greener Future." />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  A premium AI-powered IoT platform concept for school environmental quality
                  monitoring.
                </p>
                <div className="mt-4">
                  <StatusBadge label="Version 1.0 — Interface Prototype" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Navigation</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <a className="transition-colors hover:text-foreground" href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <Link className="transition-colors hover:text-foreground" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Contact</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Contact — not provided
                  </li>
                  <li className="flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub — not provided
                  </li>
                  <li>Privacy — placeholder</li>
                  <li>Terms — placeholder</li>
                </ul>
              </div>
            </div>
            <Separator className="my-8" />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} CERION. All rights reserved.</span>
              <span>Version 1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
