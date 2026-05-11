import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowBackIcon from "../../../../assets/arrow_back.svg";
import { Button } from "@/components/common/Button";
import {
  closetTemplates,
  type ClosetTemplate,
} from "@/features/clothes-registration/screens/closet-template-data";

const carouselGap = 24;
const cardFrameAspectRatio = 241 / 352;
const cardFrameHeight = 352;

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
  const TemplateImage = item.image;
  const imageWidth = item.fillFrame ? width : (frameHeight * item.imageWidth) / item.imageHeight;

  return (
    <View style={{ width }} className="items-center justify-center">
      <View
        style={{ width, height: frameHeight }}
        className={[
          "items-center justify-center overflow-hidden rounded-[12px] bg-blue-1",
          isActive ? "border-2 border-accent" : "border border-blue-2",
        ].join(" ")}
      >
        <TemplateImage width={imageWidth} height={frameHeight} />
      </View>
    </View>
  );
}

export function ClosetTemplateSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cardWidth = useMemo(() => cardFrameHeight * cardFrameAspectRatio, []);
  const frameHeight = cardFrameHeight;
  const sideInset = useMemo(() => (screenWidth - cardWidth) / 2, [cardWidth, screenWidth]);
  const snapInterval = cardWidth + carouselGap;

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    const boundedIndex = Math.min(Math.max(nextIndex, 0), closetTemplates.length - 1);

    setSelectedIndex(boundedIndex);
  };

  const selectedTemplate = closetTemplates[selectedIndex] ?? closetTemplates[0];

  return (
    <View
      className="flex-1 bg-bg-light"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View className="px-6">
        <View className="h-9 flex-row items-center">
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
        </View>

        <Text className="mt-[22px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          옷장을 선택해주세요.
        </Text>
        <Text className="mt-[16px] font-pretendard text-[13px] leading-[20px] text-text-subdued">
          5가지 옷장 중 어울리는 본인의 옷장을 선택해주세요.
        </Text>
      </View>

      <View className="mt-[60px]">
        <FlatList
          horizontal
          data={closetTemplates}
          keyExtractor={(item) => item.id}
          decelerationRate="fast"
          disableIntervalMomentum
          onMomentumScrollEnd={handleMomentumScrollEnd}
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={snapInterval}
          bounces={false}
          contentContainerStyle={{
            paddingHorizontal: sideInset,
          }}
          ItemSeparatorComponent={() => <View style={{ width: carouselGap }} />}
          renderItem={({ item, index }) => (
            <TemplateCard
              item={item}
              isActive={selectedIndex === index}
              width={cardWidth}
              frameHeight={frameHeight}
            />
          )}
        />

        <TemplatePagination activeIndex={selectedIndex} totalCount={closetTemplates.length} />
      </View>

      <View className="mt-auto px-6 pt-[40px]">
        <Button
          label="선택 완료"
          fullWidth
          className="h-[58px] rounded-[12px]"
          textClassName="font-pretendard-semibold text-[18px] leading-[24px]"
          onPress={() =>
            router.push({
              pathname: "/closet/register/result",
              params: { templateId: selectedTemplate.id },
            })
          }
        />
      </View>
    </View>
  );
}
