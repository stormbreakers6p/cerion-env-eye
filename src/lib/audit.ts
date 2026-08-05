/** Client-side administrative activity log (prototype storage). */
export type AuditEntry = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  at: string;
};

const KEY = "cerion.auditLog";
const LIMIT = 100;

export function readAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function logAudit(action: string, detail: string, actor: string): AuditEntry[] {
  const entry: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    detail,
    actor,
    at: new Date().toISOString(),
  };
  const next = [entry, ...readAuditLog()].slice(0, LIMIT);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}
