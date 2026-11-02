import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../src/app";
import { connectDatabase, isConnectedToMongo } from "../src/config/database";
import { env } from "../src/config/env";
import { User, Task } from "../src/models";
import { parseRouteParamId } from "../src/routes/tasks.routes";

describe("Stage 6: Manager Shift Task Dispatch & Engineer Retrieval", () => {
  const runId = Date.now();
  let managerId: string;
  let engineerId: string;
  let viewerId: string;
  let managerToken: string;
  let engineerToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    try {
      await connectDatabase();
    } catch {
      // Allow fallback if offline
    }

    managerId = new mongoose.Types.ObjectId().toString();
    engineerId = new mongoose.Types.ObjectId().toString();
    viewerId = new mongoose.Types.ObjectId().toString();

    if (isConnectedToMongo) {
      await User.create([
        {
          _id: managerId,
          name: "Ops Manager",
          email: `manager-${runId}@plant.io`,
          passwordHash: "mockHash123!",
          role: "manager",
        },
        {
          _id: engineerId,
          name: "Lead Engineer",
          email: `engineer-${runId}@plant.io`,
          passwordHash: "mockHash123!",
          role: "engineer",
        },
        {
          _id: viewerId,
          name: "Readonly Viewer",
          email: `viewer-${runId}@plant.io`,
          passwordHash: "mockHash123!",
          role: "viewer",
        },
      ]);
    }

    managerToken = jwt.sign(
      { id: managerId, email: `manager-${runId}@plant.io`, name: "Ops Manager", role: "manager" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    engineerToken = jwt.sign(
      { id: engineerId, email: `engineer-${runId}@plant.io`, name: "Lead Engineer", role: "engineer" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    viewerToken = jwt.sign(
      { id: viewerId, email: `viewer-${runId}@plant.io`, name: "Readonly Viewer", role: "viewer" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    if (isConnectedToMongo) {
      await User.deleteMany({ _id: { $in: [managerId, engineerId, viewerId] } });
      await Task.deleteMany({ "createdBy.id": managerId });
    }
  });

  let createdTaskId: string;

  describe("Unit: parseRouteParamId Helper", () => {
    it("accepts valid, non-empty string IDs", () => {
      expect(parseRouteParamId("task-123")).toBe("task-123");
      expect(parseRouteParamId("  6ae833eb4998ac7a18d4e7eb  ")).toBe("6ae833eb4998ac7a18d4e7eb");
    });

    it("rejects non-string types and arrays", () => {
      expect(parseRouteParamId(["task-1", "task-2"])).toBeNull();
      expect(parseRouteParamId({})).toBeNull();
      expect(parseRouteParamId(12345)).toBeNull();
      expect(parseRouteParamId(null)).toBeNull();
      expect(parseRouteParamId(undefined)).toBeNull();
    });

    it("rejects empty and whitespace-only strings", () => {
      expect(parseRouteParamId("")).toBeNull();
      expect(parseRouteParamId("   ")).toBeNull();
      expect(parseRouteParamId("\t\n")).toBeNull();
    });
  });

  it("rejects unauthorized task creation without auth or with viewer role", async () => {
    // 1. No token
    const resNoAuth = await request(app)
      .post("/api/v1/tasks")
      .send({ title: "Check Pressure Gauges", description: "Verify line 2" });
    expect(resNoAuth.status).toBe(401);

    // 2. Viewer role
    const resViewer = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ title: "Check Pressure Gauges", description: "Verify line 2" });
    expect(resViewer.status).toBe(403);
  });

  it("allows Manager to dispatch a new task with equipment and priority", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        title: "Inspect Compressor Valve C-04",
        description: "Examine intake seal for micro-fissures and log decibel reading.",
        priority: "high",
        equipmentId: "EQ-COMP-001",
        equipmentName: "Centrifugal Gas Compressor #4",
        shift: "Morning",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.title).toBe("Inspect Compressor Valve C-04");
    expect(res.body.data.priority).toBe("high");
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.equipmentId).toBe("EQ-COMP-001");
    createdTaskId = res.body.data.id;
  });

  it("allows Engineer to list all active tasks", async () => {
    const res = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${engineerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((t: any) => t.id === createdTaskId);
    expect(found).toBeDefined();
    expect(found.title).toBe("Inspect Compressor Valve C-04");
  });

  it("allows Engineer to retrieve details of a specific task by valid ID", async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${engineerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdTaskId);
    expect(res.body.data.title).toBe("Inspect Compressor Valve C-04");
  });

  it("returns HTTP 400 with INVALID_TASK_ID for whitespace-only route IDs", async () => {
    const resGet = await request(app)
      .get("/api/v1/tasks/%20%20")
      .set("Authorization", `Bearer ${engineerToken}`);
    expect(resGet.status).toBe(400);
    expect(resGet.body.success).toBe(false);
    expect(resGet.body.error.code).toBe("INVALID_TASK_ID");

    const resPatch = await request(app)
      .patch("/api/v1/tasks/%20%20")
      .set("Authorization", `Bearer ${engineerToken}`)
      .send({ status: "in_progress" });
    expect(resPatch.status).toBe(400);
    expect(resPatch.body.success).toBe(false);
    expect(resPatch.body.error.code).toBe("INVALID_TASK_ID");

    const resDelete = await request(app)
      .delete("/api/v1/tasks/%20%20")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(resDelete.status).toBe(400);
    expect(resDelete.body.success).toBe(false);
    expect(resDelete.body.error.code).toBe("INVALID_TASK_ID");
  });

  it("returns HTTP 404 for non-existent valid task IDs", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/v1/tasks/${nonExistentId}`)
      .set("Authorization", `Bearer ${engineerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("allows Engineer to update task status to in_progress and completed with notes", async () => {
    // Step 1: Start task
    const resProgress = await request(app)
      .patch(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${engineerToken}`)
      .send({ status: "in_progress" });

    expect(resProgress.status).toBe(200);
    expect(resProgress.body.data.status).toBe("in_progress");

    // Step 2: Complete task with notes
    const resComplete = await request(app)
      .patch(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${engineerToken}`)
      .send({
        status: "completed",
        completionNotes: "Seal replaced and pressure verified at 4.2 bar.",
      });

    expect(resComplete.status).toBe(200);
    expect(resComplete.body.data.status).toBe("completed");
    expect(resComplete.body.data.completionNotes).toContain("Seal replaced");
    expect(resComplete.body.data.completedAt).toBeDefined();
  });

  it("rejects unauthorized users from deleting a task", async () => {
    // Viewer cannot delete task
    const resViewer = await request(app)
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(resViewer.status).toBe(403);

    // Unauthenticated request cannot delete task
    const resNoAuth = await request(app)
      .delete(`/api/v1/tasks/${createdTaskId}`);
    expect(resNoAuth.status).toBe(401);
  });

  it("allows Manager to delete a task", async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);

    // Verify it's gone
    const resCheck = await request(app)
      .get(`/api/v1/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${engineerToken}`);
    expect(resCheck.status).toBe(404);
  });
});
