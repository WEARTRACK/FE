import { normalizeAccessToken, normalizeRefreshToken } from "@/lib/api/authToken";

export type SessionStoreData = {
  launchCount: number;
  memberId: number | null;
  nickname: string | null;
  requiredTermsAgreed: boolean;
  profileCompleted: boolean;
  accessToken: string | null;
  refreshToken: string | null;
};

export const defaultSessionStoreData: SessionStoreData = {
  launchCount: 1,
  memberId: null,
  nickname: null,
  requiredTermsAgreed: false,
  profileCompleted: false,
  accessToken: null,
  refreshToken: null,
};

export function hasValidAuthenticatedSession(
  session: Pick<SessionStoreData, "memberId" | "accessToken" | "refreshToken">,
) {
  return session.memberId !== null && Boolean(session.accessToken || session.refreshToken);
}

function normalizeNullableAccessToken(token: string) {
  const normalizedToken = normalizeAccessToken(token);
  return normalizedToken.length > 0 ? normalizedToken : null;
}

function normalizeNullableRefreshToken(token: string) {
  const normalizedToken = normalizeRefreshToken(token);
  return normalizedToken.length > 0 ? normalizedToken : null;
}

export function normalizePersistedSessionState(value: unknown): SessionStoreData {
  const session =
    value && typeof value === "object" ? (value as Partial<SessionStoreData>) : undefined;

  return {
    launchCount:
      typeof session?.launchCount === "number"
        ? session.launchCount
        : defaultSessionStoreData.launchCount,
    memberId:
      typeof session?.memberId === "number" ? session.memberId : defaultSessionStoreData.memberId,
    nickname:
      typeof session?.nickname === "string" || session?.nickname === null
        ? session.nickname
        : defaultSessionStoreData.nickname,
    requiredTermsAgreed:
      typeof session?.requiredTermsAgreed === "boolean"
        ? session.requiredTermsAgreed
        : defaultSessionStoreData.requiredTermsAgreed,
    profileCompleted:
      typeof session?.profileCompleted === "boolean"
        ? session.profileCompleted
        : defaultSessionStoreData.profileCompleted,
    accessToken:
      typeof session?.accessToken === "string" || session?.accessToken === null
        ? session.accessToken === null
          ? null
          : normalizeNullableAccessToken(session.accessToken)
        : defaultSessionStoreData.accessToken,
    refreshToken:
      typeof session?.refreshToken === "string" || session?.refreshToken === null
        ? session.refreshToken === null
          ? null
          : normalizeNullableRefreshToken(session.refreshToken)
        : defaultSessionStoreData.refreshToken,
  };
}

export const migratePersistedSessionState = normalizePersistedSessionState;

export function mergeSessionStoreData(
  currentState: SessionStoreData,
  persistedState: unknown,
): SessionStoreData {
  return {
    ...currentState,
    ...normalizePersistedSessionState(persistedState),
  };
}
