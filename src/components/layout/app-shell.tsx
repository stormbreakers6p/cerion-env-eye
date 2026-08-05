import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronLeft, Menu, Search, User, Info, Settings, X, PlugZap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CerionLogo, CerionWordmark } from "@/components/brand/logo";
import { ClassroomSelector, StatusBadge } from "@/components/cerion/kit";
import { APP_NAV, BRAND, NOT_CONNECTED } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
      {APP_NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-transparent",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border p-3 text-center">
        <PlugZap className="mx-auto h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="space-y-3 border-t border-sidebar-border p-4">
      <div className="rounded-xl border border-border bg-muted/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          System integration
        </p>
        <div className="mt-2">
          <StatusBadge label={NOT_CONNECTED} />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{BRAND.version}</span>
        <span className="rounded-full border border-border px-2 py-0.5">Interface Prototype</span>
      </div>
    </div>
  );
}

function NotificationPanel() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" aria-label="Open notifications">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Alerts appear after devices are connected.</p>
        </div>
        <div className="px-4 py-10 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No notifications</p>
          <p className="mt-1 text-xs text-muted-foreground">Your notification center is empty.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" aria-label="Open profile menu">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>
          <span className="block truncate text-sm">{user?.email ?? "Name not provided"}</span>
          <span className="block text-xs font-normal text-muted-foreground">Role not configured</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 rounded-lg">
          <Link to="/profile">
            <User className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 rounded-lg">
          <Link to="/settings">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 rounded-lg">
          <Link to="/">
            <Info className="h-4 w-4" /> About CERION
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} className="gap-2 rounded-lg text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex",
            collapsed ? "w-[76px]" : "w-[264px]",
          )}
        >
          <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
            {collapsed ? (
              <Link to="/" aria-label="CERION home" className="mx-auto">
                <CerionLogo size={34} />
              </Link>
            ) : (
              <Link to="/" aria-label="CERION home" className="min-w-0">
                <CerionWordmark subtitle="Interface Prototype" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>
          <SidebarNav collapsed={collapsed} />
          <SidebarFooter collapsed={collapsed} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            />
            <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar duration-300">
              <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                <CerionWordmark subtitle="Interface Prototype" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter collapsed={false} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border surface-glass px-3 sm:px-5">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden min-w-0 flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 max-w-sm rounded-xl pl-9"
                placeholder="Search CERION"
                aria-label="Search CERION"
              />
            </div>
            <div className="flex-1 md:hidden" />

            <div className="flex shrink-0 items-center gap-1.5">
              <ClassroomSelector className="hidden sm:flex" />
              <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
              <NotificationPanel />
              <ThemeToggle />
              <ProfileMenu />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div key={pathname} className="animate-rise space-y-6 sm:space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
