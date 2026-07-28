import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";

import { Button } from "@/components/common/Button";
import { useSocialAuthFlow } from "@/features/entry/hooks/useSocialAuthFlow";
import AppleLogo from "../../../../assets/apple.svg";
import GoogleLogo from "../../../../assets/google.svg";
import KakaoLogo from "../../../../assets/kakao.svg";
import NaverLogo from "../../../../assets/naver.svg";

type SocialActionButtonsProps = {
  mode: "login" | "signup";
};

export function SocialActionButtons({ mode }: SocialActionButtonsProps) {
  const suffix = mode === "login" ? "로그인" : "시작하기";
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const { isPending, startSocialAuth } = useSocialAuthFlow({
    successHref: mode === "signup" ? "/auth/sign-up-success" : undefined,
  });

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    void AppleAuthentication.isAvailableAsync().then(setIsAppleLoginAvailable);
  }, []);

  return (
    <View className="w-[345px] gap-3 self-center">
      <Button
        label={`카카오로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-[#FFE812] bg-[#FFE812]"
        textClassName="font-pretendard-semibold text-[18px] text-text"
        leadingIcon={<KakaoLogo width={24} height={22} />}
        disabled={isPending}
        onPress={() => void startSocialAuth("KAKAO")}
      />
      <Button
        label={`구글로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-cool bg-white"
        textClassName="font-pretendard-semibold text-[18px] text-text"
        leadingIcon={<GoogleLogo width={24} height={24} />}
        disabled={isPending}
        onPress={() => void startSocialAuth("GOOGLE")}
      />
      <Button
        label={`네이버로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-[#03C75A] bg-[#03C75A]"
        textClassName="font-pretendard-semibold text-[18px] text-white"
        leadingIcon={<NaverLogo width={36} height={36} />}
        leadingIconClassName="left-[5px]"
        disabled={isPending}
        onPress={() => void startSocialAuth("NAVER")}
      />
      {isAppleLoginAvailable ? (
        <Button
          label={`애플로 ${suffix}`}
          variant="secondary"
          size="lg"
          fullWidth
          className="border-[#373536] bg-[#373536]"
          textClassName="font-pretendard-semibold text-[18px] text-white"
          leadingIcon={<AppleLogo width={34} height={34} />}
          leadingIconClassName="left-[5px]"
          disabled={isPending}
          onPress={() => void startSocialAuth("APPLE")}
        />
      ) : null}
    </View>
  );
}
