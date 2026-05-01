import type { SocialAuthProvider } from "@/features/entry/api/socialLogin";

type OAuthCallbackResult =
  | {
      type: "success";
      provider: SocialAuthProvider;
      handoffToken: string;
    }
  | {
      type: "error";
      provider: SocialAuthProvider | null;
      error: string | null;
    };

const providers: SocialAuthProvider[] = ["GOOGLE", "KAKAO", "NAVER"];

function getSearchParam(url: URL, key: string) {
  const queryValue = url.searchParams.get(key);

  if (queryValue) {
    return queryValue;
  }

  if (!url.hash) {
    return null;
  }

  return new URLSearchParams(url.hash.replace(/^#/, "")).get(key);
}

function resolveProvider(callbackUrl: URL): SocialAuthProvider | null {
  const normalizedUrl = callbackUrl.toString().toLowerCase();

  return providers.find((provider) => normalizedUrl.includes(provider.toLowerCase())) ?? null;
}

export function parseOAuthCallback(callbackUrl: string): OAuthCallbackResult | null {
  try {
    const url = new URL(callbackUrl);
    const provider = resolveProvider(url);
    const handoffToken = getSearchParam(url, "handoff");
    const error = getSearchParam(url, "error");

    if (error) {
      return {
        type: "error",
        provider,
        error,
      };
    }

    if (!provider || !handoffToken) {
      return null;
    }

    return {
      type: "success",
      provider,
      handoffToken,
    };
  } catch {
    return null;
  }
}
