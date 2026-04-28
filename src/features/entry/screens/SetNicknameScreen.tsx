import { useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import SignupInput from "@/components/common/SignupInput";
import { checkNicknameDuplicate } from "@/features/entry/api/checkNicknameDuplicate";
import { saveNickname } from "@/features/entry/api/saveNickname";
import { getNicknameInputState } from "@/features/entry/utils/getNicknameInputState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function SetNicknameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const debouncedNickname = useDebouncedValue(nickname, 400);

  const baseState = useMemo(
    () =>
      getNicknameInputState(nickname, {
        showRequiredError: hasInteracted,
      }),
    [nickname, hasInteracted],
  );

  const isEligibleForDuplicateCheck = baseState.canSubmit;
  const isWaitingForDebounce = isEligibleForDuplicateCheck && debouncedNickname !== nickname;

  const { data: duplicateResult, isFetching: isCheckingDuplicate } = useQuery({
    queryKey: ["nickname-duplicate", debouncedNickname],
    queryFn: () => checkNicknameDuplicate(debouncedNickname),
    enabled: isEligibleForDuplicateCheck && debouncedNickname.length > 0,
    staleTime: 0,
    gcTime: 0,
  });

  const duplicateErrorMessage =
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    debouncedNickname === nickname &&
    duplicateResult?.isDuplicate
      ? "이미 사용 중인 닉네임이에요."
      : undefined;

  const errorMessage = baseState.errorMessage || duplicateErrorMessage;
  const successMessage =
    !errorMessage &&
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    duplicateResult &&
    !duplicateResult.isDuplicate
      ? "사용 가능한 닉네임이에요."
      : undefined;
  const canSubmit =
    isEligibleForDuplicateCheck &&
    !isWaitingForDebounce &&
    !isCheckingDuplicate &&
    Boolean(duplicateResult) &&
    !duplicateResult?.isDuplicate;
  const { mutate: saveNicknameMutate, isPending: isSavingNickname } = useMutation({
    mutationFn: saveNickname,
    onSuccess: () => {
      router.replace("/(main)/home");
    },
    onError: () => {
      Alert.alert("저장에 실패했어요. 다시 시도해주세요.");
    },
  });

  const handleComplete = () => {
    if (isSavingNickname) {
      return;
    }

    if (!canSubmit) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      return;
    }

    saveNicknameMutate({
      nickname: nickname.trim(),
    });
  };

  return (
    <View
      className="flex-1 bg-bg-light px-6 pt-[131px]"
      style={{ paddingBottom: insets.bottom + 20 }}
    >
      <View>
        <Text className="text-center font-pretendard-semibold text-headline text-text">
          사용하실 닉네임을 입력해주세요.
        </Text>
        <Text className="mt-3 text-center font-pretendard text-subhead text-text-subdued">
          닉네임은 회원가입 이후에도 수정할 수 있습니다.
        </Text>
      </View>

      <View className="mt-[79px]">
        <SignupInput
          label="닉네임"
          placeholder="한글, 영문, 숫자 조합만 가능"
          maxLength={5}
          value={nickname}
          onChangeText={(value) => {
            setNickname(value);
            if (!hasInteracted) {
              setHasInteracted(true);
            }
          }}
          onBlur={() => {
            if (!hasInteracted) {
              setHasInteracted(true);
            }
          }}
          error={errorMessage}
          isSuccess={Boolean(successMessage)}
          successMessage={successMessage}
          autoCapitalize="none"
          autoCorrect={false}
          labelClassName="mb-1 text-[12px] font-pretendard-semibold"
          inputClassName="h-[46px] px-[12px] py-0 text-[12px]"
          messageTextClassName="text-[10px]"
          counterClassName="text-[10px]"
          successMessageClassName="text-text-subdued"
        />
      </View>

      <View className="mt-auto">
        <Button
          label="옷장 관리 시작하기"
          onPress={handleComplete}
          fullWidth
          disabled={!canSubmit || isSavingNickname}
          className="h-[52px] rounded-[6px]"
          textClassName="text-[14px]"
        />
      </View>
    </View>
  );
}
