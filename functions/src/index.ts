import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();
const db = getFirestore();
const REGION = "asia-southeast1";
const callableOptions = {
  region: REGION,
  enforceAppCheck: process.env["ENFORCE_APP_CHECK"] === "true",
};

type Role = "owner" | "admin" | "teacher" | "viewer";
type Values = Record<string, number>;
type Actor = { uid: string; email: string; role: Role; school: string };
type ParsedReading = {
  id: string;
  measuredAt: Timestamp;
  values: Values;
  firmwareVersion: string | null;
  wifiRssi: number | null;
};

const LIMITS: Record<string, [number, number]> = {
  temperatureC: [-40, 85],
  humidityPct: [0, 100],
  pressureHpa: [300, 1200],
  gasResistanceOhm: [0, 100_000_000],
  iaq: [0, 500],
  co2Ppm: [0, 50_000],
  voltageV: [0, 400],
  currentA: [0, 100],
  powerW: [0, 50_000],
  energyKwh: [0, 1_000_000_000],
  frequencyHz: [0, 100],
  powerFactor: [0, 1.2],
};
const ENVIRONMENT_KEYS = new Set([
  "temperatureC",
  "humidityPct",
  "pressureHpa",
  "gasResistanceOhm",
  "iaq",
  "co2Ppm",
]);
const ENERGY_KEYS = new Set([
  "voltageV",
  "currentA",
  "powerW",
  "energyKwh",
  "frequencyHz",
  "powerFactor",
]);

function hashSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

function secureEqual(actual: string, expectedHash: string): boolean {
  const actualHash = hashSecret(actual);
  const expected = Buffer.from(expectedHash, "base64");
  return actualHash.length === expected.length && timingSafeEqual(actualHash, expected);
}

function parseValues(input: unknown): Values {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("invalid-values");
  const output: Values = {};
  for (const [key, range] of Object.entries(LIMITS)) {
    const value = (input as Record<string, unknown>)[key];
    if (value === undefined) continue;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < range[0] ||
      value > range[1]
    ) {
      throw new Error(`invalid-${key}`);
    }
    output[key] = value;
  }
  if (!Object.keys(output).length) throw new Error("empty-values");
  return output;
}

function measuredTimestamp(value: unknown): Timestamp {
  if (value === undefined || value === null || value === "") return Timestamp.now();
  if (typeof value !== "string") throw new Error("invalid-measuredAt");
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error("invalid-measuredAt");
  const drift = Date.now() - parsed.getTime();
  if (drift < -10 * 60 * 1000 || drift > 31 * 24 * 60 * 60 * 1000)
    throw new Error("measuredAt-out-of-range");
  return Timestamp.fromDate(parsed);
}

function readingId(deviceId: string, input: Record<string, unknown>, values: Values): string {
  const supplied = typeof input["readingId"] === "string" ? input["readingId"].trim() : "";
  const suffix = /^[A-Za-z0-9_-]{1,80}$/.test(supplied)
    ? supplied
    : createHash("sha256")
        .update(
          JSON.stringify({
            measuredAt: input["measuredAt"] ?? null,
            values: Object.fromEntries(
              Object.entries(values).sort(([a], [b]) => a.localeCompare(b)),
            ),
          }),
        )
        .digest("hex")
        .slice(0, 40);
  return `${deviceId}_${suffix}`;
}

function parseReading(deviceId: string, input: unknown): ParsedReading {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("invalid-reading");
  const source = input as Record<string, unknown>;
  const values = parseValues(source["values"]);
  const wifiRssi = source["wifiRssi"];
  if (
    wifiRssi !== undefined &&
    (typeof wifiRssi !== "number" || !Number.isFinite(wifiRssi) || wifiRssi < -150 || wifiRssi > 10)
  ) {
    throw new Error("invalid-wifiRssi");
  }
  return {
    id: readingId(deviceId, source, values),
    measuredAt: measuredTimestamp(source["measuredAt"]),
    values,
    firmwareVersion:
      typeof source["firmwareVersion"] === "string"
        ? source["firmwareVersion"].trim().slice(0, 40)
        : null,
    wifiRssi: typeof wifiRssi === "number" ? wifiRssi : null,
  };
}

