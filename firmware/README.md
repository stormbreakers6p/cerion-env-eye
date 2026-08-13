# CERION Env Eye ESP32 firmware

This PlatformIO project implements the Arduino-framework ESP32 client for the existing CERION
Firebase backend. It does not write to Firestore directly. It sends validated sensor telemetry to the
existing `ingestReading` HTTPS Cloud Function, which authenticates the device, derives its school
and classroom assignment, and performs trusted Firestore writes.

The firmware compiles for the generic ESP32 Dev Module. A real end-to-end acceptance test still
requires a physical ESP32, connected sensors, Wi-Fi, and a device ID/key provisioned from the live
CERION application.

## Existing CERION contract

- Firebase project: `cerion-platform`
- Function region: `asia-southeast1`
- Ingestion URL:
  `https://asia-southeast1-cerion-platform.cloudfunctions.net/ingestReading`
- Device authentication: `x-cerion-device-key` header containing the one-time key generated from
  CERION's Devices screen
- Web-user authentication: Firebase Email/Password Authentication plus `users/{uid}` access profiles
- Device assignment: `devices/{deviceId}.schoolId` and `.classroomId`; these values are read by the
  Function and are deliberately not trusted from firmware

The Function writes the following exact paths:

- History: `readings/{deviceId}_{readingId}`
- Latest value: `latestReadings/{deviceId}`
- Heartbeat/status clocks: updates `devices/{deviceId}`
- Secret hash and request clock: `deviceSecrets/{deviceId}` (Function/Admin access only)

For every accepted reading, the history document contains:

| Field | Type | Source |
|---|---|---|
| `deviceId` | string | Authenticated device record |
| `schoolId` | string | `devices/{deviceId}` |
| `classroomId` | string | `devices/{deviceId}` |
| `measuredAt` | Firestore Timestamp | ESP32 NTP time, or Function receive time before NTP is available |
| `receivedAt` | Firestore Timestamp | Function server time |
| `values` | map | Only validated physical-sensor fields |
| `firmwareVersion` | string or null | Firmware configuration |
| `source` | `live` or `offline-batch` | Function-derived |

`latestReadings/{deviceId}` has the same identity/timestamp/value fields except `source`.
`devices/{deviceId}` is updated with `lastSeen`, `nextOfflineCheckAt`, `wifiRssi`, `updatedAt`,
`firmwareVersion`, and the applicable `sensorLastSeen.environment` and/or `sensorLastSeen.energy`.
The UI does not store a separate `status` string: it computes `live` at 90 seconds or less,
`stale` from 90 to 300 seconds, and `offline` after 300 seconds. Thus an ESP32 becomes live only
after the Function accepts telemetry, never merely because Wi-Fi connected.

## Telemetry payload

A live request is:

```text
{
  deviceId: string,
  readingId: "b<boot>-r<nonce>-s<sequence>",
  measuredAt?: RFC3339 UTC string,
  firmwareVersion: string,
  wifiRssi?: number,
  values: { one or more supported numeric fields }
}
```

An offline request is `{ deviceId, readings: [ ...up to 60 rows... ] }`. The stable `readingId`
makes retries idempotent. The in-memory ring buffer keeps the newest 60 readings; it intentionally
does not add flash wear or claim power-loss persistence.

Supported `values` keys and server validation ranges are:

| Field | Range | Current producer |
|---|---:|---|
| `temperatureC` | -40 to 85 | BME688 |
| `humidityPct` | 0 to 100 | BME688 |
| `pressureHpa` | 300 to 1200 | BME688 |
| `gasResistanceOhm` | 0 to 100,000,000 | BME688 |
| `iaq` | 0 to 500 | None; omitted without a real IAQ algorithm |
| `co2Ppm` | 0 to 50,000 | None; omitted without a dedicated CO2 sensor |
| `voltageV` | 0 to 400 | PZEM-004T v3 |
| `currentA` | 0 to 100 | PZEM-004T v3 |
| `powerW` | 0 to 50,000 | PZEM-004T v3 |
| `energyKwh` | 0 to 1,000,000,000 | PZEM-004T v3 |
| `frequencyHz` | 0 to 100 | PZEM-004T v3 |
| `powerFactor` | 0 to 1.2 | PZEM-004T v3 |

There are no fake fallbacks. NaN, out-of-range, disabled, and failed-sensor values are omitted.
VOC and occupancy are not fields in the inspected CERION ingestion schema and are not sent.

## Libraries

PlatformIO installs these from `platformio.ini`:

- ESP32 Arduino core through `espressif32@6.12.0`
- ArduinoJson `^7.4.3`
- Adafruit BME680 Library `^2.0.5` (supports BME688 raw measurements)
- PZEM-004T-v30 `^1.1.2`

Wi-Fi, TLS, HTTP, NTP, Preferences, I2C, and hardware UART use ESP32 core libraries. The checked-in
Google Trust Services roots validate the HTTPS server; the firmware never calls `setInsecure()`.
Review `data/gts-roots.pem` before its June 2036 expiry or when Google announces a trust-chain change.

