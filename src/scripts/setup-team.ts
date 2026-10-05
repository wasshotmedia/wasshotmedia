import { connectDb } from "../lib/db";
import { User } from "../models";
import { hashPassword } from "../lib/auth";

async function main() {
  await connectDb();
  const passwordHash = await hashPassword("WasshotAdmin2026!");

  // Ensure Praneeth exists
  let praneeth = await User.findOne({
    $or: [{ email: "praneeth@wasshotmedia.com" }, { email: "admin@wasshotmedia.com" }],
  });
  if (praneeth) {
    praneeth.name = "Praneeth";
    praneeth.email = "praneeth@wasshotmedia.com";
    praneeth.passwordHash = passwordHash;
    praneeth.role = "owner";
    praneeth.title = "Studio & Creative Lead";
    praneeth.isActive = true;
    await praneeth.save();
    console.log("Updated Praneeth");
  } else {
    praneeth = await User.create({
      name: "Praneeth",
      email: "praneeth@wasshotmedia.com",
      passwordHash,
      role: "owner",
      title: "Studio & Creative Lead",
      isActive: true,
    });
    console.log("Created Praneeth");
  }

  // Ensure Wasim exists
  let wasim = await User.findOne({
    $or: [{ email: "wasim@wasshotmedia.com" }, { email: "lead@wasshotmedia.com" }],
  });
  if (wasim) {
    wasim.name = "Wasim";
    wasim.email = "wasim@wasshotmedia.com";
    wasim.passwordHash = passwordHash;
    wasim.role = "owner";
    wasim.title = "Media & Production Lead";
    wasim.isActive = true;
    await wasim.save();
    console.log("Updated Wasim");
  } else {
    wasim = await User.create({
      name: "Wasim",
      email: "wasim@wasshotmedia.com",
      passwordHash,
      role: "owner",
      title: "Media & Production Lead",
      isActive: true,
    });
    console.log("Created Wasim");
  }

  // Also keep admin@wasshotmedia.com as fallback alias pointing to Praneeth or separate account
  let admin = await User.findOne({ email: "admin@wasshotmedia.com" });
  if (!admin) {
    await User.create({
      name: "Praneeth (Admin)",
      email: "admin@wasshotmedia.com",
      passwordHash,
      role: "owner",
      title: "Studio & Creative Lead",
      isActive: true,
    });
    console.log("Created fallback admin@wasshotmedia.com");
  }

  console.log("Users verified:");
  const all = await User.find({ isActive: true });
  console.log(all.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
