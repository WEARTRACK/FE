import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAccessToken, normalizeRefreshToken } from "@/lib/api/authToken";
import { storageKeys } from "@/lib/storage/keys";
import { flushSessionStorageWrites, sessionStorage } from "@/lib/storage/sessionStorage";
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
  updateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  updateProfile: (profile: SessionProfilePatch) => void;
  clearSession: () => Promise<void>;
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
      updateTokens: (tokens) =>
        set(() => ({
          accessToken: normalizeAccessToken(tokens.accessToken),
          refreshToken: normalizeRefreshToken(tokens.refreshToken),
        })),
      updateProfile: (profile) =>
        set((state) => ({
          nickname: profile.nickname ?? state.nickname,
          requiredTermsAgreed: profile.requiredTermsAgreed ?? state.requiredTermsAgreed,
          profileCompleted: profile.profileCompleted ?? state.profileCompleted,
        })),
      clearSession: async () => {
        set(() => ({
          memberId: null,
          nickname: null,
          requiredTermsAgreed: false,
          profileCompleted: false,
          accessToken: null,
          refreshToken: null,
        }));
        await flushSessionStorageWrites();
      },
    }),
    {
      name: storageKeys.session,
      version: 2,
      migrate: migratePersistedSessionState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...mergeSessionStoreData(currentState, persistedState),
      }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