async function actor(uid: string): Promise<Actor> {
  const snapshot = await db.doc(`users/${uid}`).get();
  const data = snapshot.data();
  if (!data || data["status"] !== "active" || data["disabled"] !== false)
    throw new HttpsError("permission-denied", "Inactive CERION profile.");
  const role = data["role"] as Role;
  if (!["owner", "admin", "teacher", "viewer"].includes(role))
    throw new HttpsError("permission-denied", "Invalid CERION role.");
  return {
    uid,
    email: String(data["email"] ?? uid),
    role,
    school: String(data["school"] ?? ""),
  };
}

function canManageUser(profile: Actor, target: Record<string, unknown>): boolean {
  if (profile.role === "owner") return true;
  return (
    profile.role === "admin" &&
    ["teacher", "viewer"].includes(String(target["role"])) &&
    target["school"] === profile.school
  );
}

function canAssign(profile: Actor, role: Role, school: string): boolean {
  return (
    profile.role === "owner" ||
    (profile.role === "admin" && ["teacher", "viewer"].includes(role) && school === profile.school)
  );
}

async function validateAssignments(school: string, classrooms: string[]): Promise<void> {
  const schoolSnapshot = await db.doc(`schools/${school}`).get();
  if (!schoolSnapshot.exists || schoolSnapshot.data()?.["active"] === false)
    throw new HttpsError("invalid-argument", "School does not exist or is archived.");
  if (!classrooms.length) return;
  const unique = [...new Set(classrooms)];
  const rows = await db.getAll(...unique.map((id) => db.doc(`classrooms/${id}`)));
  if (
    rows.some(
      (row) =>
        !row.exists || row.data()?.["schoolId"] !== school || row.data()?.["active"] === false,
    )
  ) {
    throw new HttpsError("invalid-argument", "A classroom assignment is invalid.");
  }
}

async function protectLastOwner(target: Record<string, unknown>): Promise<void> {
  if (target["role"] !== "owner" || target["disabled"] === true) return;
  const owners = await db.collection("users").where("role", "==", "owner").get();
  const activeOwners = owners.docs.filter(
    (row) => row.data()["disabled"] === false && row.data()["status"] === "active",
  );
  if (activeOwners.length <= 1)
    throw new HttpsError("failed-precondition", "CERION must retain at least one active Owner.");
}

async function writeAudit(
  profile: Actor,
  action: string,
  detail: string,
  schoolId = profile.school,
): Promise<void> {
  await db.collection("auditLogs").add({
    action,
    detail: detail.slice(0, 500),
    actor: profile.email,
    actorUid: profile.uid,
    actorRole: profile.role,
    schoolId,
    at: FieldValue.serverTimestamp(),
  });
}

export const createUser = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const profile = await actor(request.auth.uid);
  const input = request.data as Record<string, unknown>;
  const fullName = typeof input["fullName"] === "string" ? input["fullName"].trim() : "";
  const email = typeof input["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  const password = typeof input["password"] === "string" ? input["password"] : "";
  const role = input["role"] as Role;
  const school = typeof input["school"] === "string" ? input["school"].trim() : "";
  const classrooms = Array.isArray(input["classrooms"])
    ? input["classrooms"].filter((item): item is string => typeof item === "string")
    : [];
  if (
    fullName.length < 2 ||
    !email ||
    password.length < 8 ||
    !["owner", "admin", "teacher", "viewer"].includes(role) ||
    !school
  ) {
    throw new HttpsError("invalid-argument", "Invalid user data.");
  }
  if (!canAssign(profile, role, school))
    throw new HttpsError("permission-denied", "Cannot create this user.");
  await validateAssignments(school, classrooms);
  const account = await getAuth().createUser({
    email,
    password,
    displayName: fullName,
    disabled: false,
  });
  try {
    await db.doc(`users/${account.uid}`).set({
      fullName,
      email,
      role,
      school,
      classrooms: [...new Set(classrooms)],
      status: "active",
      disabled: false,
      createdBy: profile.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await writeAudit(profile, "user.create", `${email} (${role})`, school);
  } catch (error) {
    await getAuth()
      .deleteUser(account.uid)
      .catch(() => undefined);
    throw error;
  }
  return { uid: account.uid };
});

export const updateUser = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const profile = await actor(request.auth.uid);
  const input = request.data as Record<string, unknown>;
  const uid = typeof input["uid"] === "string" ? input["uid"] : "";
  if (!uid || uid === request.auth.uid)
    throw new HttpsError("invalid-argument", "An Owner cannot change their own access here.");
  const targetRef = db.doc(`users/${uid}`);
  const targetSnapshot = await targetRef.get();
  if (!targetSnapshot.exists) throw new HttpsError("not-found", "User profile not found.");
  const target = targetSnapshot.data() as Record<string, unknown>;
  if (!canManageUser(profile, target))
    throw new HttpsError("permission-denied", "Cannot manage this user.");

  const fullName = typeof input["fullName"] === "string" ? input["fullName"].trim() : "";
  const role = input["role"] as Role;
  const school = typeof input["school"] === "string" ? input["school"].trim() : "";
  const classrooms = Array.isArray(input["classrooms"])
    ? input["classrooms"].filter((item): item is string => typeof item === "string")
    : [];
  if (
    fullName.length < 2 ||
    !["owner", "admin", "teacher", "viewer"].includes(role) ||
    !school ||
    !canAssign(profile, role, school)
  ) {
    throw new HttpsError("invalid-argument", "Invalid user update.");
  }
  if (target["role"] === "owner" && role !== "owner") await protectLastOwner(target);
  await validateAssignments(school, classrooms);
  await Promise.all([
    getAuth().updateUser(uid, { displayName: fullName }),
    targetRef.update({
      fullName,
      role,
      school,
      classrooms: [...new Set(classrooms)],
      updatedAt: FieldValue.serverTimestamp(),
    }),
  ]);
  await writeAudit(profile, "user.update", `${String(target["email"] ?? uid)} (${role})`, school);
  return { uid };
});

