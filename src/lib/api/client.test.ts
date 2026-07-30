import { beforeEach, describe, expect, it, vi } from "vitest";

const getStateMock = vi.fn();
const hasHydratedMock = vi.fn();
const rehydrateMock = vi.fn();
const refreshSessionTokensMock = vi.fn();

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

vi.mock("@/lib/api/tokenRefresh", () => ({
  refreshSessionTokens: refreshSessionTokensMock,
}));

function getRequestHandler(apiClient: unknown) {
  return (
    apiClient as {
      interceptors: {
        request: {
          handlers: { fulfilled: (value: unknown) => Promise<unknown> }[];
        };
      };
    }
  ).interceptors.request.handlers[0].fulfilled;
}

function getResponseErrorHandler(apiClient: unknown) {
  return (
    apiClient as {
      interceptors: {
        response: {
          handlers: { rejected: (value: unknown) => Promise<unknown> }[];
        };
      };
    }
  ).interceptors.response.handlers[0].rejected;
}

describe("apiClient auth interceptor", () => {
  beforeEach(() => {
    vi.resetModules();
    getStateMock.mockReset();
    hasHydratedMock.mockReset();
    rehydrateMock.mockReset();
    refreshSessionTokensMock.mockReset();
    hasHydratedMock.mockReturnValue(true);
    rehydrateMock.mockResolvedValue(undefined);
    getStateMock.mockReturnValue({ accessToken: "token-123" });
  });

  it("adds authorization header for onboarding endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/onboarding/status",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("normalizes a bearer-prefixed stored access token", async () => {
    getStateMock.mockReturnValue({ accessToken: "Bearer token-123" });

    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/notifications/fcm-token",
      method: "post",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("adds authorization header for fashion consumption endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

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
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/notifications/settings",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("adds authorization header for /api/members/me", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/members/me",
      method: "get",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("adds authorization header for logout requests", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/auth/logout",
      method: "post",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("does not add authorization header for public endpoints", async () => {
    const { apiClient } = await import("./client");
    const requestHandler = getRequestHandler(apiClient);

    const config = (await requestHandler({
      url: "/api/auth/social/login",
      baseURL: "https://example.com",
      headers: {},
    })) as {
      headers: { get: (name: string) => string | undefined };
    };

    expect(config.headers.get("Authorization")).toBeUndefined();
  });

  it("refreshes tokens and retries a protected request once after a 401 response", async () => {
    refreshSessionTokensMock.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const { apiClient } = await import("./client");
    const responseErrorHandler = getResponseErrorHandler(apiClient);
    const requestSpy = vi.spyOn(apiClient, "request").mockResolvedValue({
      data: { isSuccess: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    const result = await responseErrorHandler({
      config: {
        baseURL: "https://example.com",
        headers: {},
        method: "get",
        url: "/api/home",
      },
      response: {
        data: {
          code: "AUTH_401_3",
          message: "Invalid JWT token.",
        },
        status: 401,
      },
    });

    expect(refreshSessionTokensMock).toHaveBeenCalledOnce();
    expect(requestSpy).toHaveBeenCalledOnce();
    const retriedConfig = requestSpy.mock.calls[0]?.[0] as {
      headers: { get: (name: string) => string | undefined };
    };
    expect(retriedConfig.headers.get("Authorization")).toBe("Bearer new-access-token");
    expect(result).toMatchObject({
      data: { isSuccess: true },
      status: 200,
    });
  });

  it("does not refresh terminal auth requests after a 401 response", async () => {
    const { apiClient } = await import("./client");
    const responseErrorHandler = getResponseErrorHandler(apiClient);
    const requestSpy = vi.spyOn(apiClient, "request");

    await expect(
      responseErrorHandler({
        config: {
          baseURL: "https://example.com",
          headers: {},
          method: "post",
          url: "/api/auth/logout",
        },
        response: {
          data: {
            code: "AUTH_401_3",
            message: "Invalid JWT token.",
          },
          status: 401,
        },
      }),
    ).rejects.toMatchObject({
      code: "AUTH_401_3",
      message: "Invalid JWT token.",
      status: 401,
    });

    expect(refreshSessionTokensMock).not.toHaveBeenCalled();
    expect(requestSpy).not.toHaveBeenCalled();
  });
});
