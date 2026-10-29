import mongoose from "mongoose";
import { DocRequestTicket, User, IDocRequestTicket } from "../models";
import { isConnectedToMongo } from "../config/database";
import type {
  DocRequestTicketDTO,
  CreateDocRequestTicketInput,
  UpdateDocRequestTicketInput,
  TicketStatus,
} from "@man-u-ai/shared";

// In-memory fallback tickets for testing & disconnected environments
let MEMORY_TICKETS: DocRequestTicketDTO[] = [
  {
    id: "mock-ticket-001",
    ticketNumber: "DOC-2026-0001",
    equipmentName: "Slurry Pump P-102",
    requestedBy: {
      id: "mock-user-1",
      name: "Alex Martinez",
      email: "engineer@manuai.internal",
    },
    userQuery: "What is the gland packing torque sequence for the mechanical seal housing?",
    searchContext: "Searched Slurry Pump P-102 manual; closest page 18 lacked torque ratings for mechanical packing gland bolts.",
    closestMatch: {
      documentTitle: "Slurry Pump P-102 Maintenance Manual",
      page: 18,
      score: 0.28,
    },
    status: "open",
    assignedToEmail: "maintenance.lead@manuai.internal",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export class TicketService {
  /**
   * Generates a unique sequential ticket number.
   */
  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    if (!isConnectedToMongo) {
      const seq = String(MEMORY_TICKETS.length + 1).padStart(4, "0");
      return `DOC-${year}-${seq}`;
    }

    const count = await DocRequestTicket.countDocuments();
    const seq = String(count + 1).padStart(4, "0");
    return `DOC-${year}-${seq}`;
  }

  /**
   * Creates a new documentation request ticket from a user query or AI refusal.
   */
  async createTicket(
    input: CreateDocRequestTicketInput,
    userId: string
  ): Promise<DocRequestTicketDTO> {
    const ticketNumber = await this.generateTicketNumber();

    if (!isConnectedToMongo) {
      const newTicket: DocRequestTicketDTO = {
        id: `mock-ticket-${Date.now()}`,
        ticketNumber,
        equipmentId: input.equipmentId,
        equipmentName: input.equipmentName || "General Plant Equipment",
        requestedBy: {
          id: userId,
          name: "Plant Technician",
          email: "technician@manuai.internal",
        },
        userQuery: input.userQuery,
        searchContext: input.searchContext,
        closestMatch: input.closestMatch,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      MEMORY_TICKETS.unshift(newTicket);
      return newTicket;
    }

    const userOid = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId();

    const u = await User.findById(userOid);
    const eqOid =
      input.equipmentId && mongoose.Types.ObjectId.isValid(input.equipmentId)
        ? new mongoose.Types.ObjectId(input.equipmentId)
        : undefined;

    const doc = await DocRequestTicket.create({
      ticketNumber,
      equipmentId: eqOid,
      equipmentName: input.equipmentName,
      requestedBy: userOid,
      userQuery: input.userQuery,
      searchContext: input.searchContext,
      closestMatch: input.closestMatch,
      status: "open",
    });

    return {
      id: doc._id.toString(),
      ticketNumber: doc.ticketNumber,
      equipmentId: doc.equipmentId?.toString(),
      equipmentName: doc.equipmentName,
      requestedBy: {
        id: userOid.toString(),
        name: u?.name || "Technician",
        email: u?.email || "technician@manuai.internal",
      },
      userQuery: doc.userQuery,
      searchContext: doc.searchContext,
      closestMatch: doc.closestMatch,
      status: doc.status as TicketStatus,
      assignedToEmail: doc.assignedToEmail,
      resolutionNotes: doc.resolutionNotes,
      createdAt: doc.createdAt.toISOString(),
      resolvedAt: doc.resolvedAt?.toISOString(),
    };
  }

  /**
   * Lists documentation request tickets.
   */
  async listTickets(
    userRole?: string,
    userId?: string,
    statusFilter?: string
  ): Promise<DocRequestTicketDTO[]> {
    if (!isConnectedToMongo) {
      let result = [...MEMORY_TICKETS];
      if (statusFilter) {
        result = result.filter((t) => t.status === statusFilter);
      }
      return result;
    }

    const query: any = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    // Non-admin/manager roles only see their own requested tickets
    if (userRole !== "admin" && userRole !== "manager" && userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.requestedBy = new mongoose.Types.ObjectId(userId);
      }
    }

    const docs = await DocRequestTicket.find(query)
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return docs.map((d: any) => ({
      id: d._id.toString(),
      ticketNumber: d.ticketNumber,
      equipmentId: d.equipmentId?.toString(),
      equipmentName: d.equipmentName,
      requestedBy: {
        id: d.requestedBy?._id?.toString() || "",
        name: d.requestedBy?.name || "Technician",
        email: d.requestedBy?.email || "technician@manuai.internal",
      },
      userQuery: d.userQuery,
      searchContext: d.searchContext,
      closestMatch: d.closestMatch,
      status: d.status as TicketStatus,
      assignedToEmail: d.assignedToEmail,
      resolutionNotes: d.resolutionNotes,
      createdAt: d.createdAt.toISOString(),
      resolvedAt: d.resolvedAt?.toISOString(),
    }));
  }

  /**
   * Updates ticket status, assignment, or resolution notes.
   */
  async updateTicket(
    ticketId: string,
    input: UpdateDocRequestTicketInput
  ): Promise<DocRequestTicketDTO | null> {
    if (!isConnectedToMongo) {
      const idx = MEMORY_TICKETS.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);
      if (idx === -1) return null;
      MEMORY_TICKETS[idx] = {
        ...MEMORY_TICKETS[idx],
        ...input,
        status: (input.status as TicketStatus) || MEMORY_TICKETS[idx].status,
        resolvedAt: input.status === "closed" || input.status === "uploaded" ? new Date().toISOString() : undefined,
      };
      return MEMORY_TICKETS[idx];
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const updateFields: any = { ...input };
    if (input.status === "closed" || input.status === "uploaded") {
      updateFields.resolvedAt = new Date();
    }

    const updated = await DocRequestTicket.findByIdAndUpdate(ticketId, updateFields, { new: true }).populate(
      "requestedBy",
      "name email"
    );

    if (!updated) return null;

    const reqUser = updated.requestedBy as any;
    return {
      id: updated._id.toString(),
      ticketNumber: updated.ticketNumber,
      equipmentId: updated.equipmentId?.toString(),
      equipmentName: updated.equipmentName,
      requestedBy: {
        id: reqUser?._id?.toString() || "",
        name: reqUser?.name || "Technician",
        email: reqUser?.email || "technician@manuai.internal",
      },
      userQuery: updated.userQuery,
      searchContext: updated.searchContext,
      closestMatch: updated.closestMatch,
      status: updated.status as TicketStatus,
      assignedToEmail: updated.assignedToEmail,
      resolutionNotes: updated.resolutionNotes,
      createdAt: updated.createdAt.toISOString(),
      resolvedAt: updated.resolvedAt?.toISOString(),
    };
  }
}

export const ticketService = new TicketService();
