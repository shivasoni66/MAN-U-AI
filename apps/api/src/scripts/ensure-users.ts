import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

async function ensureUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const accounts = [
    {
      name: "Elena Rostova (Admin)",
      email: "admin@plant.io",
      password: "AdminPassword123!",
      role: "admin",
    },
    {
      name: "Alex Mercer (Engineer)",
      email: "alex.mercer@plant.io",
      password: "EngineerPassword123!",
      role: "engineer",
    },
    {
      name: "Sam Taylor (Operator)",
      email: "operator@plant.io",
      password: "OperatorPassword123!",
      role: "viewer",
    },
    {
      name: "System Administrator",
      email: "admin@gmail.com",
      password: "Admin@123",
      role: "admin",
    },
    {
      name: "Operations Manager",
      email: "manager@gmail.com",
      password: "Manager@123",
      role: "manager",
    },
  ];

  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 10);
    const existing = await User.findOne({ email: acc.email });

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = acc.role as any;
      existing.isActive = true;
      await existing.save();
      console.log(`Updated existing account: ${acc.email} (${acc.role})`);
    } else {
      await User.create({
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        orgId: "plant-alpha",
        isActive: true,
      });
      console.log(`Created new account: ${acc.email} (${acc.role})`);
    }
  }

  await mongoose.disconnect();
  console.log("All accounts ready.");
}

ensureUsers().catch((err) => {
  console.error("Failed to ensure users:", err);
  process.exit(1);
});
