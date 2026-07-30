import { ApiError } from "@/lib/api/errors";

export function isMemberProfileAuthError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === "AUTH_REQUIRED" ||
    error.code === "AUTH_403_1" ||
    error.code === "MEMBER_404_1" ||
    error.status === 401 ||
    error.status === 403
  );
}

export function getMemberProfileErrorMessage(
  error: unknown,
  fallbackMessage = "내 정보를 불러오지 못했어요. 다시 시도해주세요.",
) {
  if (error instanceof ApiError && error.code === "NETWORK_ERROR") {
    return "네트워크 연결을 확인해주세요.";
  }

  return fallbackMessage;
}
