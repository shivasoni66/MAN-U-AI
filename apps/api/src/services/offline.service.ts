import crypto from "crypto";
import mongoose from "mongoose";
import { Equipment, DocumentModel, DocumentChunk, DocumentFigure } from "../models";
import { isConnectedToMongo } from "../config/database";
import type {
  AreaPackDTO,
  AreaPackChunkDTO,
  DocumentDTO,
  DocumentFigureDTO,
  SyncCheckInput,
  SyncCheckResponseDTO,
} from "@man-u-ai/shared";

export class OfflineService {
  /**
   * Generates a complete Area Pack containing documents, chunks, and figures for an equipment unit.
   */
  async getAreaPack(equipmentId: string): Promise<AreaPackDTO | null> {
    if (!isConnectedToMongo || !mongoose.Types.ObjectId.isValid(equipmentId)) {
      // Mock fixture area pack for testing/disconnected mode
      return {
        equipmentId: equipmentId || "mock-eq-1",
        equipmentName: "Slurry Pump P-102",
        equipmentType: "Centrifugal Slurry Pump",
        model: "Warman AH 4/3",
        generatedAt: new Date().toISOString(),
        versionHash: "mock-v1-hash-abc1234",
        documents: [
          {
            id: "mock-doc-1",
            title: "Slurry Pump P-102 Maintenance & Overhaul Manual",
            revision: "Rev 2.4",
            filename: "slurry_pump_p102_manual.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024 * 1024 * 3,
            status: "indexed",
            uploadedById: "mock-user-1",
            ownerName: "Chief Reliability Engineer",
            ownerEmail: "reliability@manuai.internal",
            reviewDate: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
            isOverdue: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        chunks: [
          {
            id: "chunk-1",
            documentId: "mock-doc-1",
            documentTitle: "Slurry Pump P-102 Maintenance & Overhaul Manual",
            page: 12,
            section: "4.1 Mechanical Seal Overhaul",
            text: "Before disassembling the slurry pump wet end, ensure electrical feed 480V disconnect switch is locked and tagged out in accordance with standard plant LOTO procedures. Vent and drain casing completely.",
            safetyCategory: "loto_isolation",
            ppeTags: ["safety_glasses", "dielectric_gloves", "steel_toe_boots"],
          },
          {
            id: "chunk-2",
            documentId: "mock-doc-1",
            documentTitle: "Slurry Pump P-102 Maintenance & Overhaul Manual",
            page: 18,
            section: "4.3 Gland Packing & Seal Bolt Torques",
            text: "Torque gland follower bolts evenly in a cross pattern to 45 ft-lbs (61 Nm). Never over-tighten packing gland as excessive heat will glaze the packing rings and score shaft sleeve.",
            safetyCategory: "general_procedure",
            ppeTags: ["safety_glasses", "leather_gloves"],
          },
          {
            id: "chunk-3",
            documentId: "mock-doc-1",
            documentTitle: "Slurry Pump P-102 Maintenance & Overhaul Manual",
            page: 22,
            section: "5.1 Hazard Warnings: Slurry Abrasion & Trapped Pressure",
            text: "DANGER: Entrapped abrasive slurry under pressure can cause severe chemical or projectile injury. Always bleed casing pressure gauge to 0 PSIG and verify zero flow before loosening casing clamp bolts.",
            safetyCategory: "hazard_warning",
            ppeTags: ["face_shield", "chemical_apron", "heavy_duty_gloves"],
          },
        ],
        figures: [
          {
            id: "mock-fig-1",
            documentId: "mock-doc-1",
            documentTitle: "Slurry Pump P-102 Maintenance & Overhaul Manual",
            revision: "Rev 2.4",
            page: 16,
            figureId: "FIG-P102-EXPLODED",
            title: "Slurry Pump P-102 Exploded Power End & Wet End Assembly",
            caption: "Exploded cross-sectional diagram showing bearing cartridge, mechanical seal, and impeller.",
            status: "extracted",
            associatedChunkIds: ["chunk-1", "chunk-2"],
          },
        ],
      };
    }

    const eq = await Equipment.findById(equipmentId);
    if (!eq) return null;

    const docIds = (eq.documentIds || []).map((id: any) =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );

    const documents = await DocumentModel.find({
      _id: { $in: docIds },
      status: "indexed",
    });

    const validDocIds = documents.map((d) => d._id);
    const chunks = await DocumentChunk.find({
      documentId: { $in: validDocIds },
    }).select("_id documentId documentTitle page section text safetyCategory ppeTags");

    const figures = await DocumentFigure.find({
      documentId: { $in: validDocIds },
      status: "extracted",
    });

    // Compute deterministic version hash
    const hashData = documents
      .map((d) => `${d._id.toString()}:${d.revision}:${d.updatedAt.getTime()}`)
      .sort()
      .join("|");
    const versionHash = crypto.createHash("sha256").update(hashData).digest("hex").slice(0, 16);

    const docDtos: DocumentDTO[] = documents.map((d) => {
      const isOverdue = d.reviewDate ? new Date() > d.reviewDate : false;
      return {
        id: d._id.toString(),
        title: d.title,
        revision: d.revision,
        filename: d.filename,
        mimeType: d.mimeType,
        sizeBytes: d.sizeBytes,
        status: d.status,
        pageCount: d.pageCount,
        processingError: d.processingError,
        uploadedById: d.uploadedById.toString(),
        ownerName: d.ownerName,
        ownerEmail: d.ownerEmail,
        reviewDate: d.reviewDate ? d.reviewDate.toISOString() : undefined,
        isOverdue,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    });

    const chunkDtos: AreaPackChunkDTO[] = chunks.map((c) => ({
      id: c._id.toString(),
      documentId: c.documentId.toString(),
      documentTitle: c.documentTitle,
      page: c.page,
      section: c.section,
      text: c.text,
      safetyCategory: c.safetyCategory as any,
      ppeTags: c.ppeTags,
    }));

    const figureDtos: DocumentFigureDTO[] = figures.map((f) => ({
      id: f._id.toString(),
      documentId: f.documentId.toString(),
      documentTitle: f.documentTitle,
      revision: f.revision,
      page: f.page,
      figureId: f.figureId,
      title: f.title,
      caption: f.caption,
      storagePath: f.storagePath,
      storageProvider: f.storageProvider,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      dimensions: f.dimensions,
      status: f.status,
      associatedChunkIds: f.associatedChunkIds || [],
      createdAt: f.createdAt ? f.createdAt.toISOString() : undefined,
    }));

    return {
      equipmentId: eq._id.toString(),
      equipmentName: eq.name,
      equipmentType: eq.type,
      model: eq.model,
      generatedAt: new Date().toISOString(),
      versionHash,
      documents: docDtos,
      chunks: chunkDtos,
      figures: figureDtos,
    };
  }

  /**
   * Checks whether the client's cached Area Pack is up to date against latest revisions in the database.
   */
  async checkSync(input: SyncCheckInput): Promise<SyncCheckResponseDTO> {
    const pack = await this.getAreaPack(input.equipmentId);
    if (!pack) {
      return {
        equipmentId: input.equipmentId,
        isUpToDate: true,
        latestVersionHash: "none",
        latestRevisionDate: new Date().toISOString(),
      };
    }

    const isUpToDate = Boolean(input.currentVersionHash && input.currentVersionHash === pack.versionHash);

    return {
      equipmentId: input.equipmentId,
      isUpToDate,
      latestVersionHash: pack.versionHash,
      latestRevisionDate: pack.generatedAt,
    };
  }
}

export const offlineService = new OfflineService();
