import type { Href } from "expo-router";

export const myPageRoutes = {
  home: "/mypage" as Href,
  editNickname: "/mypage/edit-nickname" as Href,
  withdraw: "/mypage/withdraw" as Href,
} as const;
