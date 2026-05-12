import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/lib/storage/keys";

type ClosetState = {
  closetId: number | null;
  setClosetId: (closetId: number | null) => void;
  clearCloset: () => void;
};

export const useClosetStore = create<ClosetState>()(
  persist(
    (set) => ({
      closetId: null,
      setClosetId: (closetId) => set(() => ({ closetId })),
      clearCloset: () => set(() => ({ closetId: null })),
    }),
    {
      name: storageKeys.closet,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
