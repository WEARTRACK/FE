import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";
import Svg, { Rect } from "react-native-svg";

import CloseIcon from "../../../../assets/close.svg";
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import GridActiveIcon from "../../../../assets/grid-active.svg";
import GridInactiveIcon from "../../../../assets/grid-inactive.svg";
import ListActiveIcon from "../../../../assets/list-active.svg";
import ListInactiveIcon from "../../../../assets/list-inactive.svg";
import PageActiveIcon from "../../../../assets/page-active.svg";
import PageInactiveIcon from "../../../../assets/page-inactive.svg";
import CoatTagIcon from "../../../../assets/category/coat-active.svg";
import CardiganTagIcon from "../../../../assets/category/cardigan-active.svg";
import DressTagIcon from "../../../../assets/category/dress-active.svg";
import HoodieTagIcon from "../../../../assets/category/hoodie-active.svg";
import JacketTagIcon from "../../../../assets/category/jacket-active.svg";
import KnitTagIcon from "../../../../assets/category/knit-active.svg";
import PaddingTagIcon from "../../../../assets/category/padding-active.svg";
import PantsTagIcon from "../../../../assets/category/pants-active.svg";
import ShirtTagIcon from "../../../../assets/category/shirt-active.svg";
import ShortsTagIcon from "../../../../assets/category/shorts-active.svg";
import SkirtTagIcon from "../../../../assets/category/skirt-active.svg";
import TshirtTagIcon from "../../../../assets/category/tshirt-active.svg";
import VestTagIcon from "../../../../assets/category/vest-active.svg";
import BeigeTagIcon from "../../../../assets/color/beige-active.svg";
import BlackTagIcon from "../../../../assets/color/black-active.svg";
import BlueTagIcon from "../../../../assets/color/blue-active.svg";
import BrownTagIcon from "../../../../assets/color/brown-active.svg";
import GrayTagIcon from "../../../../assets/color/gray-active.svg";
import GreenTagIcon from "../../../../assets/color/green-active.svg";
import NavyTagIcon from "../../../../assets/color/navy-active.svg";
import OrangeTagIcon from "../../../../assets/color/orange-active.svg";
import PinkTagIcon from "../../../../assets/color/pink-active.svg";
import PurpleTagIcon from "../../../../assets/color/purple-active.svg";
import RedTagIcon from "../../../../assets/color/red-active.svg";
import WhiteTagIcon from "../../../../assets/color/white-active.svg";
import YellowTagIcon from "../../../../assets/color/yellow-active.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import {
  useClosetItem,
  useClosetItemsBySection,
  useClosetTemplate,
} from "@/features/closet/hooks/use-closet-data";
import type { ClosetCategory, ClosetColor } from "@/features/closet/types/closet-item";
import { isClosetSectionId, type ClosetSectionId } from "@/features/closet/types/closet-layout";

type ViewMode = "grid" | "list";

const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 4;
const BACK_BUTTON_SIZE = 24;
const HEADLINE_LINE_HEIGHT = 20;
const GRID_COLUMNS = 3;
const GRID_GAP_X = 6;
const PAGINATION_DOT_SIZE = 8;

const colorIconMap: Record<ClosetColor, React.ComponentType<SvgProps>> = {
  red: RedTagIcon,
  orange: OrangeTagIcon,
  yellow: YellowTagIcon,
  green: GreenTagIcon,
  navy: NavyTagIcon,
  purple: PurpleTagIcon,
  white: WhiteTagIcon,
  blue: BlueTagIcon,
  pink: PinkTagIcon,
  brown: BrownTagIcon,
  gray: GrayTagIcon,
  black: BlackTagIcon,
  beige: BeigeTagIcon,
};

const categoryIconMap: Record<ClosetCategory, React.ComponentType<SvgProps>> = {
  tshirt: TshirtTagIcon,
  knit: KnitTagIcon,
  hoodie: HoodieTagIcon,
  vest: VestTagIcon,
  cardigan: CardiganTagIcon,
  pants: PantsTagIcon,
  dress: DressTagIcon,
  shirt: ShirtTagIcon,
  shorts: ShortsTagIcon,
  jacket: JacketTagIcon,
  coat: CoatTagIcon,
  skirt: SkirtTagIcon,
  padding: PaddingTagIcon,
};

