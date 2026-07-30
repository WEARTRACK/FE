import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkNicknameDuplicate } from "@/features/entry/api/checkNicknameDuplicate";
import { getNicknameInputState } from "@/features/entry/utils/getNicknameInputState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type UseNicknameFieldStateParams = {
  nickname: string;
  hasInteracted: boolean;
  initialNickname?: string;
};

export function useNicknameFieldState({
  nickname,
  hasInteracted,
  initialNickname = "",
}: UseNicknameFieldStateParams) {
  const normalizedInitialNickname = initialNickname.trim();
  const trimmedNickname = nickname.trim();

  const baseState = useMemo(
    () =>
      getNicknameInputState(nickname, {
        showRequiredError: hasInteracted,
      }),
    [nickname, hasInteracted],
  );

  const requiresNicknameChange = normalizedInitialNickname.length > 0;
  const hasChanged = requiresNicknameChange
    ? trimmedNickname.length > 0 && trimmedNickname !== normalizedInitialNickname
    : trimmedNickname.length > 0;
  const isEligibleForDuplicateCheck =
    baseState.canSubmit && (!requiresNicknameChange || hasChanged);
  const debouncedNickname = useDebouncedValue(nickname, 400);
  const isWaitingForDebounce = isEligibleForDuplicateCheck && debouncedNickname !== nickname;

  const {
    data: duplicateResult,
    isFetching: isCheckingDuplicate,
    isError: isDuplicateCheckError,
  } = useQuery({
    queryKey: ["nickname-duplicate", debouncedNickname],
    queryFn: () => checkNicknameDuplicate(debouncedNickname),
    enabled: isEligibleForDuplicateCheck && debouncedNickname.length > 0,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const unchangedNicknameErrorMessage =
    !baseState.errorMessage && hasInteracted && requiresNicknameChange && !hasChanged
      ? "현재 닉네임과 다른 값으로 입력해주세요."
      : undefined;

  const duplicateErrorMessage =
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    debouncedNickname === nickname &&
    duplicateResult?.isDuplicate
      ? "이미 사용 중인 닉네임이에요."
      : undefined;

  const duplicateCheckErrorMessage =
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    debouncedNickname === nickname &&
    isDuplicateCheckError
      ? "중복 확인에 실패했어요. 다시 시도해주세요."
      : undefined;

  const errorMessage =
    baseState.errorMessage ||
    unchangedNicknameErrorMessage ||
    duplicateErrorMessage ||
    duplicateCheckErrorMessage;
  const isNicknameAvailable = duplicateResult?.isDuplicate === false;

  const successMessage =
    !errorMessage &&
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    isNicknameAvailable
      ? "사용 가능한 닉네임이에요."
      : undefined;

  const canSubmit =
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    !isDuplicateCheckError &&
    isNicknameAvailable;

  return {
    trimmedNickname,
    hasChanged,
    errorMessage,
    successMessage,
    canSubmit,
  };
}
