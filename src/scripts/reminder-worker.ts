import { config } from "dotenv";
config({ path: ".env.local" });
config();

import cron from "node-cron";
import { connectDb } from "../lib/db";
import { processDueReminders } from "../lib/reminders";

async function tick() {
  await connectDb();
  const results = await processDueReminders();
  if (results.length) {
    console.log(new Date().toISOString(), results);
  }
}

cron.schedule("* * * * *", () => {
  tick().catch((error) => console.error("Reminder tick failed", error));
});

console.log("WasShot reminder worker started. Processing due reminders every minute from MongoDB.");
tick().catch((error) => console.error(error));
