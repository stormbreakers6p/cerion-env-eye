import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, StatusBadge } from "@/components/cerion/kit";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useI18n } from "@/lib/i18n";
import { logAudit } from "@/lib/audit";
import type { Role } from "@/lib/rbac";
import {
  assignableRoles,
  canManageUser,
  createUserAccount,
  deleteUserAccount,
  resetUserPassword,
  setUserDisabled,
  subscribeUsers,
  updateUserAccount,
  userErrorKey,
  type UserProfile,
} from "@/lib/users";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  school: string;
  classrooms: string;
};

function emptyForm(role: Role, school: string): FormState {
  return { fullName: "", email: "", password: "", role, school, classrooms: "" };
}

function parseClassrooms(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function UserManager({ roleFilter }: { roleFilter?: Role[] | undefined }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { role: actorRole, selectedSchool } = useRole();

  const allowedRoles = useMemo(() => assignableRoles(actorRole), [actorRole]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState<UserProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(allowedRoles[0] ?? "viewer", selectedSchool ?? ""));

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeUsers(
      actorRole,
      selectedSchool,
      (rows) => {
        setUsers(rows);
        setLoadError(false);
        setLoading(false);
      },
      () => {
        setLoadError(true);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [actorRole, selectedSchool]);

  const visible = useMemo(() => {
    return users.filter((entry) => {
      if (roleFilter && !roleFilter.includes(entry.role)) return false;
      if (actorRole === "admin") {
        if (!allowedRoles.includes(entry.role)) return false;
        if (selectedSchool && entry.school && entry.school !== selectedSchool) return false;
      }
      return true;
    });
  }, [users, roleFilter, actorRole, allowedRoles, selectedSchool]);

  const openCreate = useCallback(() => {
    const defaultRole = (roleFilter?.find((r) => allowedRoles.includes(r)) ?? allowedRoles[0] ?? "viewer") as Role;
    setForm(emptyForm(defaultRole, selectedSchool ?? ""));
    setCreateOpen(true);
  }, [allowedRoles, roleFilter, selectedSchool]);

  const openEdit = useCallback((entry: UserProfile) => {
    setForm({
      fullName: entry.fullName,
      email: entry.email,
      password: "",
      role: entry.role,
      school: entry.school,
      classrooms: entry.classrooms.join(", "),
    });
    setEditing(entry);
  }, []);

  function validate(withPassword: boolean): string | null {
    if (form.fullName.trim().length < 2) return t("users.error.name", "Full name is required.");
    if (withPassword && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
      return t("users.error.invalidEmail", "Enter a valid email address.");
    if (withPassword && form.password.length < 6) return t("users.error.weakPassword", "Password must be at least 6 characters.");
    if (!allowedRoles.includes(form.role)) return t("users.error.permission", "You are not allowed to assign this role.");
    if (!form.school.trim()) return t("users.error.school", "School is required.");
    return null;
  }

  async function handleCreate() {
    const problem = validate(true);
    if (problem) {
      toast.error(problem);
      return;
    }
    setBusy(true);
    try {
      const created = await createUserAccount(
        {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
          school: form.school,
          classrooms: parseClassrooms(form.classrooms),
        },
        actorRole,
        user?.email ?? null,
      );
      logAudit("user.create", `${created.email} (${created.role})`, user?.email ?? "unknown");
      toast.success(t("users.toast.created", "User account created."));
      setCreateOpen(false);
    } catch (error) {
      toast.error(t(userErrorKey(error), "Could not create the user account."));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!editing) return;
    const problem = validate(false);
    if (problem) {
      toast.error(problem);
      return;
    }
    setBusy(true);
    try {
      await updateUserAccount(
        editing.uid,
        {
          fullName: form.fullName,
          role: form.role,
          school: form.school,
          classrooms: parseClassrooms(form.classrooms),
        },
        actorRole,
      );
      logAudit("user.update", `${editing.email} (${form.role})`, user?.email ?? "unknown");
      toast.success(t("users.toast.updated", "User updated."));
      setEditing(null);
    } catch (error) {
      toast.error(t(userErrorKey(error), "Could not update the user."));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDisabled(entry: UserProfile, next: boolean) {
    try {
      await setUserDisabled(entry.uid, next);
      logAudit(next ? "user.disable" : "user.enable", entry.email, user?.email ?? "unknown");
      toast.success(next ? t("users.toast.disabled", "User disabled.") : t("users.toast.enabled", "User enabled."));
    } catch (error) {
      toast.error(t(userErrorKey(error), "Could not change the user status."));
    }
  }

  async function handleReset(entry: UserProfile) {
    try {
      await resetUserPassword(entry.email);
      logAudit("user.password_reset", entry.email, user?.email ?? "unknown");
      toast.success(t("users.toast.reset", "Password reset email sent."));
    } catch (error) {
      toast.error(t(userErrorKey(error), "Could not send the reset email."));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteUserAccount(deleting.uid);
      logAudit("user.delete", deleting.email, user?.email ?? "unknown");
      toast.success(t("users.toast.deleted", "User deleted."));
      setDeleting(null);
    } catch (error) {
      toast.error(t(userErrorKey(error), "Could not delete the user."));
    } finally {
      setBusy(false);
    }
  }

  if (allowedRoles.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("users.noPermissionTitle", "No access")}
        description={t("users.noPermission", "Your role cannot manage user accounts.")}
      />
    );
  }

  const fields = (mode: "create" | "edit") => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-name`}>{t("users.field.fullName", "Full name")}</Label>
        <Input
          id={`${mode}-name`}
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          placeholder="Nguyen Van A"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-email`}>{t("users.field.email", "Email")}</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          value={form.email}
          disabled={mode === "edit"}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="teacher@school.edu"
        />
      </div>
      {mode === "create" && (
        <div className="grid gap-2">
          <Label htmlFor="create-password">{t("users.field.password", "Password")}</Label>
          <Input
            id="create-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="••••••••"
          />
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label>{t("users.field.role", "Role")}</Label>
          <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as Role })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`role.${role}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-school`}>{t("users.field.school", "School")}</Label>
          <Input
            id={`${mode}-school`}
            value={form.school}
            disabled={actorRole === "admin" && Boolean(selectedSchool)}
            onChange={(event) => setForm({ ...form, school: event.target.value })}
            placeholder="CERION Demo School"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-classrooms`}>{t("users.field.classrooms", "Assigned classrooms (optional)")}</Label>
        <Input
          id={`${mode}-classrooms`}
          value={form.classrooms}
          onChange={(event) => setForm({ ...form, classrooms: event.target.value })}
          placeholder="A1, A2, B3"
        />
        <p className="text-xs text-muted-foreground">
          {t("users.field.classroomsHint", "Separate classroom names with commas.")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("users.count", "Accounts")}: {visible.length}
        </p>
        <Button className="h-10 rounded-xl" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("users.create", "Create user")}
        </Button>
      </div>

      {loadError ? (
        <EmptyState
          icon={Users}
          title={t("users.errorTitle", "Cannot load users")}
          description={t(
            "users.errorDescription",
            "The user directory is unavailable. Check that Cloud Firestore is enabled and its rules allow access.",
          )}
        />
      ) : loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={t("users.emptyTitle", "No accounts yet")}
          description={t("users.emptyDescription", "Create the first account to get started.")}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">{t("users.field.fullName", "Full name")}</th>
                <th className="p-3 font-medium">{t("users.field.email", "Email")}</th>
                <th className="p-3 font-medium">{t("users.field.role", "Role")}</th>
                <th className="p-3 font-medium">{t("users.field.school", "School")}</th>
                <th className="p-3 font-medium">{t("users.field.classrooms", "Classrooms")}</th>
                <th className="p-3 font-medium">{t("users.status", "Status")}</th>
                <th className="p-3 text-right font-medium">{t("users.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => {
                const manageable = canManageUser(actorRole, selectedSchool, entry);
                return (
                  <tr key={entry.uid} className="border-t border-border">
                    <td className="p-3 font-medium">{entry.fullName || "—"}</td>
                    <td className="p-3 text-muted-foreground">{entry.email}</td>
                    <td className="p-3">
                      <StatusBadge label={t(`role.${entry.role}`)} tone="info" />
                    </td>
                    <td className="p-3 text-muted-foreground">{entry.school || "—"}</td>
                    <td className="p-3 text-muted-foreground">
                      {entry.classrooms.length ? entry.classrooms.join(", ") : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!entry.disabled}
                          disabled={!manageable}
                          aria-label={t("users.toggleActive", "Toggle account active")}
                          onCheckedChange={(checked) => void handleToggleDisabled(entry, !checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {entry.disabled ? t("users.disabled", "Disabled") : t("users.active", "Active")}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!manageable}
                          aria-label={t("users.edit", "Edit user")}
                          onClick={() => openEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!manageable}
                          aria-label={t("users.resetPassword", "Reset password")}
                          onClick={() => void handleReset(entry)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!manageable}
                          aria-label={t("users.delete", "Delete user")}
                          onClick={() => setDeleting(entry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("users.create", "Create user")}</DialogTitle>
            <DialogDescription>
              {t("users.createHint", "Creates the sign-in account and its CERION profile.")}
            </DialogDescription>
          </DialogHeader>
          {fields("create")}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void handleCreate()} disabled={busy}>
              {busy ? t("common.loading") : t("users.create", "Create user")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("users.edit", "Edit user")}</DialogTitle>
            <DialogDescription>{t("users.editHint", "Update profile details, role and assignments.")}</DialogDescription>
          </DialogHeader>
          {fields("edit")}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void handleUpdate()} disabled={busy}>
              {busy ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.delete", "Delete user")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteHint", "The profile and platform access are removed immediately.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={busy}>
              {t("users.delete", "Delete user")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
