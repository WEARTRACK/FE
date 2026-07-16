import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import { CommonHeader } from "@/components/common/CommonHeader";
import { getClosetTemplateSections } from "@/features/clothes-registration/screens/closet-template-data";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";

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

export function ClosetAnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const templateId = useClosetRegistrationStore((state) => state.templateId);
  const sections = getClosetTemplateSections(templateId);
  const hasSelectedTemplate = sections.length > 0;

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingBottom: insets.bottom + 20 }}>
      <View className="pb-[8px]">
        <CommonHeader />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-[12px]">
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            분석이 완료됐습니다.
          </Text>

          {hasSelectedTemplate ? (
            <View className="mt-[29px]">
              <AnalysisSummaryCard sectionCount={sections.length} />

              <Text className="mt-[46px] font-pretendard-semibold text-[18px] leading-[24px] text-text">
                감지된 칸
              </Text>

              <View className="mt-[24px] gap-[12px]">
                {sections.map((section, index) => (
                  <View
                    key={section.id}
                    className="h-[72px] flex-row items-center rounded-lg border-[0.5px] border-disabled bg-cool px-[20px]"
                  >
                    <View className="h-[32px] w-[32px] items-center justify-center rounded border-[0.5px] border-text-subdued bg-white">
                      <Text className="font-pretendard text-[13px] leading-[20px] text-text">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="ml-[16px] font-pretendard text-[14px] leading-[20px] text-text">
                      {section.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text className="mt-[29px] font-pretendard text-[14px] leading-[20px] text-text-subdued">
              선택한 옷장 템플릿 정보를 확인할 수 없어요. 다시 선택해주세요.
            </Text>
          )}

          <View className="mt-auto pt-6">
            <Button
              label={hasSelectedTemplate ? "칸 이름 입력하기" : "옷장 다시 선택하기"}
              fullWidth
              className="h-[58px]"
              textClassName="font-pretendard-semibold text-[18px] leading-[30px]"
              onPress={() =>
                router.push(
                  hasSelectedTemplate ? "/closet/register/labels" : "/closet/register/select",
                )
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
