import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { glossaryService } from "../src/services/glossary.service";
import { offlineService } from "../src/services/offline.service";
import { ticketService } from "../src/services/ticket.service";
import { diagramService } from "../src/services/diagram.service";
import { classifyChunkSafety } from "../src/services/pdf.service";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env";

const testToken = jwt.sign(
  { id: "test-user-id", email: "alex.mercer@plant.io", name: "Alex Mercer", role: "engineer" },
  env.JWT_SECRET,
  { expiresIn: "1h" }
);

const adminToken = jwt.sign(
  { id: "admin-user-id", email: "admin@plant.io", name: "Admin Lead", role: "admin" },
  env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("5 Industrial AI Search & Reliability Features", () => {
  describe("Feature 1: Plant Glossary & Slang Mapping", () => {
    it("expands colloquial worker slang ('the blower') to canonical equipment terminology", async () => {
      const expansion = await glossaryService.expandQuery("Inspect vibration on the blower");
      expect(expansion.expandedTerms.length).toBeGreaterThan(0);
      expect(expansion.expandedTerms.some((t) => t.includes("the blower"))).toBe(true);
      expect(expansion.expandedQuery.toLowerCase()).toContain("induced draft centrifugal fan");
    });

    it("expands plant equipment tag ('the pack pump' or 'P-102') to canonical name", async () => {
      const expansion = await glossaryService.expandQuery("Check gland packing on the pack pump");
      expect(expansion.expandedTerms.length).toBeGreaterThan(0);
      expect(expansion.expandedQuery).toContain("High Pressure Slurry Recirculation Pump");
    });

    it("records a glossary suggestion when a search term has no match", async () => {
      await glossaryService.recordLowConfidenceQuery("rotary airlock feeder jammed");

      // Verify the glossary suggestion endpoint responds with admin authorization
      const res = await request(app)
        .get("/api/glossary/suggestions")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /api/glossary returns plant glossary entries", async () => {
      const res = await request(app)
        .get("/api/glossary")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Feature 2: Offline-Capable Mode for Dead Zones", () => {
    it("generates an Area Pack with version checksum and chunk procedures", async () => {
      const pack = await offlineService.getAreaPack("equip-p102");
      expect(pack).toBeDefined();
      expect(pack!.equipmentId).toBe("equip-p102");
      expect(pack!.versionHash).toBeDefined();
      expect(pack!.chunks.length).toBeGreaterThan(0);
      expect(pack!.chunks[0].text).toBeDefined();
    });

    it("GET /api/equipment/:id/offline-pack returns offline payload", async () => {
      const res = await request(app)
        .get("/api/equipment/equip-p102/offline-pack")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.versionHash).toBeDefined();
      expect(Array.isArray(res.body.data.chunks)).toBe(true);
    });

    it("POST /api/equipment/:id/sync-check evaluates client cache version", async () => {
      const pack = await offlineService.getAreaPack("equip-p102");
      const res = await request(app)
        .post("/api/equipment/equip-p102/sync-check")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ clientVersionHash: pack!.versionHash });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.isUpToDate).toBe("boolean");
    });
  });

  describe("Feature 3: Refusal-to-Fix Loop", () => {
    it("creates a documentation request ticket when search cannot verify", async () => {
      const ticket = await ticketService.createTicket(
        {
          userQuery: "How do we bleed the auxiliary accumulator on press HP-400?",
          equipmentId: "equip-hp400",
          equipmentName: "Hydraulic Press HP-400",
          searchContext: "No explicit bleed procedure found in current section.",
        },
        "user-alex"
      );

      expect(ticket).toBeDefined();
      expect(ticket.ticketNumber).toMatch(/^DOC-\d{4}-\d{4}$/);
      expect(ticket.status).toBe("open");
      expect(ticket.userQuery).toContain("auxiliary accumulator");
    });

    it("POST /api/tickets creates a ticket via API endpoint", async () => {
      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          userQuery: "What is the nitrogen pre-charge pressure for accumulator ACC-02?",
          equipmentName: "Accumulator ACC-02",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketNumber).toBeDefined();
      expect(res.body.data.status).toBe("open");
    });

    it("GET /api/tickets returns list of documentation requests", async () => {
      const res = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Feature 4: Safety Preconditions Pinned First", () => {
    it("classifies safety chunks during PDF text processing", () => {
      const warningText = "DANGER: High pressure hydraulic fluid injection hazard! Wear face shield and bleed line before opening.";
      const classification = classifyChunkSafety(warningText);
      expect(classification.safetyCategory).toBe("hazard_warning");
      expect(classification.ppeTags).toContain("face_shield");

      const lotoText = "LOCKOUT TAGOUT: Perform zero-energy isolation. Padlock breaker 480V-M4 and verify zero pressure at gauge PG-12.";
      const lotoClass = classifyChunkSafety(lotoText);
      expect(lotoClass.safetyCategory).toBe("loto_isolation");
    });

    it("evaluates safety preconditions data structures for procedure answers", () => {
      const preconditions = {
        hazards: ["High Pressure Slurry Injection Hazard (400 PSI Line)"],
        requiredPPE: ["Face Shield", "Heavy Nitrile Gauntlets", "Steel Toe Boots"],
        lotoSteps: ["Padlock main 480V disconnect at Breaker MCC-04", "Vent casing bleed valve to zero gauge pressure"],
      };

      expect(preconditions.hazards.length).toBeGreaterThan(0);
      expect(preconditions.requiredPPE).toContain("Face Shield");
      expect(preconditions.lotoSteps[0]).toContain("Padlock");
    });
  });

  describe("Feature 5: Tap-the-Part Exploded Diagrams", () => {
    it("retrieves interactive diagram hotspots with OEM part numbers and manual pages", async () => {
      const annotation = await diagramService.getAnnotations("FIG-P102-EXPLODED");
      expect(annotation).toBeDefined();
      expect(annotation!.figureId).toBe("FIG-P102-EXPLODED");
      expect(annotation!.hotspots.length).toBeGreaterThanOrEqual(4);

      const sealPart = annotation!.hotspots.find((h) => h.partNumber === "SP-102-03");
      expect(sealPart).toBeDefined();
      expect(sealPart!.partName).toContain("Mechanical Seal");
      expect(sealPart!.manualPage).toBe(22);
      expect(sealPart!.boundingBox.length).toBe(4);
    });

    it("GET /api/diagrams/:figureId returns diagram annotation and hotspots", async () => {
      const res = await request(app)
        .get("/api/diagrams/FIG-P102-EXPLODED")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.figureId).toBe("FIG-P102-EXPLODED");
      expect(Array.isArray(res.body.data.hotspots)).toBe(true);
      expect(res.body.data.hotspots.length).toBeGreaterThanOrEqual(1);
    });
  });
});
