import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/lib/storage/keys";

type SessionState = {
  launchCount: number;
  accessToken: string | null;
  incrementLaunchCount: () => void;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      launchCount: 1,
      accessToken: null,
      incrementLaunchCount: () =>
        set((state) => ({
          launchCount: state.launchCount + 1,
        })),
      setAccessToken: (token) =>
        set(() => ({
          accessToken: token,
        })),
      clearAccessToken: () =>
        set(() => ({
          accessToken: null,
        })),
    }),
    {
      name: storageKeys.session,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
