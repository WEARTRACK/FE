import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
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
import type { ClosetDetailResult } from "@/features/closet/api/closet-api-types";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { useClosetSearchResults } from "@/features/closet/hooks/use-closet-search-results";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetCategory, ClosetColor } from "@/features/closet/types/closet-item";
import { parseClosetSearchParams } from "@/features/closet/types/closet-search";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";

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
  const repository = useMemo(() => getClosetRepository(), []);
  const { template } = useClosetTemplate();
  const insets = useSafeAreaInsets();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<ClosetDetailResult | null>(null);
  const [selectedItemDetailPrice, setSelectedItemDetailPrice] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [draftPriceInput, setDraftPriceInput] = useState("");
  const [draftSectionId, setDraftSectionId] = useState<number | null>(null);
  const [draftSectionName, setDraftSectionName] = useState<string | null>(null);
  const lastToastMessageRef = useRef<string | null>(null);

  const localSearchParams = useLocalSearchParams<{ mode?: string | string[]; value?: string | string[] }>();
  const parsedParams = parseClosetSearchParams(localSearchParams);
  const searchMode = parsedParams?.mode ?? "color";
  const {
    items,
    isLoading,
    error,
    paramError,
    queryLabel,
    totalCount,
    totalPages,
    currentPage,
    setPage,
    applyDetailToList,
    removeItemOptimistic,
    refetch,
  } = useClosetSearchResults(parsedParams);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );
  const selectedItemClothesId = selectedItem?.clothesId ?? null;
  const sectionOptions = useMemo(() => {
    const templateOptions = template.sections
      .map((section) => {
        const match = section.id.match(/section-(\d+)/);
        if (!match) {
          return null;
        }

        return {
          id: Number(match[1]),
          name: section.sectionName ?? `칸 ${match[1]}`,
        };
      })
      .filter((option): option is { id: number; name: string } => option !== null);

    if (
      selectedItemDetail &&
      !templateOptions.some((option) => option.id === selectedItemDetail.sectionId)
    ) {
      templateOptions.unshift({
        id: selectedItemDetail.sectionId,
        name: selectedItemDetail.sectionName,
      });
    }

    return templateOptions;
  }, [selectedItemDetail, template.sections]);

  useEffect(() => {
    setSelectedItemId(null);
    setSelectedItemDetail(null);
    setSelectedItemDetailPrice(null);
    setIsEditing(false);
    setIsSectionDropdownOpen(false);
    setDraftPriceInput("");
    setDraftSectionId(null);
    setDraftSectionName(null);
  }, [parsedParams?.mode, parsedParams?.value]);

  function getActionErrorMessage(error: unknown, fallback: string) {
    if (!(error instanceof ApiError)) {
      return fallback;
    }

    if (error.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인해주세요.";
    }

    if (error.status === 404) {
      return "대상 옷을 찾을 수 없습니다.";
    }

    if (error.code === "INVALID_ENUM_MAPPING" || error.code === "INVALID_RESPONSE") {
      return "서버 응답 형식이 올바르지 않습니다.";
    }

    return fallback;
  }

  useEffect(() => {
    let isActive = true;

    async function fetchDetail() {
      if (!selectedItemClothesId) {
        setSelectedItemDetail(null);
        setSelectedItemDetailPrice(null);
        return;
      }

      try {
        const detail = await repository.getClothesDetail(selectedItemClothesId);
        if (!isActive) {
          return;
        }
        setSelectedItemDetail(detail);
        setSelectedItemDetailPrice(detail.price);
        setDraftPriceInput(String(detail.price));
        setDraftSectionId(detail.sectionId);
        setDraftSectionName(detail.sectionName);
        applyDetailToList(detail);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setSelectedItemDetail(null);
        setSelectedItemDetailPrice(null);
        showToast(getActionErrorMessage(error, "상세 정보를 불러오지 못했어요."));
      }
    }

    fetchDetail();

    return () => {
      isActive = false;
    };
  }, [applyDetailToList, repository, selectedItemClothesId]);

  useEffect(() => {
    let nextMessage: string | null = null;

    if (paramError) {
      nextMessage = searchMode === "color" ? "색상을 선택해주세요." : "카테고리를 선택해주세요.";
    } else {
      lastToastMessageRef.current = null;
    }

    if (!nextMessage) {
      return;
    }

    if (lastToastMessageRef.current === nextMessage) {
      return;
    }

    lastToastMessageRef.current = nextMessage;
    showToast(nextMessage);
  }, [paramError, searchMode]);

  const handleCloseDetailModal = () => {
    setSelectedItemId(null);
    setSelectedItemDetail(null);
    setSelectedItemDetailPrice(null);
    setIsEditing(false);
    setIsSectionDropdownOpen(false);
    setDraftPriceInput("");
    setDraftSectionId(null);
    setDraftSectionName(null);
  };
  const onUpdate = async () => {
    if (!selectedItem) {
      return;
    }

    const detail = selectedItemDetail;
    if (!detail) {
      showToast("상세 정보가 준비되면 다시 시도해주세요.");
      return;
    }

    const nextPrice = Number(draftPriceInput.replace(/[^0-9]/g, ""));
    const nextSectionId = draftSectionId ?? detail.sectionId;
    const hasPriceChanged = Number.isFinite(nextPrice) && nextPrice !== detail.price;
    const hasSectionChanged = nextSectionId !== detail.sectionId;

    if (!hasPriceChanged && !hasSectionChanged) {
      showToast("변경된 내용이 없습니다.");
      setIsEditing(false);
      setIsSectionDropdownOpen(false);
      return;
    }

    try {
      const updated = await repository.updateClothes(detail.clothesId, {
        color: detail.color,
        category: detail.category,
        price: Number.isFinite(nextPrice) ? nextPrice : detail.price,
        sectionId: nextSectionId,
      });
      setSelectedItemDetail(updated);
      applyDetailToList(updated);
      setSelectedItemDetailPrice(updated.price);
      setDraftPriceInput(String(updated.price));
      setDraftSectionId(updated.sectionId);
      setDraftSectionName(updated.sectionName);
      setIsEditing(false);
      setIsSectionDropdownOpen(false);
      showToast("수정이 완료됐어요.");
    } catch (error) {
      showToast(getActionErrorMessage(error, "수정에 실패했어요. 다시 시도해주세요."));
    }
  };
  const handleDeleteItem = () => {
    if (!selectedItem) {
      return;
    }

    Alert.alert("옷 삭제", "정말 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          removeItemOptimistic(selectedItem.clothesId);
          handleCloseDetailModal();

          try {
            await repository.deleteClothes(selectedItem.clothesId);
            await refetch();
            showToast("옷 삭제에 성공하였습니다.");
          } catch (error) {
            await refetch();
            showToast(getActionErrorMessage(error, "삭제에 실패했습니다. 다시 시도해주세요."));
          }
        },
      },
    ]);
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

  if (paramError) {
    return renderStatusScreen("검색 조건을 확인해주세요.");
  }

  if (isLoading) {
    return renderStatusScreen("검색 결과를 불러오는 중입니다.");
  }

  if (error) {
    return renderStatusScreen("검색에 실패했어요. 다시 시도해주세요.");
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
              <Text className="font-pretendard-semibold text-headline text-text">{totalCount}벌을 찾았습니다.</Text>
              <Text className="font-pretendard-light text-caption text-text-subdued">
                {queryLabel}에 해당되는 유사한 옷 {totalCount}벌이 발견됐습니다.
              </Text>
            </View>
          </View>
          <View className="mt-[38px] gap-2">
            {items.map((item) => {
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
                      {searchMode === "color" ? (
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
                      {item.sectionName}
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
          <View
            className="absolute left-0 right-0 items-center justify-center"
            style={{
              top: insets.top + 67,
              bottom: insets.bottom + 66,
            }}
          >
            <QuestionIcon width={225} height={225} />
            <Text className="mt-3 font-pretendard-semibold text-headline text-bg-dark">
              {searchMode === "color" ? "해당 색상 옷이 없습니다." : "해당 카테고리 옷이 없습니다."}
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
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="h-[604px] w-[344px]"
            >
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

              <View className="relative mt-6 gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="font-pretendard text-body text-text-subdued">보관 칸</Text>
                  {isEditing ? (
                    <View className="items-end">
                      <Pressable
                        accessibilityRole="button"
                        className="rounded-md border-[0.5px] border-disabled bg-white px-2 py-1"
                        onPress={() => setIsSectionDropdownOpen((prev) => !prev)}
                      >
                        <Text className="font-pretendard text-body text-text-subdued">
                          {draftSectionName ?? selectedItem.sectionName}
                        </Text>
                      </Pressable>
                      {isSectionDropdownOpen ? (
                        <View
                          className="absolute right-0 top-9 w-[140px] rounded-md border-[0.5px] border-disabled bg-white"
                          style={{ position: "absolute", zIndex: 999 }}
                        >
                          {sectionOptions.map((option) => (
                            <Pressable
                              key={option.id}
                              className="px-3 py-2"
                              onPress={() => {
                                setDraftSectionId(option.id);
                                setDraftSectionName(option.name);
                                setIsSectionDropdownOpen(false);
                              }}
                            >
                              <Text className="font-pretendard text-body text-text-subdued">{option.name}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <Text className="font-pretendard text-body text-text-subdued">
                      {selectedItem.sectionName}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-pretendard text-body text-text-subdued">가격</Text>
                  {isEditing ? (
                    <TextInput
                      className="min-w-[120px] rounded-md border-[0.5px] border-disabled px-2 py-1 text-right font-pretendard text-body text-text-subdued"
                      keyboardType="numeric"
                      onChangeText={(value) => setDraftPriceInput(value.replace(/[^0-9]/g, ""))}
                      value={draftPriceInput}
                    />
                  ) : (
                    <Text className="font-pretendard text-body text-text-subdued">
                      {(selectedItemDetailPrice ?? selectedItem.price).toLocaleString("ko-KR")}원
                    </Text>
                  )}
                </View>
              </View>

                <View className="mt-7 flex-row items-center gap-1">
                <View className="flex-1">
                  <Button
                    label={isEditing ? "저장하기" : "수정하기"}
                    onPress={() => {
                      if (isEditing) {
                        void onUpdate();
                        return;
                      }

                      setIsEditing(true);
                      setIsSectionDropdownOpen(false);
                      setDraftPriceInput(String(selectedItemDetailPrice ?? selectedItem.price));
                      setDraftSectionId(selectedItemDetail?.sectionId ?? null);
                      setDraftSectionName(selectedItemDetail?.sectionName ?? selectedItem.sectionName);
                    }}
                    size="sm"
                    variant="primary"
                    fullWidth
                  />
                </View>
                <View className="flex-1">
                  <Button label="삭제하기" onPress={handleDeleteItem} size="sm" variant="secondary" fullWidth />
                </View>
              </View>
            </View>
            </KeyboardAvoidingView>
          ) : null}
	        </View>
	      </Modal>
	    </View>
	  );
	}
