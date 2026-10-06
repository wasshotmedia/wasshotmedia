// WasShot Media Native Mobile API Service
export const API_BASE_URL = "https://wasshot.in/api";
export const FALLBACK_URL = "https://wasshotmedia-8y1s.vercel.app/api";

async function fetchFromApi(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // try fallback
  }

  try {
    const res = await fetch(`${FALLBACK_URL}${endpoint}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[API] Failed to fetch ${endpoint}:`, err);
  }
  return null;
}

export async function getDashboardOverview() {
  const data = await fetchFromApi("/admin/dashboard-overview");
  return data || {
    metrics: {
      activeProjects: 4,
      totalClients: 8,
      upcomingShoots: 3,
      unpaidInvoices: 2,
      totalRevenue: 345000,
    },
    upcomingShoots: [],
    recentActivities: [],
  };
}

export async function getCalendarEvents() {
  const data = await fetchFromApi("/admin/events");
  return data?.items || [];
}

export async function getClients() {
  const data = await fetchFromApi("/admin/clients");
  return data?.items || [];
}

export async function getProjects() {
  const data = await fetchFromApi("/admin/projects");
  return data?.items || [];
}

export async function getInvoices() {
  const data = await fetchFromApi("/admin/invoices");
  return data?.items || [];
}

export async function getMessages() {
  const data = await fetchFromApi("/admin/messages");
  return data?.items || [];
}