export const provisionDeviceKey = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const deviceId = typeof request.data?.deviceId === "string" ? request.data.deviceId.trim() : "";
  if (!deviceId) throw new HttpsError("invalid-argument", "deviceId is required.");
  const profile = await actor(request.auth.uid);
  const deviceRef = db.doc(`devices/${deviceId}`);
  const device = await deviceRef.get();
  if (!device.exists) throw new HttpsError("not-found", "Device not found.");
  const data = device.data() as Record<string, unknown>;
  if (!(
    profile.role === "owner" ||
    (profile.role === "admin" && data["schoolId"] === profile.school)
  ))
    throw new HttpsError("permission-denied", "Cannot provision this device.");
  const secret = randomBytes(32).toString("base64url");
  await Promise.all([
    db.doc(`deviceSecrets/${deviceId}`).set({
      secretHash: hashSecret(secret).toString("base64"),
      rotatedAt: FieldValue.serverTimestamp(),
      rotatedBy: request.auth.uid,
      lastRequestAt: null,
    }),
    deviceRef.update({
      nextOfflineCheckAt: Timestamp.fromMillis(Date.now() + 5 * 60 * 1000),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    writeAudit(profile, "device.rotate_key", deviceId, String(data["schoolId"] ?? "")),
  ]);
  return { deviceId, secret };
});

export const setUserDisabled = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const uid = typeof request.data?.uid === "string" ? request.data.uid : "";
  const disabled = request.data?.disabled === true;
  if (!uid || uid === request.auth.uid)
    throw new HttpsError("invalid-argument", "Cannot change your own account status.");
  const profile = await actor(request.auth.uid);
  const targetRef = db.doc(`users/${uid}`);
  const targetSnapshot = await targetRef.get();
  const target = targetSnapshot.data() as Record<string, unknown> | undefined;
  if (!target || !canManageUser(profile, target))
    throw new HttpsError("permission-denied", "Cannot manage this user.");
  if (disabled) await protectLastOwner(target);
  await Promise.all([
    getAuth().updateUser(uid, { disabled }),
    targetRef.update({
      disabled,
      status: disabled ? "disabled" : "active",
      updatedAt: FieldValue.serverTimestamp(),
    }),
  ]);
  await writeAudit(
    profile,
    disabled ? "user.disable" : "user.enable",
    String(target["email"] ?? uid),
    String(target["school"] ?? ""),
  );
  return { uid, disabled };
});

export const deleteUser = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const uid = typeof request.data?.uid === "string" ? request.data.uid : "";
  if (!uid || uid === request.auth.uid)
    throw new HttpsError("invalid-argument", "Cannot delete your own account.");
  const profile = await actor(request.auth.uid);
  const targetRef = db.doc(`users/${uid}`);
  const targetSnapshot = await targetRef.get();
  const target = targetSnapshot.data() as Record<string, unknown> | undefined;
  if (!target || !canManageUser(profile, target))
    throw new HttpsError("permission-denied", "Cannot manage this user.");
  await protectLastOwner(target);
  await getAuth().deleteUser(uid);
  await targetRef.delete();
  await writeAudit(
    profile,
    "user.delete",
    String(target["email"] ?? uid),
    String(target["school"] ?? ""),
  );
  return { uid };
});

