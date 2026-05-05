import type { Href } from "expo-router";

export const clothesRegistrationRoutes = {
  guide: "/closet/register" as Href,
  preview: "/closet/register/preview" as Href,
  analyzing: "/closet/register/analyzing" as Href,
  result: "/closet/register/result" as Href,
  failure: "/closet/register/failure" as Href,
  labels: "/closet/register/labels" as Href,
  complete: "/closet/register/complete" as Href,
  clothesGuide: "/clothes/register" as Href,
  clothesPreview: "/clothes/register/preview" as Href,
  clothesAnalyzing: "/clothes/register/analyzing" as Href,
  clothesResult: "/clothes/register/result" as Href,
  clothesAdditionalInfo: "/clothes/register/additional-info" as Href,
  clothesStyle: "/clothes/register/style" as Href,
  clothesFailure: "/clothes/register/failure" as Href,
  clothesComplete: "/clothes/register/complete" as Href,
} as const;
