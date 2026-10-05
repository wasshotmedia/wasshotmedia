import fs from "fs";
import path from "path";
import { defaultContent } from "./default-content";

export interface StudioUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "editor";
  title?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioClient {
  _id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status?: "active" | "retainer" | "lead" | "completed" | "inactive";
  city?: string;
  business?: string;
  website?: string;
  socialLinks?: { instagram?: string; linkedin?: string };
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioLead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
  budget?: string;
  timeline?: string;
  stage: "new" | "contacted" | "qualified" | "proposal_sent" | "negotiation" | "won" | "lost";
  assignedTo?: string;
  followUpAt?: string;
  notes?: string;
  convertedClientId?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioProject {
  _id: string;
  name: string;
  clientId?: string;
  clientName?: string;
  leadId?: string;
  type: "video" | "website" | "seo" | "marketing" | "mixed";
  stage: "enquiry" | "briefing" | "pre_production" | "production" | "post_production" | "review" | "delivered" | "archived";
  description?: string;
  startDate?: string;
  dueDate?: string;
  team?: string[];
  services?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudioTask {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  clientId?: string;
  assignedTo?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudioCalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: "shoot" | "meeting" | "deadline" | "review" | "milestone";
  start: string;
  end?: string;
  location?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  assignedTeam?: string[];
  equipmentNeeded?: string[];
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  callTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioInvoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  projectId?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioNotification {
  _id: string;
  title: string;
  body?: string;
  read: boolean;
  type?: string;
  link?: string;
  createdAt: string;
}

export interface StudioActivityLog {
  _id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: any;
  ip?: string;
  createdAt: string;
}

export interface StudioStoreData {
  users: StudioUser[];
  clients: StudioClient[];
  leads: StudioLead[];
  projects: StudioProject[];
  tasks: StudioTask[];
  events: StudioCalendarEvent[];
  reminders: any[];
  notifications: StudioNotification[];
  invoices: StudioInvoice[];
  payments: any[];
  services: any[];
  portfolio: any[];
  faqs: any[];
  testimonials: any[];
  pricing: any[];
  messages: any[];
  activityLogs: StudioActivityLog[];
  settings: any;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "studio-store.json");

function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return timestamp + random;
}

function getInitialStore(): StudioStoreData {
  const now = new Date().toISOString();
  const adminId = generateId();
  const leadId = generateId();

  const users: StudioUser[] = [
    {
      _id: adminId,
      name: "Admin",
      email: "admin@wasshotmedia.com",
      passwordHash: "$2b$10$/8Ys4uNDxjm5BpFGX6opqekVJO4B3iyKCbHIid0Ro/paKmVMlLesu",
      role: "owner",
      title: "Creative and Digital Lead",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: leadId,
      name: "Studio Lead",
      email: "lead@wasshotmedia.com",
      passwordHash: "$2b$10$HM6zEDWMACquAFRfL56Ml.5e0oP5l5wr8AQdHcf9qT3ioiv2PRwKW",
      role: "owner",
      title: "Creative and Media Lead",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users,
    clients: [],
    leads: [],
    projects: [],
    tasks: [],
    events: [],
    reminders: [],
    notifications: [],
    invoices: [],
    payments: [],
    services: defaultContent.services.map((s, idx) => ({ ...s, _id: generateId(), order: idx, published: true })),
    portfolio: [],
    faqs: defaultContent.faqs.map((f, idx) => ({ ...f, _id: generateId(), order: idx, published: true })),
    testimonials: [],
    pricing: defaultContent.pricing.map((p, idx) => ({ ...p, _id: generateId(), order: idx, published: true })),
    messages: [],
    activityLogs: [
      {
        _id: generateId(),
        actorName: "System",
        action: "Studio operations initialized",
        entityType: "system",
        createdAt: now,
      },
    ],
    settings: {
      singleton: "agency",
      brandName: defaultContent.brandName,
      tagline: defaultContent.tagline,
      email: "hello@wasshotmedia.com",
      phone: "+91 73969 86817",
      whatsapp: "+91 73969 86817",
      instagram: "https://instagram.com/wasshot.media",
      linkedin: "",
      address: "Hyderabad, India",
      seoTitle: defaultContent.seoTitle,
      seoDescription: defaultContent.seoDescription,
      availabilityLabel: defaultContent.availabilityLabel,
      availableForProjects: true,
      founders: defaultContent.founders,
      homepage: defaultContent.homepage,
    },
  };
}

class StudioLocalStore {
  private data: StudioStoreData | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private lastLoadedMtime = 0;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const stat = fs.statSync(STORE_FILE);
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        this.data = JSON.parse(raw);
        this.lastLoadedMtime = stat.mtimeMs;
      } else {
        this.data = getInitialStore();
        this.persistSync();
      }
    } catch (err) {
      console.warn("[StudioStore] Failed to read store file, using in-memory initial store:", err);
      this.data = getInitialStore();
    }
  }

  private persistSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), "utf-8");
      if (fs.existsSync(STORE_FILE)) {
        this.lastLoadedMtime = fs.statSync(STORE_FILE).mtimeMs;
      }
    } catch (err) {
      console.error("[StudioStore] Persist error:", err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.persistSync();
    }, 150);
  }

  private getCollection(name: keyof StudioStoreData): any[] {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const stat = fs.statSync(STORE_FILE);
        if (stat.mtimeMs > this.lastLoadedMtime) {
          const raw = fs.readFileSync(STORE_FILE, "utf-8");
          this.data = JSON.parse(raw);
          this.lastLoadedMtime = stat.mtimeMs;
        }
      }
    } catch {
      // Ignore reading error, fallback to memory
    }

    if (!this.data) this.load();
    const col = (this.data as any)[name];
    if (!Array.isArray(col)) {
      (this.data as any)[name] = [];
      return (this.data as any)[name];
    }

    if (name === "clients") {
      col.forEach((c: any) => {
        if (!c.status) c.status = "active";
        if (!c.city) c.city = c.address ? c.address.split(",").pop()?.trim() || "Hyderabad" : "Hyderabad";
      });
    }

    return col;
  }

  public find(collectionName: keyof StudioStoreData, filter?: Record<string, any>): any[] {
    const list = this.getCollection(collectionName);
    if (!filter || Object.keys(filter).length === 0) {
      return [...list];
    }
    return list.filter((item) => {
      for (const [key, val] of Object.entries(filter)) {
        if (val === undefined || val === null) continue;
        if (key === "$or" && Array.isArray(val)) {
          const matchOr = val.some((cond) => {
            for (const [k, v] of Object.entries(cond)) {
              if (v instanceof RegExp) {
                if (v.test(String(item[k] || ""))) return true;
              } else if (item[k] === v) {
                return true;
              }
            }
            return false;
          });
          if (!matchOr) return false;
        } else if (val instanceof RegExp) {
          if (!val.test(String(item[key] || ""))) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  public findOne(collectionName: keyof StudioStoreData, filter: Record<string, any>): any | null {
    const results = this.find(collectionName, filter);
    return results[0] || null;
  }

  public findById(collectionName: keyof StudioStoreData, id: string): any | null {
    const list = this.getCollection(collectionName);
    return list.find((item) => String(item._id) === String(id)) || null;
  }

  public create(collectionName: keyof StudioStoreData, item: Record<string, any>): any {
    const list = this.getCollection(collectionName);
    const now = new Date().toISOString();
    const newItem = {
      _id: item._id || generateId(),
      ...item,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    list.unshift(newItem);
    this.scheduleSave();
    return newItem;
  }

  public findByIdAndUpdate(
    collectionName: keyof StudioStoreData,
    id: string,
    update: Record<string, any>
  ): any | null {
    const list = this.getCollection(collectionName);
    const idx = list.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;

    const existing = list[idx];
    const updated = {
      ...existing,
      ...update,
      _id: existing._id,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    this.scheduleSave();
    return updated;
  }

  public findByIdAndDelete(collectionName: keyof StudioStoreData, id: string): boolean {
    const list = this.getCollection(collectionName);
    const idx = list.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  public getSettings(): any {
    if (!this.data) this.load();
    return this.data?.settings || {};
  }

  public updateSettings(update: Record<string, any>): any {
    if (!this.data) this.load();
    if (!this.data) return update;
    this.data.settings = { ...this.data.settings, ...update };
    this.scheduleSave();
    return this.data.settings;
  }

  public logActivity(action: string, entityType?: string, entityId?: string, meta?: any, actorName = "Admin") {
    this.create("activityLogs", {
      actorName,
      action,
      entityType,
      entityId,
      meta,
    });
  }

  public getDashboardOverview(sessionUser: { name: string; role: string }) {
    if (!this.data) this.load();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const allEvents = this.getCollection("events");
    const todayEvents = allEvents.filter((ev: any) => ev.start && ev.start.startsWith(todayStr));
    const upcomingShoots = allEvents.filter(
      (ev: any) => ev.type === "shoot" && ev.status !== "cancelled" && new Date(ev.start) >= now
    );

    const allLeads = this.getCollection("leads");
    const leadsAttention = allLeads.filter(
      (l: any) => l.stage === "new" || l.stage === "proposal_sent" || (l.followUpAt && new Date(l.followUpAt) <= now)
    );

    const allTasks = this.getCollection("tasks");
    const tasksToday = allTasks.filter((t: any) => t.status !== "done" && t.dueDate && t.dueDate.startsWith(todayStr));
    const tasksOverdue = allTasks.filter(
      (t: any) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now && !t.dueDate.startsWith(todayStr)
    );

    const allInvoices = this.getCollection("invoices");
    const pendingInvoices = allInvoices.filter((inv: any) => inv.status !== "paid" && inv.status !== "cancelled");
    const outstandingAmount = pendingInvoices.reduce(
      (sum: number, inv: any) => sum + (inv.balance ?? inv.total ?? 0),
      0
    );

    return {
      user: sessionUser,
      metrics: {
        leads: allLeads.length,
        clients: this.getCollection("clients").length,
        projects: this.getCollection("projects").length,
        shoots: upcomingShoots.length,
        tasksToday: tasksToday.length,
        tasksOverdue: tasksOverdue.length,
        pendingInvoices: pendingInvoices.length,
        outstandingAmount,
      },
      todayEvents,
      upcomingShoots: upcomingShoots.slice(0, 5),
      leadsAttention: leadsAttention.slice(0, 5),
      tasks: allTasks.filter((t: any) => t.status !== "done").slice(0, 8),
      activityLogs: this.getCollection("activityLogs").slice(0, 8),
    };
  }
}

// Global Singleton for LocalStore across Next.js reloads
const globalForStore = globalThis as unknown as {
  studioStoreInstance?: StudioLocalStore;
};

export const localStore = globalForStore.studioStoreInstance ?? new StudioLocalStore();
globalForStore.studioStoreInstance = localStore;
