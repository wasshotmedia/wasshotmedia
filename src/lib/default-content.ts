export const defaultContent = {
  brandName: "WasShot Media",
  tagline: "WE CREATE. YOU GROW.",
  availabilityLabel: "Available for new projects",
  availableForProjects: true,
  seoTitle: "WasShot Media — Creative Media + Digital Agency",
  seoDescription:
    "WasShot Media helps brands turn ideas into powerful visuals, websites and digital experiences that people remember.",
  homepage: {
    heroLabel: "Creative Media × Digital",
    heroHeadline: ["WE", "CREATE", "YOU", "GROW"],
    heroMessage: "Stories that look good.\nDigital experiences that work.",
    heroSupport:
      "WasShot Media helps brands turn ideas into powerful visuals, websites and digital experiences that people remember.",
    introLabel: "What we do",
    introHeadline: [
      "We help brands",
      "look better,",
      "tell better",
      "stories,",
      "and grow online.",
    ],
    introSupport:
      "From the first frame to the final click, we bring creative production, design and digital strategy together.",
  },
  founders: [] as Array<{
    name: string;
    role: string;
    bio: string;
    responsibilities?: string[];
    avatarUrl?: string;
  }>,
  services: [
    {
      number: "01",
      slug: "shooting",
      title: "Shooting",
      visualKey: "shooting",
      description:
        "Cinematic production for brands that need stills and moving images with intention.",
      deliverables: ["Brand films", "Product photography", "On-location shoots", "Direction"],
    },
    {
      number: "02",
      slug: "video-editing",
      title: "Video Editing",
      visualKey: "editing",
      description:
        "Pace, colour and sound shaped so the story lands — from first cut to final master.",
      deliverables: ["Offline / online edit", "Colour", "Sound mix", "Social cuts"],
    },
    {
      number: "03",
      slug: "website-development",
      title: "Website Development",
      visualKey: "websites",
      description:
        "Custom websites that look premium and work hard for the business behind them.",
      deliverables: ["UX / UI", "Custom build", "CMS", "Performance"],
    },
    {
      number: "04",
      slug: "seo",
      title: "SEO",
      visualKey: "seo",
      description:
        "Search work grounded in the actual pages, offers and audiences of the brand.",
      deliverables: ["Technical SEO", "On-page", "Content structure", "Measurement"],
    },
    {
      number: "05",
      slug: "promotions",
      title: "Promotions",
      visualKey: "promotions",
      description:
        "Campaign creative and distribution that keeps the work visible where it matters.",
      deliverables: ["Social campaigns", "Ad creative", "Launch kits", "Content calendars"],
    },
    {
      number: "06",
      slug: "strategy",
      title: "Strategy",
      visualKey: "strategy",
      description:
        "A clear brief before the cameras roll or the first line of code is written.",
      deliverables: ["Creative strategy", "Positioning", "Project planning", "Messaging"],
    },
  ],
  faqs: [
    {
      question: "What services does WasShot Media provide?",
      answer:
        "Shooting, video editing, website development, SEO, promotions and creative strategy — either as connected work or as focused projects.",
    },
    {
      question: "How do we start a project?",
      answer:
        "Send a brief through the contact form or WhatsApp. We review the objective, share a plan, and only start production once the scope is agreed.",
    },
    {
      question: "How long does a project take?",
      answer:
        "Timelines depend on the work. A focused edit or landing page is faster than a full shoot-plus-website engagement. We confirm dates before we begin.",
    },
    {
      question: "Can you handle shooting and editing together?",
      answer:
        "Yes. Production and post can live in the same team, so the edit is planned while we shoot.",
    },
    {
      question: "Do you build custom websites?",
      answer:
        "Yes. We build original websites for the brand — not generic templates — including content structure and launch support.",
    },
    {
      question: "Do you manage social media promotions?",
      answer:
        "We create and run promotional work when it is part of the agreed scope. Ongoing management can be included in a custom package.",
    },
    {
      question: "How does your pricing work?",
      answer:
        "Packages are starting points. Final pricing follows the brief, timeline and deliverables. Figures shown on the site are only published when they are set in the admin dashboard.",
    },
    {
      question: "Can we request a custom package?",
      answer:
        "Yes. Most clients do. Tell us the outcome you need and we will shape a package around it.",
    },
    {
      question: "Can you work with businesses outside Vijayawada?",
      answer:
        "Yes. Creative and digital work can be remote. Shoots outside Vijayawada are planned case by case.",
    },
  ],
  pricing: [
    {
      title: "Starter",
      description: "For small brands beginning their digital journey.",
      startingPrice: null,
      currency: "INR",
      billingType: "Project",
      highlighted: false,
      ctaLabel: "Get Started →",
      features: [
        "Focused creative or digital scope",
        "Clear deliverables",
        "Direct communication with the team",
        "Timeline agreed before start",
      ],
    },
    {
      title: "Growth",
      description: "For businesses ready to improve their online presence.",
      startingPrice: null,
      currency: "INR",
      billingType: "Project",
      highlighted: true,
      ctaLabel: "Get Started →",
      features: [
        "Combined creative + digital work",
        "Campaign or website focus",
        "Review rounds included",
        "Launch support",
      ],
    },
    {
      title: "Custom",
      description: "For brands requiring a complete creative + digital solution.",
      startingPrice: null,
      currency: "INR",
      billingType: "Scoped proposal",
      highlighted: false,
      ctaLabel: "Get Started →",
      features: [
        "Shooting, editing and digital under one plan",
        "Dedicated project rhythm",
        "Strategy before production",
        "Tailored deliverables",
      ],
    },
  ],
  capabilities: [
    { label: "Creative Production", detail: "Shooting and editing with a single visual language." },
    { label: "Digital Experiences", detail: "Websites built to look considered and convert." },
    { label: "Growth Strategy", detail: "SEO and promotions tied to a real business objective." },
  ],
  process: [
    { number: "01", title: "Discover", text: "Understand the brand, audience and objective." },
    { number: "02", title: "Plan", text: "Build the creative direction and execution plan." },
    { number: "03", title: "Create", text: "Shoot, design, develop and produce." },
    { number: "04", title: "Refine", text: "Review, test and improve." },
    { number: "05", title: "Launch", text: "Deliver and help the brand move forward." },
  ],
  why: [
    { title: "Creative thinking", text: "We don't just execute briefs." },
    { title: "One connected team", text: "Creative and digital work under one roof." },
    { title: "Built for real brands", text: "Every project starts with the business objective." },
    { title: "Fast + personal", text: "Direct communication without unnecessary layers." },
  ],
  marquee: ["Shooting", "Editing", "Websites", "SEO", "Promotions", "Strategy"],
};
