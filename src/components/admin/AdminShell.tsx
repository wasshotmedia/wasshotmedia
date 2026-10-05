"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  CheckSquare,
  Target,
  Bell,
  Receipt,
  FolderGit2,
  Layers,
  BarChart3,
  Settings,
  Mail,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  body?: string;
  read: boolean;
  type?: string;
  createdAt: string;
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar & Shoots", icon: Calendar },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/admin/leads", label: "Leads & CRM", icon: Target },
  { href: "/admin/messages", label: "Enquiries", icon: Mail },
  { href: "/admin/reminders", label: "Reminders", icon: Bell },
  { href: "/admin/invoices", label: "Invoices & Payments", icon: Receipt },
  { href: "/admin/portfolio", label: "Portfolio CMS", icon: FolderGit2 },
  { href: "/admin/services", label: "Services CMS", icon: Layers },
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on /admin/login, don't show shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const [user, setUser] = useState<AdminUser | null>({
    id: "admin-default",
    name: "Admin",
    email: "admin@wasshotmedia.com",
    role: "owner",
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(true);

  // Quick Create Modal States
  const [modalType, setModalType] = useState<
    "shoot" | "client" | "project" | "lead" | "task" | "invoice" | null
  >(null);

  // Fetch session & notifications
  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"));

    fetchNotifications();
  }, [router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setQuickCreateOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Breadcrumbs title
  const currentNav =
    NAV_ITEMS.find((item) =>
      item.href === "/admin/dashboard"
        ? pathname === "/admin" || pathname === "/admin/dashboard"
        : pathname.startsWith(item.href),
    ) || NAV_ITEMS[0];

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-[#fbfbfa]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange border-t-transparent" />
          <span className="font-display text-[10px] uppercase tracking-widest text-muted font-bold">
            Connecting Studio OS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex h-screen overflow-hidden bg-[#fbfbfa] text-ink selection:bg-orange selection:text-white">
      {/* 1. DESKTOP PERSISTENT SIDEBAR */}
      <aside
        className={`hidden border-r border-[#e8e8e3] bg-white transition-all duration-300 md:flex md:flex-col ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e8e3] px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs">
              <Image
                src="/brand/wasshoticon.png"
                alt="WasShot Admin"
                width={36}
                height={36}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-ink text-sm leading-none">
                  WasShot Media
                </span>
                <span className="font-display text-[9px] uppercase tracking-widest text-orange font-bold mt-0.5">
                  Studio Admin
                </span>
              </div>
            )}
          </Link>
          <button
            suppressHydrationWarning
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-muted hover:bg-black/[0.05] hover:text-ink"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-300 ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin" || pathname === "/admin/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-ink text-white shadow-xs"
                    : "text-muted hover:bg-black/[0.04] hover:text-ink"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-orange" : "text-muted group-hover:text-ink"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Logged-in User, Role, Logout */}
        <div className="border-t border-[#e8e8e3] p-3 bg-white">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/10 font-bold text-xs text-orange">
                {user?.name ? user.name[0].toUpperCase() : "P"}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">
                    {user?.name || "Praneeth"}
                  </p>
                  <p className="font-display text-[9px] uppercase tracking-wider text-muted font-bold">
                    {user?.role || "OWNER"}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                suppressHydrationWarning
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-700 transition"
                title="Sign out of Studio Admin"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER NAVIGATION */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[#e8e8e3] px-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/wasshoticon.png"
                  alt="WasShot"
                  width={32}
                  height={32}
                  className="rounded-lg border border-black/10"
                />
                <div>
                  <p className="font-extrabold text-sm text-ink">WasShot Media</p>
                  <p className="font-display text-[9px] uppercase tracking-widest text-orange font-bold">
                    Studio Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin/dashboard"
                    ? pathname === "/admin" || pathname === "/admin/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      isActive ? "bg-ink text-white" : "text-muted hover:bg-black/[0.04] hover:text-ink"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-orange" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#e8e8e3] p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN APPLICATION AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e8e3] bg-white px-4 md:px-8">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              suppressHydrationWarning
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted hover:bg-black/[0.05] hover:text-ink md:hidden"
              aria-label="Open mobile navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted font-medium">WasShot</span>
              <span className="text-black/20">/</span>
              <span className="font-bold text-ink">{currentNav.label}</span>
            </div>
          </div>

          {/* Right Controls: Search, Quick Add, Notifications, Live Site */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Bar (Ctrl+K) */}
            <button
              suppressHydrationWarning
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-1.5 text-xs text-muted hover:border-black/20 hover:text-ink sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search anything...</span>
              <kbd className="rounded border border-black/10 bg-white px-1.5 py-0.5 font-sans font-bold text-[10px] text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Dropdown Button */}
            <div className="relative">
              <button
                suppressHydrationWarning
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                className="flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#e03d07]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quick Create</span>
              </button>

              {quickCreateOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-2xl border border-[#e8e8e3] bg-white p-1.5 shadow-lg">
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("shoot");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Calendar className="h-3.5 w-3.5 text-orange" />
                    <span>Schedule Shoot</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("client");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Users className="h-3.5 w-3.5 text-orange" />
                    <span>New Client</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("project");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-orange" />
                    <span>New Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("lead");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Target className="h-3.5 w-3.5 text-orange" />
                    <span>New Lead</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("task");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-orange" />
                    <span>New Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      setModalType("invoice");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Receipt className="h-3.5 w-3.5 text-orange" />
                    <span>New Invoice</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                suppressHydrationWarning
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2 text-muted hover:border-black/20 hover:text-ink"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-[#e8e8e3] bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-2">
                    <p className="text-xs font-bold text-ink">Notifications</p>
                    <Link
                      href="/admin/reminders"
                      className="text-[10px] font-semibold text-orange hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted">
                        No notifications right now.
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className="rounded-xl border border-[#f0f0eb] bg-[#fbfbfa] p-2.5 text-xs"
                        >
                          <p className="font-semibold text-ink">{n.title}</p>
                          {n.body && <p className="mt-0.5 text-muted">{n.body}</p>}
                          <p className="mt-1 font-display text-[9px] text-muted font-medium">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Link to Public Website */}
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-muted hover:border-black/20 hover:text-ink lg:flex"
            >
              <span>Live Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-[#fbfbfa] p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* 4. COMMAND PALETTE MODAL (Ctrl + K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-[#e8e8e3] bg-white p-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#e8e8e3] pb-3">
              <Search className="h-5 w-5 text-muted" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to section or search..."
                className="w-full text-sm text-ink placeholder-muted focus:outline-none"
              />
              <kbd className="rounded border border-black/10 bg-[#fbfbfa] px-1.5 py-0.5 font-sans font-bold text-[10px] text-muted">
                ESC
              </kbd>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                Quick Navigation
              </p>
              {NAV_ITEMS.filter((item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()),
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(item.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-orange/10 hover:text-orange"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. GLOBAL QUICK CREATE ACTION MODAL */}
      {modalType && (
        <QuickCreateModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            setModalType(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// Global Quick Create Form component
function QuickCreateModal({
  type,
  onClose,
  onSuccess,
}: {
  type: "shoot" | "client" | "project" | "lead" | "task" | "invoice";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<any>(null);
  const [overrideConflict, setOverrideConflict] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedPerson, setAssignedPerson] = useState("Praneeth");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [location, setLocation] = useState("Vijayawada");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setConflictWarning(null);

    try {
      if (type === "shoot") {
        // Fetch user IDs for assigned team
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();
        const foundUser = (usersData.items || []).find((u: any) =>
          u.name.toLowerCase().includes(assignedPerson.toLowerCase()),
        );
        const assignedTeam = foundUser ? [foundUser._id] : [];

        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(`${date}T${endTime}:00`);

        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || `${clientName} Shoot`,
            type: "shoot",
            start: start.toISOString(),
            end: end.toISOString(),
            location,
            assignedTeam,
            notes,
            status: "confirmed",
            overrideConflict,
            reminderOffsets: [24 * 60, 2 * 60],
          }),
        });

        const data = await res.json();
        if (res.status === 409) {
          setConflictWarning(data);
          setSubmitting(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to schedule shoot");
        }
        onSuccess();
        return;
      }

      if (type === "client") {
        const res = await fetch("/api/admin/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: clientName,
            contactPerson: clientName,
            email,
            phone,
            address: location,
            notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create client");
        onSuccess();
        return;
      }

      if (type === "lead") {
        const res = await fetch("/api/admin/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: clientName,
            email,
            phone,
            message: notes,
            stage: "new",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create lead");
        onSuccess();
        return;
      }

      if (type === "project") {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: title || "New Project",
            stage: "enquiry",
            description: notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create project");
        onSuccess();
        return;
      }

      if (type === "task") {
        const res = await fetch("/api/admin/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "New Task",
            priority: "medium",
            status: "todo",
            notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create task");
        onSuccess();
        return;
      }

      if (type === "invoice") {
        // Find or create default client
        const clientsRes = await fetch("/api/admin/clients");
        const clientsData = await clientsRes.json();
        const firstClient = clientsData.items?.[0];

        const res = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: firstClient?._id,
            items: [{ description: title || "Studio Production", quantity: 1, price: 50000 }],
            taxRate: 18,
            notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create invoice");
        onSuccess();
        return;
      }
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
          <h3 className="display text-xl font-bold capitalize">
            {type === "shoot"
              ? "Schedule Shoot"
              : type === "client"
                ? "New Client"
                : type === "lead"
                  ? "New Lead"
                  : type === "project"
                    ? "New Project"
                    : type === "task"
                      ? "New Task"
                      : "New Invoice"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-black/[0.05]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server-Side Conflict Alert Dialog */}
        {conflictWarning && (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs text-red-900">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>BOOKING CONFLICT DETECTED</span>
            </div>
            <p className="mt-1">{conflictWarning.message}</p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="override"
                checked={overrideConflict}
                onChange={(e) => setOverrideConflict(e.target.checked)}
                className="rounded border-red-300 text-orange focus:ring-orange"
              />
              <label htmlFor="override" className="font-semibold text-red-950">
                Authorize Conflict Override as Studio Owner
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {type === "shoot" ? (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted">
                  Shoot Title / Event Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ABC Brand Shoot"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3.5 py-2.5 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted">
                    Assign To
                  </label>
                  <select
                    value={assignedPerson}
                    onChange={(e) => setAssignedPerson(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="Praneeth">Praneeth (Creative Lead)</option>
                    <option value="Wasim">Wasim (Media Lead)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vijayawada Studio / On-Location"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3.5 py-2.5 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-muted">
                  Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={title || clientName}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setClientName(e.target.value);
                  }}
                  placeholder="Enter name or title"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3.5 py-2.5 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              {(type === "client" || type === "lead") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-muted">Notes / Scope</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes, shot list or equipment..."
              className="mt-1 w-full rounded-xl border border-black/10 bg-[#fbfbfa] px-3.5 py-2.5 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#e8e8e3] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white transition hover:bg-orange disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
