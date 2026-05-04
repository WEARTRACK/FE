import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetFrame from "../../../../assets/closet-frame.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { CLOSET_LAYOUTS } from "@/features/closet/constants/closet-layouts";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

const LABEL_CENTER_THRESHOLD_PX = 89;

export function ClosetMainScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const { template } = useClosetTemplate();
  const slots = CLOSET_LAYOUTS[template.templateId];
  const frameWidth = screenWidth - 48;
  const frameHeight = (frameWidth * 517) / 345;
  const frameTop = insets.top + 96;
  const buttonTop = frameTop + frameHeight + 24;

  const sectionNameById = new Map(template.sections.map((section) => [section.id, section.sectionName]));
  const availableSectionIds = new Set(slots.map((slot) => slot.id));

  // const handleOpenStats = () => {
  //   router.push("/closet/stats");
  // };

  const handleOpenStats = () => {
    if (template.templateId === "LAYOUT_E") {
      router.push("/closet/stats");
      return;
    }

    router.push("/closet/stats");
  };

  const handleOpenSection = (sectionId: ClosetSectionId) => {
    if (!availableSectionIds.has(sectionId)) {
      return;
    }
    router.push(`/closet/section/${sectionId}`);
  };

  return (
    <View className="flex-1 bg-bg-light">
      <View
        className="absolute left-0 right-0 z-10"
        style={{ top: insets.top + 15 }}
      >
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">내 옷장</Text>
      </View>

      <View className="absolute left-0 right-0 items-center" style={{ top: frameTop }}>
        <View style={{ width: frameWidth, height: frameHeight }}>
          <ClosetFrame width={frameWidth} height={frameHeight} />
          <View className="absolute inset-0">
            {slots.map((slot) => {
              const sectionName = sectionNameById.get(slot.id);
              const slotHeightPx = (frameHeight * slot.height) / 100;
              const isCompactHeight = slotHeightPx < LABEL_CENTER_THRESHOLD_PX;

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
                    paddingTop: isCompactHeight ? 0 : 15,
                    justifyContent: isCompactHeight ? "center" : "flex-start",
                  }}
                >
                  {sectionName ? (
                    <Text className="font-pretendard text-body text-text-subdued">{sectionName}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View className="absolute left-6 right-6" style={{ top: buttonTop }}>
        <Button fullWidth label="옷장 열기" onPress={handleOpenStats} size="lg" variant="primary" />
      </View>
    </View>
  );
}
