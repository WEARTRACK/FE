import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/common/Button";
import {
  getRandomTemplateIdsBySectionCounts,
  getClosetTemplatesByIds,
  type ClosetTemplate,
} from "@/features/clothes-registration/screens/closet-template-data";
import { ClosetRegistrationHeader } from "@/features/clothes-registration/screens/ClosetRegistrationHeader";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";

const carouselGap = 24;
const cardFrameAspectRatio = 345 / 503;
const cardFrameHeight = 352;
const manualSectionCounts = Array.from({ length: 9 }, (_, index) => index + 2);

function TemplatePagination({
  activeIndex,
  totalCount,
}: {
  activeIndex: number;
  totalCount: number;
}) {
  return (
    <View className="mt-[40px] flex-row items-center justify-center gap-[12px]">
      {Array.from({ length: totalCount }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <View
            key={`template-dot-${index + 1}`}
            className={[
              "h-[10px] w-[10px] rounded-full",
              isActive ? "bg-blue-4" : "border-[0.4px] border-blue-3 bg-blue-1",
            ].join(" ")}
          />
        );
      })}
    </View>
  );
}

function TemplateCard({
  item,
  isActive,
  width,
  frameHeight,
}: {
  item: ClosetTemplate;
  isActive: boolean;
  width: number;
  frameHeight: number;
}) {
  const TemplateImage = item.Image;

  return (
    <View style={{ width }} className="items-center justify-center">
      <View
        style={{ width, height: frameHeight }}
        className="relative items-center justify-center rounded-[12px]"
      >
        <TemplateImage height={frameHeight} width={width} />
        {isActive ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-[10px] border-2 border-accent"
          />
        ) : null}
      </View>
    </View>
  );
}

export function ClosetTemplateSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const recommendedTemplateIds = useClosetRegistrationStore(
    (state) => state.recommendedTemplateIds,
  );
  const setClosetDraft = useClosetRegistrationStore((state) => state.setDraft);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isManualSelection = mode === "manual";
  const templates = useMemo(
    () =>
      getClosetTemplatesByIds(
        isManualSelection
          ? getRandomTemplateIdsBySectionCounts(manualSectionCounts)
          : recommendedTemplateIds,
      ),
    [isManualSelection, recommendedTemplateIds],
  );
  const cardWidth = useMemo(() => cardFrameHeight * cardFrameAspectRatio, []);
  const sideInset = useMemo(() => (screenWidth - cardWidth) / 2, [cardWidth, screenWidth]);
  const snapInterval = cardWidth + carouselGap;
  const selectedTemplate = templates[selectedIndex] ?? templates[0] ?? null;

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    const boundedIndex = Math.min(Math.max(nextIndex, 0), templates.length - 1);

    setSelectedIndex(boundedIndex);
  };

  const handleSelectTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    setClosetDraft({ templateId: selectedTemplate.id });
    router.push("/closet/register/result");
  };

  return (
    <View
      className="flex-1 bg-bg-light"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="px-6">
        <ClosetRegistrationHeader title="옷장등록" />
      </View>

      {templates.length > 0 ? (
        <View className="mt-[118px]">
          <FlatList
            horizontal
            bounces={false}
            data={templates}
            decelerationRate="fast"
            disableIntervalMomentum
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={snapInterval}
            contentContainerStyle={{ paddingHorizontal: sideInset }}
            ItemSeparatorComponent={() => <View style={{ width: carouselGap }} />}
            renderItem={({ item, index }) => (
              <TemplateCard
                frameHeight={cardFrameHeight}
                isActive={selectedIndex === index}
                item={item}
                width={cardWidth}
              />
            )}
          />

          <TemplatePagination activeIndex={selectedIndex} totalCount={templates.length} />

          <Text className="mt-[38px] px-6 text-center font-pretendard text-[15px] leading-[20px] text-text">
            제시된 템플릿 중 본인의 옷장과{`\n`}가장 어울리는 옷장을 선택해주세요.
          </Text>
        </View>
      ) : (
        <Text className="mt-[60px] px-6 text-center font-pretendard text-[14px] leading-[20px] text-text-subdued">
          {isManualSelection
            ? "옷장 템플릿 정보를 확인할 수 없어요. 다시 시도해주세요."
            : "추천 템플릿 정보를 확인할 수 없어요. 사진을 다시 촬영해주세요."}
        </Text>
      )}

      <View className="mt-auto px-6 pt-[40px]">
        <Button
          disabled={!selectedTemplate}
          label={selectedTemplate ? "옷장 선택하기" : "재촬영하기"}
          fullWidth
          className="h-[58px] rounded-[12px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[24px]"
          onPress={() => {
            if (selectedTemplate) {
              handleSelectTemplate();
              return;
            }

            router.replace("/closet/register");
          }}
        />
      </View>
    </View>
  );
}
