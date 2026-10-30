import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models";
import { cleanMongoUri, sanitizeMongoMessage } from "./provision-user";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

/**
 * Validates whether the given connection URI points to a local/loopback database instance.
 */
export function isLocalDatabaseUri(uri: string): boolean {
  if (!uri) return false;
  const cleaned = cleanMongoUri(uri).toLowerCase();
  if (cleaned.startsWith("mongodb+srv://")) return false;
  return (
    cleaned.includes("localhost") ||
    cleaned.includes("127.0.0.1") ||
    cleaned.includes("::1") ||
    cleaned.includes("0.0.0.0")
  );
}

export interface EnsureUsersOptions {
  allowRemote?: boolean;
}

/**
 * Development-only initialization helper.
 * Strictly forbidden in production environments.
 * Idempotent: Never overwrites existing user passwords or promotes existing roles.
 */
export async function ensureUsers(options?: EnsureUsersOptions): Promise<{ created: string[]; preserved: string[] }> {
  // 1. Production Mode Guard: Block predictable default credential creation
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[Security Policy Violation] ensure-users cannot be executed in production. " +
        "Predictable default credentials and automated seeding are strictly forbidden. " +
        "Use the secure interactive provisioning workflow instead: pnpm --filter @man-u-ai/api provision-user"
    );
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  // 2. Target Safety Guard: Prevent accidental execution against remote/production MongoDB clusters
  const isLocal = isLocalDatabaseUri(rawUri);
  const allowRemote = options?.allowRemote || process.env.ALLOW_REMOTE_DEV_SEED === "true";

  if (!isLocal && !allowRemote) {
    throw new Error(
      `[Security Policy Violation] Execution blocked against remote database target (${sanitizeMongoMessage(
        rawUri
      )}). Development seeding is restricted to local MongoDB instances. To bypass in development, set ALLOW_REMOTE_DEV_SEED=true.`
    );
  }

  console.log(`[Security] Connecting to development MongoDB (${sanitizeMongoMessage(rawUri)})...`);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(rawUri);
  }

  // 3. Allowed Development Demo Accounts ONLY (No hardcoded admin/manager production accounts)
  // Passwords are configurable via environment (INITIAL_SEED_PASSWORD) or fallback to strong dev-only defaults
  const devPassword = process.env.INITIAL_SEED_PASSWORD || "DevOnlyPlantPass123!";

  const devAccounts = [
    {
      name: "Elena Rostova (Dev Admin)",
      email: "admin@plant.io",
      role: "admin",
    },
    {
      name: "Alex Mercer (Dev Engineer)",
      email: "alex.mercer@plant.io",
      role: "engineer",
    },
    {
      name: "Sam Taylor (Dev Operator)",
      email: "operator@plant.io",
      role: "viewer",
    },
  ];

  const created: string[] = [];
  const preserved: string[] = [];

  for (const acc of devAccounts) {
    const existing = await User.findOne({ email: acc.email });

    if (existing) {
      // 4. Protection Guard: Never silently reset an existing user's password or promote role
      preserved.push(acc.email);
      console.log(
        `[Security] Preserving existing user ${acc.email} (role: ${existing.role}). Password and permissions were not overwritten.`
      );
    } else {
      const passwordHash = await bcrypt.hash(devPassword, 10);
      await User.create({
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        orgId: "plant-alpha",
        isActive: true,
      });
      created.push(acc.email);
      console.log(`[Security] Initialized local dev account: ${acc.email} (role: ${acc.role})`);
    }
  }

  console.log(
    `[Security] Development account check complete. Created: ${created.length}, Preserved: ${preserved.length}.`
  );
  console.log(
    "[Security] For production or custom administrator enrollment, use the secure provisioning CLI: pnpm --filter @man-u-ai/api provision-user"
  );

  return { created, preserved };
}

// Execute directly if run via CLI
if (require.main === module) {
  ensureUsers()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[FATAL]", err.message);
      process.exit(1);
    });
}
