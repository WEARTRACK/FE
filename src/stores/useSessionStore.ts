import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAccessToken, normalizeRefreshToken } from "@/lib/api/authToken";
import { storageKeys } from "@/lib/storage/keys";
import {
  defaultSessionStoreData,
  mergeSessionStoreData,
  migratePersistedSessionState,
  type SessionStoreData,
} from "@/stores/sessionState";

type SessionProfilePatch = Partial<
  Pick<SessionStoreData, "nickname" | "requiredTermsAgreed" | "profileCompleted">
>;

type SessionState = SessionStoreData & {
  incrementLaunchCount: () => void;
  setSession: (session: {
    memberId: number;
    nickname: string | null;
    requiredTermsAgreed: boolean;
    profileCompleted: boolean;
    accessToken: string;
    refreshToken: string;
  }) => void;
  updateProfile: (profile: SessionProfilePatch) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...defaultSessionStoreData,
      incrementLaunchCount: () =>
        set((state) => ({
          launchCount: state.launchCount + 1,
        })),
      setSession: (session) =>
        set(() => ({
          memberId: session.memberId,
          nickname: session.nickname,
          requiredTermsAgreed: session.requiredTermsAgreed,
          profileCompleted: session.profileCompleted,
          accessToken: normalizeAccessToken(session.accessToken),
          refreshToken: normalizeRefreshToken(session.refreshToken),
        })),
      updateProfile: (profile) =>
        set((state) => ({
          nickname: profile.nickname ?? state.nickname,
          requiredTermsAgreed: profile.requiredTermsAgreed ?? state.requiredTermsAgreed,
          profileCompleted: profile.profileCompleted ?? state.profileCompleted,
        })),
      clearSession: () =>
        set(() => ({
          memberId: null,
          nickname: null,
          requiredTermsAgreed: false,
          profileCompleted: false,
          accessToken: null,
          refreshToken: null,
        })),
    }),
    {
      name: storageKeys.session,
      version: 1,
      migrate: migratePersistedSessionState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...mergeSessionStoreData(currentState, persistedState),
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
