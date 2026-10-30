import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://wasshot.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WasShot Media — Creative Media & Digital Agency | Vijayawada",
    template: "%s · WasShot Media",
  },
  description:
    "WasShot Media is a leading creative media & digital agency in Vijayawada, Andhra Pradesh. Specializing in commercial video production, brand shoots, bespoke website design, and high-impact digital marketing.",
  keywords: [
    "WasShot Media",
    "WasShot",
    "Creative Agency Vijayawada",
    "Video Production Vijayawada",
    "Commercial Ad Film Makers Andhra Pradesh",
    "Brand Photography Studio Vijayawada",
    "Website Development Agency Vijayawada",
    "Digital Marketing Agency Vijayawada",
    "Social Media Marketing Andhra Pradesh",
    "Best Ad Agency in Vijayawada",
    "Product Shoot Studio Vijayawada",
    "UI UX Design Agency India",
  ],
  authors: [{ name: "WasShot Media", url: "https://wasshot.in" }],
  creator: "WasShot Media",
  publisher: "WasShot Media",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "WasShot Media",
    title: "WasShot Media — WE CREATE. YOU GROW.",
    description:
      "Commercial video production, brand photography, bespoke websites, and digital marketing that builds iconic brands.",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WasShot Media Studio — Creative Media & Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WasShot Media — Creative Media + Digital Agency",
    description:
      "Commercial video production, brand photography, websites, and digital growth. We create. You grow.",
    images: ["/brand/og-image.jpg"],
    creator: "@wasshotmedia",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/wasshoticon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "sEeLEPbZdREIuENixbTTkyHhpxzHRtl-j83R3pWhyNs",
  },
};

// Rich Structured Data for Google Rich Snippets & Local Business Graph
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ProfessionalService", "LocalBusiness", "Organization"],
      "@id": "https://wasshot.in/#organization",
      name: "WasShot Media",
      alternateName: ["WasShot", "WasShot Media Studio"],
      url: "https://wasshot.in",
      logo: "https://wasshot.in/brand/wasshotlogo.png",
      image: "https://wasshot.in/brand/og-image.jpg",
      description:
        "WasShot Media is a premier creative media & digital agency in Vijayawada, Andhra Pradesh. Specializing in cinema-grade commercial ad films, brand shoots, web engineering, and performance digital marketing.",
      telephone: "+91 7396986817",
      email: "wasshotmedia@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bhavanipuram",
        addressLocality: "Vijayawada",
        addressRegion: "Andhra Pradesh",
        postalCode: "520012",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "16.5062",
        longitude: "80.6480",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "20:00",
        },
      ],
      priceRange: "₹₹",
      sameAs: [
        "https://instagram.com/wasshot.media",
        "https://linkedin.com/company/wasshotmedia",
      ],
      founder: [
        {
          "@type": "Person",
          name: "Praneeth Badugu",
          jobTitle: "Co-Founder & Creative Director",
        },
        {
          "@type": "Person",
          name: "Waseem Akram",
          jobTitle: "Co-Founder & Head of Operations",
        },
      ],
      areaServed: [
        { "@type": "City", name: "Vijayawada" },
        { "@type": "City", name: "Guntur" },
        { "@type": "City", name: "Amaravati" },
        { "@type": "City", name: "Hyderabad" },
        { "@type": "AdministrativeArea", name: "Andhra Pradesh" },
        { "@type": "AdministrativeArea", name: "Telangana" },
        { "@type": "Country", name: "India" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "WasShot Media Creative Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Commercial Video Production & Ad Films",
              description:
                "Cinema-grade ad films, brand anthems, TVCs, and promotional video shoots.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Brand Photography & Product Shoots",
              description:
                "Commercial brand photography, fashion lookbooks, and high-converting product shoots.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Design & Web Application Development",
              description:
                "Bespoke high-performance Next.js websites, ecommerce platforms, and digital experiences.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Social Media Marketing & Brand Growth",
              description:
                "Organic growth strategies, viral short-form video content, and targeted digital campaigns.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://wasshot.in/#website",
      url: "https://wasshot.in",
      name: "WasShot Media",
      publisher: {
        "@id": "https://wasshot.in/#organization",
      },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="sEeLEPbZdREIuENixbTTkyHhpxzHRtl-j83R3pWhyNs"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
