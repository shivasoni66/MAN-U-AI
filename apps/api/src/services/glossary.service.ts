import mongoose from "mongoose";
import { PlantGlossary, GlossarySuggestion, IPlantGlossary } from "../models";
import { isConnectedToMongo } from "../config/database";
import type {
  PlantGlossaryDTO,
  CreatePlantGlossaryInput,
  GlossarySuggestionDTO,
} from "@man-u-ai/shared";

// Standard in-memory fallback dictionary for test and offline environments
const DEFAULT_GLOSSARY_FIXTURES: Array<{
  term: string;
  canonicalTerm: string;
  equipmentTag?: string;
  category: "slang" | "equipment_tag" | "abbreviation" | "component";
  synonyms: string[];
  plantArea?: string;
  isActive: boolean;
}> = [
  {
    term: "the blower",
    canonicalTerm: "Induced Draft Centrifugal Fan",
    equipmentTag: "IDF-400",
    category: "slang",
    synonyms: ["draft fan", "exhaust blower", "IDF", "IDF-400 fan"],
    plantArea: "Boiler House",
    isActive: true,
  },
  {
    term: "the pack pump",
    canonicalTerm: "High Pressure Slurry Recirculation Pump",
    equipmentTag: "P-102",
    category: "equipment_tag",
    synonyms: ["slurry pump", "P-102", "P102", "recirc pump"],
    plantArea: "Ore Processing Bay 2",
    isActive: true,
  },
  {
    term: "big press",
    canonicalTerm: "Industrial Hydraulic Stamping Press",
    equipmentTag: "HP-400",
    category: "slang",
    synonyms: ["hydraulic press", "HP-400", "400 ton press"],
    plantArea: "Forming Cell A",
    isActive: true,
  },
  {
    term: "snort valve",
    canonicalTerm: "Pneumatic Rapid Pressure Relief Dump Valve",
    equipmentTag: "PRV-09",
    category: "component",
    synonyms: ["bleed valve", "dump valve", "PRV-09", "blowoff valve"],
    plantArea: "Air Compressor House",
    isActive: true,
  },
  {
    term: "pecker head",
    canonicalTerm: "Electric Motor Terminal Conduit Connection Box",
    category: "slang",
    synonyms: ["motor junction box", "terminal enclosure", "T-box"],
    plantArea: "All Areas",
    isActive: true,
  },
];

export class GlossaryService {
  /**
   * Expands user queries by substituting or appending canonical terms,
   * equipment tags, and synonyms based on the plant glossary.
   */
  async expandQuery(rawQuery: string): Promise<{
    expandedQuery: string;
    expandedTerms: string[];
  }> {
    if (!rawQuery || rawQuery.trim().length === 0) {
      return { expandedQuery: rawQuery, expandedTerms: [] };
    }

    let glossaryEntries: Array<{
      term: string;
      canonicalTerm: string;
      equipmentTag?: string;
      synonyms: string[];
    }> = [];

    if (isConnectedToMongo) {
      try {
        const docs = await PlantGlossary.find({ isActive: true }).lean();
        glossaryEntries = docs.map((d) => ({
          term: d.term,
          canonicalTerm: d.canonicalTerm,
          equipmentTag: d.equipmentTag,
          synonyms: d.synonyms || [],
        }));
      } catch (err) {
        console.warn("[GlossaryService] Failed to load glossary from MongoDB, using fixtures:", err);
        glossaryEntries = DEFAULT_GLOSSARY_FIXTURES;
      }
    } else {
      glossaryEntries = DEFAULT_GLOSSARY_FIXTURES;
    }

    const matchedCanonicalTerms: string[] = [];
    const expandedTerms: string[] = [];
    const lowerQuery = rawQuery.toLowerCase();

    for (const entry of glossaryEntries) {
      let matched = false;
      const termsToTest = [entry.term, ...(entry.equipmentTag ? [entry.equipmentTag] : []), ...entry.synonyms];

      for (const t of termsToTest) {
        if (!t || t.trim().length < 2) continue;
        const escaped = t.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        if (regex.test(lowerQuery)) {
          matched = true;
          expandedTerms.push(`${t} → ${entry.canonicalTerm}`);
          break;
        }
      }

      if (matched) {
        if (!matchedCanonicalTerms.includes(entry.canonicalTerm)) {
          matchedCanonicalTerms.push(entry.canonicalTerm);
        }
        if (entry.equipmentTag && !matchedCanonicalTerms.includes(entry.equipmentTag)) {
          matchedCanonicalTerms.push(entry.equipmentTag);
        }
      }
    }

    if (matchedCanonicalTerms.length === 0) {
      return { expandedQuery: rawQuery, expandedTerms: [] };
    }

    // Append authoritative canonical terms and equipment tags to the search query for vector + BM25 retrieval
    const augmentation = ` [${matchedCanonicalTerms.join(", ")}]`;
    const expandedQuery = `${rawQuery}${augmentation}`;

    return {
      expandedQuery,
      expandedTerms: Array.from(new Set(expandedTerms)),
    };
  }

