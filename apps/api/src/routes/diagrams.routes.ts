import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { diagramService } from "../services/diagram.service";
import {
  CreateDiagramAnnotationSchema,
  ApiResponse,
  DiagramAnnotationDTO,
} from "@man-u-ai/shared";

export const diagramRouter: Router = Router();

// Get diagram annotations/hotspots for a figure
diagramRouter.get("/:figureId", requireAuth, async (req: Request, res: Response) => {
  try {
    const figureId = String(req.params.figureId);
    const annotations = await diagramService.getAnnotations(figureId);

    if (!annotations) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `No annotations found for figure ${figureId}` },
      });
    }

    const response: ApiResponse<DiagramAnnotationDTO> = {
      success: true,
      data: annotations,
    };
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "DIAGRAM_FETCH_ERROR", message: err.message },
    });
  }
});

// Run Gemini Vision to detect component hotspots automatically
diagramRouter.post("/:figureId/annotate", requireAuth, async (req: Request, res: Response) => {
  try {
    const figureId = String(req.params.figureId);
    const annotations = await diagramService.annotateWithVision(figureId);

    return res.json({
      success: true,
      data: annotations,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "DIAGRAM_ANNOTATE_ERROR", message: err.message },
    });
  }
});

// Save or edit diagram annotations
diagramRouter.post("/:figureId/hotspots", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role === "viewer") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Viewers cannot edit diagram hotspots." },
      });
    }

    const parseResult = CreateDiagramAnnotationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid hotspot payload.",
        },
      });
    }

    const saved = await diagramService.saveAnnotations(parseResult.data);
    return res.json({
      success: true,
      data: saved,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "DIAGRAM_SAVE_ERROR", message: err.message },
    });
  }
});
