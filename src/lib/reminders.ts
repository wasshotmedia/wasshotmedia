import {
  CalendarEvent,
  Notification,
  Reminder,
  User,
} from "@/models";
import {
  DEFAULT_REMINDER_OFFSETS_MINUTES,
  reminderDedupeKey,
  reminderSendAt,
} from "@/lib/domain";
import { sendEmail, isMailConfigured } from "@/lib/mail";

export async function syncEventReminders(args: {
  eventId: string;
  start: Date;
  assignedTeam: string[];
  offsets?: number[];
  cancelOnly?: boolean;
}) {
  await Reminder.updateMany(
    { eventId: args.eventId, status: { $in: ["scheduled", "processing"] } },
    { $set: { status: "cancelled" } },
  );
  if (args.cancelOnly) return { created: 0 };

  const offsets = args.offsets?.length
    ? args.offsets
    : DEFAULT_REMINDER_OFFSETS_MINUTES;
  const channels: Array<"in_app" | "email"> = ["in_app", "email"];
  let created = 0;
  for (const offset of offsets) {
    for (const channel of channels) {
      const sendAt = reminderSendAt(args.start, offset);
      if (sendAt.getTime() <= Date.now()) continue;
      const dedupeKey = reminderDedupeKey(args.eventId, offset, channel);
      const existing = await Reminder.findOne({ dedupeKey });
      if (existing) {
        existing.status = "scheduled";
        existing.sendAt = sendAt;
        existing.recipientUserIds = args.assignedTeam as any;
        existing.lastError = undefined;
        await existing.save();
        created += 1;
        continue;
      }
      await Reminder.create({
        eventId: args.eventId,
        offsetMinutes: offset,
        sendAt,
        channel,
        status: "scheduled",
        dedupeKey,
        recipientUserIds: args.assignedTeam as any,
      });
      created += 1;
    }
  }
  return { created };
}

export async function processDueReminders(now = new Date()) {
  const due = await Reminder.find({
    status: "scheduled",
    sendAt: { $lte: now },
  }).limit(50);

  const results = [];
  for (const reminder of due) {
    reminder.status = "processing";
    await reminder.save();
    try {
      const event = await CalendarEvent.findById(reminder.eventId);
      if (!event || event.status === "cancelled") {
        reminder.status = "cancelled";
        await reminder.save();
        results.push({ id: String(reminder._id), status: "cancelled" });
        continue;
      }
      const users = await User.find({
        _id: { $in: reminder.recipientUserIds?.length ? reminder.recipientUserIds : event.assignedTeam },
        isActive: true,
      });
      const hours = Math.round(reminder.offsetMinutes / 60);
      const title = `Upcoming ${event.type}: ${event.title}`;
      const body = `${event.title} starts at ${event.start.toISOString()} (${hours}h reminder).`;

      if (reminder.channel === "in_app") {
        for (const user of users) {
          await Notification.create({
            userId: user._id,
            title,
            body,
            type: "reminder",
            relatedId: event._id,
            relatedModel: "CalendarEvent",
          });
        }
        reminder.status = "sent";
        reminder.sentAt = new Date();
        await reminder.save();
        results.push({ id: String(reminder._id), status: "sent", channel: "in_app" });
        continue;
      }

      if (!isMailConfigured()) {
        reminder.status = "failed";
        reminder.lastError = "Email service is not configured. Email was not sent.";
        await reminder.save();
        results.push({ id: String(reminder._id), status: "failed", reason: reminder.lastError });
        continue;
      }

      let emailsSent = 0;
      for (const user of users) {
        if (!user.email) continue;
        const result = await sendEmail({
          to: user.email,
          subject: title,
          text: body,
        });
        if (result.sent) emailsSent += 1;
        else {
          reminder.status = "failed";
          reminder.lastError = result.reason;
          await reminder.save();
          results.push({ id: String(reminder._id), status: "failed", reason: result.reason });
          emailsSent = -1;
          break;
        }
      }
      if (emailsSent < 0) continue;
      if (emailsSent === 0) {
        reminder.status = "failed";
        reminder.lastError = "No recipient emails were available.";
        await reminder.save();
        results.push({ id: String(reminder._id), status: "failed", reason: reminder.lastError });
        continue;
      }
      reminder.status = "sent";
      reminder.sentAt = new Date();
      await reminder.save();
      results.push({ id: String(reminder._id), status: "sent", channel: "email" });
    } catch (error) {
      reminder.status = "failed";
      reminder.lastError = error instanceof Error ? error.message : "Unknown error";
      await reminder.save();
      results.push({ id: String(reminder._id), status: "failed", reason: reminder.lastError });
    }
  }
  return results;
}
