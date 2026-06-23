import { beforeAll, describe, expect, it } from "vitest";

import { ApiError } from "../../../lib/api/errors";
import type { ClosetSectionId } from "../types/closet-layout";

let mapServerCategoryToClosetCategory: (rawCategory: string) => string;
let mapServerColorToClosetColor: (rawColor: string) => string;
let resolveClosetImageUrl: (rawImageUrl: string) => string;
let mapApiSectionIdToClosetSectionId: (rawSectionId: number) => string;
let mapClosetSectionIdToApiSectionId: (sectionId: ClosetSectionId) => number;
let mapApiTemplateIdToClosetTemplateId: (rawTemplateId: number) => string;

beforeAll(async () => {
  process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

  const mappers = await import("./closet-api-mappers");

  mapServerCategoryToClosetCategory = mappers.mapServerCategoryToClosetCategory;
  mapServerColorToClosetColor = mappers.mapServerColorToClosetColor;
  resolveClosetImageUrl = mappers.resolveClosetImageUrl;
  mapApiSectionIdToClosetSectionId = mappers.mapApiSectionIdToClosetSectionId;
  mapClosetSectionIdToApiSectionId = mappers.mapClosetSectionIdToApiSectionId;
  mapApiTemplateIdToClosetTemplateId = mappers.mapApiTemplateIdToClosetTemplateId;
});

describe("closet-api-mappers", () => {
  it("normalizes server aliases", () => {
    expect(mapServerCategoryToClosetCategory("Knite")).toBe("knit");
    expect(mapServerColorToClosetColor("GREY")).toBe("gray");
  });

  it("returns server raw value when mapping misses", () => {
    expect(mapServerCategoryToClosetCategory("OUTER")).toBe("OUTER");
  });

  it("converts relative image URL to absolute URL", () => {
    const resolved = resolveClosetImageUrl("/uploads/image.png");

    expect(resolved.startsWith("http")).toBe(true);
    expect(resolved.endsWith("/uploads/image.png")).toBe(true);
  });

  it("converts relative image URL without leading slash", () => {
    const resolved = resolveClosetImageUrl("uploads/image.png");

    expect(resolved).toBe("http://localhost:3000/uploads/image.png");
  });

  it("allows absolute image URL when host matches base URL", () => {
    const resolved = resolveClosetImageUrl("https://localhost:3000/uploads/image.png");

    expect(resolved).toBe("https://localhost:3000/uploads/image.png");
  });

  it("rejects protocol-relative image URL when host differs from base URL", () => {
    expect(() => resolveClosetImageUrl("//cdn.example.com/image.png")).toThrowError(ApiError);
  });

  it("throws error when image URL is empty", () => {
    expect(() => resolveClosetImageUrl("   ")).toThrowError(ApiError);
  });

  it("maps api section id to closet section id", () => {
    expect(mapApiSectionIdToClosetSectionId(3)).toBe("section-3");
  });

  it("throws when api section id cannot be mapped", () => {
    expect(() => mapApiSectionIdToClosetSectionId(99)).toThrowError(ApiError);
  });

  it("maps closet section id to api section id", () => {
    expect(mapClosetSectionIdToApiSectionId("section-8")).toBe(8);
  });

  it("maps api template id to closet template id", () => {
    expect(mapApiTemplateIdToClosetTemplateId(5)).toBe("LAYOUT_4");
    expect(mapApiTemplateIdToClosetTemplateId(10)).toBe("LAYOUT_9");
  });
});
