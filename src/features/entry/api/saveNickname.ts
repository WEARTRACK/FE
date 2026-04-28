type SaveNicknamePayload = {
  nickname: string;
};

type SaveNicknameResponse = {
  isSuccess: true;
};

export async function saveNickname({
  nickname,
}: SaveNicknamePayload): Promise<SaveNicknameResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 테스트용 실패 케이스: 저장 실패 분기 검증을 위해 남겨둠
  if (nickname.trim().toLowerCase() === "fail") {
    throw new Error("SAVE_NICKNAME_FAILED");
  }

  return {
    isSuccess: true,
  };
}
