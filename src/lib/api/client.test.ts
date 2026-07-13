import { beforeEach, describe, expect, it, vi } from "vitest";

const getStateMock = vi.fn();
const hasHydratedMock = vi.fn();
const rehydrateMock = vi.fn();

vi.mock("@/config/env", () => ({
  env: {
    apiBaseUrl: "https://example.com",
  },
}));

vi.mock("@/stores/useSessionStore", () => ({
  useSessionStore: Object.assign(vi.fn(), {
    getState: getStateMock,
    persist: {
      hasHydrated: hasHydratedMock,
      rehydrate: rehydrateMock,
    },
  }),
}));

describe("apiClient auth interceptor", () => {
  beforeEach(() => {
    vi.resetModules();
    getStateMock.mockReset();
    hasHydratedMock.mockReset();
    rehydrateMock.mockReset();
    hasHydratedMock.mockReturnValue(true);
    rehydrateMock.mockResolvedValue(undefined);
    getStateMock.mockReturnValue({ accessToken: "token-123" });
  });

  it("adds authorization header for onboarding endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = (
      apiClient.interceptors.request as unknown as {
        handlers: { fulfilled: (value: unknown) => Promise<unknown> }[];
      }
    ).handlers[0].fulfilled;

    const config = (await requestHandler({
      url: "/api/onboarding/status",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("adds authorization header for fashion consumption endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = (
      apiClient.interceptors.request as unknown as {
        handlers: { fulfilled: (value: unknown) => Promise<unknown> }[];
      }
    ).handlers[0].fulfilled;

    const config = (await requestHandler({
      url: "/api/fashion-consumption/reports/weekly/current",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("adds authorization header for notification endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = (
      apiClient.interceptors.request as unknown as {
        handlers: { fulfilled: (value: unknown) => Promise<unknown> }[];
      }
    ).handlers[0].fulfilled;

    const config = (await requestHandler({
      url: "/api/notifications/settings",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("does not add authorization header for public endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = (
      apiClient.interceptors.request as unknown as {
        handlers: { fulfilled: (value: unknown) => Promise<unknown> }[];
      }
    ).handlers[0].fulfilled;

    const config = (await requestHandler({
      url: "/api/auth/social/login",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBeUndefined();
  });
});
