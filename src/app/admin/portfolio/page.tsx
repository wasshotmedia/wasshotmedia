"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";

interface PortfolioItem {
  _id: string;
  title: string;
  name?: string;
  slug: string;
  category: string;
  role?: string;
  client?: string;
  clientName?: string;
  year?: string;
  description: string;
  deliverables?: string[];
  services?: string[];
  imageUrl?: string;
  metrics?: Array<{ label: string; value: string }>;
  published?: boolean;
}

const IMAGE_PRESETS = [
  { label: "Cinematic Shoot", url: "/services/shooting.jpg" },
  { label: "Video Editing", url: "/services/editing.jpg" },
  { label: "Web Architecture", url: "/services/website.jpg" },
  { label: "Ad Campaigns", url: "/services/promotions.jpg" },
  { label: "SEO & Growth", url: "/services/seo.jpg" },
  { label: "Creative Strategy", url: "/services/strategy.jpg" },
];

export default function PortfolioCmsPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Cinematography & Film");
  const [formClient, setFormClient] = useState("");
  const [formYear, setFormYear] = useState("2026");
  const [formDescription, setFormDescription] = useState("");
  const [formDeliverables, setFormDeliverables] = useState(
    "Cinematic 4K Commercial, Social Cutdowns, Sound Design"
  );
  const [formImageUrl, setFormImageUrl] = useState("/services/shooting.jpg");
  const [formMetricVal, setFormMetricVal] = useState("2.4M");
  const [formMetricLabel, setFormMetricLabel] = useState("Digital Views");
  const [formPublished, setFormPublished] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load portfolio items", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: PortfolioItem) => {
    if (item) {
      setFormId(item._id);
      setFormTitle(item.title || item.name || "");
      setFormSlug(item.slug || "");
      setFormCategory(item.category || item.role || "Cinematography & Film");
      setFormClient(item.client || item.clientName || "");
      setFormYear(item.year || "2026");
      setFormDescription(item.description || "");
      setFormDeliverables(
        (item.deliverables || item.services || []).join(", ")
      );
      setFormImageUrl(item.imageUrl || "/services/shooting.jpg");
      setFormMetricVal(item.metrics?.[0]?.value || "");
      setFormMetricLabel(item.metrics?.[0]?.label || "");
      setFormPublished(item.published ?? true);
    } else {
      setFormId("");
      setFormTitle("");
      setFormSlug("");
      setFormCategory("Cinematography & Film");
      setFormClient("");
      setFormYear("2026");
      setFormDescription("");
      setFormDeliverables("Cinematic 4K Commercial, Social Cutdowns, Sound Design");
      setFormImageUrl("/services/shooting.jpg");
      setFormMetricVal("");
      setFormMetricLabel("");
      setFormPublished(true);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const deliverables = formDeliverables
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const metrics = formMetricVal
        ? [{ value: formMetricVal, label: formMetricLabel || "Views" }]
        : [];

      const cleanSlug =
        formSlug.trim() ||
        formTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const payload = {
        title: formTitle,
        name: formTitle,
        slug: cleanSlug,
        category: formCategory,
        role: formCategory,
        client: formClient,
        clientName: formClient,
        year: formYear,
        description: formDescription,
        deliverables,
        services: deliverables,
        imageUrl: formImageUrl,
        metrics,
        published: formPublished,
      };

      const url = formId ? `/api/admin/portfolio/${formId}` : "/api/admin/portfolio";
      const method = formId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to save portfolio item");
        return;
      }

      await loadPortfolio();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save portfolio item");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: PortfolioItem) => {
    try {
      const res = await fetch(`/api/admin/portfolio/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      });
      if (res.ok) {
        setItems(
          items.map((i) => (i._id === item._id ? { ...i, published: !i.published } : i))
        );
      }
    } catch (err) {
      console.error("Failed to toggle publish", err);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${item.title || item.name}"? This will remove it from the public website.`
    );
    if (!confirmDelete) return;

    setDeletingId(item._id);
    try {
      const res = await fetch(`/api/admin/portfolio/${item._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((i) => i._id !== item._id));
      } else {
        alert("Failed to delete case study");
      }
    } catch (err) {
      console.error("Failed to delete portfolio item", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-display text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio CMS · Main Website Showcase
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Portfolio CMS ({items.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Projects published here appear live on the homepage and at wasshotmedia.com/work.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07] transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ Add Case Study</span>
        </button>
      </div>

      {/* 2. GRID */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-muted">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange border-r-transparent mb-3" />
            <p className="font-display font-bold uppercase tracking-wider">Loading portfolio...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-[#e8e8e3] bg-white p-12 text-center shadow-xs">
            <FolderGit2 className="h-10 w-10 text-muted/40 mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-ink">
              No portfolio projects published yet
            </h3>
            <p className="mt-1 text-xs text-muted max-w-md mx-auto leading-relaxed">
              Click &quot;+ Add Case Study&quot; above to add your first studio project. It will immediately show up on the main website!
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e03d07]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Case Study</span>
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl border border-[#e8e8e3] bg-white p-5 shadow-xs flex flex-col justify-between transition hover:border-black/20"
            >
              <div>
                {/* Image Preview */}
                {item.imageUrl && (
                  <div className="relative mb-3.5 h-36 w-full overflow-hidden rounded-2xl bg-black/10 border border-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title || item.name || ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange/10 px-2.5 py-0.5 font-display text-[10px] font-bold text-orange uppercase tracking-wider">
                    {item.category || item.role}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                      item.published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-zinc-100 text-muted"
                    }`}
                  >
                    {item.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    <span>{item.published ? "Published" : "Draft"}</span>
                  </button>
                </div>

                <h3 className="font-display mt-3 text-lg font-bold text-ink">
                  {item.title || item.name}
                </h3>
                {(item.client || item.clientName) && (
                  <p className="text-xs text-muted font-medium mt-0.5">
                    Client: {item.client || item.clientName} · {item.year || "2026"}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {(item.deliverables || item.services) && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(item.deliverables || item.services || []).map((d, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[10px] text-muted font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#f0f0eb] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="inline-flex items-center gap-1 text-orange font-semibold hover:underline"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item._id}
                    className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{deletingId === item._id ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>

                <Link
                  href={`/work/${item.slug}`}
                  target="_blank"
                  className="text-muted hover:text-ink inline-flex items-center gap-1 text-[11px] font-medium"
                >
                  <span>Live Page</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">
                  {formId ? "Edit Case Study" : "Add Case Study"}
                </h3>
                <p className="text-xs text-muted">
                  Showcase your studio projects on wasshotmedia.com/work
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (!formId) {
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Zenith Commercial Film"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Category / Role</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                  >
                    <option value="Cinematography & Film">Cinematography & Film</option>
                    <option value="Post-Production & Grade">Post-Production & Grade</option>
                    <option value="Custom Digital Experience">Custom Digital Experience</option>
                    <option value="Brand Growth Campaign">Brand Growth Campaign</option>
                    <option value="Commercial Photography">Commercial Photography</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-ink mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. zenith-commercial-film"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Year</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2026"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Client Name</label>
                <input
                  type="text"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  placeholder="e.g. Zenith Motors or Self-Initiated"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block font-bold text-ink mb-1">Project Visual / Image URL *</label>
                <input
                  type="text"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/services/shooting.jpg or https://..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-muted font-semibold mr-1">Quick Presets:</span>
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setFormImageUrl(p.url)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-medium border transition ${
                        formImageUrl === p.url
                          ? "border-orange bg-orange/10 text-orange font-bold"
                          : "border-[#e8e8e3] bg-[#fbfbfa] text-muted hover:border-black/20"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Creative direction, camera rigs, lighting, and narrative approach..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Deliverables / Services (Comma separated)</label>
                <input
                  type="text"
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  placeholder="4K Master Cut, 9:16 Social Re-cuts, Color Grade"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#e8e8e3]">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <label htmlFor="publishedCheck" className="font-bold text-ink cursor-pointer">
                  Publish to Main Website immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 font-semibold text-ink hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange px-5 py-2 font-semibold text-white shadow-xs hover:bg-[#e03d07] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : formId ? "Update Project" : "Publish Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
