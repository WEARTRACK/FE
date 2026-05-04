import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";
import Svg, { Rect } from "react-native-svg";

import CloseIcon from "../../../../assets/close.svg";
import PageActiveIcon from "../../../../assets/page-active.svg";
import PageInactiveIcon from "../../../../assets/page-inactive.svg";
import QuestionIcon from "../../../../assets/question-icon.svg";
import CardiganTagIcon from "../../../../assets/category/cardigan-active.svg";
import CoatTagIcon from "../../../../assets/category/coat-active.svg";
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
import { useClosetSearchResults } from "@/features/closet/hooks/use-closet-search-results";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetCategory, ClosetColor } from "@/features/closet/types/closet-item";
import { parseClosetSearchParams } from "@/features/closet/types/closet-search";

const LIST_PAGE_SIZE = 4;

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

export function ClosetSearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const localSearchParams = useLocalSearchParams<{ mode?: string | string[]; value?: string | string[] }>();
  const parsedParams = parseClosetSearchParams(localSearchParams);
  const { items, isLoading, error, queryLabel } = useClosetSearchResults(parsedParams);
  const { template } = useClosetTemplate();

  const sectionNameById = useMemo(
    () => new Map(template.sections.map((section) => [section.id, section.sectionName])),
    [template.sections],
  );

  const totalPages = Math.ceil(items.length / LIST_PAGE_SIZE);
  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const pageItems =
    totalPages === 0 ? [] : items.slice(currentPage * LIST_PAGE_SIZE, currentPage * LIST_PAGE_SIZE + LIST_PAGE_SIZE);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  useEffect(() => {
    setPage(0);
    setSelectedItemId(null);
  }, [parsedParams?.mode, parsedParams?.value]);

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
  const renderStatusScreen = (message: string) => (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-10" style={{ top: insets.top + 15 }}>
        <BackButton accessibilityLabel="이전 화면으로 돌아가기" />
      </View>
      <View className="absolute left-0 right-0" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">검색 결과</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="font-pretendard text-body text-text-subdued">{message}</Text>
      </View>
    </View>
  );

  if (!parsedParams) {
    return renderStatusScreen("유효하지 않은 검색 파라미터입니다.");
  }

  if (isLoading) {
    return renderStatusScreen("검색 데이터를 불러오는 중입니다.");
  }

  if (error) {
    return renderStatusScreen("검색 데이터를 불러오지 못했습니다.");
  }

  return (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-10" style={{ top: insets.top + 15 }}>
        <BackButton accessibilityLabel="이전 화면으로 돌아가기" />
      </View>

      <View className="absolute left-0 right-0" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">검색 결과</Text>
      </View>

      {items.length > 0 ? (
        <>
          <View className="relative h-[148px] rounded-xl border-[0.5px] border-blue-3 bg-blue-1 px-[21px]" style={{ marginTop: insets.top + 67 }}>
            <View className="absolute bottom-[34px] left-[21px] right-[21px] top-5 justify-between">
              <Text className="font-pretendard text-subhead text-text-subdued">검색 결과</Text>
              <Text className="font-pretendard-semibold text-headline text-text">{items.length}벌을 찾았습니다.</Text>
              <Text className="font-pretendard-light text-caption text-text-subdued">
                {queryLabel}에 해당되는 유사한 옷 {items.length}벌이 발견되었습니다.
              </Text>
            </View>
          </View>

          <View className="mt-[38px] gap-2">
            {pageItems.map((item) => {
              const ColorIcon = colorIconMap[item.color];
              const CategoryIcon = categoryIconMap[item.category];

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  className="h-[99px] flex-row items-start rounded-lg border-[0.5px] border-text-subdued bg-cool px-[18px] pt-[11.5px]"
                  onPress={() => setSelectedItemId(item.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                >
                  <Image
                    className="h-[76px] w-[76px] rounded-xl border-[0.5px] border-text-subdued"
                    resizeMode="cover"
                    source={{ uri: item.imageUri }}
                  />

                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center gap-[6px]">
                      {parsedParams.mode === "color" ? (
                        <>
                          <ColorIcon width={72} height={32} />
                          <CategoryIcon width={72} height={32} />
                        </>
                      ) : (
                        <>
                          <CategoryIcon width={72} height={32} />
                          <ColorIcon width={72} height={32} />
                        </>
                      )}
                    </View>
                    <Text className="ml-[5px] mt-[13px] font-pretendard text-body text-bg-dark">
                      {sectionNameById.get(item.sectionId) ?? "알 수 없는 보관 칸"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View
            className="absolute left-0 right-0 flex-row items-center justify-center gap-[14px]"
            style={{ bottom: insets.bottom + 48 }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Pressable
                key={`page-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`${index + 1} 페이지로 이동`}
                hitSlop={10}
                onPress={() => setPage(index)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                {index === currentPage ? <PageActiveIcon width={8} height={8} /> : <PageInactiveIcon width={8} height={8} />}
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <View className="flex-1">
          <View className="flex-1 items-center justify-center pb-[172px]">
            <QuestionIcon width={225} height={225} />
            <Text className="mt-3 font-pretendard-semibold text-headline text-bg-dark">
              {parsedParams.mode === "color" ? "해당 색상 옷이 없습니다." : "해당 카테고리 옷이 없습니다."}
            </Text>
            <Text className="mt-3 font-pretendard text-body text-text-subdued">옷을 등록하러 가볼까요?</Text>
          </View>
          <View className="absolute left-0 right-0" style={{ bottom: 8 }}>
            <Button fullWidth label="옷 등록하기" onPress={() => {}} size="lg" variant="primary" />
          </View>
        </View>
      )}

      <Modal animationType="fade" onRequestClose={handleCloseDetailModal} transparent visible={Boolean(selectedItem)}>
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
                <View className="h-[302px] w-[306px] overflow-hidden rounded-xl">
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
                    {sectionNameById.get(selectedItem.sectionId) ?? "알 수 없는 보관 칸"}
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
