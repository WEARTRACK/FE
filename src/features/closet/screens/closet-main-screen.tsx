import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetFrame from "../../../../assets/closet-frame.svg";
import DeleteIcon from "../../../../assets/delete.svg";
import EditIcon from "../../../../assets/edit.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import type { ClosetListItem } from "@/features/closet/api/closet-list-api";
import { deleteCloset } from "@/features/closet/api/closet-delete-api";
import { CLOSET_LAYOUTS } from "@/features/closet/constants/closet-layouts";
import { useClosetList } from "@/features/closet/hooks/use-closet-list";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";

const CAROUSEL_GAP = 24;
const FRAME_ASPECT_RATIO = 345 / 517;

function MoreIcon() {
  return (
    <View className="items-center gap-[3px]">
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
    </View>
  );
}

function ClosetPagination({
  activeIndex,
  totalCount,
}: {
  activeIndex: number;
  totalCount: number;
}) {
  return (
    <View className="mt-[24px] flex-row items-center justify-center gap-[8px]">
      {Array.from({ length: totalCount }, (_, index) => (
        <View
          key={`closet-dot-${index + 1}`}
          className={[
            "h-[8px] w-[8px] rounded-full",
            index === activeIndex ? "bg-accent" : "bg-disabled/40",
          ].join(" ")}
        />
      ))}
    </View>
  );
}

