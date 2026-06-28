import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import ClothesIcon from "../../../../assets/clothes-icon.svg";
import GridActiveIcon from "../../../../assets/grid-active.svg";
import GridInactiveIcon from "../../../../assets/grid-inactive.svg";
import ListActiveIcon from "../../../../assets/list-active.svg";
import ListInactiveIcon from "../../../../assets/list-inactive.svg";
import PageActiveIcon from "../../../../assets/page-active.svg";
import PageInactiveIcon from "../../../../assets/page-inactive.svg";
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
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import {
  useClosetItemsBySection,
  useClosetTemplate,
} from "@/features/closet/hooks/use-closet-data";
import { isClosetSectionId, type ClosetSectionId } from "@/features/closet/types/closet-layout";
import { getCategoryIcon, getColorIcon } from "@/features/closet/utils/closet-tag-icons";
import { ApiError } from "@/lib/api/errors";
import { queryClient } from "@/lib/queryClient";
import { showToast } from "@/lib/ui/showToast";

type ViewMode = "grid" | "list";

const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 4;
const BACK_BUTTON_SIZE = 24;
const HEADLINE_LINE_HEIGHT = 20;
const GRID_COLUMNS = 3;
const GRID_COLUMN_GAP = 6;
const GRID_ROW_GAP = 8;
const PAGINATION_BOTTOM_OFFSET_FROM_TAB_TOP = 48;
const SWIPE_PAGE_GAP = 24;

