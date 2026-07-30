import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import NaverLogin from "@react-native-seoul/naver-login";

import type { SocialAuthProvider, SocialLoginPayload } from "@/features/entry/api/socialLogin";

const googleIosClientId =
  "580898159630-g9sksvq1sj8vn4vi5v54p3qaspq437lr.apps.googleusercontent.com";
const naverClientId = "pBXowk7IH0N_OHULLlJl";
const naverClientSecret = "QdlRcsSdX5";
const naverUrlScheme = "weartracknaverlogin";
const naverAppName = "WEARTRACK";

let googleConfigured = false;
let naverConfigured = false;

export class NativeSocialAuthCancelledError extends Error {
  constructor() {
    super("Native social auth was cancelled.");
    this.name = "NativeSocialAuthCancelledError";
  }
}

export function isNativeSocialAuthCancelledError(error: unknown) {
  return error instanceof NativeSocialAuthCancelledError;
}

function isCancelledNativeError(error: unknown) {
  if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";

  return code.includes("cancel") || message.includes("cancel");
}

function ensureGoogleConfigured() {
  if (googleConfigured) {
    return;
  }

  GoogleSignin.configure({
    iosClientId: googleIosClientId,
    scopes: ["email", "profile"],
  });
  googleConfigured = true;
}

function ensureNaverConfigured() {
  if (naverConfigured) {
    return;
  }

  NaverLogin.initialize({
    consumerKey: naverClientId,
    consumerSecret: naverClientSecret,
    appName: naverAppName,
    serviceUrlSchemeIOS: naverUrlScheme,
  });
  naverConfigured = true;
}

async function createKakaoLoginPayload(): Promise<SocialLoginPayload> {
  const token = await kakaoLogin();

  if (!token.accessToken) {
    throw new Error("Kakao access token is missing.");
  }

  return {
    provider: "KAKAO",
    accessToken: token.accessToken,
  };
}

async function createNaverLoginPayload(): Promise<SocialLoginPayload> {
  ensureNaverConfigured();
  const response = await NaverLogin.login();

  if (!response.isSuccess) {
    if (response.failureResponse?.isCancel) {
      throw new NativeSocialAuthCancelledError();
    }

    throw new Error(response.failureResponse?.message ?? "Naver login failed.");
  }

  const accessToken = response.successResponse?.accessToken;

  if (!accessToken) {
    throw new Error("Naver access token is missing.");
  }

  return {
    provider: "NAVER",
    accessToken,
  };
}

async function createGoogleLoginPayload(): Promise<SocialLoginPayload> {
  ensureGoogleConfigured();

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw new NativeSocialAuthCancelledError();
  }

  if (!response.data.idToken) {
    throw new Error("Google id token is missing.");
  }

  return {
    provider: "GOOGLE",
    idToken: response.data.idToken,
  };
}

async function createAppleLoginPayload(): Promise<SocialLoginPayload> {
  if (Platform.OS !== "ios" || !(await AppleAuthentication.isAvailableAsync())) {
    throw new Error("Apple login is not available on this device.");
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Apple identity token is missing.");
  }

  return {
    provider: "APPLE",
    idToken: credential.identityToken,
  };
}

export async function createNativeSocialLoginPayload(
  provider: SocialAuthProvider,
): Promise<SocialLoginPayload> {
  try {
    switch (provider) {
      case "KAKAO":
        return await createKakaoLoginPayload();
      case "NAVER":
        return await createNaverLoginPayload();
      case "GOOGLE":
        return await createGoogleLoginPayload();
      case "APPLE":
        return await createAppleLoginPayload();
    }
  } catch (error) {
    if (isCancelledNativeError(error)) {
      throw new NativeSocialAuthCancelledError();
    }

    throw error;
  }
}
