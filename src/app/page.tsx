import { getPublicContent } from "@/lib/content";
import { HomePage } from "@/components/site/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getPublicContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: content.settings.brandName,
    slogan: content.settings.tagline,
    description: content.settings.seoDescription,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    email: content.settings.email || undefined,
    telephone: content.settings.phone || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage content={content} />
    </>
  );
}
