/**
 * Centralised Role-Based Access Control (RBAC) definitions for CERION.
 *
 * These helpers mirror backend policy for navigation and route UX only. They
 * are not a security boundary; Firestore rules and trusted server operations
 * must independently authorize every data operation.
 */

export const ROLES = ["owner", "admin", "teacher", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  // Read surfaces
  "view.dashboard",
  "view.environment",
  "view.alerts",
  "view.history",
  "view.reports",
  "view.ai",
  "view.analytics",
  // Actions
  "export.reports",
  "alerts.acknowledge",
  "devices.report_issue",
  "classroom.notes",
  // Management
  "management.access",
  "manage.schools",
  "manage.users",
  "manage.roles",
  "manage.classrooms",
  "manage.devices",
  "manage.teacher_assignment",
  "manage.school_users",
  // Platform
  "settings.view",
  "settings.global",
  "settings.ai",
  "settings.thresholds",
  "settings.integrations",
  "settings.backup",
  "settings.firmware",
  "audit.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const OWNER_PERMISSIONS: Permission[] = [...PERMISSIONS];

const ADMIN_PERMISSIONS: Permission[] = [
  "view.dashboard",
  "view.environment",
  "view.alerts",
  "view.history",
  "view.reports",
  "view.ai",
  "export.reports",
  "alerts.acknowledge",
  "devices.report_issue",
  "classroom.notes",
  "management.access",
  "manage.classrooms",
  "manage.devices",
  "manage.teacher_assignment",
  "manage.school_users",
  "settings.view",
  "settings.thresholds",
  "audit.view",
];

const TEACHER_PERMISSIONS: Permission[] = [
  "view.dashboard",
  "view.environment",
  "view.alerts",
  "view.history",
  "view.reports",
  "view.ai",
  "export.reports",
  "alerts.acknowledge",
  "devices.report_issue",
  "classroom.notes",
  "management.access",
];

const VIEWER_PERMISSIONS: Permission[] = [
  "view.dashboard",
  "view.environment",
  "view.alerts",
  "view.history",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: OWNER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  teacher: TEACHER_PERMISSIONS,
  viewer: VIEWER_PERMISSIONS,
};

/** Owner intentionally has no description (per product spec). */
export const ROLE_DESCRIPTION_KEY: Record<Role, string | null> = {
  owner: null,
  admin: "role.admin.description",
  teacher: "role.teacher.description",
  viewer: "role.viewer.description",
};

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role | null, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/** Route path -> permission required to open it. Unmapped protected routes deny access. */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "view.dashboard",
  "/profile": "view.dashboard",
  "/environment": "view.environment",
  "/devices": "manage.devices",
  "/alerts": "view.alerts",
  "/history": "view.history",
  "/reports": "view.reports",
  "/ai-insights": "view.ai",
  "/settings": "settings.view",
  "/management": "management.access",
};

export function canAccessRoute(role: Role | null, pathname: string): boolean {
  const match = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!match) return false;
  return hasPermission(role, ROUTE_PERMISSIONS[match] as Permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Management sections rendered per role. Viewer gets none (menu hidden). */
export type ManagementSection = {
  key: string;
  labelKey: string;
  permission: Permission;
};

export const MANAGEMENT_SECTIONS: Record<Role, ManagementSection[]> = {
  owner: [
    { key: "schools", labelKey: "management.schools", permission: "manage.schools" },
    { key: "users", labelKey: "management.users", permission: "manage.users" },
    { key: "roles", labelKey: "management.roles", permission: "manage.roles" },
    { key: "classrooms", labelKey: "management.classrooms", permission: "manage.classrooms" },
    { key: "devices", labelKey: "management.devices", permission: "manage.devices" },
  ],
  admin: [
    { key: "teachers", labelKey: "management.teachers", permission: "manage.school_users" },
    { key: "viewers", labelKey: "management.viewers", permission: "manage.school_users" },
    { key: "classrooms", labelKey: "management.classrooms", permission: "manage.classrooms" },
    { key: "devices", labelKey: "management.devices", permission: "manage.devices" },
    { key: "assignment", labelKey: "management.assignment", permission: "manage.teacher_assignment" },
  ],
  teacher: [
    { key: "my-classrooms", labelKey: "management.myClassrooms", permission: "management.access" },
    { key: "device-issues", labelKey: "management.deviceIssues", permission: "devices.report_issue" },
    { key: "acknowledgements", labelKey: "management.acknowledgements", permission: "alerts.acknowledge" },
    { key: "notes", labelKey: "management.notes", permission: "classroom.notes" },
  ],
  viewer: [],
};