export function ClosetSectionScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();

  const currentSectionId: ClosetSectionId =
    sectionId && isClosetSectionId(sectionId) ? sectionId : "section-1";
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { template } = useClosetTemplate();
  const { items: sectionItems } = useClosetItemsBySection(currentSectionId);
  const { item: selectedItem } = useClosetItem(currentSectionId, selectedItemId);
  const sectionNameById = useMemo(
    () => new Map(template.sections.map((section) => [section.id, section.sectionName])),
    [template.sections],
  );

  const sectionName = useMemo(() => {
    const found = template.sections.find((section) => section.id === currentSectionId);
    return found?.sectionName ?? "칸 조회";
  }, [currentSectionId, template.sections]);

  const contentWidth = screenWidth - 48;
  const gridItemSize = (contentWidth - GRID_GAP_X * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.ceil(sectionItems.length / pageSize);
  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const pageItems =
    totalPages === 0
      ? []
      : sectionItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const backButtonTop = insets.top + 14;
  const titleTop = backButtonTop + BACK_BUTTON_SIZE + 29;
  const countTop = titleTop + HEADLINE_LINE_HEIGHT + 29;
  const contentTop = countTop + 36;
  const viewToggleTop = titleTop - 8;
  const tabBarTop = screenHeight - insets.bottom - 56;
  const contentHeight =
    viewMode === "list"
      ? pageItems.length > 0
        ? pageItems.length * 99 + (pageItems.length - 1) * 8
        : 0
      : pageItems.length > 0
        ? Math.ceil(pageItems.length / GRID_COLUMNS) * gridItemSize +
          (Math.ceil(pageItems.length / GRID_COLUMNS) - 1) * 8
        : 0;
  const contentBottom = contentTop + contentHeight;
  const spaceBetweenContentAndTabBar = Math.max(tabBarTop - contentBottom, 0);
  const paginationCenterY = contentBottom + spaceBetweenContentAndTabBar * 0.6;
  const paginationTop = paginationCenterY - PAGINATION_DOT_SIZE / 2;

  const handleToggleView = (nextViewMode: ViewMode) => {
    setViewMode(nextViewMode);
    setPage(0);
  };

  const handleItemPress = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleCloseDetailModal = () => {
    setSelectedItemId(null);
  };

  const handleEditItem = () => {
    if (!selectedItem) {
      return;
    }

    console.warn("TODO: edit item", selectedItem.id);
  };

  const handleDeleteItem = () => {
    if (!selectedItem) {
      return;
    }

    console.warn("TODO: delete item", selectedItem.id);
  };

  return (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-10" style={{ top: backButtonTop }}>
        <BackButton accessibilityLabel="내 옷장으로 돌아가기" />
      </View>

      <Text
        className="absolute left-6 font-pretendard-semibold text-headline text-text-subdued"
        style={{ top: titleTop }}
      >
        {sectionName}
      </Text>

      {sectionItems.length > 0 ? (
        <>
          <Text className="absolute left-6 font-pretendard text-body text-bg-dark" style={{ top: countTop }}>
            총 {sectionItems.length}벌
          </Text>

          <View className="absolute right-6 flex-row items-center gap-[7px]" style={{ top: viewToggleTop }}>
            <Pressable
              accessibilityLabel="그리드 보기"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => handleToggleView("grid")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              {viewMode === "grid" ? (
                <GridActiveIcon width={37} height={36} />
              ) : (
                <GridInactiveIcon width={37} height={36} />
              )}
            </Pressable>
            <Pressable
              accessibilityLabel="리스트 보기"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => handleToggleView("list")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              {viewMode === "list" ? (
                <ListActiveIcon width={37} height={36} />
              ) : (
                <ListInactiveIcon width={37} height={36} />
              )}
            </Pressable>
          </View>
        </>
      ) : null}

      {sectionItems.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-20">
          <ClothesIcon width={157} height={145} />
          <Text className="mt-8 font-pretendard-semibold text-headline text-bg-dark">등록된 옷이 없습니다.</Text>
          <Text className="mt-4 font-pretendard text-body text-text-subdued">옷을 등록하러 가볼까요?</Text>
        </View>
      ) : (
        <View className="absolute left-6 right-6" style={{ top: contentTop }}>
          {viewMode === "grid" ? (
            <View className="flex-row flex-wrap gap-x-[6px] gap-y-2">
              {pageItems.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.colorLabel} ${item.categoryLabel}`}
                  className="overflow-hidden rounded-[13.2px] border-[0.55px] border-text-subdued"
                  onPress={() => handleItemPress(item.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                >
                  <Image
                    resizeMode="cover"
                    source={{ uri: item.imageUri }}
                    style={{ width: gridItemSize, height: gridItemSize }}
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="gap-2">
              {pageItems.map((item) => {
                const ColorIcon = colorIconMap[item.color];
                const CategoryIcon = categoryIconMap[item.category];

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${sectionName} ${item.colorLabel} ${item.categoryLabel}`}
                    className="h-[99px] flex-row items-start rounded-lg bg-cool px-[18px] pt-[11.5px]"
                    onPress={() => handleItemPress(item.id)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Image
                      className="h-[76px] w-[76px] rounded-xl border-[0.5px] border-text-subdued"
                      resizeMode="cover"
                      source={{ uri: item.imageUri }}
                    />

                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center gap-[6px]">
                        <ColorIcon width={72} height={32} />
                        <CategoryIcon width={72} height={32} />
                      </View>
                      <Text className="ml-[5px] mt-[13px] font-pretendard text-body text-bg-dark">
                        {sectionName}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {sectionItems.length > 0 ? (
        <View
          className="absolute left-0 right-0 flex-row items-center justify-center gap-[14px]"
          style={{ top: paginationTop }}
        >
          {Array.from({ length: totalPages }).map((_, index) => (
            <Pressable
              key={`page-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`${index + 1} 페이지로 이동`}
              hitSlop={10}
              onPress={() => {
                if (index === currentPage) {
                  return;
                }
                setPage(index);
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              {index === currentPage ? (
                <PageActiveIcon width={8} height={8} />
              ) : (
                <PageInactiveIcon width={8} height={8} />
              )}
            </Pressable>
          ))}
        </View>
      ) : null}

      {sectionItems.length === 0 ? (
        <View className="absolute left-6 right-6" style={{ bottom: 8 }}>
          <Button fullWidth label="옷 등록하기" onPress={() => {}} size="lg" variant="primary" />
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={handleCloseDetailModal}
        transparent
        visible={Boolean(selectedItem)}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Pressable
            accessibilityLabel="상세 모달 닫기"
            accessibilityRole="button"
            className="absolute inset-0 bg-black/20"
            onPress={handleCloseDetailModal}
          />

          {selectedItem ? (
            <View accessibilityViewIsModal className="h-[604px] w-[344px] rounded-2xl bg-white p-5">
              <View className="flex-row items-center justify-between">
                <Text className="font-pretendard-semibold text-headline text-bg-dark">상세보기</Text>
                <Pressable
                  accessibilityLabel="상세 모달 닫기"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleCloseDetailModal}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <CloseIcon width={24} height={24} />
                </Pressable>
              </View>

              <View className="mt-6 items-center">
                <View
                  className="h-[302px] w-[306px] overflow-hidden rounded-xl"
                >
                  <Image className="h-[302px] w-[306px]" resizeMode="cover" source={{ uri: selectedItem.imageUri }} />
                  <View className="absolute inset-0">
                    <Svg height="302" width="306">
                      <Rect
                        x="0.5"
                        y="0.5"
                        width="305"
                        height="301"
                        rx="12"
                        fill="none"
                        stroke={colors.disabled}
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    </Svg>
                  </View>
                </View>
              </View>

              <View className="mt-7 flex-row items-center gap-[6px]">
                {(() => {
                  const ColorIcon = colorIconMap[selectedItem.color];
                  return <ColorIcon width={72} height={32} />;
                })()}
                {(() => {
                  const CategoryIcon = categoryIconMap[selectedItem.category];
                  return <CategoryIcon width={72} height={32} />;
                })()}
              </View>

              <View className="mt-6 gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="font-pretendard text-body text-text-subdued">보관 칸</Text>
                  <Text className="font-pretendard text-body text-text-subdued">
                    {sectionNameById.get(selectedItem.sectionId) ?? sectionName}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-pretendard text-body text-text-subdued">가격</Text>
                  <Text className="font-pretendard text-body text-text-subdued">
                    {selectedItem.price.toLocaleString("ko-KR")}원
                  </Text>
                </View>
              </View>

              <View className="mt-7 flex-row items-center gap-1">
                <View className="flex-1">
                  <Button label="수정하기" onPress={handleEditItem} size="sm" variant="primary" fullWidth />
                </View>
                <View className="flex-1">
                  <Button label="삭제하기" onPress={handleDeleteItem} size="sm" variant="secondary" fullWidth />
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
