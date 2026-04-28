type CheckNicknameDuplicateResponse = {
  isDuplicate: boolean;
};

const duplicatedNicknameSamples = new Set(["관리자", "weartrack", "옷잘알"]);

function normalizeNickname(value: string) {
  return value.trim().toLowerCase();
}

export async function checkNicknameDuplicate(
  nickname: string,
): Promise<CheckNicknameDuplicateResponse> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const normalizedNickname = normalizeNickname(nickname);

  return {
    isDuplicate: duplicatedNicknameSamples.has(normalizedNickname),
  };
}
