import { View } from "react-native";

import { Button } from "@/components/common/Button";
import GoogleLogo from "../../../../assets/google.svg";
import KakaoLogo from "../../../../assets/kakao.svg";
import NaverLogo from "../../../../assets/naver.svg";

type SocialActionButtonsProps = {
  mode: "login" | "signup";
};

export function SocialActionButtons({ mode }: SocialActionButtonsProps) {
  const suffix = mode === "login" ? "로그인" : "시작하기";

  return (
    <View className="w-[345px] gap-3 self-center">
      <Button
        label={`카카오로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-[#FFE812] bg-[#FFE812]"
        textClassName="text-text"
        leadingIcon={<KakaoLogo width={24} height={22} />}
      />
      <Button
        label={`구글로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-cool bg-white"
        textClassName="text-text"
        leadingIcon={<GoogleLogo width={24} height={24} />}
      />
      <Button
        label={`네이버로 ${suffix}`}
        variant="secondary"
        size="lg"
        fullWidth
        className="border-[#03C75A] bg-[#03C75A]"
        textClassName="text-white"
        leadingIcon={<NaverLogo width={36} height={36} />}
        leadingIconClassName="left-[5px]"
      />
    </View>
  );
}