export function ClosetSectionScreen() {
  const router = useRouter();
  const repository = useMemo(() => getClosetRepository(), []);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();

  const currentSectionId: ClosetSectionId =
    sectionId && isClosetSectionId(sectionId) ? sectionId : "section-1";
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemDetailPrice, setSelectedItemDetailPrice] = useState<number | null>(null);
  const [selectedItemDetailSectionName, setSelectedItemDetailSectionName] = useState<string | null>(
    null,
  );
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [updatedItemsById, setUpdatedItemsById] = useState<
    Record<string, { price: number; sectionId: ClosetSectionId; sectionName: string }>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [draftPriceInput, setDraftPriceInput] = useState("");
  const [draftSectionId, setDraftSectionId] = useState<ClosetSectionId | null>(null);
  const [draftSectionName, setDraftSectionName] = useState<string | null>(null);
  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);
  const lastToastMessageRef = useRef<string | null>(null);
  const pageListRef = useRef<FlatList<number>>(null);

  const { template } = useClosetTemplate();
  const {
    items: sectionItems,
    isLoading,
    error,
    refetch,
  } = useClosetItemsBySection(currentSectionId);
  const visibleSectionItems = useMemo(() => {
    const patched = sectionItems
      .map((item) => {
        const updated = updatedItemsById[item.id];
        if (!updated) {
          return item;
        }

        return {
          ...item,
          price: updated.price,
          sectionId: updated.sectionId,
        };
      })
      .filter((item) => item.sectionId === currentSectionId);

    return patched.filter((item) => !deletedItemIds.includes(item.id));
  }, [currentSectionId, deletedItemIds, sectionItems, updatedItemsById]);
  const selectedItem = useMemo(
    () => visibleSectionItems.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId, visibleSectionItems],
  );
  const selectedItemOverride = selectedItem ? updatedItemsById[selectedItem.id] : null;
  const sectionNameById = useMemo(
    () => new Map(template.sections.map((section) => [section.id, section.sectionName])),
    [template.sections],
  );

  const sectionName = useMemo(() => {
    const found = template.sections.find((section) => section.id === currentSectionId);
    return found?.sectionName ?? "칸 조회";
  }, [currentSectionId, template.sections]);
  const sectionOptions = useMemo(
    () =>
      template.sections.map((section) => ({
        id: section.id,
        name: section.sectionName ?? section.id,
      })),
    [template.sections],
  );

  const contentWidth = screenWidth - 48;
  const gridItemSize = (contentWidth - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const gridContentWidth = gridItemSize * GRID_COLUMNS + GRID_COLUMN_GAP * (GRID_COLUMNS - 1);

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.ceil(visibleSectionItems.length / pageSize);
  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);

  const backButtonTop = insets.top + 14;
  const titleTop = backButtonTop + BACK_BUTTON_SIZE + 29;
  const countTop = titleTop + HEADLINE_LINE_HEIGHT + 29;
  const contentTop = countTop + 36;
  const viewToggleTop = titleTop - 8;
  const paginationBottom = PAGINATION_BOTTOM_OFFSET_FROM_TAB_TOP;
  const swipePageStride = contentWidth + SWIPE_PAGE_GAP;
  const pageIndices = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index),
    [totalPages],
  );

  const getPageItems = useCallback(
    (targetPage: number) =>
      visibleSectionItems.slice(targetPage * pageSize, targetPage * pageSize + pageSize),
    [pageSize, visibleSectionItems],
  );

  const renderPageContent = (targetPage: number) => {
    const targetPageItems = getPageItems(targetPage);

    if (viewMode === "grid") {
      const gridRows = Array.from(
        { length: Math.ceil(targetPageItems.length / GRID_COLUMNS) },
        (_, rowIndex) =>
          targetPageItems.slice(rowIndex * GRID_COLUMNS, rowIndex * GRID_COLUMNS + GRID_COLUMNS),
      );

      return (
        <View style={{ alignSelf: "center", width: gridContentWidth }}>
          {gridRows.map((rowItems, rowIndex) => (
            <View
              key={`grid-row-${targetPage}-${rowIndex}`}
              className="flex-row"
              style={{
                justifyContent: "space-between",
                marginBottom: rowIndex === gridRows.length - 1 ? 0 : GRID_ROW_GAP,
                width: gridContentWidth,
              }}
            >
              {Array.from({ length: GRID_COLUMNS }, (_, columnIndex) => {
                const item = rowItems[columnIndex];

                if (!item) {
                  return (
                    <View
                      key={`grid-placeholder-${targetPage}-${rowIndex}-${columnIndex}`}
                      style={{ width: gridItemSize, height: gridItemSize }}
                    />
                  );
                }

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.colorLabel} ${item.categoryLabel}`}
                    className="overflow-hidden rounded-[13.2px] border-[0.55px] border-text-subdued"
                    onPress={() => handleItemPress(item.id)}
                    style={({ pressed }) => ({
                      width: gridItemSize,
                      height: gridItemSize,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Image
                      resizeMode="cover"
                      source={{ uri: item.imageUri }}
                      style={{ width: gridItemSize, height: gridItemSize }}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View className="gap-2">
        {targetPageItems.map((item) => {
          const ColorIcon = getColorIcon(item.color);
          const CategoryIcon = getCategoryIcon(item.category);

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
                  <ColorIcon />
                  <CategoryIcon />
                </View>
                <Text className="ml-[5px] mt-[13px] font-pretendard text-body text-bg-dark">
                  {sectionName}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const handleToggleView = (nextViewMode: ViewMode) => {
    setViewMode(nextViewMode);
    setPage(0);
    requestAnimationFrame(() => {
      pageListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
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

  const handleItemPress = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleCloseDetailModal = () => {
    setSelectedItemId(null);
    setSelectedItemDetailPrice(null);
    setSelectedItemDetailSectionName(null);
    setIsEditing(false);
    setIsSectionDropdownOpen(false);
    setDraftPriceInput("");
    setDraftSectionId(null);
    setDraftSectionName(null);
  };

  const resolveClothesId = (itemId: string) => {
    const match = itemId.match(/(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  const getActionErrorMessage = (error: unknown, fallback: string) => {
    if (!(error instanceof ApiError)) {
      return fallback;
    }

    if (error.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인해주세요.";
    }

    if (error.status === 404) {
      return "대상 옷을 찾을 수 없습니다.";
    }

    return fallback;
  };

  useEffect(() => {
    setDeletedItemIds([]);
    setUpdatedItemsById({});
    setPage(0);
    pageListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [currentSectionId]);

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

  useEffect(() => {
    let isActive = true;

    async function fetchDetail() {
      if (!selectedItem) {
        setSelectedItemDetailPrice(null);
        setSelectedItemDetailSectionName(null);
        return;
      }

      const clothesId = resolveClothesId(selectedItem.id);
      if (!clothesId) {
        setSelectedItemDetailPrice(null);
        setSelectedItemDetailSectionName(null);
        return;
      }

      try {
        const detail = await repository.getClothesDetail(clothesId);
        if (!isActive) {
          return;
        }
        setSelectedItemDetailPrice(detail.price);
        setSelectedItemDetailSectionName(detail.sectionName);
        setDraftPriceInput(String(detail.price));
        setDraftSectionId(detail.sectionId);
        setDraftSectionName(detail.sectionName);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setSelectedItemDetailPrice(null);
        setSelectedItemDetailSectionName(null);
        showToast(getActionErrorMessage(error, "상세 정보를 불러오지 못했어요."));
      }
    }

    fetchDetail();

    return () => {
      isActive = false;
    };
  }, [repository, selectedItem]);

  const handleEditItem = async () => {
    if (!selectedItem) {
      return;
    }

    const clothesId = resolveClothesId(selectedItem.id);
    if (!clothesId) {
      showToast("옷 ID를 확인할 수 없어 수정할 수 없습니다.");
      return;
    }

    if (!isEditing) {
      setIsEditing(true);
      setIsSectionDropdownOpen(false);
      setDraftPriceInput(String(selectedItemDetailPrice ?? selectedItem.price));
      setDraftSectionId(selectedItem.sectionId);
      setDraftSectionName(
        selectedItemDetailSectionName ?? sectionNameById.get(selectedItem.sectionId) ?? sectionName,
      );
      return;
    }

    const nextPrice = Number(draftPriceInput.replace(/[^0-9]/g, ""));
    const nextSectionId = draftSectionId ?? selectedItem.sectionId;
    const currentPrice = selectedItemDetailPrice ?? selectedItem.price;
    const hasSectionChanged = nextSectionId !== selectedItem.sectionId;

    if (!Number.isFinite(nextPrice)) {
      showToast("가격을 입력해주세요.");
      return;
    }

    if (nextPrice === currentPrice && !hasSectionChanged) {
      showToast("변경된 내용이 없습니다.");
      setIsEditing(false);
      setIsSectionDropdownOpen(false);
      return;
    }

    try {
      const detail = await repository.getClothesDetail(clothesId);
      const updated = await repository.updateClothes(clothesId, {
        color: detail.color,
        category: detail.category,
        price: nextPrice,
        sectionId: nextSectionId,
      });
      setSelectedItemDetailPrice(updated.price);
      setSelectedItemDetailSectionName(updated.sectionName);
      setDraftSectionId(updated.sectionId);
      setDraftSectionName(updated.sectionName);
      setUpdatedItemsById((current) => ({
        ...current,
        [selectedItem.id]: {
          price: updated.price,
          sectionId: updated.sectionId,
          sectionName: updated.sectionName,
        },
      }));
      setIsEditing(false);
      setIsSectionDropdownOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["home-summary"] });
      if (updated.sectionId !== currentSectionId) {
        handleCloseDetailModal();
      }
      showToast("수정이 완료됐어요.");
    } catch (error) {
      showToast(getActionErrorMessage(error, "수정에 실패했어요. 다시 시도해주세요."));
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) {
      return;
    }

    const clothesId = resolveClothesId(selectedItem.id);
    if (!clothesId) {
      showToast("옷 ID를 확인할 수 없어 삭제할 수 없습니다.");
      return;
    }

    Alert.alert("옷 삭제", "정말 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          setDeletedItemIds((current) => [...current, selectedItem.id]);
          handleCloseDetailModal();
          try {
            await repository.deleteClothes(clothesId);
            await queryClient.invalidateQueries({ queryKey: ["home-summary"] });
            showToast("옷 삭제에 성공하였습니다.");
          } catch (error) {
            setDeletedItemIds((current) => current.filter((itemId) => itemId !== selectedItem.id));
            showToast(getActionErrorMessage(error, "삭제에 실패했습니다. 다시 시도해주세요."));
          }
        },
      },
    ]);
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

  return (
    <>
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

        {!isLoading && !error && visibleSectionItems.length > 0 ? (
          <>
            <Text
              className="absolute left-6 font-pretendard text-body text-bg-dark"
              style={{ top: countTop }}
            >
              총 {visibleSectionItems.length}벌
            </Text>

            <View
              className="absolute right-6 flex-row items-center gap-[7px]"
              style={{ top: viewToggleTop }}
            >
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

        {!isLoading && !error && visibleSectionItems.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ClothesIcon width={157} height={145} />
            <Text className="mt-8 font-pretendard-semibold text-headline text-bg-dark">
              등록된 옷이 없습니다.
            </Text>
            <Text className="mt-4 font-pretendard text-body text-text-subdued">
              옷을 등록하러 가볼까요?
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Text className="font-pretendard text-body text-text-subdued">불러오는 중입니다.</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Text className="font-pretendard text-body text-text-subdued">
              불러오기에 실패했어요.
            </Text>
          </View>
        ) : null}

        {!isLoading && !error && visibleSectionItems.length > 0 ? (
          <View
            className="absolute left-6 right-6 overflow-hidden"
            style={{ top: contentTop }}
          >
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
              initialScrollIndex={currentPage}
              key={`${viewMode}-${pageSize}`}
              keyExtractor={(targetPage) => `swipe-page-${targetPage}`}
              onMomentumScrollEnd={handlePageMomentumEnd}
              pagingEnabled={false}
              renderItem={({ item: targetPage }) => (
                <View style={{ width: contentWidth }}>{renderPageContent(targetPage)}</View>
              )}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={swipePageStride}
              ItemSeparatorComponent={() => <View style={{ width: SWIPE_PAGE_GAP }} />}
            />
          </View>
        ) : null}

        {!isLoading && !error && visibleSectionItems.length > 0 ? (
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
        ) : null}

        {!isLoading && !error && visibleSectionItems.length === 0 ? (
          <View className="absolute left-6 right-6" style={{ bottom: 8 }}>
            <Button
              fullWidth
              label="옷 등록하기"
              onPress={() => setIsClothesGuideVisible(true)}
              size="lg"
              variant="primary"
            />
          </View>
        ) : null}

        {!isLoading && error ? (
          <View className="absolute left-6 right-6" style={{ bottom: 8 }}>
            <Button fullWidth label="다시 시도" onPress={refetch} size="lg" variant="primary" />
          </View>
        ) : null}

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
              />

              {selectedItem ? (
                <View
                  accessibilityViewIsModal
                  className="w-[344px] rounded-2xl bg-white p-5"
                  style={{ maxHeight: "90%" }}
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
                    className="mt-6"
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

                    <View className="mt-6 gap-4">
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
                                {draftSectionName ??
                                  selectedItemOverride?.sectionName ??
                                  sectionNameById.get(selectedItem.sectionId) ??
                                  sectionName}
                              </Text>
                            </Pressable>
                            {isSectionDropdownOpen ? (
                              <View
                                className="absolute right-0 top-9 max-h-[180px] w-[140px] rounded-md border-[0.5px] border-disabled bg-white"
                                style={{ position: "absolute", zIndex: 999 }}
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
                            {selectedItemDetailSectionName ??
                              selectedItemOverride?.sectionName ??
                              sectionNameById.get(selectedItem.sectionId) ??
                              sectionName}
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
                            {(
                              selectedItemDetailPrice ??
                              selectedItemOverride?.price ??
                              selectedItem.price
                            ).toLocaleString("ko-KR")}
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
                        onPress={handleEditItem}
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
