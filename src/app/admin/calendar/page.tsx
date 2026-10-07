"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  ListTodo,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";

interface CalendarEvent {
  _id: string;
  title: string;
  type: "shoot" | "meeting" | "site_visit" | "editing" | "delivery" | "other";
  client?: { _id: string; name: string; company?: string };
  project?: { _id: string; title: string };
  start: string;
  end: string;
  allDay?: boolean;
  assignedTo?: Array<{ _id: string; name: string; email?: string }>;
  location?: string;
  locationUrl?: string;
  equipmentChecklist?: Array<{ item: string; checked: boolean }>;
  shotList?: Array<{ shot: string; checked: boolean }>;
  notes?: string;
  status: "scheduled" | "in_progress" | "completed" | "rescheduled" | "cancelled";
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar View State
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter States
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Drawer / Detail State
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<CalendarEvent["type"]>("shoot");
  const [formClientId, setFormClientId] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState<string[]>([]);
  const [formLocation, setFormLocation] = useState("Vijayawada");
  const [formLocationUrl, setFormLocationUrl] = useState("");
  const [formEquipmentStr, setFormEquipmentStr] = useState("Sony FX3 / A7SIII\n24-70mm f/2.8 GM\nWireless Mic DJI Mic 2\nAputure 200d + Softbox\nTripod & Gimbal\nExtra Batteries & SD Cards");
  const [formShotListStr, setFormShotListStr] = useState("Hero product establishing wide\nSlow-motion macro detail\nFounder interview / soundbite\nCustomer reaction B-roll\nCall-to-action end slate");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<CalendarEvent["status"]>("scheduled");