async function hasLinked(collectionName: string, field: string, value: string): Promise<boolean> {
  const snapshot = await db.collection(collectionName).where(field, "==", value).limit(1).get();
  return !snapshot.empty;
}

export const deleteSchool = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const profile = await actor(request.auth.uid);
  if (profile.role !== "owner") throw new HttpsError("permission-denied", "Owner required.");
  const schoolId = typeof request.data?.schoolId === "string" ? request.data.schoolId : "";
  const schoolRef = db.doc(`schools/${schoolId}`);
  const school = await schoolRef.get();
  if (!school.exists) throw new HttpsError("not-found", "School not found.");
  const links = await Promise.all([
    hasLinked("classrooms", "schoolId", schoolId),
    hasLinked("devices", "schoolId", schoolId),
    hasLinked("users", "school", schoolId),
    hasLinked("readings", "schoolId", schoolId),
    hasLinked("alerts", "schoolId", schoolId),
  ]);
  if (links.some(Boolean))
    throw new HttpsError("failed-precondition", "School still has linked records.");
  const batch = db.batch();
  batch.delete(schoolRef);
  batch.delete(db.doc(`settings/${schoolId}`));
  await batch.commit();
  await writeAudit(profile, "school.delete", schoolId, schoolId);
  return { schoolId };
});

export const deleteClassroom = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const profile = await actor(request.auth.uid);
  const classroomId = typeof request.data?.classroomId === "string" ? request.data.classroomId : "";
  const classroomRef = db.doc(`classrooms/${classroomId}`);
  const classroom = await classroomRef.get();
  const data = classroom.data();
  if (!data) throw new HttpsError("not-found", "Classroom not found.");
  if (!(
    profile.role === "owner" ||
    (profile.role === "admin" && data["schoolId"] === profile.school)
  ))
    throw new HttpsError("permission-denied", "Cannot delete this classroom.");
  const links = await Promise.all([
    hasLinked("devices", "classroomId", classroomId),
    db.collection("users").where("classrooms", "array-contains", classroomId).limit(1).get(),
    hasLinked("readings", "classroomId", classroomId),
    hasLinked("alerts", "classroomId", classroomId),
  ]);
  if (links[0] || !links[1].empty || links[2] || links[3])
    throw new HttpsError("failed-precondition", "Classroom still has linked records.");
  await classroomRef.delete();
  await writeAudit(profile, "classroom.delete", classroomId, String(data["schoolId"] ?? ""));
  return { classroomId };
});

export const deleteDevice = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const profile = await actor(request.auth.uid);
  const deviceId = typeof request.data?.deviceId === "string" ? request.data.deviceId : "";
  const deviceRef = db.doc(`devices/${deviceId}`);
  const device = await deviceRef.get();
  const data = device.data();
  if (!data) throw new HttpsError("not-found", "Device not found.");
  if (!(
    profile.role === "owner" ||
    (profile.role === "admin" && data["schoolId"] === profile.school)
  ))
    throw new HttpsError("permission-denied", "Cannot delete this device.");
  const links = await Promise.all([
    hasLinked("readings", "deviceId", deviceId),
    hasLinked("alerts", "deviceId", deviceId),
  ]);
  if (links.some(Boolean))
    throw new HttpsError("failed-precondition", "Device still has linked history or alerts.");
  const batch = db.batch();
  batch.delete(deviceRef);
  batch.delete(db.doc(`deviceSecrets/${deviceId}`));
  batch.delete(db.doc(`latestReadings/${deviceId}`));
  await batch.commit();
  await writeAudit(profile, "device.delete", deviceId, String(data["schoolId"] ?? ""));
  return { deviceId };
});

type ThresholdEvent = {
  metric: string;
  severity: "critical" | "warning";
  condition: "high" | "low";
  value: number;
  threshold: number;
  title: string;
};

