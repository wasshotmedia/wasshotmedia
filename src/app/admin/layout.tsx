import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Studio Admin · WasShot Media",
  description: "Internal Business Operating System for WasShot Media.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning className="min-h-screen">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
