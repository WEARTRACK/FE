import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/lib/storage/keys";

type SessionState = {
  launchCount: number;
  incrementLaunchCount: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      launchCount: 1,
      incrementLaunchCount: () =>
        set((state) => ({
          launchCount: state.launchCount + 1,
        })),
    }),
    {
      name: storageKeys.session,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