function thresholdEvents(values: Values, thresholds: Record<string, unknown>): ThresholdEvent[] {
  const events: ThresholdEvent[] = [];
  const high = (
    metric: string,
    key: string,
    title: string,
    severity: "critical" | "warning" = "warning",
  ) => {
    const value = values[metric];
    const threshold = thresholds[key];
    if (value !== undefined && typeof threshold === "number" && value > threshold)
      events.push({ metric, severity, condition: "high", value, threshold, title });
  };
  const low = (metric: string, key: string, title: string) => {
    const value = values[metric];
    const threshold = thresholds[key];
    if (value !== undefined && typeof threshold === "number" && value < threshold)
      events.push({
        metric,
        severity: "warning",
        condition: "low",
        value,
        threshold,
        title,
      });
  };
  high("temperatureC", "temperatureMaxC", "High classroom temperature");
  low("temperatureC", "temperatureMinC", "Low classroom temperature");
  high("humidityPct", "humidityMaxPct", "High classroom humidity");
  low("humidityPct", "humidityMinPct", "Low classroom humidity");
  high("iaq", "iaqWarning", "IAQ warning", "critical");
  high("powerW", "powerWarningW", "Power threshold exceeded", "critical");
  return events;
}

const monitoredConditions = [
  [
    "temperatureC",
    "temperatureMaxC",
    "high",
    (value: number, threshold: number) => value > threshold,
  ],
  [
    "temperatureC",
    "temperatureMinC",
    "low",
    (value: number, threshold: number) => value < threshold,
  ],
  [
    "humidityPct",
    "humidityMaxPct",
    "high",
    (value: number, threshold: number) => value > threshold,
  ],
  ["humidityPct", "humidityMinPct", "low", (value: number, threshold: number) => value < threshold],
  ["iaq", "iaqWarning", "high", (value: number, threshold: number) => value > threshold],
  ["powerW", "powerWarningW", "high", (value: number, threshold: number) => value > threshold],
] as const;

