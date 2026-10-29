import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Equipment } from "../models";
import { isConnectedToMongo } from "../config/database";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { CreateEquipmentSchema, SyncCheckSchema } from "@man-u-ai/shared";
import { offlineService } from "../services/offline.service";

export const equipmentRouter: Router = Router();

// GET / - List all equipment records
equipmentRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  if (!isConnectedToMongo) {
    return res.json({
      success: true,
      data: [
        {
          id: "equip-p102",
          name: "Centrifugal Slurry Pump P-102",
          type: "Centrifugal Slurry Pump",
          model: "Warman AH 4/3",
          manufacturer: "Flowserve",
          serialNumber: "FS-2023-9981",
          location: "Line 1 - Slurry Preparation",
          documentIds: ["mock-doc-1"],
        },
        {
          id: "equip-hp400",
          name: "Hydraulic Stamping Press HP-400",
          type: "Hydraulic Press",
          model: "Schuler 400-T",
          manufacturer: "Schuler Pressen",
          serialNumber: "SC-400-091",
          location: "Line 3 - Main Fabrication",
          documentIds: ["mock-doc-2"],
        },
        {
          id: "equip-ac300",
          name: "Rotary Screw Air Compressor AC-300",
          type: "Air Compressor",
          model: "Atlas Copco GA-90+",
          manufacturer: "Atlas Copco",
          serialNumber: "AC-8812-B",
          location: "Utility Room B",
          documentIds: ["mock-doc-3"],
        },
      ],
    });
  }

  try {
    const items = await Equipment.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: items.map((eq) => ({
        id: eq._id.toString(),
        name: eq.name,
        type: eq.type,
        model: eq.model,
        manufacturer: eq.manufacturer,
        serialNumber: eq.serialNumber,
        location: eq.location,
        documentIds: eq.documentIds,
        createdAt: eq.createdAt ? eq.createdAt.toISOString() : null,
        updatedAt: eq.updatedAt ? eq.updatedAt.toISOString() : null,
      })),
    });
  } catch (err) {
    console.error("[Equipment] Mongo query failed:", err);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to retrieve equipment from database" },
    });
  }
});

// GET /:id/offline-pack - Download offline Area Pack (documents, chunks, figures)
equipmentRouter.get("/:id/offline-pack", requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const pack = await offlineService.getAreaPack(id);
    if (!pack) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Equipment with ID ${id} was not found.` },
      });
    }

    return res.json({
      success: true,
      data: pack,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "OFFLINE_PACK_ERROR", message: err.message },
    });
  }
});

// POST /:id/sync-check - Verify offline cache validity against latest revisions
equipmentRouter.post("/:id/sync-check", requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parseResult = SyncCheckSchema.safeParse({ ...req.body, equipmentId: id });
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid sync check payload" },
    });
  }

  try {
    const syncResult = await offlineService.checkSync(parseResult.data);
    return res.json({
      success: true,
      data: syncResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "SYNC_CHECK_ERROR", message: err.message },
    });
  }
});

// GET /:id - Get single equipment record by ID
equipmentRouter.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!isConnectedToMongo) {
    return res.status(503).json({
      success: false,
      error: { code: "SERVICE_UNAVAILABLE", message: "Database connection unavailable for equipment retrieval" },
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Equipment not found" },
    });
  }

  try {
    const eq = await Equipment.findById(id).populate("documentIds");
    if (!eq) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Equipment not found" },
      });
    }

    return res.json({
      success: true,
      data: {
        id: eq._id.toString(),
        name: eq.name,
        type: eq.type,
        model: eq.model,
        manufacturer: eq.manufacturer,
        serialNumber: eq.serialNumber,
        location: eq.location,
        documentIds: eq.documentIds,
        createdAt: eq.createdAt ? eq.createdAt.toISOString() : null,
        updatedAt: eq.updatedAt ? eq.updatedAt.toISOString() : null,
      },
    });
  } catch (err) {
    console.error("[Equipment] Find error:", err);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to query equipment record" },
    });
  }
});

// POST / - Create equipment record (Admin or Engineer only)
equipmentRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "engineer", "manager"]),
  async (req: AuthenticatedRequest, res: Response) => {
    const parsed = CreateEquipmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid equipment format", details: parsed.error.issues },
      });
    }

    if (!isConnectedToMongo) {
      return res.status(503).json({
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: "Database connection unavailable for equipment registration" },
      });
    }

    try {
      const created = await Equipment.create(parsed.data);
      return res.status(201).json({
        success: true,
        data: {
          id: created._id.toString(),
          ...parsed.data,
          createdAt: created.createdAt ? created.createdAt.toISOString() : null,
        },
      });
    } catch (err) {
      console.error("[Equipment] Mongo save failed:", err);
      return res.status(500).json({
        success: false,
        error: { code: "DATABASE_WRITE_FAILED", message: "Failed to persist equipment record to database" },
      });
    }
  }
);

// DELETE /:id - Delete equipment record (Admin or Engineer only)
equipmentRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "engineer", "manager"]),
  async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);

    if (!isConnectedToMongo) {
      return res.status(503).json({
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: "Database connection unavailable for equipment deletion" },
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Equipment not found" },
      });
    }

    try {
      const deleted = await Equipment.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Equipment not found" },
        });
      }

      return res.json({
        success: true,
        data: { message: "Equipment removed successfully" },
      });
    } catch (err) {
      console.error("[Equipment] Delete error:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to delete equipment record" },
      });
    }
  }
);
