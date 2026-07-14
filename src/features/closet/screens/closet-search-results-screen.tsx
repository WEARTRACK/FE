import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect } from "react-native-svg";

import CloseIcon from "../../../../assets/close.svg";
import PageActiveIcon from "../../../../assets/page-active.svg";
import PageInactiveIcon from "../../../../assets/page-inactive.svg";
import QuestionIcon from "../../../../assets/question-icon.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import { colors } from "@/constants/colors";
import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import type { ClosetDetailResult } from "@/features/closet/api/closet-api-types";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { useClosetSearchResults } from "@/features/closet/hooks/use-closet-search-results";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { parseClosetSearchParams } from "@/features/closet/types/closet-search";
import { getCategoryIcon, getColorIcon } from "@/features/closet/utils/closet-tag-icons";
import { ApiError } from "@/lib/api/errors";
import { queryClient } from "@/lib/queryClient";
import { showAlert } from "@/lib/ui/showAlert";
import { showToast } from "@/lib/ui/showToast";

const PAGINATION_BOTTOM_OFFSET_FROM_TAB_TOP = 13;
const SEARCH_PAGE_GAP = 24;

export function ClosetSearchResultsScreen() {
  const router = useRouter();
  const repository = useMemo(() => getClosetRepository(), []);
  const { template } = useClosetTemplate();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<ClosetDetailResult | null>(null);
  const [selectedItemDetailPrice, setSelectedItemDetailPrice] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [draftPriceInput, setDraftPriceInput] = useState("");
  const [draftSectionId, setDraftSectionId] = useState<ClosetSectionId | null>(null);
  const [draftSectionName, setDraftSectionName] = useState<string | null>(null);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);
  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const lastToastMessageRef = useRef<string | null>(null);
  const pageListRef = useRef<FlatList<number>>(null);

  const localSearchParams = useLocalSearchParams<{
    mode?: string | string[];
    value?: string | string[];
  }>();
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
    pageItemsByIndex,
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
  const summaryTop = insets.top + 67;
  const paginationBottom = PAGINATION_BOTTOM_OFFSET_FROM_TAB_TOP;
  const contentWidth = screenWidth - 48;
  const swipePageStride = contentWidth + SEARCH_PAGE_GAP;
  const pageIndices = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index),
    [totalPages],
  );

  const sectionOptions = useMemo(() => {
    const templateOptions = template.sections.map((section) => ({
      id: section.id,
      name: section.sectionName ?? section.id,
    }));

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["closet"] }),
      ]);
      showToast("수정이 완료됐어요.");
    } catch (error) {
      showToast(getActionErrorMessage(error, "수정에 실패했어요. 다시 시도해주세요."));
    }
  };
  const handleDeleteItem = () => {
    if (!selectedItem) {
      return;
    }

    showAlert({
      title: "옷 삭제",
      message: "정말 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.",
      confirmText: "삭제하기",
      cancelText: "취소",
      dismissible: false,
      onConfirm: async () => {
        try {
          await repository.deleteClothes(selectedItem.clothesId);
          removeItemOptimistic(selectedItem.clothesId);
          handleCloseDetailModal();
          showToast("옷 삭제에 성공하였습니다.");
        } catch (error) {
          await refetch();
          showToast(getActionErrorMessage(error, "삭제에 실패했습니다. 다시 시도해주세요."));
          return;
        }

        try {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
            queryClient.invalidateQueries({ queryKey: ["closet"] }),
          ]);
        } catch {
          await refetch();
        }
      },
    });
  };

  const handlePressClothesCapture = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressClothesImageSelect = async () => {
    setIsClothesGuideVisible(false);

    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      router.push({
        pathname: "/clothes/register/preview",
        params: { imageUri },
      });
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressShoppingMallLink = () => {
    setIsClothesGuideVisible(false);
    router.push(clothesRegistrationRoutes.shoppingMallTerms);
  };

  const handlePageMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / swipePageStride);
    const boundedPage = Math.min(Math.max(nextPage, 0), totalPages - 1);

    setPage(boundedPage);
  };

  const handlePaginationPress = (targetPage: number) => {
    if (targetPage === currentPage) {
      return;
    }

    pageListRef.current?.scrollToOffset({
      offset: targetPage * swipePageStride,
      animated: true,
    });
    setPage(targetPage);
  };

  const renderSearchPage = (targetPage: number) => {
    const targetItems = targetPage === currentPage ? items : (pageItemsByIndex[targetPage] ?? []);

    return (
      <View className="gap-2" style={{ width: contentWidth }}>
        {targetItems.map((item) => {
          const ColorIcon = getColorIcon(item.color);
          const CategoryIcon = getCategoryIcon(item.category);

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
                      <ColorIcon />
                      <CategoryIcon />
                    </>
                  ) : (
                    <>
                      <CategoryIcon />
                      <ColorIcon />
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
    );
  };

  const renderStatusScreen = (message: string) => (
    <View className="flex-1 bg-bg-light px-6">
      <View className="absolute left-6 z-10" style={{ top: insets.top + 15 }}>
        <BackButton accessibilityLabel="이전 화면으로 돌아가기" />
      </View>
      <View className="absolute left-0 right-0" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">
          검색 결과
        </Text>
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
    <>
      <View className="flex-1 bg-bg-light px-6">
        <View className="absolute left-6 z-10" style={{ top: insets.top + 15 }}>
          <BackButton accessibilityLabel="이전 화면으로 돌아가기" />
        </View>

        <View className="absolute left-0 right-0" style={{ top: insets.top + 15 }}>
          <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">
            검색 결과
          </Text>
        </View>

        {items.length > 0 ? (
          <>
            <View
              className="relative h-[134px] rounded-xl border-[0.5px] border-blue-3 bg-blue-1 px-[24px]"
              style={{ marginTop: summaryTop }}
            >
              <View className="absolute bottom-[20px] left-[21px] right-[21px] top-5 justify-between">
                <Text className="font-pretendard text-subhead text-text-subdued">검색 결과</Text>
                <Text className="font-pretendard-semibold text-headline text-text">
                  {totalCount}벌을 찾았습니다.
                </Text>
                <Text className="font-pretendard-light text-caption text-text-subdued">
                  {queryLabel}에 해당되는 유사한 옷 {totalCount}벌이 발견됐습니다.
                </Text>
              </View>
            </View>
            <View className="mt-[21px] overflow-hidden">
              <FlatList
                ref={pageListRef}
                horizontal
                bounces={false}
                data={pageIndices}
                decelerationRate="fast"
                disableIntervalMomentum
                getItemLayout={(_, index) => ({
                  length: swipePageStride,
                  offset: swipePageStride * index,
                  index,
                })}
                keyExtractor={(targetPage) => `search-page-${targetPage}`}
                onMomentumScrollEnd={handlePageMomentumEnd}
                pagingEnabled={false}
                renderItem={({ item: targetPage }) => renderSearchPage(targetPage)}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={swipePageStride}
                ItemSeparatorComponent={() => <View style={{ width: SEARCH_PAGE_GAP }} />}
              />
            </View>

            <View
              className="absolute left-0 right-0 flex-row items-center justify-center gap-[14px]"
              style={{ bottom: paginationBottom }}
            >
              {Array.from({ length: totalPages }).map((_, index) => (
                <Pressable
                  key={`page-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${index + 1} 페이지로 이동`}
                  hitSlop={10}
                  onPress={() => handlePaginationPress(index)}
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
                {searchMode === "color"
                  ? "해당 색상 옷이 없습니다."
                  : "해당 카테고리 옷이 없습니다."}
              </Text>
              <Text className="mt-3 font-pretendard text-body text-text-subdued">
                옷을 등록하러 가볼까요?
              </Text>
            </View>
            <View className="absolute left-0 right-0" style={{ bottom: 8 }}>
              <Button
                fullWidth
                label="옷 등록하기"
                onPress={() => setIsClothesGuideVisible(true)}
                size="lg"
                variant="primary"
              />
            </View>
          </View>
        )}

        <Modal
          animationType="fade"
          onRequestClose={handleCloseDetailModal}
          transparent
          visible={Boolean(selectedItem)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <View className="flex-1 items-center justify-center px-6">
              <Pressable
                accessibilityLabel="상세 모달 닫기"
                accessibilityRole="button"
                className="absolute inset-0 bg-black/20"
                onPress={handleCloseDetailModal}
                style={{ zIndex: 0 }}
              />

              {selectedItem ? (
                <View
                  accessibilityViewIsModal
                  className="w-[344px] rounded-2xl bg-white px-5 pb-5 pt-[22px]"
                  style={{ position: "relative", maxHeight: "90%", elevation: 2, zIndex: 1 }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-pretendard-semibold text-headline text-bg-dark">
                      상세보기
                    </Text>
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

                  <ScrollView
                    className="mt-[22px]"
                    contentContainerStyle={{ paddingBottom: 8 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={{ flexShrink: 1 }}
                  >
                    <View className="items-center">
                      <View className="h-[302px] w-[306px] overflow-hidden rounded-xl">
                        <Image
                          className="h-[302px] w-[306px]"
                          resizeMode="cover"
                          source={{ uri: selectedItem.imageUri }}
                        />
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
                        const ColorIcon = getColorIcon(selectedItem.color);
                        return <ColorIcon />;
                      })()}
                      {(() => {
                        const CategoryIcon = getCategoryIcon(selectedItem.category);
                        return <CategoryIcon />;
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
                                className="mt-2 max-h-[180px] w-[140px] rounded-md border-[0.5px] border-disabled bg-white"
                                style={{ zIndex: 999 }}
                              >
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
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
                                      <Text className="font-pretendard text-body text-text-subdued">
                                        {option.name}
                                      </Text>
                                    </Pressable>
                                  ))}
                                </ScrollView>
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
                            {...keyboardAccessory.getInputAccessoryProps(0)}
                            className="min-w-[120px] rounded-md border-[0.5px] border-disabled px-2 py-1 text-right font-pretendard text-body text-text-subdued"
                            keyboardType="numeric"
                            onChangeText={(value) =>
                              setDraftPriceInput(value.replace(/[^0-9]/g, ""))
                            }
                            value={draftPriceInput}
                          />
                        ) : (
                          <Text className="font-pretendard text-body text-text-subdued">
                            {(selectedItemDetailPrice ?? selectedItem.price).toLocaleString(
                              "ko-KR",
                            )}
                            원
                          </Text>
                        )}
                      </View>
                    </View>
                  </ScrollView>

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
                          setDraftSectionName(
                            selectedItemDetail?.sectionName ?? selectedItem.sectionName,
                          );
                        }}
                        size="sm"
                        variant="primary"
                        fullWidth
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        label="삭제하기"
                        onPress={handleDeleteItem}
                        size="sm"
                        variant="secondary"
                        fullWidth
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          </KeyboardAvoidingView>
          {keyboardAccessory.toolbar}
        </Modal>
      </View>
      <ClothesRegistrationGuideModal
        visible={isClothesGuideVisible}
        onClose={() => setIsClothesGuideVisible(false)}
        onPressCapture={handlePressClothesCapture}
        onPressSelectImage={handlePressClothesImageSelect}
        onPressShoppingMallLink={handlePressShoppingMallLink}
      />
    </>
  );
}
