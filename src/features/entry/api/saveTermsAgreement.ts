import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

type SaveTermsAgreementResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: null;
};

function isSaveTermsAgreementResponse(value: unknown): value is SaveTermsAgreementResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    candidate.result === null
  );
}

export async function saveTermsAgreement() {
  const response = await apiClient.post<SaveTermsAgreementResponse>(
    "/api/members/me/terms-agreement",
    {
      requiredTermsAgreed: true,
    },
  );

  if (!isSaveTermsAgreementResponse(response.data)) {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "약관 동의 응답 형식이 올바르지 않아요.",
      status: null,
      details: response.data,
    });
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: 200,
      details: response.data.result,
    });
  }

  return response.data;
}
