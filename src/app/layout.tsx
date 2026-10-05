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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WasShot Media — Creative Media + Digital Agency",
    template: "%s · WasShot Media",
  },
  description:
    "WasShot Media helps brands turn ideas into powerful visuals, websites and digital experiences that people remember.",
  openGraph: {
    type: "website",
    siteName: "WasShot Media",
    title: "WasShot Media — WE CREATE. YOU GROW.",
    description:
      "Stories that look good. Digital experiences that work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WasShot Media",
    description: "Creative media + digital agency. We create. You grow.",
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
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${manrope.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
