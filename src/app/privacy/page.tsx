import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";

export const metadata = { title: "Privacy" };

export default async function PrivacyPage() {
  const content = await getPublicContent();
  return (
    <PublicShell content={content}>
      <article className="site-grid max-w-3xl pb-24 pt-36">
        <h1 className="display text-5xl">Privacy</h1>
        <p className="mt-6 text-muted">
          WasShot Media collects only the information you submit through the contact form or that an authorised admin
          records in the dashboard. We use it to respond to enquiries and deliver work. Admin accounts, invoices and
          client records are private and are not indexed by search engines.
        </p>
      </article>
    </PublicShell>
  );
}
