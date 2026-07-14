import type { Href } from "expo-router";

export const termsRoutes = {
  authAgreement: "/auth/terms-agreement" as Href,
  authService: "/auth/service-terms" as Href,
  authPrivacy: "/auth/privacy-policy" as Href,
  myPageHome: "/mypage" as Href,
  myPageService: "/mypage/service-terms" as Href,
  myPagePrivacy: "/mypage/privacy-policy" as Href,
} as const;