  // Conflict Modal State
  const [conflictData, setConflictData] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, teamRes, clientsRes, projectsRes] = await Promise.all([
        fetch("/api/admin/events").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/team").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/clients").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({ items: [] })),
      ]);

      setEvents(eventsRes.items || []);
      setTeamMembers(teamRes.items || []);
      setClients(clientsRes.items || []);
      setProjects(projectsRes.items || []);
    } catch (err) {
      console.error("Failed to load calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  const toLocalDatetimeInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Open Schedule Modal for a new shoot or event
  const handleOpenNewModal = (defaultDateStr?: string) => {
    setIsEditing(false);
    setFormId("");
    setFormTitle("");
    setFormType("shoot");
    setFormClientId("");
    setFormProjectId("");

    const now = defaultDateStr ? new Date(defaultDateStr) : new Date();
    // Default start to next hour
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startStr = toLocalDatetimeInput(now);

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const endStr = toLocalDatetimeInput(end);

    setFormStart(startStr);
    setFormEnd(endStr);
    // Assign Praneeth and Wasim by default if found
    setFormAssignedTo(teamMembers.map((m) => m._id));
    setFormLocation("Vijayawada");
    setFormLocationUrl("");
    setFormNotes("");
    setFormStatus("scheduled");
    setConflictData(null);
    setShowScheduleModal(true);
  };

  // Open Edit Modal for an existing event
  const handleOpenEditModal = (ev: CalendarEvent) => {
    setIsEditing(true);
    setFormId(ev._id);
    setFormTitle(ev.title);
    setFormType(ev.type);
    setFormClientId(ev.client?._id || "");
    setFormProjectId(ev.project?._id || "");
    setFormStart(ev.start ? toLocalDatetimeInput(new Date(ev.start)) : "");
    setFormEnd(ev.end ? toLocalDatetimeInput(new Date(ev.end)) : "");
    setFormAssignedTo((ev.assignedTo || []).map((u: any) => u._id || u));
    setFormLocation(ev.location || "Vijayawada");
    setFormLocationUrl(ev.locationUrl || "");
    setFormEquipmentStr(
      ev.equipmentChecklist ? ev.equipmentChecklist.map((c) => c.item).join("\n") : ""
    );
    setFormShotListStr(
      ev.shotList ? ev.shotList.map((s) => s.shot).join("\n") : ""
    );
    setFormNotes(ev.notes || "");
    setFormStatus(ev.status || "scheduled");
    setConflictData(null);
    setShowScheduleModal(true);
  };

  // Submit Schedule Form with Conflict Detection
  const handleSaveEvent = async (overrideConflict = false) => {
    if (!formTitle || !formStart || !formEnd) {
      alert("Please provide title, start date/time, and end date/time.");
      return;
    }

    setSaving(true);
    try {
      const equipmentChecklist = formEquipmentStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => ({ item, checked: false }));

      const shotList = formShotListStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((shot) => ({ shot, checked: false }));

      const payload = {
        title: formTitle,
        type: formType,
        clientId: formClientId || undefined,
        projectId: formProjectId || undefined,
        start: new Date(formStart).toISOString(),
        end: new Date(formEnd).toISOString(),
        assignedTo: formAssignedTo,
        location: formLocation,
        locationUrl: formLocationUrl,
        equipmentChecklist,
        shotList,
        notes: formNotes,
        status: formStatus,
        overrideConflict,
      };

      const url = isEditing ? `/api/admin/events/${formId}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.conflict) {
        // SERVER-SIDE CONFLICT DETECTED!
        setConflictData({
          message: data.error,
          conflicts: data.conflicts,
        });
        setSaving(false);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to schedule event.");
        setSaving(false);
        return;
      }

      // Success! Refresh events and close modals
      await loadData();
      setShowScheduleModal(false);
      setConflictData(null);
      if (isEditing && selectedEvent?._id === formId) {
        setSelectedEvent(data.item);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  // Quick Action: Update Status (Reschedule, Cancel, Complete)
  const handleUpdateStatus = async (
    eventId: string,
    newStatus: CalendarEvent["status"]
  ) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedEvent(data.item);
        await loadData();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Toggle Checklist Item
  const handleToggleChecklist = async (
    field: "equipmentChecklist" | "shotList",
    index: number
  ) => {
    if (!selectedEvent) return;
    const updated = { ...selectedEvent };
    if (field === "equipmentChecklist" && updated.equipmentChecklist) {
      updated.equipmentChecklist[index].checked = !updated.equipmentChecklist[index].checked;
    }
    if (field === "shotList" && updated.shotList) {
      updated.shotList[index].checked = !updated.shotList[index].checked;
    }
    setSelectedEvent(updated);

    try {
      await fetch(`/api/admin/events/${selectedEvent._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: updated[field] }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to toggle checklist", err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    if (filterAssignee !== "all") {
      const assignedIds = (ev.assignedTo || []).map((u: any) => u._id || u);
      if (!assignedIds.includes(filterAssignee)) return false;
    }
    if (filterType !== "all" && ev.type !== filterType) return false;
    if (filterStatus !== "all" && ev.status !== filterStatus) return false;
    return true;
  });

  // Calendar Date Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const todayMonth = () => {
    setCurrentDate(new Date());
  };

  // Build Month Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    isCurrentMonth: boolean;
    dateStr: string;
  }> = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, d);
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr: prevDate.toISOString().split("T")[0],
    });
  }
  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, month, d);
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateStr: curDate.toISOString().split("T")[0],
    });
  }
  // Next month padding to reach 35 or 42 grid boxes
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nxtDate = new Date(year, month + 1, d);
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr: nxtDate.toISOString().split("T")[0],
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio Operations · Calendar & Shoots
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Coordinate cinematography, site visits, client meetings, and editing milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month/Week/Agenda Toggle */}
          <div className="flex rounded-full border border-[#e8e8e3] bg-white p-1">
            {(["month", "agenda"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                  viewMode === mode
                    ? "bg-ink text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1 rounded-full border border-[#e8e8e3] bg-white px-2 py-1">
            <button
              onClick={prevMonth}
              className="rounded-full p-1 text-muted hover:bg-black/[0.04] hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={todayMonth}
              className="px-2 font-mono text-xs font-semibold text-ink hover:text-orange"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="rounded-full p-1 text-muted hover:bg-black/[0.04] hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Action: Schedule Shoot */}
          <button
            onClick={() => handleOpenNewModal()}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#e03d07]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Schedule Shoot</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <Filter className="h-3.5 w-3.5 text-orange" />
            <span>Filters:</span>
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Event Types</option>
            <option value="shoot">Shoots & Cinematography</option>
            <option value="meeting">Client Meetings</option>
            <option value="site_visit">Site Visits</option>
            <option value="editing">Editing / Post-Production</option>
            <option value="delivery">Deliveries & Reviews</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-[11px] font-medium text-muted">
          Showing <strong>{filteredEvents.length}</strong> events
        </div>
      </div>

      {/* 3. CALENDAR VIEW */}
      {viewMode === "month" ? (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-[#e8e8e3] bg-[#fafaf8] text-center text-[11px] font-bold uppercase tracking-wider text-muted py-2.5">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#f0f0eb]">
            {calendarDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter((ev) =>
                ev.start && ev.start.startsWith(cell.dateStr)
              );
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenNewModal(cell.dateStr)}
                  className={`min-h-[110px] p-2 transition cursor-pointer hover:bg-orange/[0.02] ${
                    !cell.isCurrentMonth ? "bg-[#fafaf8]/50 text-muted/60" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                        isToday
                          ? "bg-orange text-white shadow-xs"
                          : cell.isCurrentMonth
                          ? "text-ink"
                          : "text-muted/60"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="font-mono text-[10px] font-bold text-muted">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges */}
                  <div className="mt-1.5 space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const isShoot = ev.type === "shoot";
                      return (
                        <div
                          key={ev._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`group flex items-center justify-between rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition truncate shadow-xs ${
                            isShoot
                              ? "bg-orange/10 text-orange border border-orange/20 hover:bg-orange hover:text-white"
                              : "bg-[#f4f4f0] text-ink border border-black/[0.06] hover:bg-ink hover:text-white"
                          }`}
                        >
                          <span className="truncate">
                            {new Date(ev.start).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="block text-[9px] font-semibold text-muted text-center">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : (
        /* Agenda / List View */
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-[#e8e8e3] pb-3">
            Chronological Agenda
          </h3>
          <div className="mt-4 divide-y divide-[#f0f0eb]">
            {filteredEvents.length > 0 ? (
              filteredEvents
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .map((ev) => (
                  <div
                    key={ev._id}
                    onClick={() => setSelectedEvent(ev)}
                    className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center hover:bg-[#fafaf8] px-2 rounded-xl cursor-pointer transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-orange">
                          {new Date(ev.start).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ·{" "}
                          {new Date(ev.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <h4 className="text-sm font-bold text-ink">{ev.title}</h4>
                        <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] uppercase font-bold text-muted">
                          {ev.type}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </span>
                        )}
                        {ev.assignedTo && ev.assignedTo.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ev.assignedTo.map((u: any) => u.name).join(", ")}
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {ev.status}
                        </span>
                      </div>
                    </div>

                    <button className="rounded-full border border-[#e8e8e3] bg-white px-3.5 py-1 text-xs font-semibold text-ink hover:border-black/30">
                      View Details
                    </button>
                  </div>
                ))
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                No events match the selected filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SHOOT / EVENT DETAIL DRAWER */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl transition animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange">
                  {selectedEvent.type.replace("_", " ")}
                </span>
                <h2 className="display mt-2 text-2xl font-bold text-ink">
                  {selectedEvent.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted font-mono">
                  ID: {selectedEvent._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-full p-2 text-muted hover:bg-black/[0.05] hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-4 flex flex-wrap gap-2 border-b border-[#e8e8e3] pb-4">
              <button
                onClick={() => {
                  const ev = selectedEvent;
                  setSelectedEvent(null);
                  handleOpenEditModal(ev);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.04]"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>

              {selectedEvent.status !== "completed" && (
                <button
                  onClick={() => handleUpdateStatus(selectedEvent._id, "completed")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}

              {selectedEvent.status !== "cancelled" && (
                <button
                  onClick={() => handleUpdateStatus(selectedEvent._id, "cancelled")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Shoot</span>
                </button>
              )}

              {selectedEvent.status === "cancelled" && (
                <button
                  onClick={() => handleUpdateStatus(selectedEvent._id, "scheduled")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-semibold text-orange hover:bg-orange/20"
                >
                  <span>Reactivate / Reschedule</span>
                </button>
              )}
            </div>

            {/* Event Info Details */}
            <div className="mt-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-3.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-muted">
                    Schedule Window
                  </span>
                  <p className="mt-1 font-semibold text-ink">
                    {new Date(selectedEvent.start).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-muted">
                    to{" "}
                    {new Date(selectedEvent.end).toLocaleTimeString([], {
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-3.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-muted">
                    Production Status
                  </span>
                  <div className="mt-1">
                    <span className="inline-block rounded-full bg-orange/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-orange">
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & Maps */}
              <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange" />
                    <div>
                      <span className="font-bold text-ink">Location</span>
                      <p className="text-muted">{selectedEvent.location || "Vijayawada, AP"}</p>
                    </div>
                  </div>
                  {selectedEvent.locationUrl ? (
                    <a
                      href={selectedEvent.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-orange font-semibold hover:underline"
                    >
                      Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        selectedEvent.location || "Vijayawada"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-orange font-semibold hover:underline"
                    >
                      Open Map <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Assigned Team */}
              <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <Users className="h-4 w-4 text-orange" />
                  <span>Assigned Studio Crew</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEvent.assignedTo && selectedEvent.assignedTo.length > 0 ? (
                    selectedEvent.assignedTo.map((u: any) => (
                      <span
                        key={u._id || u}
                        className="rounded-full border border-black/10 bg-[#fafaf8] px-3 py-1 font-semibold text-ink"
                      >
                        {u.name || "Team Member"}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Equipment Checklist */}
              <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4">
                <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-2">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <ListTodo className="h-4 w-4 text-orange" />
                    <span>Equipment Checklist</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    {selectedEvent.equipmentChecklist?.filter((c) => c.checked).length || 0} /{" "}
                    {selectedEvent.equipmentChecklist?.length || 0} Ready
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedEvent.equipmentChecklist &&
                  selectedEvent.equipmentChecklist.length > 0 ? (
                    selectedEvent.equipmentChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleChecklist("equipmentChecklist", idx)}
                        className="flex items-center gap-2.5 cursor-pointer py-1 hover:text-orange"
                      >
                        {item.checked ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Square className="h-4 w-4 text-muted" />
                        )}
                        <span className={item.checked ? "line-through text-muted" : "text-ink font-medium"}>
                          {item.item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No equipment checklist specified.</p>
                  )}
                </div>
              </div>

              {/* Shot List */}
              <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4">
                <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-2">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <CheckSquare className="h-4 w-4 text-orange" />
                    <span>Shot List & Deliverables</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    {selectedEvent.shotList?.filter((s) => s.checked).length || 0} /{" "}
                    {selectedEvent.shotList?.length || 0} Completed
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedEvent.shotList && selectedEvent.shotList.length > 0 ? (
                    selectedEvent.shotList.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleChecklist("shotList", idx)}
                        className="flex items-center gap-2.5 cursor-pointer py-1 hover:text-orange"
                      >
                        {item.checked ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Square className="h-4 w-4 text-muted" />
                        )}
                        <span className={item.checked ? "line-through text-muted" : "text-ink font-medium"}>
                          {item.shot}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No shot list entered.</p>
                  )}
                </div>
              </div>

              {/* Automatic Shoot Reminders System Status */}
              <div className="rounded-2xl border border-orange/20 bg-orange/[0.04] p-4">
                <div className="flex items-center gap-2 font-bold text-orange">
                  <Clock className="h-4 w-4" />
                  <span>Automatic Persistent Reminders</span>
                </div>
                <p className="mt-1 text-muted leading-relaxed">
                  Scheduled automatically in MongoDB: <strong>24 hours</strong> before shoot and{" "}
                  <strong>2 hours</strong> before shoot. If rescheduled or cancelled, all reminder jobs sync automatically.
                </p>
              </div>

              {/* Production Notes */}
              {selectedEvent.notes && (
                <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-4">
                  <span className="font-bold text-ink">Production Notes</span>
                  <p className="mt-1 text-muted whitespace-pre-wrap">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SCHEDULE / EDIT SHOOT MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header (Always Visible) */}
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="display text-xl font-bold text-ink">
                  {isEditing ? "Edit Shoot / Event" : "Schedule New Shoot / Production"}
                </h3>
                <p className="text-xs text-muted">
                  Includes automatic server conflict detection for Praneeth and Wasim.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="scheduleShootForm"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEvent(false);
              }}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-ink mb-1">
                  Event / Shoot Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Commercial Brand Shoot · ABC Media"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-sm text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="shoot">Cinematography Shoot</option>
                    <option value="meeting">Client Meeting</option>
                    <option value="site_visit">Site Visit / Location Recce</option>
                    <option value="editing">Editing / Post-Production</option>
                    <option value="delivery">Delivery / Client Review</option>
                    <option value="other">General Studio Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Client</label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-medium text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-medium text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-medium text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Assign Team Members (Praneeth, Wasim) */}
              <div>
                <label className="block font-bold text-ink mb-1">
                  Assign Team Crew (Praneeth / Wasim)
                </label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => {
                      const isAssigned = formAssignedTo.includes(member._id);
                      return (
                        <label
                          key={member._id}
                          className={`flex items-center gap-2 cursor-pointer rounded-xl border px-3 py-2 transition ${
                            isAssigned
                              ? "border-orange bg-orange/10 font-bold text-orange"
                              : "border-[#e8e8e3] bg-[#fbfbfa] text-ink hover:border-black/20"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormAssignedTo([...formAssignedTo, member._id]);
                              } else {
                                setFormAssignedTo(formAssignedTo.filter((id) => id !== member._id));
                              }
                            }}
                            className="rounded text-orange focus:ring-orange"
                          />
                          <span>{member.name}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-muted">Loading studio crew...</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Vijayawada, AP"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Google Maps Link</label>
                  <input
                    type="url"
                    value={formLocationUrl}
                    onChange={(e) => setFormLocationUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    Equipment Checklist (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formEquipmentStr}
                    onChange={(e) => setFormEquipmentStr(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 font-mono text-[11px] text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    Shot List (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formShotListStr}
                    onChange={(e) => setFormShotListStr(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 font-mono text-[11px] text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Production Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Creative brief notes, client contacts, lighting setups..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-xs text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            {/* Sticky Action Footer (Always Visible at bottom!) */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-full border border-[#e8e8e3] bg-white px-5 py-2 font-semibold text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="scheduleShootForm"
                disabled={saving}
                className="rounded-full bg-orange px-6 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : isEditing ? "Update Shoot" : "Schedule Shoot →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFLICT WARNING DIALOG (Double Booking Detection) */}
      {conflictData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-red-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Scheduling Conflict Detected</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-red-500">
                  Double Booking Warning
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink/80">
              {conflictData.message}
            </p>

            {conflictData.conflicts && conflictData.conflicts.length > 0 && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/50 p-3 space-y-2 text-xs">
                {conflictData.conflicts.map((c: any, i: number) => (
                  <div key={i} className="text-red-900">
                    <p className="font-bold">
                      {c.userName} has conflicting booking:
                    </p>
                    <p className="text-xs text-red-700">
                      &quot;{c.conflictingEventTitle}&quot; (
                      {new Date(c.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(c.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-2">
              <button
                onClick={() => setConflictData(null)}
                className="w-full rounded-full border border-[#e8e8e3] bg-white py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
              >
                Change Time or Reassign
              </button>
              <button
                onClick={() => handleSaveEvent(true)}
                disabled={saving}
                className="w-full rounded-full bg-red-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                {saving ? "Saving..." : "Proceed Anyway (Double Book) →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
