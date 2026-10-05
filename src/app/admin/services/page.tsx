"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Edit2,
  Plus,
  ExternalLink,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";

interface ServiceItem {
  _id: string;
  number: string;
  title: string;
  slug: string;
  description: string;
  deliverables?: string[];
  published?: boolean;
}

export default function ServicesCmsPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDeliverables, setFormDeliverables] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (srv: ServiceItem) => {
    setEditingItem(srv);
    setFormTitle(srv.title);
    setFormDescription(srv.description);
    setFormDeliverables((srv.deliverables || []).join(", "));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const deliverables = formDeliverables
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/services/${editingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          deliverables,
        }),
      });

      if (res.ok) {
        await loadServices();
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Failed to update service", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio CMS · Service Offerings
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Services CMS ({services.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Manage the 6 core agency pillars published on wasshotmedia.com/services.
          </p>
        </div>

        <Link
          href="/services"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-black/30"
        >
          <span>View Public Services Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 2. SERVICES GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-muted">
            Loading services...
          </div>
        ) : (
          services.map((srv) => (
            <div
              key={srv._id}
              className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs flex flex-col justify-between transition hover:border-black/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-orange">
                    {srv.number || "01"}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Live On Site
                  </span>
                </div>

                <h3 className="display mt-3 text-lg font-bold text-ink">{srv.title}</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  {srv.description}
                </p>

                {srv.deliverables && srv.deliverables.length > 0 && (
                  <div className="mt-4 space-y-1 border-t border-[#f0f0eb] pt-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted">
                      Key Deliverables:
                    </span>
                    <ul className="text-xs text-ink/80 space-y-0.5 list-disc list-inside">
                      {srv.deliverables.slice(0, 3).map((d, i) => (
                        <li key={i} className="truncate">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#f0f0eb] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleEdit(srv)}
                  className="inline-flex items-center gap-1 text-orange font-semibold hover:underline"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Content</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="display text-xl font-bold text-ink">Edit Service Dossier</h3>
                <p className="text-xs text-muted">Service #{editingItem.number} · {editingItem.title}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  Deliverables (Comma separated)
                </label>
                <textarea
                  rows={3}
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange px-5 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Service →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
