"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  X,
  Trash2,
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  project?: { _id: string; title: string };
  client?: { _id: string; name: string };
  assignedTo?: { _id: string; name: string };
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  dueDate?: string;
  description?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "today" | "overdue" | "done">("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formPriority, setFormPriority] = useState<Task["priority"]>("medium");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, teamRes, projRes] = await Promise.all([
        fetch("/api/admin/tasks").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/team").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({ items: [] })),
      ]);

      setTasks(tasksRes.items || []);
      setTeamMembers(teamRes.items || []);
      setProjects(projRes.items || []);
      if (teamRes.items && teamRes.items[0]) {
        setFormAssignedTo(teamRes.items[0]._id);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDone = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      const res = await fetch(`/api/admin/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(
          tasks.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          projectId: formProjectId || undefined,
          assignedTo: formAssignedTo || undefined,
          priority: formPriority,
          dueDate: formDueDate ? new Date(formDueDate).toISOString() : undefined,
          description: formDescription,
          status: "todo",
        }),
      });

      if (res.ok) {
        await loadData();
        setShowModal(false);
        setFormTitle("");
        setFormDescription("");
        setFormDueDate("");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const filtered = tasks.filter((t) => {
    if (activeTab === "today") {
      if (!t.dueDate || !t.dueDate.startsWith(todayStr)) return false;
    } else if (activeTab === "overdue") {
      if (t.status === "done") return false;
      if (!t.dueDate || new Date(t.dueDate) >= now || t.dueDate.startsWith(todayStr)) {
        return false;
      }
    } else if (activeTab === "done") {
      if (t.status !== "done") return false;
    } else if (activeTab === "all") {
      if (t.status === "done") return false; // Show active by default
    }

    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio Workflows · Action Items
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Task Management ({tasks.filter((t) => t.status !== "done").length} Active)
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track daily deliverables, shoot prep checklists, post-production edits, and reviews.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* 2. TABS & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-[#e8e8e3] bg-[#fafaf8] p-1 max-w-full">
          {[
            { key: "all", label: "Active Tasks" },
            { key: "today", label: "Due Today" },
            { key: "overdue", label: "Overdue" },
            { key: "done", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-ink text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="rounded-lg border border-[#e8e8e3] bg-[#fafaf8] px-3 py-1 text-xs text-ink placeholder-muted focus:outline-none"
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fafaf8] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 3. TASKS LIST */}
      <div className="rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
        <div className="divide-y divide-[#f0f0eb]">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              No tasks match current filter.
            </div>
          ) : (
            filtered.map((task) => {
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate) < now &&
                task.status !== "done";

              return (
                <div
                  key={task._id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center hover:bg-[#fafaf8] transition"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleDone(task)}
                      className="mt-0.5 text-muted hover:text-orange"
                    >
                      {task.status === "done" ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-bold text-ink ${
                          task.status === "done" ? "line-through text-muted" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                        {task.project && (
                          <span className="font-semibold text-ink">
                            Project: {task.project.title}
                          </span>
                        )}
                        {task.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-orange" />
                            {task.assignedTo.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? "font-bold text-red-600" : ""
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        task.priority === "urgent"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : task.priority === "high"
                          ? "bg-orange/10 text-orange border border-orange/20"
                          : "bg-black/[0.04] text-muted"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. NEW TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="display text-xl font-bold text-ink">Create Task</h3>
                <p className="text-xs text-muted">Add a studio operational deliverable</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Export 4K master grade cut"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Project</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="">Select Project (Optional)</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Assigned Person</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description / Checklist</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Specific details, file formats, frame rates, export specs..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange px-5 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Task →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
