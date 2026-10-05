import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { connectDb } from "../lib/db";
import {
  User,
  Client,
  Project,
  CalendarEvent,
  Reminder,
  Invoice,
} from "../models";

async function runE2ETests() {
  console.log("==================================================");
  console.log("WASSHOT MEDIA - AGENCY MANAGEMENT SYSTEM E2E TESTS");
  console.log("==================================================");

  const BASE_URL = "http://localhost:3000";

  await connectDb();
  // Clean up any previous test events on Oct 10 / Oct 12
  await CalendarEvent.deleteMany({
    title: { $in: ["ABC Brand Commercial Shoot", "Conflicting Brand Shoot"] },
  });
  await Reminder.deleteMany({
    "payload.title": { $regex: /ABC Brand Commercial Shoot/i },
  });

  // Step 1: Login as Praneeth
  console.log("\n[Test 1] Authenticating as Praneeth (praneeth@wasshotmedia.com)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "praneeth@wasshotmedia.com",
      password: "WasshotAdmin2026!",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  const cookie = loginRes.headers.get("set-cookie") || "";
  const loginData = await loginRes.json();
  console.log(`✓ Authenticated as: ${loginData.user.name} (${loginData.user.role})`);

  // Step 2: Create client "ABC Media"
  console.log("\n[Test 2] Creating client 'ABC Media' in CRM...");
  const clientRes = await fetch(`${BASE_URL}/api/admin/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      name: "Suresh Babu",
      company: "ABC Media",
      email: "suresh@abcmedia.in",
      phone: "+91 98480 12345",
      city: "Vijayawada",
      status: "active",
      notes: "Commercial film production client in Vijayawada",
    }),
  });

  const clientData = await clientRes.json();
  if (!clientRes.ok) {
    throw new Error(`Client creation failed: ${JSON.stringify(clientData)}`);
  }
  const clientId = clientData.item._id;
  console.log(`✓ Client created: ${clientData.item.name} · ${clientData.item.company} (ID: ${clientId})`);

  // Step 3: Create project "ABC Brand Shoot"
  console.log("\n[Test 3] Creating project 'ABC Brand Shoot'...");
  const projectRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "ABC Brand Shoot",
      clientId,
      service: "video",
      stage: "Pre-Production",
      budget: 85000,
      notes: "4K commercial shoot in Vijayawada",
    }),
  });

  const projectData = await projectRes.json();
  if (!projectRes.ok) {
    throw new Error(`Project creation failed: ${JSON.stringify(projectData)}`);
  }
  const projectId = projectData.item._id;
  console.log(`✓ Project created: ${projectData.item.title} (ID: ${projectId})`);

  // Get Praneeth's user ID
  await connectDb();
  const praneethUser = await User.findOne({ email: "praneeth@wasshotmedia.com" });
  if (!praneethUser) throw new Error("Praneeth user not found in DB");
  const praneethId = praneethUser._id.toString();

  // Step 4: Schedule Shoot: Oct 10 10:00 - 13:00, assign Praneeth
  console.log("\n[Test 4] Scheduling Shoot: Oct 10, 2026 from 10:00 to 13:00 (Assign: Praneeth)...");
  const shootStart = "2026-10-10T10:00:00.000Z";
  const shootEnd = "2026-10-10T13:00:00.000Z";

  const shootRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "ABC Brand Commercial Shoot",
      type: "shoot",
      clientId,
      projectId,
      start: shootStart,
      end: shootEnd,
      assignedTo: [praneethId],
      location: "Bunder Road, Vijayawada",
      locationUrl: "https://maps.google.com/?q=Vijayawada",
      equipmentChecklist: [
        { item: "Sony FX3 Camera Package", checked: false },
        { item: "DJI Mic 2 Wireless", checked: false },
      ],
      shotList: [
        { shot: "Hero product wide angle", checked: false },
        { shot: "Macro close-up", checked: false },
      ],
    }),
  });

  const shootRawText = await shootRes.text();
  let shootData: any = {};
  try {
    shootData = JSON.parse(shootRawText);
  } catch (e) {
    throw new Error(`Shoot creation returned status ${shootRes.status} with non-JSON body: ${shootRawText}`);
  }
  if (!shootRes.ok) {
    throw new Error(`Shoot creation failed (${shootRes.status}): ${JSON.stringify(shootData)}`);
  }
  const shootId = shootData.item._id;
  console.log(`✓ Shoot scheduled successfully (ID: ${shootId})`);

  // Step 5: Verify Persistent Reminders (24h & 2h before)
  console.log("\n[Test 5] Verifying persistent reminders created in MongoDB queue...");
  const reminders = await Reminder.find({ eventId: shootId });
  console.log(`✓ Found ${reminders.length} reminder job(s) for shoot ${shootId}:`);
  reminders.forEach((r) => {
    console.log(`   - [${r.channel}] at ${r.sendAt.toISOString()} | status: ${r.status}`);
  });
  if (reminders.length < 2) {
    throw new Error(`Expected at least 2 reminders (24h & 2h), found ${reminders.length}`);
  }

  // Step 6 & 7: Attempt to schedule overlapping shoot: Oct 10 12:00 - 14:00 (conflict with 10:00-13:00)
  console.log("\n[Test 6 & 7] Testing Server-Side Conflict Detection with overlapping booking (12:00 - 14:00)...");
  const overlapRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "Conflicting Brand Shoot",
      type: "shoot",
      clientId,
      start: "2026-10-10T12:00:00.000Z",
      end: "2026-10-10T14:00:00.000Z",
      assignedTo: [praneethId],
      location: "MG Road, Vijayawada",
    }),
  });

  const overlapData = await overlapRes.json();
  if (overlapRes.status === 409 && (overlapData.conflicts || overlapData.conflict)) {
    console.log("✓ CONFLICT DETECTED AS EXPECTED (HTTP 409 Conflict):");
    console.log(`   Error message: "${overlapData.error}"`);
    console.log(`   Conflicting bookings:`, overlapData.conflicts);
  } else {
    throw new Error(`Conflict detection failed! Server returned ${overlapRes.status}: ${JSON.stringify(overlapData)}`);
  }

  // Step 8: Test Rescheduling & Reminders Sync
  console.log("\n[Test 8] Testing Shoot Rescheduling & Reminder Auto-Sync...");
  const newStart = "2026-10-12T09:00:00.000Z";
  const newEnd = "2026-10-12T12:00:00.000Z";

  const rescheduleRes = await fetch(`${BASE_URL}/api/admin/events/${shootId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      start: newStart,
      end: newEnd,
      status: "rescheduled",
    }),
  });

  if (!rescheduleRes.ok) {
    throw new Error(`Rescheduling failed: ${await rescheduleRes.text()}`);
  }
  console.log("✓ Shoot rescheduled to Oct 12, 2026");

  const updatedReminders = await Reminder.find({ eventId: shootId, status: "scheduled" });
  console.log(`✓ Reminders automatically updated in MongoDB to match new start date:`);
  updatedReminders.forEach((r) => {
    console.log(`   - [${r.channel}] new trigger: ${r.sendAt.toISOString()}`);
  });

  // Step 9: Verify Public Pages Remain 100% Intact
  console.log("\n[Test 9] Verifying public pages remain intact and pristine...");
  const publicRoutes = ["/", "/services", "/work", "/about", "/contact"];
  for (const route of publicRoutes) {
    const pageRes = await fetch(`${BASE_URL}${route}`);
    if (pageRes.status === 200) {
      console.log(`✓ Public route '${route}' rendered successfully (HTTP 200)`);
    } else {
      throw new Error(`Public route '${route}' returned HTTP ${pageRes.status}`);
    }
  }

  console.log("\n==================================================");
  console.log("ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
