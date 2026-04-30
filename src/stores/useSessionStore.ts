import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/lib/storage/keys";

type SessionState = {
  launchCount: number;
  memberId: number | null;
  nickname: string | null;
  profileCompleted: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  incrementLaunchCount: () => void;
  setSession: (session: {
    memberId: number;
    nickname: string | null;
    profileCompleted: boolean;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      launchCount: 1,
      memberId: null,
      nickname: null,
      profileCompleted: false,
      accessToken: null,
      refreshToken: null,
      incrementLaunchCount: () =>
        set((state) => ({
          launchCount: state.launchCount + 1,
        })),
      setSession: (session) =>
        set(() => ({
          memberId: session.memberId,
          nickname: session.nickname,
          profileCompleted: session.profileCompleted,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        })),
      clearSession: () =>
        set(() => ({
          memberId: null,
          nickname: null,
          profileCompleted: false,
          accessToken: null,
          refreshToken: null,
        })),
    }),
    {
      name: storageKeys.session,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
