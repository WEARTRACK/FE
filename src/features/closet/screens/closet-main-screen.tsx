import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetFrame from "../../../../assets/closet-frame.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { CLOSET_LAYOUTS } from "@/features/closet/constants/closet-layouts";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { showToast } from "@/lib/ui/showToast";

const LABEL_CENTER_THRESHOLD_PX = 71;

export function ClosetMainScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const { template, isLoading, error, refetch } = useClosetTemplate(getClosetRepository());
  const lastToastMessageRef = useRef<string | null>(null);
  const slots = CLOSET_LAYOUTS[template.templateId];
  const frameWidth = screenWidth - 48;
  const frameHeight = (frameWidth * 517) / 345;
  const frameTop = insets.top + 96;

  const sectionNameById = new Map(
    template.sections.map((section) => [section.id, section.sectionName]),
  );
  const availableSectionIds = new Set(template.sections.map((section) => section.id));

  useEffect(() => {
    if (!error) {
      lastToastMessageRef.current = null;
      return;
    }

    const message = "불러오기에 실패했어요.";
    if (lastToastMessageRef.current === message) {
      return;
    }

    lastToastMessageRef.current = message;
    showToast(message);
  }, [error]);

  // const handleOpenStats = () => {
  //   router.push("/closet/stats");
  // };

  const handleOpenStats = () => {
    if (isLoading) {
      return;
    }

    if (error) {
      refetch();
      return;
    }

    if (template.templateId === "LAYOUT_E") {
      router.push("/closet/stats");
      return;
    }

    router.push("/closet/stats");
  };

  const handleOpenSection = (sectionId: ClosetSectionId) => {
    if (isLoading || error) {
      return;
    }

    if (!availableSectionIds.has(sectionId)) {
      return;
    }
    router.push(`/closet/section/${sectionId}`);
  };

  return (
    <View className="flex-1 bg-bg-light">
      <View className="absolute left-0 right-0 z-10" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">
          내 옷장
        </Text>
      </View>

      <View className="absolute left-0 right-0 items-center" style={{ top: frameTop }}>
        <View style={{ width: frameWidth, height: frameHeight }}>
          <ClosetFrame width={frameWidth} height={frameHeight} />
          {isLoading ? (
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-pretendard text-body text-text-subdued">
                불러오는 중입니다.
              </Text>
            </View>
          ) : (
            <View className="absolute inset-0">
              {slots.map((slot) => {
                const sectionName = sectionNameById.get(slot.id);
                const isCompactHeight = slot.heightPx < LABEL_CENTER_THRESHOLD_PX;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    accessibilityLabel={sectionName ? `${sectionName} 열기` : "칸 열기"}
                    accessibilityRole="button"
                    onPress={() => handleOpenSection(slot.id)}
                    activeOpacity={0.75}
                    style={{
                      position: "absolute",
                      left: `${slot.left}%`,
                      top: `${slot.top}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.blue[3],
                      backgroundColor: colors.white,
                      paddingLeft: 20,
                      paddingTop: isCompactHeight ? 0 : 20,
                      justifyContent: isCompactHeight ? "center" : "flex-start",
                    }}
                  >
                    {sectionName ? (
                      <Text className="font-pretendard text-body text-text-subdued">
                        {sectionName}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <View className="absolute bottom-2 left-6 right-6">
        <Button
          fullWidth
          label={isLoading ? "불러오는 중" : error ? "다시 시도" : "옷장 열기"}
          onPress={handleOpenStats}
          size="lg"
          variant="primary"
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
