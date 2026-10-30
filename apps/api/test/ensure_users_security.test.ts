import { describe, it, expect, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import { ensureUsers, isLocalDatabaseUri } from "../src/scripts/ensure-users";
import { User } from "../src/models";
import { isConnectedToMongo, connectDatabase } from "../src/config/database";

describe("Ensure-Users Script Production Security & Safeguards", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalAllowRemote = process.env.ALLOW_REMOTE_DEV_SEED;

  const testEmails = [
    "admin@plant.io",
    "alex.mercer@plant.io",
    "operator@plant.io",
    "admin@gmail.com",
    "manager@gmail.com",
  ];

  beforeEach(async () => {
    if (!isConnectedToMongo) {
      await connectDatabase();
    }
    await User.deleteMany({ email: { $in: testEmails } });
  });

  afterEach(async () => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.MONGODB_URI = originalMongoUri;
    if (originalAllowRemote !== undefined) {
      process.env.ALLOW_REMOTE_DEV_SEED = originalAllowRemote;
    } else {
      delete process.env.ALLOW_REMOTE_DEV_SEED;
    }
    if (isConnectedToMongo) {
      await User.deleteMany({ email: { $in: testEmails } });
    }
  });

  describe("isLocalDatabaseUri", () => {
    it("identifies localhost and loopback IP connections as local", () => {
      expect(isLocalDatabaseUri("mongodb://127.0.0.1:27017/manuai")).toBe(true);
      expect(isLocalDatabaseUri("mongodb://localhost:27017/manuai")).toBe(true);
      expect(isLocalDatabaseUri("mongodb://0.0.0.0:27017/manuai")).toBe(true);
    });

    it("rejects remote cloud atlas and non-localhost connection strings", () => {
      expect(isLocalDatabaseUri("mongodb+srv://admin:secret@manuai-cluster.mongodb.net/production")).toBe(false);
      expect(isLocalDatabaseUri("mongodb://db.plant.corp:27017/production")).toBe(false);
      expect(isLocalDatabaseUri("mongodb://10.0.0.5:27017/production")).toBe(false);
    });
  });

  describe("Production Execution Guard", () => {
    it("strictly blocks execution when NODE_ENV is production", async () => {
      process.env.NODE_ENV = "production";

      await expect(ensureUsers()).rejects.toThrowError(
        /\[Security Policy Violation\] ensure-users cannot be executed in production/i
      );
    });
  });

  describe("Remote Target Accidental Execution Guard", () => {
    it("blocks execution against remote cloud cluster targets without explicit override", async () => {
      process.env.NODE_ENV = "development";
      process.env.MONGODB_URI = "mongodb+srv://admin:pass@production-cluster.mongodb.net/manuai";
      delete process.env.ALLOW_REMOTE_DEV_SEED;

      await expect(ensureUsers()).rejects.toThrowError(
        /\[Security Policy Violation\] Execution blocked against remote database target/i
      );
    });
  });

  describe("Account Preservation & Absence of Fixed Privileged Accounts", () => {
    it("does not create or define unsafe hardcoded accounts (admin@gmail.com, manager@gmail.com)", async () => {
      process.env.NODE_ENV = "development";

      const result = await ensureUsers();
      expect(result.created).not.toContain("admin@gmail.com");
      expect(result.created).not.toContain("manager@gmail.com");
      expect(result.preserved).not.toContain("admin@gmail.com");
      expect(result.preserved).not.toContain("manager@gmail.com");

      // Verify they do not exist in the database from ensureUsers
      const adminGmail = await User.findOne({ email: "admin@gmail.com" });
      const managerGmail = await User.findOne({ email: "manager@gmail.com" });
      expect(adminGmail).toBeNull();
      expect(managerGmail).toBeNull();
    });

    it("never silently overwrites an existing user's password or promotes their role", async () => {
      process.env.NODE_ENV = "development";

      const testEmail = "admin@plant.io";
      const customPassword = "CustomOperatorPassword-999!";
      const customHash = await bcrypt.hash(customPassword, 10);

      // Create an existing user with specific password and viewer role
      await User.create({
        name: "Existing Person",
        email: testEmail,
        passwordHash: customHash,
        role: "viewer",
        orgId: "plant-alpha",
        isActive: true,
      });

      // Run ensureUsers
      const result = await ensureUsers();
      expect(result.preserved).toContain(testEmail);

      // Verify the password and role were NOT changed or reset
      const userAfter = await User.findOne({ email: testEmail });
      expect(userAfter).not.toBeNull();
      const isPasswordPreserved = await bcrypt.compare(customPassword, userAfter!.passwordHash);
      expect(isPasswordPreserved).toBe(true);
      expect(userAfter!.role).toBe("viewer"); // Not promoted to admin!
    });
  });
});
