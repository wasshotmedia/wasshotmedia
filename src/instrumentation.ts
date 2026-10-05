export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_IN_PROCESS_SCHEDULER !== "true") return;

  const cron = await import("node-cron");
  const { connectDb } = await import("@/lib/db");
  const { processDueReminders } = await import("@/lib/reminders");

  cron.default.schedule("* * * * *", async () => {
    try {
      await connectDb();
      await processDueReminders();
    } catch (error) {
      console.error("In-process reminder scheduler failed", error);
    }
  });
}
