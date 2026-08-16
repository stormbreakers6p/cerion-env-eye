# CERION — Remove electrical monitoring + add Google Sign-In

Scope: web app only (`src/`). `firmware/` and `functions/` are left untouched, so the ESP32 → Firestore contract (including `co2Ppm`) does not change.

## 1. Remove electrical monitoring from the web app

Confirmed references found in the web source:

- `src/routes/_app.energy.tsx` — the entire Energy page (Voltage, Current, Power, Energy Today, cost, carbon, PZEM wording).
- `src/routes/_app.dashboard.tsx` — Voltage / Current / Power / Energy Today metric cards; Weekly Energy, Monthly Energy, Energy Distribution charts.
- `src/lib/navigation.ts` — `nav.energy` sidebar item.
- `src/lib/rbac.ts` — `view.energy` permission (4 role lists) and the `/energy` route mapping.
- `src/lib/i18n.tsx` — energy-related EN/VI strings.
- `src/routes/index.tsx` — landing page "Energy Monitoring" feature card, electricity copy, the "Energy" stat tile, and the "Why energy matters" block.
- `src/routes/_app.history.tsx` — "Power" and "Energy" columns and the metric filter option.
- `src/routes/_app.reports.tsx` — "Energy Score" and "Highest Energy Usage" entries plus electricity copy.
- `src/routes/_app.ai-insights.tsx` — "Energy recommendations" card and the two electricity prompts.
- `src/routes/_app.alerts.tsx` — "electrical monitoring" description text.
- `src/routes/_app.settings.tsx` — "Power" threshold row and the energy sentence in the About block.
- `src/routes/_app.devices.tsx` — "Energy meter" device-type option.

Actions:

- Delete `src/routes/_app.energy.tsx` (route removed entirely, per your choice) and let the route tree regenerate.
- Strip the nav item, the `view.energy` permission and its route mapping, and the now-unused i18n keys.
- Remove electrical metric cards, charts, columns, filters and copy from the pages above; rewrite the affected sentences so they read as environment-only (temperature, humidity, CO₂, pressure, gas resistance, air quality).
- Drop icons/imports (`Zap`, `Plug`, `Battery`, `CircleDollarSign`, etc.) that become unused.

Preserved untouched: CO₂ (`co2Ppm`), temperature, humidity, pressure, gas resistance, AQI/VOC display, device status, Wi-Fi/connection status, environmental alerts, all Firestore/user-management code.

## 2. Add Google Sign-In

Uses the existing Firebase app in `src/lib/firebase.ts` — same project `cerion-platform`, no config or project changes.

- `src/lib/auth.ts`: add `signInWithGoogle()` using `GoogleAuthProvider` + `signInWithPopup`, applying the existing persistence helper; on success, upsert the Firestore `users/{uid}` document via the existing `ensureUserDocument` logic (name from the Google profile, `role: "user"`, `status: "active"`, `createdAt: serverTimestamp()`) only when the doc does not already exist.
- Extend `firebaseErrorMessage` with friendly text for `auth/popup-closed-by-user` and `auth/cancelled-popup-request` (treated as a silent, non-error cancel), `auth/popup-blocked`, `auth/account-exists-with-different-credential`, and `auth/operation-not-allowed` (which is what appears if the Google provider is not enabled in the Firebase console).
- `src/routes/login.tsx` and `src/routes/register.tsx`: add a "Continue with Google" button above the email form with an "or" divider, in the existing design system — same button component, spacing and card styling. Cancellation clears the loading state without showing an error; other failures show the inline error banner already present.
- Auth state, session persistence, logout, route guards (`src/routes/_app.tsx`), RBAC and i18n are unchanged; Google users flow through the same `onAuthStateChanged` path and land on `/dashboard`.
- Add EN/VI strings for the new button and errors.

## Manual Firebase Console step (required)

Google Sign-In will only work after you enable it: Firebase Console → project `cerion-platform` → Authentication → Sign-in method → enable **Google**, set a support email, and confirm `localhost` plus your Lovable preview/published domains are in Authentication → Settings → Authorised domains. Until then the code is correct but the popup returns `auth/operation-not-allowed`, and the UI will say Google sign-in is not enabled.

## Verification

- Typecheck and build.
- Grep `src/` for voltage/current/power/energy/kWh/PZEM to confirm nothing remains.
- Browser pass: landing, dashboard, environment, history, reports, alerts, devices, settings render with no electrical widgets and no runtime errors; `/energy` no longer resolves; email login and guards still work; the Google button renders and cancellation is handled. Actual Google authentication cannot be verified until the provider is enabled in the console — I will report it as "implemented, not yet tested" if so.
