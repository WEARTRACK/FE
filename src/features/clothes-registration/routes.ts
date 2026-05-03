import type { Href } from "expo-router";

export const clothesRegistrationRoutes = {
  guide: "/closet/register" as Href,
  preview: "/closet/register/preview" as Href,
  analyzing: "/closet/register/analyzing" as Href,
  result: "/closet/register/result" as Href,
  failure: "/closet/register/failure" as Href,
  labels: "/closet/register/labels" as Href,
  complete: "/closet/register/complete" as Href,
} as const;
