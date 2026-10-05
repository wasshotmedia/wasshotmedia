import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";

export const metadata = { title: "Terms" };

export default async function TermsPage() {
  const content = await getPublicContent();
  return (
    <PublicShell content={content}>
      <article className="site-grid max-w-3xl pb-24 pt-36">
        <h1 className="display text-5xl">Terms</h1>
        <p className="mt-6 text-muted">
          Project scope, timelines and fees are agreed in writing before work begins. Published package prices only
          appear when they have been set in the admin dashboard. Nothing on this website is a guarantee of results.
        </p>
      </article>
    </PublicShell>
  );
}
