import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SocialAuthProvider } from "@/features/entry/api/socialLogin";
import { useSocialAuthFlow } from "@/features/entry/hooks/useSocialAuthFlow";
import KakaoLogo from "../../../../assets/kakao.svg";
import SocialAppleIcon from "../../../../assets/Social-Apple.svg";
import SocialGoogleIcon from "../../../../assets/Social-Google.svg";
import SocialNaverIcon from "../../../../assets/Social-Naver.svg";

type SocialActionButtonsProps = {
  mode: "login" | "signup";
};

type SocialIconButtonProps = {
  accessibilityLabel: string;
  backgroundColor?: string;
  disabled: boolean;
  Icon: typeof SocialAppleIcon;
  iconHeight?: number;
  iconWidth?: number;
  onPress: () => void;
};

function SocialIconButton({
  accessibilityLabel,
  backgroundColor,
  disabled,
  Icon,
  iconHeight = 44,
  iconWidth = 44,
  onPress,
}: SocialIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 44,
        opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
        width: 44,
      })}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor,
          borderRadius: 22,
          height: 44,
          justifyContent: "center",
          overflow: "hidden",
          width: 44,
        }}
      >
        <Icon width={iconWidth} height={iconHeight} />
      </View>
    </Pressable>
  );
}

export function SocialActionButtons({ mode }: SocialActionButtonsProps) {
  const panelLabel = mode === "login" ? "SNS 계정으로 로그인" : "SNS 계정으로 시작하기";
  const actionLabel = mode === "login" ? "로그인" : "시작하기";
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const insets = useSafeAreaInsets();
  const { isPending, startSocialAuth } = useSocialAuthFlow({
    successHref: mode === "signup" ? "/auth/sign-up-success" : undefined,
  });
  const panelBottomPadding = Math.max(insets.bottom + 55, 70);

  const handleSocialPress = (provider: SocialAuthProvider) => {
    void startSocialAuth(provider);
  };

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    void AppleAuthentication.isAvailableAsync().then(setIsAppleLoginAvailable);
  }, []);

  return (
    <View
      className="absolute bottom-0 items-center bg-[#30343F] px-6 pt-[31px]"
      style={{
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        left: 24,
        paddingBottom: panelBottomPadding,
        right: 24,
      }}
    >
      <Text className="font-pretendard text-[15px] leading-[20px] text-primary">{panelLabel}</Text>

      <View className="mt-[24px] flex-row items-center justify-center gap-[24px]">
        {isAppleLoginAvailable ? (
          <SocialIconButton
            accessibilityLabel={`Apple로 ${actionLabel}`}
            disabled={isPending}
            Icon={SocialAppleIcon}
            onPress={() => handleSocialPress("APPLE")}
          />
        ) : null}

        <SocialIconButton
          accessibilityLabel={`네이버로 ${actionLabel}`}
          disabled={isPending}
          Icon={SocialNaverIcon}
          onPress={() => handleSocialPress("NAVER")}
        />

        <SocialIconButton
          accessibilityLabel={`카카오로 ${actionLabel}`}
          backgroundColor="#FFE812"
          disabled={isPending}
          Icon={KakaoLogo}
          iconHeight={18}
          iconWidth={21}
          onPress={() => handleSocialPress("KAKAO")}
        />

        <SocialIconButton
          accessibilityLabel={`구글로 ${actionLabel}`}
          disabled={isPending}
          Icon={SocialGoogleIcon}
          onPress={() => handleSocialPress("GOOGLE")}
        />
      </View>
    </View>
  );
}