  /**
   * Automatically records terms from low-confidence or failed searches as candidate glossary suggestions.
   */
  async recordLowConfidenceQuery(query: string, candidateSuggestions?: string[]): Promise<void> {
    if (!query || query.trim().length < 3) return;

    // Filter out generic English stop words to find salient technical keywords
    const stopWords = new Set([
      "what", "when", "where", "which", "who", "whom", "this", "that", "these", "those",
      "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
      "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
      "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
      "about", "against", "between", "into", "through", "during", "before", "after",
      "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
      "under", "again", "further", "then", "once", "how", "all", "any", "both",
      "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
      "only", "own", "same", "so", "than", "too", "very", "can", "will", "just",
      "should", "now", "show", "tell", "check", "clear", "replace", "fix",
    ]);

    const words = query
      .toLowerCase()
      .replace(/[^a-z0-9\-\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const unmatched = candidateSuggestions && candidateSuggestions.length > 0 ? candidateSuggestions : words.slice(0, 4);
    if (unmatched.length === 0) return;

    if (!isConnectedToMongo) return;

    try {
      // Find existing pending suggestion for similar raw query or create new
      const existing = await GlossarySuggestion.findOne({
        rawQuery: query.trim(),
        status: "pending",
      });

      if (existing) {
        existing.frequency += 1;
        existing.lastSearchedAt = new Date();
        await existing.save();
      } else {
        await GlossarySuggestion.create({
          rawQuery: query.trim(),
          unmatchedTerms: unmatched,
          frequency: 1,
          lastSearchedAt: new Date(),
          status: "pending",
        });
      }
    } catch (err) {
      console.warn("[GlossaryService] Failed to record glossary suggestion:", err);
    }
  }

  /**
   * Retrieves all active glossary entries.
   */
  async listGlossary(filter?: { category?: string; query?: string }): Promise<PlantGlossaryDTO[]> {
    if (!isConnectedToMongo) {
      let fixtures = [...DEFAULT_GLOSSARY_FIXTURES];
      if (filter?.category) {
        fixtures = fixtures.filter((f) => f.category === filter.category);
      }
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        fixtures = fixtures.filter(
          (f) =>
            f.term.toLowerCase().includes(q) ||
            f.canonicalTerm.toLowerCase().includes(q) ||
            f.synonyms.some((s) => s.toLowerCase().includes(q))
        );
      }
      return fixtures.map((f, i) => ({
        id: `mock-glossary-${i}`,
        term: f.term,
        canonicalTerm: f.canonicalTerm,
        equipmentTag: f.equipmentTag,
        category: f.category,
        synonyms: f.synonyms,
        plantArea: f.plantArea,
        isActive: f.isActive,
        createdAt: new Date().toISOString(),
      }));
    }

    const query: any = {};
    if (filter?.category) {
      query.category = filter.category;
    }
    if (filter?.query) {
      query.$or = [
        { term: { $regex: filter.query, $options: "i" } },
        { canonicalTerm: { $regex: filter.query, $options: "i" } },
        { synonyms: { $regex: filter.query, $options: "i" } },
        { equipmentTag: { $regex: filter.query, $options: "i" } },
      ];
    }

    const docs = await PlantGlossary.find(query).sort({ updatedAt: -1 });
    return docs.map((d) => ({
      id: d._id.toString(),
      term: d.term,
      canonicalTerm: d.canonicalTerm,
      equipmentTag: d.equipmentTag,
      category: d.category,
      synonyms: d.synonyms,
      plantArea: d.plantArea,
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt?.toISOString(),
    }));
  }

  /**
   * Creates or updates a plant glossary entry.
   */
  async createEntry(input: CreatePlantGlossaryInput, userId: string): Promise<PlantGlossaryDTO> {
    if (!isConnectedToMongo) {
      return {
        id: `mock-glossary-${Date.now()}`,
        term: input.term,
        canonicalTerm: input.canonicalTerm,
        equipmentTag: input.equipmentTag,
        category: input.category,
        synonyms: input.synonyms,
        plantArea: input.plantArea,
        isActive: input.isActive,
        createdAt: new Date().toISOString(),
      };
    }

    const userOid = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId();

    const created = await PlantGlossary.create({
      term: input.term,
      canonicalTerm: input.canonicalTerm,
      equipmentTag: input.equipmentTag,
      category: input.category,
      synonyms: input.synonyms,
      plantArea: input.plantArea,
      isActive: input.isActive,
      createdBy: userOid,
    });

    return {
      id: created._id.toString(),
      term: created.term,
      canonicalTerm: created.canonicalTerm,
      equipmentTag: created.equipmentTag,
      category: created.category,
      synonyms: created.synonyms,
      plantArea: created.plantArea,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt?.toISOString(),
    };
  }

  /**
   * Lists candidate suggestions from low-confidence searches.
   */
  async listSuggestions(): Promise<GlossarySuggestionDTO[]> {
    if (!isConnectedToMongo) {
      return [
        {
          id: "mock-sug-1",
          rawQuery: "how to clean the muck collector under IDF-400",
          unmatchedTerms: ["muck collector"],
          frequency: 4,
          lastSearchedAt: new Date().toISOString(),
          status: "pending",
          suggestedCanonical: "Ash Hopper Sump",
          createdAt: new Date().toISOString(),
        },
      ];
    }

    const docs = await GlossarySuggestion.find({ status: "pending" })
      .sort({ frequency: -1, lastSearchedAt: -1 })
      .limit(50);

    return docs.map((d) => ({
      id: d._id.toString(),
      rawQuery: d.rawQuery,
      unmatchedTerms: d.unmatchedTerms,
      frequency: d.frequency,
      lastSearchedAt: d.lastSearchedAt.toISOString(),
      status: d.status,
      suggestedCanonical: d.suggestedCanonical,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  /**
   * Approves a candidate suggestion and promotes it to the active Plant Glossary.
   */
  async approveSuggestion(
    suggestionId: string,
    entryData: CreatePlantGlossaryInput,
    userId: string
  ): Promise<PlantGlossaryDTO> {
    const created = await this.createEntry(entryData, userId);

    if (isConnectedToMongo && mongoose.Types.ObjectId.isValid(suggestionId)) {
      await GlossarySuggestion.findByIdAndUpdate(suggestionId, {
        status: "approved",
      });
    }

    return created;
  }

  /**
   * Dismisses a candidate suggestion.
   */
  async dismissSuggestion(suggestionId: string): Promise<void> {
    if (isConnectedToMongo && mongoose.Types.ObjectId.isValid(suggestionId)) {
      await GlossarySuggestion.findByIdAndUpdate(suggestionId, {
        status: "dismissed",
      });
    }
  }

  /**
   * Deletes a glossary entry.
   */
  async deleteEntry(id: string): Promise<boolean> {
    if (!isConnectedToMongo || !mongoose.Types.ObjectId.isValid(id)) return true;
    const res = await PlantGlossary.findByIdAndDelete(id);
    return Boolean(res);
  }
}

export const glossaryService = new GlossaryService();
