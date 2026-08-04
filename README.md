# CERION — Smarter Classrooms, Greener Future

CERION is a premium AI-powered IoT platform **concept** for monitoring classroom environmental quality and electricity consumption. **Version 1 is a UI/UX prototype only** — the complete visual interface, with no data, backend, or hardware integration.

## Technology stack

- Vite + React 19 + TypeScript
- TanStack Start / TanStack Router (file-based routing)
- Tailwind CSS v4 (CSS-first design tokens in `src/styles.css`)
- shadcn/ui + Lucide React
- CSS-based animations (page fade/rise, hover lift, shimmer skeletons, drawer transitions), all respecting `prefers-reduced-motion`

## Commands

```bash
npm install     # install dependencies
npm run dev     # development server
npm run build   # production build
npm run preview # preview the production build
```

## Routes

`/` (landing) · `/dashboard` · `/environment` · `/energy` · `/devices` · `/alerts` · `/history` · `/reports` · `/ai-insights` · `/settings` · `/profile` · premium 404 for unknown routes. All routes are public — there is no authentication.

## Structure

```
src/
  components/
    brand/        CERION logo + wordmark
    cerion/kit.tsx  reusable UI system (PageHeader, SectionCard, MetricCard,
                    ChartCard/ChartPlaceholder, GaugeCard/GaugePlaceholder,
                    HeatMapPlaceholder, DataTableShell, DeviceCard, EmptyState,
                    skeletons, SearchInput, FilterBar, DateRangeSelector,
                    ClassroomSelector, StatusBadge, IntegrationStatus)
    layout/       AppShell (sidebar, mobile drawer, top navbar)
    theme/        ThemeProvider (light/dark/system, persisted) + ThemeToggle
    ui/           shadcn primitives
  lib/            utils, navigation model
  types/          component prop interfaces
  routes/         file-based routes (`_app.*` share the dashboard shell)
```

## Version 1 scope

Design system, theming, layouts, navigation, responsive behaviour, empty states, loading skeletons, animations, accessibility.

## Version 1 limitations

No data, no mock datasets, no fake sensor/energy/device/alert/report/AI values. Operational buttons (Export PDF/CSV, Print, Generate Report, Add Device, Restart Device, Save Settings, Ask CERION) are visually complete but disabled with the note "Feature will be available after system integration."

## Future integration plan

Firebase, ESP32 hardware, sensor data ingestion, electricity metering, authentication, alerting, reports, AI insights and export features will be added by the project owner. The component API accepts optional props (`value`, `status`, `loading`, device/alert objects) so real data can be supplied without redesigning the interface.

## Deployment

Static/SSR build output from `npm run build` deploys to Vercel (framework preset: Vite) or any Node/edge host.
