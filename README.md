# CERION Web — Version 4.0

CERION is a bilingual React/TypeScript + Firebase platform for classroom environmental and electrical monitoring. Checkpoint 04 preserves the original Lovable/TanStack project structure and adds production-oriented management, telemetry, reporting, security and deployment work.

## Chức năng đã hoàn thiện

- Email/password Authentication with an administrator-created Firestore access profile.
- Four roles: `owner`, `admin`, `teacher`, `viewer`.
- School/classroom create, edit, archive, restore and guarded permanent deletion.
- User creation, role/classroom assignment, enable/disable, password reset and guarded deletion through Firebase Admin.
- Protection against self-lock/self-delete and removal of the final active Owner.
- Device registration, edit, classroom transfer, enable/disable, installation location, key rotation and guarded deletion.
- Separate BME688/PZEM states: `Live`, `Stale`, `Offline`, `No data`.
- HTTPS ESP32 ingestion with hashed per-device credentials, validation and request rate limiting.
- Single readings or offline batches of up to 60 readings per request.
- Idempotent reading IDs to prevent duplicate history after retry/reconnect.
- Live dashboard, environment, energy and trend charts using actual Firestore data only.
- Reset-safe, multi-PZEM consumption; optional cost and CO₂e calculation.
- Date-range history queries, pagination and full-range CSV export.
- Day/7-day/30-day reports, official A4 Print/Save-as-PDF layout and CSV.
- Threshold/offline alerts, acknowledgement, assignment, notes and resolution.
- Automatic alert resolution when device telemetry resumes.
- Central Firestore audit log with a local offline cache.
- Classroom notes and device-issue reporting for teachers.
- Daily retention cleanup using each school's configured retention period.
- Optional Firebase App Check and Firebase Trigger Email queue.
- Global navigation search, English/Vietnamese UI and light/dark/system themes.
- Vercel preset, Firestore Rules/indexes, Functions, automated telemetry tests and bundle splitting.

CERION does not invent missing sensor values. CO₂ appears only when a dedicated sensor sends `co2Ppm`; BME688 gas resistance/BSEC IAQ is not direct CO₂ measurement.

## 1. Cài đặt cục bộ

Requirements: Node.js 22 LTS, npm and Firebase CLI.

```bash
cp .env.example .env
npm install
npm --prefix functions install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run test
npm --prefix functions run build
npm run build
```

The web production build uses Nitro's Vercel preset and creates `.vercel/output`.

## 2. Firebase Web configuration

Fill the publishable values in local `.env` and Vercel:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=cerion-platform
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_APP_CHECK_SITE_KEY=
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=false
```

Do not commit `.env`, service-account JSON or device secrets.

Enable Email/Password Authentication, Cloud Firestore and Cloud Functions. The scheduled Functions need a Firebase Blaze plan. Enable App Check + reCAPTCHA v3 if App Check enforcement is required.

```bash
firebase deploy --only firestore:rules,firestore:indexes
npm --prefix functions run build
firebase deploy --only functions
```

App Check is supported by the browser client. Set the Functions runtime environment variable `ENFORCE_APP_CHECK=true` only after the site key is configured and verified. ESP32 ingestion continues to use its per-device key because it does not use browser reCAPTCHA.

## 3. Tạo Owner đầu tiên

No browser account may grant itself Owner access:

1. Create the account in Firebase Authentication.
2. Create `users/{AUTH_UID}` in Firestore:

```json
{
  "fullName": "CERION Owner",
  "email": "owner@example.com",
  "role": "owner",
  "school": "",
  "classrooms": [],
  "status": "active",
  "disabled": false
}
```

Sign in, create/select a school, then create classrooms, users and devices.

## 4. Mô hình dữ liệu chính

| Collection | Purpose | Browser writes |
|---|---|---|
| `users` | Authorized profiles, roles and assignments | Own name only; Functions manage access |
| `schools` | School records and archive state | Owner create/update |
| `classrooms` | Classroom records and archive state | Owner/Admin create/update |
| `devices` | Hardware registration and sensor clocks | Owner/Admin create/update |
| `deviceSecrets` | Hashed device keys and request clock | Functions only |
| `latestReadings` | Latest values per device | Ingestion only |
| `readings` | Time-series history | Ingestion only |
| `alerts` / `activeAlerts` | Alert workflow and deduplication | Trusted creation; scoped workflow updates |
| `settings` | Thresholds, tariff, emissions, retention and alert emails | Owner/Admin |
| `auditLogs` | Central administrative activity | Authenticated append; scoped read |
| `classroomNotes` | Teacher classroom notes | Authorized classroom users |
| `deviceIssues` | Reported hardware issues | Authorized classroom users |
| `mail` | Optional Trigger Email queue | Functions only |

## 5. ESP32 ingestion

After registering a device, CERION displays its secret once. Save it in device configuration, never public source code.

Send HTTPS `POST` to the deployed `ingestReading` Function:

```text
x-cerion-device-key: <DEVICE_SECRET>
Content-Type: application/json
```

Single reading:

```json
{
  "deviceId": "FIRESTORE_DEVICE_ID",
  "readingId": "boot42-seq0081",
  "measuredAt": "2026-08-13T04:00:00.000Z",
  "firmwareVersion": "1.0.0",
  "wifiRssi": -61,
  "values": {
    "temperatureC": 27.4,
    "humidityPct": 63.1,
    "pressureHpa": 1007.8,
    "gasResistanceOhm": 128540,
    "iaq": 82,
    "voltageV": 221.7,
    "currentA": 0.42,
    "powerW": 87.6,
    "energyKwh": 13.284,
    "frequencyHz": 50,
    "powerFactor": 0.94
  }
}
```

Offline/reconnect batch (maximum 60):

```json
{
  "deviceId": "FIRESTORE_DEVICE_ID",
  "readings": [
    {
      "readingId": "boot42-seq0082",
      "measuredAt": "2026-08-13T04:01:00.000Z",
      "firmwareVersion": "1.0.0",
      "wifiRssi": -70,
      "values": { "temperatureC": 27.5, "powerW": 88.1, "energyKwh": 13.285 }
    },
    {
      "readingId": "boot42-seq0083",
      "measuredAt": "2026-08-13T04:02:00.000Z",
      "firmwareVersion": "1.0.0",
      "wifiRssi": -68,
      "values": { "temperatureC": 27.6, "powerW": 86.9, "energyKwh": 13.287 }
    }
  ]
}
```

Use a stable unique `readingId` stored with each buffered sample. Retrying it is recognized as a duplicate. Omit fields that the hardware did not measure.

## 6. Email alerts

Enter comma-separated recipients in Settings. CERION writes threshold messages to `mail`. Install/configure Firebase Trigger Email (or a compatible worker) to deliver the queue. Without it, in-app alerts continue to work but email is not sent.

## 7. Vercel deployment

1. Push the project contents to the connected GitHub repository.
2. Import it into Vercel.
3. Add all required `VITE_FIREBASE_*` variables.
4. Deploy and add the Vercel domain to Firebase Authentication → Authorized domains.
5. Verify login, each role, a real ESP32 payload, alerts and report export.

## 8. Production notes

- Run a load test using the intended sensor interval before admitting 2,000–3,000 users.
- Firestore cost is driven mainly by sampling frequency, not only user count.
- For a high-frequency fleet, add hourly/daily aggregate documents and long-term archival.
- Enable budget alerts, monitoring, backups/PITR and App Check enforcement after staging verification.
- CERION is not a certified fire, gas, medical or emergency alarm.
- Predictive AI is not claimed; AI Insights remains transparent rule-based guidance until enough validated historical data exists.