## Local configuration

1. Copy `include/config.example.h` to `include/local_config.h`.
2. Set `CERION_WIFI_SSID` and `CERION_WIFI_PASSWORD`.
3. Keep `CERION_FIREBASE_PROJECT_ID` as `cerion-platform`.
4. In the CERION web application's Devices page, select the correct school/classroom and register
   the ESP32. Copy the generated Firestore device ID and one-time secret into
   `CERION_DEVICE_ID` and `CERION_DEVICE_KEY`.
5. Enable only sensors physically attached using `CERION_ENABLE_BME688` and
   `CERION_ENABLE_PZEM004T`.
6. Adjust pins and `CERION_UPLOAD_INTERVAL_MS` if required. The default is 10,000 ms.

`include/local_config.h` is ignored by Git. Never commit it, paste it into issue logs, or use a
Firebase service-account key. A Firebase Web API key is not required for this device architecture.
School and classroom IDs are configured in CERION, not in firmware; this prevents a stolen device
key from selecting another tenant context.

The firmware also prints a MAC/eFuse-derived hardware ID such as `CERION-A1B2C3D4E5F6`. Use it as
an installation label or device name if desired, but the authoritative ID sent to CERION is the
provisioned Firestore document ID.

## Wiring assumptions

Default BME688 I2C wiring:

| BME688 | ESP32 |
|---|---|
| VIN | 3.3 V (use the breakout's specified supply) |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

The code tries address `0x76`, then `0x77`.

Default PZEM-004T v3 low-voltage UART wiring:

| PZEM UART | ESP32 |
|---|---|
| TX | GPIO 16 (ESP32 RX) |
| RX | GPIO 17 (ESP32 TX) |
| GND | GND on the isolated low-voltage interface |

Use a proper level shifter when required by the exact PZEM interface. The PZEM's mains side is
hazardous and must be installed by a qualified person in a suitable insulated enclosure with the
correct fuse, conductors, and current-transformer orientation. Never wire mains on a breadboard.

## Build, flash, and monitor

Install PlatformIO Core or the VS Code PlatformIO extension, connect the ESP32, then run from this
directory:

```bash
pio run
pio run --target upload
pio device monitor --baud 115200
```

If the board is not a generic ESP32 Dev Module, change `board` and the pin mapping before flashing.
The application refuses to start network activity while placeholders remain in local configuration.

## Firebase deployment prerequisites

Use the existing `cerion-platform` project; do not create another project or database.

On 2026-08-13, a verified HTTPS probe to the expected Function URL returned HTTP 404. The source
contains `ingestReading`, but it was not deployed at that URL at inspection time. Deploying the
existing Functions code is therefore required before any ESP32 can authenticate or update Firestore.

1. Enable Cloud Firestore and Email/Password Authentication for the web application.
2. Use a plan that supports the existing v2 HTTPS and scheduled Functions.
3. From the web-project root, build and deploy the existing trusted backend:

   ```bash
   npm --prefix functions run build
   firebase deploy --only firestore:rules,firestore:indexes
   firebase deploy --only functions
   ```

4. Sign in as an Owner/Admin, register the device in its real classroom, and provision its key.

Firestore rules intentionally deny all browser/device writes to `readings`, `latestReadings`, and
`deviceSecrets`. The Admin SDK inside the Function performs writes only after the constant-time
device-key check, enabled-device check, 250 ms rate limit, payload validation, and server-side
school/classroom lookup. Do not loosen these rules.

## End-to-end test procedure

1. Flash and open the 115200-baud Serial Monitor; confirm startup and sensor initialization.
2. Confirm `[WiFi] Connected` without any password/key being printed.
3. Confirm NTP synchronization and secure-upload enablement.
4. Confirm BME688 and/or PZEM return validated real values; failed fields must be absent.
5. Confirm `[Firebase] Authenticated; upload successful (HTTP 202)`.
6. In Firestore, inspect `readings/{deviceId}_{readingId}` and verify the exact fields above.
7. Confirm `latestReadings/{deviceId}` contains the newest physical values.
8. Confirm `devices/{deviceId}.lastSeen`, `wifiRssi`, and applicable sensor clock update, then verify
   the CERION Dashboard/Environment/Energy/Devices views display the same data.
9. Disconnect Wi-Fi. Confirm sensors keep sampling, the buffer count rises, and the ESP32 does not
   restart.
10. Reconnect Wi-Fi. Confirm NTP/TLS remain valid, a batch uploads automatically, and the buffered
    reading IDs appear once in Firestore.
11. Retry a known reading ID and confirm the Function reports a duplicate rather than creating a
    second history document.
12. Leave the device disconnected for more than five minutes to verify the UI/offline monitor, then
    reconnect and confirm telemetry automatically resolves the offline alert.

Compilation alone does not prove the live ESP32-to-Firestore path. Completion should be claimed only
after steps 5-8 succeed with the provisioned production/staging device and its real sensors.
