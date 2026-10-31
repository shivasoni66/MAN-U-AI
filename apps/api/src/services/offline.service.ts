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
    if (equipmentId === "equip-cb-a61") {
      return {
        equipmentId: "equip-cb-a61",
        equipmentName: "Conveyor Belt A61",
        equipmentType: "Modular Belt Conveyor",
        model: "A61-SIMREADY-01",
        generatedAt: new Date().toISOString(),
        versionHash: "cb-a61-v1-hash-9901",
        documents: [
          {
            id: "doc-conveyor-a61",
            title: "SimReady Conveyor Belt A61 Technical Operation & Disassembly Guide",
            revision: "Rev 1.0-OEM",
            filename: "conveyor_belt_a61_manual.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024 * 1024 * 4,
            status: "indexed",
            uploadedById: "mock-user-1",
            ownerName: "Senior Automation Specialist",
            ownerEmail: "conveyors@manuai.internal",
            reviewDate: new Date(Date.now() + 3600000 * 24 * 365).toISOString(),
            isOverdue: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        chunks: [
          {
            id: "chk-04",
            documentId: "doc-conveyor-a61",
            documentTitle: "SimReady Conveyor Belt A61 Technical Operation & Disassembly Guide",
            page: 1,
            section: "1.1 Drive Motor & Planetary Gearbox Assembly",
            text: "The Conveyor Belt A61 drive train comprises a 480V 3-phase high-torque brushless drive motor (sm_conveyor_belt_a61_obj_00) coupled to a sealed helical planetary gearbox (sm_button01/sm_button02 operator start/stop interface). Maintain oil temperature under 65°C and verify 32 Nm flange mount torques during quarterly PM.",
            safetyCategory: "loto_isolation",
            ppeTags: ["safety_glasses", "dielectric_gloves", "steel_toe_boots"],
          },
          {
            id: "chk-05",
            documentId: "doc-conveyor-a61",
            documentTitle: "SimReady Conveyor Belt A61 Technical Operation & Disassembly Guide",
            page: 2,
            section: "2.3 Idler Roller Array & Vulcanized Belt Tensioning",
            text: "The bed features 36 precision-machined stainless idler rollers (sm_roller01 through sm_roller36) supporting a multi-ply high-traction vulcanized belt. Belt tracking must be calibrated using the pneumatic automatic tensioner cylinders (sm_button05/06 pressure regulators) to maintain between 4.2 and 4.8 bar.",
            safetyCategory: "general_procedure",
            ppeTags: ["safety_glasses", "cut_resistant_gloves"],
          },
          {
            id: "chk-06",
            documentId: "doc-conveyor-a61",
            documentTitle: "SimReady Conveyor Belt A61 Technical Operation & Disassembly Guide",
            page: 3,
            section: "3.2 Optical Inspection Scanner & Vision Housing",
            text: "Quality inspection is performed by the top-mounted high-speed optical scanning module (sm_glass_a61_obj_00 lens enclosure). Clean optical glass face with lint-free isopropyl wipes before every 8-hour shift. In case of belt stoppage, engage Emergency Stop console (sm_button04) immediately.",
            safetyCategory: "hazard_warning",
            ppeTags: ["safety_glasses", "esd_wrist_strap"],
          },
        ],
        figures: [
          {
            id: "fig-cb-a61",
            documentId: "doc-conveyor-a61",
            documentTitle: "SimReady Conveyor Belt A61 Technical Operation & Disassembly Guide",
            revision: "Rev 1.0-OEM",
            page: 2,
            figureId: "FIG-CONVEYOR-BELT-A61",
            title: "Conveyor Belt A61 Exploded Assembly & Component Diagram",
            caption: "Detailed 3D SimReady CAD rendering displaying drive motor, idler rollers, tensioners, and optical scanner.",
            status: "extracted",
            associatedChunkIds: ["chk-04", "chk-05", "chk-06"],
          },
        ],
      };
    }

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