function ClosetCarouselCard({
  closet,
  frameHeight,
  frameWidth,
  isActive,
  displayName,
  onOpenSection,
}: {
  closet: ClosetListItem;
  frameHeight: number;
  frameWidth: number;
  isActive: boolean;
  displayName: string;
  onOpenSection: (sectionId: ClosetSectionId) => void;
}) {
  const slots = CLOSET_LAYOUTS[closet.templateId];
  const sectionNameById = new Map(
    closet.sections.map((section) => [section.id, section.sectionName]),
  );

  return (
    <View
      accessibilityLabel={`${displayName} 옷장`}
      style={{ width: frameWidth, opacity: isActive ? 1 : 0.42 }}
    >
      <View className="mb-[9px] items-start">
        <View className="max-w-full rounded-full border-[0.5px] border-blue-3 bg-blue-1 px-[18px] py-[6px]">
          <Text
            className="font-pretendard text-[12px] leading-[18px] text-text"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>
      </View>

      <View style={{ width: frameWidth, height: frameHeight }}>
        <ClosetFrame width={frameWidth} height={frameHeight} />
        <View className="absolute inset-0">
          {slots.map((slot) => {
            const sectionName = sectionNameById.get(slot.id);
            const slotHeight = (frameHeight * slot.height) / 100;
            const isCompact = slotHeight < 46;

            return (
              <TouchableOpacity
                key={slot.id}
                accessibilityLabel={sectionName ? `${sectionName} 열기` : "칸 열기"}
                accessibilityRole="button"
                activeOpacity={0.75}
                disabled={!isActive || !sectionName}
                onPress={() => onOpenSection(slot.id)}
                style={{
                  position: "absolute",
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  justifyContent: isCompact ? "center" : "flex-start",
                  paddingLeft: 12,
                  paddingTop: isCompact ? 0 : 12,
                  borderRadius: 6,
                  borderWidth: 0.8,
                  borderColor: colors.blue[3],
                  backgroundColor: colors.white,
                }}
              >
                <Text
                  className="font-pretendard text-[11px] leading-[15px] text-text-subdued"
                  numberOfLines={1}
                >
                  {sectionName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {isActive ? (
          <View
            pointerEvents="none"
            className="absolute left-0 right-0 rounded-[10px] border-2 border-accent"
            style={{ top: 0, bottom: 12 }}
          />
        ) : null}
      </View>
    </View>
  );
}

export function ClosetMainScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<ClosetListItem>>(null);
  const activeClosetId = useClosetStore((state) => state.closetId);
  const setClosetId = useClosetStore((state) => state.setClosetId);
  const clearCloset = useClosetStore((state) => state.clearCloset);
  const { data: closets = [], isLoading, error, refetch } = useClosetList();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const frameHeight = useMemo(
    () => Math.min(420, Math.max(330, screenHeight * 0.47)),
    [screenHeight],
  );
  const frameWidth = frameHeight * FRAME_ASPECT_RATIO;
  const sideInset = Math.max((screenWidth - frameWidth) / 2, 0);
  const snapInterval = frameWidth + CAROUSEL_GAP;
  const selectedCloset = closets[selectedIndex] ?? closets[0] ?? null;

  useEffect(() => {
    if (closets.length === 0) {
      setSelectedIndex(0);
      return;
    }

    const activeIndex = closets.findIndex((closet) => closet.closetId === activeClosetId);
    const nextIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextCloset = closets[nextIndex];
    setSelectedIndex(nextIndex);

    if (nextCloset && nextCloset.closetId !== activeClosetId) {
      setClosetId(nextCloset.closetId);
    }

    if (nextIndex > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ animated: false, index: nextIndex });
      });
    }
  }, [activeClosetId, closets, setClosetId]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.min(
      Math.max(Math.round(event.nativeEvent.contentOffset.x / snapInterval), 0),
      closets.length - 1,
    );
    const nextCloset = closets[nextIndex];
    setSelectedIndex(nextIndex);
    setIsActionsMenuVisible(false);

    if (nextCloset) {
      setClosetId(nextCloset.closetId);
    }
  };

  const handleOpenSection = (sectionId: ClosetSectionId) => {
    if (!selectedCloset) {
      return;
    }

    setClosetId(selectedCloset.closetId);
    router.push({
      pathname: "/closet/section/[sectionId]",
      params: {
        sectionId,
        closetId: String(selectedCloset.closetId),
      },
    });
  };

  const handleOpenStats = () => {
    if (!selectedCloset) {
      return;
    }

    setClosetId(selectedCloset.closetId);
    router.push({
      pathname: "/closet/stats",
      params: { closetId: String(selectedCloset.closetId) },
    });
  };

  const handlePressDelete = () => {
    setIsActionsMenuVisible(false);
    Alert.alert("옷장을 삭제하시겠습니까?", "삭제한 옷장은 복구할 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제하기",
        style: "destructive",
        onPress: () => void handleConfirmDelete(),
      },
    ]);
  };

  const handlePressRename = () => {
    setIsActionsMenuVisible(false);

    if (Platform.OS !== "ios") {
      Alert.alert("옷장 이름 수정", "이름 입력 알럿은 iOS에서만 지원합니다.", [{ text: "확인" }]);
      return;
    }

    Alert.prompt(
      "옷장 이름 수정",
      "이름을 입력해주세요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: (nextName?: string) => {
            if (!nextName?.trim()) {
              showToast("옷장 이름을 입력해주세요.");
              return;
            }

            showToast("옷장 이름 수정 기능은 준비 중입니다.");
          },
        },
      ],
      "plain-text",
      selectedCloset?.closetName ?? "",
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedCloset || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCloset(selectedCloset.closetId);
      clearCloset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["closet"] }),
      ]);
      showToast("옷장이 삭제되었습니다.");
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.code === "CLOSET_4015") {
        Alert.alert("옷이 있는 옷장은 삭제할 수 없습니다.", "옷을 모두 비워주세요.", [
          { text: "확인" },
        ]);
        return;
      }

      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "옷장을 삭제하지 못했어요. 다시 시도해주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-light" style={{ paddingTop: insets.top + 15, paddingBottom: 12 }}>
      <View className="h-6 justify-center px-6">
        <View className="absolute left-6 z-10">
          <BackButton
            accessibilityLabel="홈으로 돌아가기"
            onPress={() => router.replace("/home")}
          />
        </View>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">
          내 옷장
        </Text>
        {selectedCloset ? (
          <Pressable
            accessibilityLabel="옷장 메뉴 열기"
            accessibilityRole="button"
            className="absolute right-6 h-6 w-6 items-center justify-center"
            hitSlop={12}
            onPress={() => setIsActionsMenuVisible((current) => !current)}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          >
            <MoreIcon />
          </Pressable>
        ) : null}
      </View>

      {isActionsMenuVisible ? (
        <>
          <Pressable
            accessibilityLabel="옷장 메뉴 닫기"
            className="absolute inset-0 z-20"
            onPress={() => setIsActionsMenuVisible(false)}
          />
          <View
            className="absolute right-6 z-40 w-[210px] rounded-lg border-[0.5px] border-disabled bg-white px-4 py-3"
            style={{
              top: insets.top + 52,
              elevation: 5,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.14,
              shadowRadius: 6,
            }}
          >
            <View className="flex-row items-center justify-end">
              <Pressable
                accessibilityLabel="옷장 메뉴 닫기"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsActionsMenuVisible(false)}
              >
                <Text className="font-pretendard text-[28px] leading-[24px] text-text">×</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              className="h-[40px] flex-row items-center gap-[12px]"
              onPress={handlePressDelete}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <DeleteIcon height={24} width={24} />
              <Text className="font-pretendard text-[14px] leading-[20px] text-error">
                옷장 삭제
              </Text>
            </Pressable>
            <View className="h-[0.5px] bg-disabled" />
            <Pressable
              accessibilityRole="button"
              className="h-[40px] flex-row items-center gap-[12px]"
              onPress={handlePressRename}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <EditIcon height={24} width={24} />
              <Text className="font-pretendard text-[14px] leading-[20px] text-text">
                이름 수정하기
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="font-pretendard text-body text-text-subdued">
            옷장을 불러오고 있습니다.
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-pretendard text-body text-text-subdued">
            옷장 목록을 불러오지 못했어요.
          </Text>
          <View className="mt-5 w-full">
            <Button
              fullWidth
              label="다시 시도"
              onPress={() => void refetch()}
              variant="secondary"
            />
          </View>
        </View>
      ) : closets.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-text">
            등록된 옷장이 없습니다.
          </Text>
          <Text className="mt-2 text-center font-pretendard text-body text-text-subdued">
            옷장을 등록하면 여러 옷장을 넘겨보며 관리할 수 있어요.
          </Text>
          <View className="mt-6 w-full">
            <Button
              fullWidth
              label="옷장 등록하기"
              onPress={() => router.push("/closet/register/preview")}
            />
          </View>
        </View>
      ) : (
        <>
          <View className="flex-1 justify-center">
            <FlatList
              ref={listRef}
              horizontal
              bounces={false}
              contentContainerStyle={{ paddingHorizontal: sideInset, paddingTop: 40 }}
              style={{ flexGrow: 0, height: frameHeight + 88 }}
              data={closets}
              decelerationRate="fast"
              disableIntervalMomentum
              getItemLayout={(_, index) => ({
                index,
                length: snapInterval,
                offset: snapInterval * index,
              })}
              ItemSeparatorComponent={() => <View style={{ width: CAROUSEL_GAP }} />}
              keyExtractor={(item) => String(item.closetId)}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              renderItem={({ item, index }) => (
                <ClosetCarouselCard
                  closet={item}
                  displayName={item.closetName.trim() || `내 옷장 ${index + 1}`}
                  frameHeight={frameHeight}
                  frameWidth={frameWidth}
                  isActive={selectedIndex === index}
                  onOpenSection={handleOpenSection}
                />
              )}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={snapInterval}
            />

            <ClosetPagination activeIndex={selectedIndex} totalCount={closets.length} />
          </View>

          <View className="px-6 pt-5">
            <Button
              disabled={!selectedCloset || isDeleting}
              fullWidth
              label={isDeleting ? "삭제 중..." : "옷장 열기"}
              onPress={handleOpenStats}
              className="h-[58px] rounded-[12px]"
              textClassName="font-pretendard-semibold text-[18px] leading-[24px]"
            />
          </View>
        </>
      )}
    </View>
  );
}
