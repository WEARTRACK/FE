import { resolveApiAuthPolicy } from "@/lib/api/authPolicy";
import { createBearerAuthorizationHeader, normalizeAccessToken } from "@/lib/api/authToken";
import { ApiError } from "@/lib/api/errors";
import { refreshSessionTokens } from "@/lib/api/tokenRefresh";
import { useSessionStore } from "@/stores/useSessionStore";

function resolveRequestPathname(input: RequestInfo | URL) {
  const url = typeof input === "string" || input instanceof URL ? input.toString() : input.url;

  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function createAuthorizedInit(init: RequestInit, accessToken: string): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("Authorization", createBearerAuthorizationHeader(accessToken));

  return {
    ...init,
    headers,
  };
}

async function resolveAccessToken() {
  if (!useSessionStore.persist.hasHydrated()) {
    await useSessionStore.persist.rehydrate();
  }

  const session = useSessionStore.getState();

  if (session.accessToken) {
    return normalizeAccessToken(session.accessToken);
  }

  if (session.refreshToken) {
    return (await refreshSessionTokens()).accessToken;
  }

  throw new ApiError({
    code: "AUTH_REQUIRED",
    message: "인증이 필요합니다.",
    status: 401,
  });
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const accessToken = await resolveAccessToken();
  const response = await fetch(input, createAuthorizedInit(init, accessToken));

  if (response.status !== 401) {
    return response;
  }

  const authPolicy = resolveApiAuthPolicy({
    pathname: resolveRequestPathname(input),
    method: init.method,
  });

  if (!authPolicy.allowRefresh) {
    return response;
  }

  try {
    const tokens = await refreshSessionTokens();
    return fetch(input, createAuthorizedInit(init, tokens.accessToken));
  } catch {
    return response;
  }
}
