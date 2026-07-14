export type ApiAuthPolicy = {
  requiresAccessToken: boolean;
  allowRefresh: boolean;
};

const PUBLIC_AUTH_POLICY: ApiAuthPolicy = {
  requiresAccessToken: false,
  allowRefresh: false,
};

const PROTECTED_AUTH_POLICY: ApiAuthPolicy = {
  requiresAccessToken: true,
  allowRefresh: true,
};

const TERMINAL_AUTH_POLICY: ApiAuthPolicy = {
  requiresAccessToken: true,
  allowRefresh: false,
};

function normalizeMethod(method: string | undefined) {
  return method?.toUpperCase() ?? "GET";
}

export function resolveApiAuthPolicy(params: { pathname: string; method?: string }): ApiAuthPolicy {
  const { pathname } = params;
  const method = normalizeMethod(params.method);

  if (pathname === "/api/auth/logout" && method === "POST") {
    return TERMINAL_AUTH_POLICY;
  }

  if (
    pathname === "/api/home" ||
    pathname.startsWith("/api/fashion-consumption/") ||
    pathname.startsWith("/api/home/") ||
    pathname.startsWith("/api/clothes") ||
    pathname.startsWith("/api/daily-reviews") ||
    pathname.startsWith("/api/weekly-reviews") ||
    pathname === "/api/closets" ||
    pathname === "/api/members/nickname/check" ||
    pathname === "/api/members/me" ||
    pathname === "/api/members/me/nickname" ||
    pathname.startsWith("/api/members/me/") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/onboarding/") ||
    pathname.startsWith("/api/closets/") ||
    pathname.startsWith("/api/clothes/")
  ) {
    return PROTECTED_AUTH_POLICY;
  }

  return PUBLIC_AUTH_POLICY;
}
