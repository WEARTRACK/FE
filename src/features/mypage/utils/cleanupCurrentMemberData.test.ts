import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";

const mocks = vi.hoisted(() => ({
  clearQueryCache: vi.fn(),
  clearCloset: vi.fn(),
  resetClosetRegistrationDraft: vi.fn(),
  resetShoppingMallRegistrationDraft: vi.fn(),
  resetQuestRegistrationState: vi.fn(),
  clearSocialAuthIntent: vi.fn(),
  clearNotificationTokenSyncStateForMember: vi.fn(),
  clearShoppingMallTermsAgreement: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock("@/features/clothes-registration/data/shopping-mall-terms-agreement", () => ({
  clearShoppingMallTermsAgreement: mocks.clearShoppingMallTermsAgreement,
}));

vi.mock("@/features/entry/oauth/socialAuthIntentStorage", () => ({
  clearSocialAuthIntent: mocks.clearSocialAuthIntent,
}));

vi.mock("@/features/notifications/utils/notification-token-sync", () => ({
  clearNotificationTokenSyncStateForMember: mocks.clearNotificationTokenSyncStateForMember,
}));

vi.mock("@/stores/useClosetRegistrationStore", () => ({
  useClosetRegistrationStore: {
    getState: () => ({ resetDraft: mocks.resetClosetRegistrationDraft }),
  },
}));

vi.mock("@/stores/useClosetStore", () => ({
  useClosetStore: {
    getState: () => ({ clearCloset: mocks.clearCloset }),
  },
}));

vi.mock("@/stores/useQuestRegistrationStore", () => ({
  useQuestRegistrationStore: {
    getState: () => ({ resetState: mocks.resetQuestRegistrationState }),
  },
}));

vi.mock("@/stores/useSessionStore", () => ({
  useSessionStore: {
    getState: () => ({ clearSession: mocks.clearSession }),
  },
}));

vi.mock("@/stores/useShoppingMallRegistrationStore", () => ({
  useShoppingMallRegistrationStore: {
    getState: () => ({ resetDraft: mocks.resetShoppingMallRegistrationDraft }),
  },
}));

describe("cleanupCurrentMemberData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears all member data by default", async () => {
    const { cleanupCurrentMemberData } = await import("./cleanupCurrentMemberData");
    const queryClient = { clear: mocks.clearQueryCache } as unknown as QueryClient;

    await cleanupCurrentMemberData({ memberId: 42, queryClient });

    expect(mocks.clearQueryCache).toHaveBeenCalledOnce();
    expect(mocks.clearCloset).toHaveBeenCalledOnce();
    expect(mocks.resetClosetRegistrationDraft).toHaveBeenCalledOnce();
    expect(mocks.resetShoppingMallRegistrationDraft).toHaveBeenCalledOnce();
    expect(mocks.resetQuestRegistrationState).toHaveBeenCalledOnce();
    expect(mocks.clearSocialAuthIntent).toHaveBeenCalledOnce();
    expect(mocks.clearNotificationTokenSyncStateForMember).toHaveBeenCalledWith(42);
    expect(mocks.clearShoppingMallTermsAgreement).toHaveBeenCalledWith(42);
    expect(mocks.clearSession).toHaveBeenCalledOnce();
  });

  it("preserves notification token sync state when requested", async () => {
    const { cleanupCurrentMemberData } = await import("./cleanupCurrentMemberData");
    const queryClient = { clear: mocks.clearQueryCache } as unknown as QueryClient;

    await cleanupCurrentMemberData({
      memberId: 42,
      queryClient,
      skipNotificationTokenClear: true,
    });

    expect(mocks.clearNotificationTokenSyncStateForMember).not.toHaveBeenCalled();
    expect(mocks.clearSocialAuthIntent).toHaveBeenCalledOnce();
    expect(mocks.clearShoppingMallTermsAgreement).toHaveBeenCalledWith(42);
    expect(mocks.clearSession).toHaveBeenCalledOnce();
  });
});
