import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetFrame from "../../../../assets/closet-frame.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { deleteCloset } from "@/features/closet/api/closet-delete-api";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { CLOSET_LAYOUTS } from "@/features/closet/constants/closet-layouts";
import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetStore } from "@/stores/useClosetStore";

const LABEL_CENTER_THRESHOLD_PX = 71;

function MoreIcon() {
  return (
    <View className="items-center gap-[3px]">
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
      <View className="h-[3px] w-[3px] rounded-full bg-text" />
    </View>
  );
}

export function ClosetMainScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const closetId = useClosetStore((state) => state.closetId);
  const clearCloset = useClosetStore((state) => state.clearCloset);
  const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      "",
    );
  };

  const handleConfirmDelete = async () => {
    if (closetId === null || isDeleting) {
      if (closetId === null) {
        showToast("삭제할 옷장 정보를 확인할 수 없어요.");
      }
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCloset(closetId);
      clearCloset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["closet"] }),
      ]);
      showToast("옷장이 삭제되었습니다.");
      router.replace("/home");
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
    <View className="flex-1 bg-bg-light">
      <View className="absolute left-0 right-0 z-30" style={{ top: insets.top + 15 }}>
        <Text className="text-center font-pretendard-semibold text-headline text-text-subdued">
          내 옷장
        </Text>
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
            <View className="flex-row items-center justify-between">
              <Text className="font-pretendard-semibold text-[14px] leading-[20px] text-text">
                옷장 관리
              </Text>
              <Pressable
                accessibilityLabel="옷장 메뉴 닫기"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsActionsMenuVisible(false)}
              >
                <Text className="font-pretendard text-[24px] leading-[24px] text-text">×</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              className="mt-2 h-[42px] justify-center"
              onPress={handlePressDelete}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <Text className="font-pretendard text-[14px] leading-[20px] text-error">
                옷장 삭제
              </Text>
            </Pressable>
            <View className="h-[0.5px] bg-cool" />
            <Pressable
              accessibilityRole="button"
              className="h-[42px] justify-center"
              onPress={handlePressRename}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <Text className="font-pretendard text-[14px] leading-[20px] text-text">
                옷장 이름 수정하기
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

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
