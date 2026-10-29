import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { glossaryService } from "../services/glossary.service";
import {
  CreatePlantGlossarySchema,
  ApproveGlossarySuggestionSchema,
  ApiResponse,
  PlantGlossaryDTO,
  GlossarySuggestionDTO,
} from "@man-u-ai/shared";

export const glossaryRouter = Router();

// Viewer and above can read active glossary (used for quick-lookups and search badges)
glossaryRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, query } = req.query;
    const entries = await glossaryService.listGlossary({
      category: typeof category === "string" ? category : undefined,
      query: typeof query === "string" ? query : undefined,
    });

    const response: ApiResponse<PlantGlossaryDTO[]> = {
      success: true,
      data: entries,
    };
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "GLOSSARY_FETCH_ERROR", message: err.message },
    });
  }
});

// Admin and Manager can create glossary entries
glossaryRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only administrators and plant managers can manage the glossary." },
      });
    }

    const parseResult = CreatePlantGlossarySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid glossary entry data.",
        },
      });
    }

    const userId = String((req as any).user?.id || (req as any).user?._id);
    const created = await glossaryService.createEntry(parseResult.data, userId);

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "GLOSSARY_CREATE_ERROR", message: err.message },
    });
  }
});

// Admin and Manager can delete glossary entries
glossaryRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only administrators and plant managers can delete glossary entries." },
      });
    }

    const id = String(req.params.id);
    await glossaryService.deleteEntry(id);

    return res.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "GLOSSARY_DELETE_ERROR", message: err.message },
    });
  }
});

// Admin and Manager can view low-confidence search suggestions
glossaryRouter.get("/suggestions", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only administrators and plant managers can view glossary suggestions." },
      });
    }

    const suggestions = await glossaryService.listSuggestions();
    const response: ApiResponse<GlossarySuggestionDTO[]> = {
      success: true,
      data: suggestions,
    };
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "SUGGESTIONS_FETCH_ERROR", message: err.message },
    });
  }
});

// Admin and Manager can approve a suggestion into the glossary
glossaryRouter.post("/suggestions/:id/approve", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only administrators and plant managers can approve glossary suggestions." },
      });
    }

    const id = String(req.params.id);
    const parseResult = ApproveGlossarySuggestionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid approval payload.",
        },
      });
    }

    const userId = String((req as any).user?.id || (req as any).user?._id);
    const created = await glossaryService.approveSuggestion(
      id,
      {
        term: parseResult.data.term,
        canonicalTerm: parseResult.data.canonicalTerm,
        category: parseResult.data.category,
        equipmentTag: parseResult.data.equipmentTag,
        synonyms: parseResult.data.synonyms,
        isActive: true,
      },
      userId
    );

    return res.json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "SUGGESTION_APPROVE_ERROR", message: err.message },
    });
  }
});

// Admin and Manager can dismiss a suggestion
glossaryRouter.post("/suggestions/:id/dismiss", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only administrators and plant managers can dismiss glossary suggestions." },
      });
    }

    const id = String(req.params.id);
    await glossaryService.dismissSuggestion(id);

    return res.json({
      success: true,
      data: { id, dismissed: true },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: "SUGGESTION_DISMISS_ERROR", message: err.message },
    });
  }
});
