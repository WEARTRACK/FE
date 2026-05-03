import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { CommonHeader } from "@/components/common/CommonHeader";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

const mockSections = ["칸 1", "칸 2", "칸 3", "칸 4"];

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
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <CommonHeader />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-[24px] pt-[20px]"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
          분석이 완료됐습니다.
        </Text>

        <View className="mt-[29px]">
          <AnalysisSummaryCard sectionCount={mockSections.length} />
        </View>

        <Text className="mt-[51px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          감지된 칸
        </Text>

        <View className="mt-[30px] gap-[12px]">
          {mockSections.map((section, index) => (
            <DetectedSectionRow key={section} label={section} index={index} />
          ))}
        </View>
      </ScrollView>

      <View className="px-6">
        <Button
          label="칸 이름 입력하기"
          href={clothesRegistrationRoutes.labels}
          fullWidth
          className="h-[58px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[30px]"
        />
      </View>
    </View>
  );
}
