type NicknameInputState = {
  errorMessage?: string;
  successMessage?: string;
  canSubmit: boolean;
};

const nicknamePattern = /^[A-Za-z0-9가-힣]+$/;

type NicknameInputStateOptions = {
  showRequiredError?: boolean;
};

export function getNicknameInputState(
  nickname: string,
  options?: NicknameInputStateOptions,
): NicknameInputState {
  const showRequiredError = options?.showRequiredError ?? false;
  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length === 0) {
    return {
      errorMessage: showRequiredError ? "닉네임을 입력해주세요." : undefined,
      successMessage: undefined,
      canSubmit: false,
    };
  }

  if (!nicknamePattern.test(nickname)) {
    return {
      errorMessage: "한글, 영문, 숫자만 입력 가능해요.",
      successMessage: undefined,
      canSubmit: false,
    };
  }

  if (nickname.length < 2 || nickname.length > 5) {
    return {
      errorMessage: "2~5자 닉네임을 입력해주세요.",
      successMessage: undefined,
      canSubmit: false,
    };
  }

  return {
    errorMessage: undefined,
    successMessage: "사용 가능한 닉네임 형식이에요.",
    canSubmit: true,
  };
}
