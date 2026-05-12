import type { PredictedClosetSection } from "@/features/clothes-registration/api/uploadClosetPhoto";

export function parseNumericParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function serializePredictedSections(sections: PredictedClosetSection[]) {
  return JSON.stringify(sections);
}

export function parsePredictedSections(value: string | string[] | undefined): PredictedClosetSection[] {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((section): section is PredictedClosetSection => {
        if (!section || typeof section !== "object") {
          return false;
        }

        const candidate = section as Record<string, unknown>;
        return typeof candidate.sectionOrder === "number" && typeof candidate.sectionName === "string";
      })
      .sort((left, right) => left.sectionOrder - right.sectionOrder);
  } catch {
    return [];
  }
}
