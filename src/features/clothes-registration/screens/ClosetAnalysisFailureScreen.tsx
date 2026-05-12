import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowBackIcon from "../../../../assets/arrow_back.svg";
import ClosetIcon from "../../../../assets/closet-icon.svg";
import { Button } from "@/components/common/Button";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";

function ErrorBadge() {
  return (
    <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-error">
      <Text className="font-pretendard-semibold text-[18px] leading-[28px] text-white">!</Text>
    </View>
  );
}

export function ClosetAnalysisFailureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    imageUrl: imageUrlParam,
    templateId: templateIdParam,
    predictedSections: predictedSectionsParam,
  } = useLocalSearchParams<{
    imageUrl?: string;
    templateId?: string;
    predictedSections?: string;
  }>();
  const imageUrl = getParamString(imageUrlParam);
  const templateId = getParamString(templateIdParam);
  const predictedSections = getParamString(predictedSectionsParam);

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="h-[32px] flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="뒤로가기"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <ArrowBackIcon width={24} height={24} />
        </Pressable>
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          옷장등록
        </Text>
        <View className="w-[32px]" />
      </View>

      <View className="flex-1 items-center justify-center pb-[112px]">
        <View>
          <ClosetIcon width={124} height={171} />
          <View className="absolute right-[-7px] top-[-9px]">
            <ErrorBadge />
          </View>
        </View>

        <Text className="mt-[33px] text-center font-pretendard-semibold text-[20px] leading-[28px] text-text">
          분석에 실패했습니다.
        </Text>
        <Text className="mt-[16px] text-center font-pretendard text-[12px] leading-[20px] text-text-subdued">
          재촬영 또는 직접 입력해주세요.
        </Text>
      </View>

      <View className="gap-[8px]">
        <Button
          label="재촬영"
          href={clothesRegistrationRoutes.guide}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />

        <Button
          label="사용자 입력"
          href={{
            pathname: "/closet/register/labels",
            params: {
              imageUrl: imageUrl ?? "",
              templateId: templateId ?? "",
              predictedSections: predictedSections ?? "",
            },
          }}
          variant="secondary"
          fullWidth
          className="h-[58px] border-[0.5px] border-text-subdued"
          textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        />
      </View>
    </View>
  );
}
