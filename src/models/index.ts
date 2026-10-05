import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

function getModel<T>(name: string, schema: Schema): Model<T> {
  return ((mongoose.models[name] as unknown as Model<T>) ||
    (mongoose.model(name, schema as any) as unknown as Model<T>));
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin", "editor"], default: "editor" },
    title: String,
    bio: String,
    avatarUrl: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

const clientSchema = new Schema(
  {
    name: { type: String, required: true },
    contactPerson: String,
    email: String,
    phone: String,
    whatsapp: String,
    business: String,
    website: String,
    socialLinks: {
      instagram: String,
      linkedin: String,
    },
    address: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
clientSchema.index({ name: "text", email: "text", business: "text" });

const leadSchema = new Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    service: String,
    message: String,
    budget: String,
    timeline: String,
    stage: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiation",
        "won",
        "lost",
      ],
      default: "new",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    followUpAt: Date,
    notes: String,
    convertedClientId: { type: Schema.Types.ObjectId, ref: "Client" },
    source: { type: String, default: "manual" },
    contactMessageId: { type: Schema.Types.ObjectId, ref: "ContactMessage" },
  },
  { timestamps: true },
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    type: {
      type: String,
      enum: ["video", "website", "seo", "marketing", "mixed"],
      default: "mixed",
    },
    stage: { type: String, default: "enquiry", index: true },
    description: String,
    startDate: Date,
    dueDate: Date,
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    services: [String],
  },
  { timestamps: true },
);

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "waiting", "done"],
      default: "todo",
      index: true,
    },
    dueDate: Date,
    checklist: [{ text: String, done: { type: Boolean, default: false } }],
    notes: String,
  },
  { timestamps: true },
);
taskSchema.index({ dueDate: 1, status: 1 });

const calendarEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["shoot", "meeting", "site_visit", "editing", "deadline", "delivery", "other"],
      required: true,
    },
    title: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true },
    location: String,
    mapLink: String,
    assignedTeam: [{ type: Schema.Types.ObjectId, ref: "User" }],
    equipment: [Schema.Types.Mixed],
    equipmentChecklist: [Schema.Types.Mixed],
    shotList: [Schema.Types.Mixed],
    notes: String,
    status: {
      type: String,
      enum: [
        "draft",
        "confirmed",
        "scheduled",
        "in_progress",
        "completed",
        "rescheduled",
        "cancelled",
      ],
      default: "confirmed",
    },
    conflictOverride: { type: Boolean, default: false },
    conflictOverrideBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
calendarEventSchema.index({ start: 1, end: 1, assignedTeam: 1 });

const reminderSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "CalendarEvent", required: true, index: true },
    offsetMinutes: { type: Number, required: true },
    sendAt: { type: Date, required: true, index: true },
    channel: { type: String, enum: ["in_app", "email"], required: true },
    status: {
      type: String,
      enum: ["scheduled", "processing", "sent", "failed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    dedupeKey: { type: String, required: true, unique: true },
    lastError: String,
    sentAt: Date,
    recipientUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: String,
    read: { type: Boolean, default: false },
    type: String,
    relatedId: Schema.Types.ObjectId,
    relatedModel: String,
  },
  { timestamps: true },
);

const invoiceSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
      },
    ],
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    subtotal: Number,
    tax: Number,
    total: Number,
    paid: { type: Number, default: 0 },
    balance: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ["draft", "issued", "partially_paid", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    notes: String,
  },
  { timestamps: true },
);

const paymentSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    amount: { type: Number, required: true },
    method: String,
    paidAt: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true },
);

const serviceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    number: String,
    title: { type: String, required: true },
    description: String,
    deliverables: [String],
    visualKey: String,
    imageUrl: String,
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const portfolioSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    year: String,
    role: String,
    services: [String],
    description: String,
    imageUrl: String,
    gallery: [String],
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    clientName: String,
  },
  { timestamps: true },
);

const testimonialSchema = new Schema(
  {
    clientName: { type: String, required: true },
    company: String,
    project: String,
    quote: { type: String, required: true },
    imageUrl: String,
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const pricingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    startingPrice: { type: Number, default: null },
    currency: { type: String, default: "INR" },
    billingType: String,
    features: [String],
    ctaLabel: { type: String, default: "Get Started →" },
    highlighted: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    service: String,
    description: { type: String, required: true },
    budget: String,
    timeline: String,
    status: { type: String, enum: ["new", "read", "archived"], default: "new" },
  },
  { timestamps: true },
);

const activityLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: String,
    entityId: String,
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: true },
);
activityLogSchema.index({ createdAt: -1 });

const settingsSchema = new Schema(
  {
    singleton: { type: String, default: "agency", unique: true },
    brandName: { type: String, default: "WasShot Media" },
    tagline: { type: String, default: "WE CREATE. YOU GROW." },
    email: String,
    phone: String,
    whatsapp: String,
    instagram: String,
    linkedin: String,
    address: String,
    seoTitle: String,
    seoDescription: String,
    ogImage: String,
    availabilityLabel: { type: String, default: "Available for new projects" },
    availableForProjects: { type: Boolean, default: true },
    founders: [
      {
        name: String,
        role: String,
        bio: String,
        responsibilities: [String],
        avatarUrl: String,
        instagram: String,
        linkedin: String,
      },
    ],
    homepage: {
      heroLabel: String,
      heroHeadline: [String],
      heroMessage: String,
      heroSupport: String,
      introLabel: String,
      introHeadline: [String],
      introSupport: String,
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export type ClientDoc = InferSchemaType<typeof clientSchema> & { _id: mongoose.Types.ObjectId };
export type LeadDoc = InferSchemaType<typeof leadSchema> & { _id: mongoose.Types.ObjectId };
export type ProjectDoc = InferSchemaType<typeof projectSchema> & { _id: mongoose.Types.ObjectId };
export type TaskDoc = InferSchemaType<typeof taskSchema> & { _id: mongoose.Types.ObjectId };
export type CalendarEventDoc = InferSchemaType<typeof calendarEventSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type ReminderDoc = InferSchemaType<typeof reminderSchema> & { _id: mongoose.Types.ObjectId };
export type NotificationDoc = InferSchemaType<typeof notificationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type InvoiceDoc = InferSchemaType<typeof invoiceSchema> & { _id: mongoose.Types.ObjectId };
export type PaymentDoc = InferSchemaType<typeof paymentSchema> & { _id: mongoose.Types.ObjectId };
export type ServiceDoc = InferSchemaType<typeof serviceSchema> & { _id: mongoose.Types.ObjectId };
export type PortfolioDoc = InferSchemaType<typeof portfolioSchema> & { _id: mongoose.Types.ObjectId };
export type TestimonialDoc = InferSchemaType<typeof testimonialSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type FaqDoc = InferSchemaType<typeof faqSchema> & { _id: mongoose.Types.ObjectId };
export type PricingDoc = InferSchemaType<typeof pricingSchema> & { _id: mongoose.Types.ObjectId };
export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type ActivityLogDoc = InferSchemaType<typeof activityLogSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type SettingsDoc = InferSchemaType<typeof settingsSchema> & { _id: mongoose.Types.ObjectId };

export const User = getModel<UserDoc>("User", userSchema);
export const Client = getModel<ClientDoc>("Client", clientSchema);
export const Lead = getModel<LeadDoc>("Lead", leadSchema);
export const Project = getModel<ProjectDoc>("Project", projectSchema);
export const Task = getModel<TaskDoc>("Task", taskSchema);
export const CalendarEvent = getModel<CalendarEventDoc>("CalendarEvent", calendarEventSchema);
export const Reminder = getModel<ReminderDoc>("Reminder", reminderSchema);
export const Notification = getModel<NotificationDoc>("Notification", notificationSchema);
export const Invoice = getModel<InvoiceDoc>("Invoice", invoiceSchema);
export const Payment = getModel<PaymentDoc>("Payment", paymentSchema);
export const Service = getModel<ServiceDoc>("Service", serviceSchema);
export const PortfolioProject = getModel<PortfolioDoc>("PortfolioProject", portfolioSchema);
export const Testimonial = getModel<TestimonialDoc>("Testimonial", testimonialSchema);
export const FAQ = getModel<FaqDoc>("FAQ", faqSchema);
export const PricingPlan = getModel<PricingDoc>("PricingPlan", pricingSchema);
export const ContactMessage = getModel<ContactMessageDoc>("ContactMessage", contactMessageSchema);
export const ActivityLog = getModel<ActivityLogDoc>("ActivityLog", activityLogSchema);
export const AgencySettings = getModel<SettingsDoc>("AgencySettings", settingsSchema);