export const ingestReading = onRequest(
  { region: REGION, cors: false, timeoutSeconds: 60, memory: "256MiB" },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).set("Allow", "POST").json({ error: "method-not-allowed" });
      return;
    }
    const deviceId = typeof request.body?.deviceId === "string" ? request.body.deviceId.trim() : "";
    const deviceKey = request.get("x-cerion-device-key")?.trim() ?? "";
    if (!deviceId || !deviceKey) {
      response.status(401).json({ error: "missing-device-credentials" });
      return;
    }
    try {
      const deviceRef = db.doc(`devices/${deviceId}`);
      const secretRef = db.doc(`deviceSecrets/${deviceId}`);
      const deviceSnapshot = await deviceRef.get();
      if (!deviceSnapshot.exists || deviceSnapshot.data()?.["enabled"] === false) {
        response.status(401).json({ error: "unknown-or-disabled-device" });
        return;
      }
      await db.runTransaction(async (transaction) => {
        const secretSnapshot = await transaction.get(secretRef);
        const secretHash = String(secretSnapshot.data()?.["secretHash"] ?? "");
        if (!secretSnapshot.exists || !secretHash || !secureEqual(deviceKey, secretHash))
          throw new Error("invalid-device-credentials");
        const last = secretSnapshot.data()?.["lastRequestAt"];
        if (last instanceof Timestamp && Date.now() - last.toMillis() < 250)
          throw new Error("rate-limited");
        transaction.update(secretRef, { lastRequestAt: Timestamp.now() });
      });

      const device = deviceSnapshot.data() as Record<string, unknown>;
      const schoolId = String(device["schoolId"] ?? "");
      const classroomId = String(device["classroomId"] ?? "");
      if (!schoolId || !classroomId) throw new Error("unassigned-device");
      const rawRows = Array.isArray(request.body?.readings)
        ? request.body.readings
        : [request.body];
      if (!rawRows.length || rawRows.length > 60) throw new Error("invalid-batch-size");
      const unique = new Map<string, ParsedReading>();
      rawRows.forEach((row: unknown) => {
        const parsed = parseReading(deviceId, row);
        unique.set(parsed.id, parsed);
      });
      const parsedRows = [...unique.values()].sort(
        (a, b) => a.measuredAt.toMillis() - b.measuredAt.toMillis(),
      );
      const refs = parsedRows.map((row) => db.doc(`readings/${row.id}`));
      const existing = await db.getAll(...refs);
      const accepted = parsedRows.filter((_, index) => !existing[index]?.exists);
      if (!accepted.length) {
        response.status(200).json({
          accepted: true,
          acceptedCount: 0,
          duplicateCount: rawRows.length,
          alertCount: 0,
        });
        return;
      }

      const now = Timestamp.now();
      const newest = accepted.at(-1) as ParsedReading;
      const latestRef = db.doc(`latestReadings/${deviceId}`);
      const latestSnapshot = await latestRef.get();
      const latestMeasuredAt = latestSnapshot.data()?.["measuredAt"];
      const shouldUpdateLatest =
        !(latestMeasuredAt instanceof Timestamp) ||
        newest.measuredAt.toMillis() >= latestMeasuredAt.toMillis();
      const settings = (await db.doc(`settings/${schoolId}`).get()).data() ?? {};
      const thresholds =
        settings["thresholds"] && typeof settings["thresholds"] === "object"
          ? (settings["thresholds"] as Record<string, unknown>)
          : {};
      const events = thresholdEvents(newest.values, thresholds);
      const activeSnapshots = await Promise.all(
        events.map((event) =>
          db.doc(`activeAlerts/${deviceId}_${event.metric}_${event.condition}`).get(),
        ),
      );
      const offlineRef = db.doc(`activeAlerts/${deviceId}_device_offline`);
      const offline = await offlineRef.get();
      const batch = db.batch();

      for (const row of accepted) {
        batch.create(db.doc(`readings/${row.id}`), {
          deviceId,
          schoolId,
          classroomId,
          measuredAt: row.measuredAt,
          receivedAt: now,
          values: row.values,
          firmwareVersion: row.firmwareVersion,
          source: rawRows.length > 1 ? "offline-batch" : "live",
        });
      }
      if (shouldUpdateLatest) {
        batch.set(
          latestRef,
          {
            deviceId,
            schoolId,
            classroomId,
            measuredAt: newest.measuredAt,
            receivedAt: now,
            values: newest.values,
            firmwareVersion: newest.firmwareVersion,
          },
          { merge: true },
        );
      }
      const deviceUpdate: Record<string, unknown> = {
        lastSeen: now,
        nextOfflineCheckAt: Timestamp.fromMillis(now.toMillis() + 5 * 60 * 1000),
        wifiRssi: newest.wifiRssi,
        updatedAt: now,
      };
      if (newest.firmwareVersion) deviceUpdate["firmwareVersion"] = newest.firmwareVersion;
      if (Object.keys(newest.values).some((key) => ENVIRONMENT_KEYS.has(key)))
        deviceUpdate["sensorLastSeen.environment"] = now;
      if (Object.keys(newest.values).some((key) => ENERGY_KEYS.has(key)))
        deviceUpdate["sensorLastSeen.energy"] = now;
      batch.update(deviceRef, deviceUpdate);

      let createdAlerts = 0;
      for (const [index, event] of events.entries()) {
        if (activeSnapshots[index]?.data()?.["active"] === true) continue;
        const alertRef = db.collection("alerts").doc();
        batch.create(alertRef, {
          deviceId,
          schoolId,
          classroomId,
          metric: event.metric,
          severity: event.severity,
          state: "open",
          title: event.title,
          message: `${event.metric} measured ${event.value}; configured threshold is ${event.threshold}.`,
          value: event.value,
          threshold: event.threshold,
          createdAt: now,
          note: "",
          assignedTo: null,
          acknowledgedAt: null,
          acknowledgedBy: null,
          resolvedAt: null,
          resolvedBy: null,
        });
        batch.set(db.doc(`activeAlerts/${deviceId}_${event.metric}_${event.condition}`), {
          active: true,
          alertId: alertRef.id,
          deviceId,
          schoolId,
          classroomId,
          metric: event.metric,
          condition: event.condition,
          updatedAt: now,
        });
        const emails = Array.isArray(settings["notificationEmails"])
          ? settings["notificationEmails"].filter(
              (item): item is string => typeof item === "string",
            )
          : [];
        if (emails.length) {
          batch.set(db.doc(`mail/${alertRef.id}`), {
            to: emails.slice(0, 20),
            message: {
              subject: `CERION: ${event.title}`,
              text: `${event.metric}: ${event.value}; threshold: ${event.threshold}; classroom: ${classroomId}.`,
            },
            createdAt: now,
          });
        }
        createdAlerts += 1;
      }
      for (const [metric, key, condition, breached] of monitoredConditions) {
        const value = newest.values[metric];
        const threshold = thresholds[key];
        if (value === undefined || typeof threshold !== "number" || breached(value, threshold))
          continue;
        batch.set(
          db.doc(`activeAlerts/${deviceId}_${metric}_${condition}`),
          { active: false, updatedAt: now },
          { merge: true },
        );
      }
      if (offline.data()?.["active"] === true) {
        batch.set(offlineRef, { active: false, updatedAt: now }, { merge: true });
        const alertId = offline.data()?.["alertId"];
        if (typeof alertId === "string")
          batch.update(db.doc(`alerts/${alertId}`), {
            state: "resolved",
            resolvedAt: now,
            resolvedBy: "system:device-reconnected",
            note: "Automatically resolved when telemetry resumed.",
          });
      }
      await batch.commit();
      response.status(202).json({
        accepted: true,
        acceptedCount: accepted.length,
        duplicateCount: rawRows.length - accepted.length,
        latestUpdated: shouldUpdateLatest,
        alertCount: createdAlerts,
      });
    } catch (error) {
      console.error("ingestReading", error);
      const message = error instanceof Error ? error.message : "invalid-reading";
      const status = message === "rate-limited" ? 429 : message.includes("credentials") ? 401 : 400;
      response.status(status).json({ error: message });
    }
  },
);

