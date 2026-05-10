import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { CommonHeader } from "@/components/common/CommonHeader";
import { getClosetTemplateSections } from "@/features/clothes-registration/screens/closet-template-data";

function AnalysisSummaryCard({ sectionCount }: { sectionCount: number }) {
  return (
    <View className="h-[109px] items-center justify-center rounded-xl border-[0.5px] border-blue-3 bg-blue-1">
      <Text className="font-pretendard text-[12px] leading-[20px] text-bg-dark">분석결과</Text>
      <Text className="mt-[12px] font-pretendard-semibold text-[20px] leading-[30px] text-text-subdued">
        총 <Text className="text-text">{sectionCount}개</Text>의 칸을 찾았습니다.
      </Text>
    </View>
  );
}

function DetectedSectionRow({ label, index }: { label: string; index: number }) {
  return (
    <View className="h-[75px] flex-row items-center rounded-lg border-[0.5px] border-disabled bg-cool p-[22px]">
      <View className="h-[32px] w-[32px] items-center justify-center rounded border-[0.5px] border-text-subdued bg-white">
        <Text className="font-pretendard text-[13px] leading-[24px] text-text">{index + 1}</Text>
      </View>
      <Text className="ml-[24px] font-pretendard text-[12px] leading-[20px] text-bg-dark">
        {label}
      </Text>
    </View>
  );
}

export function ClosetAnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const detectedSections = getClosetTemplateSections(templateId);

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <View className="pb-[8px]">
        <CommonHeader />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-[24px] pt-[12px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
          분석이 완료됐습니다.
        </Text>

        <View className="mt-[29px]">
          <AnalysisSummaryCard sectionCount={detectedSections.length} />
        </View>

        <Text className="mt-[51px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          감지된 칸
        </Text>

        <View className="mt-[30px] gap-[12px]">
          {detectedSections.map((section, index) => (
            <DetectedSectionRow key={section.id} label={section.label} index={index} />
          ))}
        </View>
      </ScrollView>

      <View className="px-6">
        <Button
          label="칸 이름 입력하기"
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[30px]"
          onPress={() =>
            router.push({
              pathname: "/closet/register/labels",
              params: templateId ? { templateId } : undefined,
            })
          }
        />
      </View>
    </View>
  );
}
