const bearerPrefixPattern = /^Bearer\s+/i;

export function normalizeAccessToken(token: string) {
  return token.trim().replace(bearerPrefixPattern, "").trim();
}

export function normalizeRefreshToken(token: string) {
  return token.trim();
}

export function createBearerAuthorizationHeader(accessToken: string) {
  return `Bearer ${normalizeAccessToken(accessToken)}`;
}