export const monitorOfflineDevices = onSchedule(
  { region: REGION, schedule: "every 5 minutes", timeZone: "Asia/Ho_Chi_Minh" },
  async () => {
    const now = Timestamp.now();
    const devices = await db
      .collection("devices")
      .where("enabled", "==", true)
      .where("nextOfflineCheckAt", "<=", now)
      .orderBy("nextOfflineCheckAt")
      .limit(150)
      .get();
    if (devices.empty) return;
    const activeRefs = devices.docs.map((device) =>
      db.doc(`activeAlerts/${device.id}_device_offline`),
    );
    const activeRows = await db.getAll(...activeRefs);
    const batch = db.batch();
    devices.docs.forEach((device, index) => {
      const data = device.data();
      const activeRef = activeRefs[index] as FirebaseFirestore.DocumentReference;
      if (activeRows[index]?.data()?.["active"] !== true) {
        const alertRef = db.collection("alerts").doc();
        batch.create(alertRef, {
          deviceId: device.id,
          schoolId: String(data["schoolId"] ?? ""),
          classroomId: String(data["classroomId"] ?? ""),
          metric: "deviceOffline",
          severity: "critical",
          state: "open",
          title: "Device offline",
          message: "No telemetry was received within the configured five-minute window.",
          value: null,
          threshold: 300,
          createdAt: now,
          note: "",
          assignedTo: null,
          acknowledgedAt: null,
          acknowledgedBy: null,
          resolvedAt: null,
          resolvedBy: null,
        });
        batch.set(activeRef, {
          active: true,
          alertId: alertRef.id,
          deviceId: device.id,
          schoolId: String(data["schoolId"] ?? ""),
          classroomId: String(data["classroomId"] ?? ""),
          metric: "deviceOffline",
          condition: "offline",
          updatedAt: now,
        });
      }
      batch.update(device.ref, {
        nextOfflineCheckAt: Timestamp.fromMillis(now.toMillis() + 60 * 60 * 1000),
      });
    });
    await batch.commit();
  },
);

export const enforceDataRetention = onSchedule(
  {
    region: REGION,
    schedule: "every day 02:30",
    timeZone: "Asia/Ho_Chi_Minh",
    timeoutSeconds: 540,
  },
  async () => {
    const settings = await db.collection("settings").get();
    for (const setting of settings.docs) {
      const retention = Number(setting.data()["dataRetentionDays"]);
      if (!Number.isFinite(retention) || retention < 30) continue;
      const cutoff = Timestamp.fromMillis(Date.now() - retention * 24 * 60 * 60 * 1000);
      for (let page = 0; page < 40; page += 1) {
        const expired = await db
          .collection("readings")
          .where("schoolId", "==", setting.id)
          .where("measuredAt", "<", cutoff)
          .orderBy("measuredAt")
          .limit(500)
          .get();
        if (expired.empty) break;
        const batch = db.batch();
        expired.docs.forEach((row) => batch.delete(row.ref));
        await batch.commit();
        if (expired.size < 500) break;
      }
    }
  },
);
