import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";

import { ClothesRegistrationGuideModal } from "@/features/clothes-registration/components/ClothesRegistrationGuideModal";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import { useClosetItemsBySection, useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import { ClosetItemBrowserScreen } from "@/features/closet/components/ClosetItemBrowserScreen";
import { isClosetSectionId, type ClosetSectionId } from "@/features/closet/types/closet-layout";
import type { ClosetItem } from "@/features/closet/types/closet-item";
import { queryClient } from "@/lib/queryClient";
import { showToast } from "@/lib/ui/showToast";
import { ApiError } from "@/lib/api/errors";
import { weeklyReviewQueryKeys } from "@/features/weekly-review/api/weekly-review-query-keys";
import { useSessionStore } from "@/stores/useSessionStore";

function toBrowserItem(item: ClosetItem, sectionName: string) {
  const clothesId = Number(item.id);

  return {
    id: item.id,
    clothesId: Number.isFinite(clothesId) ? clothesId : null,
    imageUri: item.imageUri,
    color: item.color,
    colorLabel: item.colorLabel,
    category: item.category,
    categoryLabel: item.categoryLabel,
    price: item.price,
    sectionId: item.sectionId,
    sectionName,
  };
}

export function ClosetSectionScreen() {
  const router = useRouter();
  const repository = useMemo(() => getClosetRepository(), []);
  const memberId = useSessionStore((state) => state.memberId);
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
  const [isClothesGuideVisible, setIsClothesGuideVisible] = useState(false);

  const currentSectionId: ClosetSectionId =
    sectionId && isClosetSectionId(sectionId) ? sectionId : "section-1";

  const { template } = useClosetTemplate();
  const {
    items: sectionItems,
    isLoading,
    error,
    refetch,
  } = useClosetItemsBySection(currentSectionId);

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

  const browserItems = useMemo(
    () => sectionItems.map((item) => toBrowserItem(item, sectionName)),
    [sectionItems, sectionName],
  );

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

  const getActionErrorMessage = (requestError: unknown, fallback: string) => {
    if (!(requestError instanceof ApiError)) {
      return fallback;
    }

    if (requestError.code === "NETWORK_ERROR") {
      return "네트워크 연결을 확인해주세요.";
    }

    if (requestError.status === 404) {
      return "대상 옷을 찾을 수 없습니다.";
    }

    if (requestError.code === "INVALID_ENUM_MAPPING" || requestError.code === "INVALID_RESPONSE") {
      return "서버 응답 형식이 올바르지 않습니다.";
    }

    return fallback;
  };

  return (
    <>
      <ClosetItemBrowserScreen
        title={sectionName}
        backButtonAccessibilityLabel="내 옷장으로 돌아가기"
        items={browserItems}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        currentSectionId={currentSectionId}
        emptyTitle="등록된 옷이 없습니다."
        emptyDescription="옷을 등록하러 가볼까요?"
        emptyActionLabel="옷 등록하기"
        onEmptyActionPress={() => setIsClothesGuideVisible(true)}
        sectionOptions={sectionOptions}
        onLoadDetail={repository.getClothesDetail}
        onUpdateItem={repository.updateClothes}
        onDeleteItem={async (clothesId) => {
          await repository.deleteClothes(clothesId);
        }}
        onMutationSuccess={async () => {
          refetch();

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["home-summary"] }),
            memberId == null
              ? Promise.resolve()
              : queryClient.invalidateQueries({
                  queryKey: weeklyReviewQueryKeys.currentWeeklyReview(memberId),
                }),
            memberId == null
              ? Promise.resolve()
              : queryClient.invalidateQueries({
                  queryKey: weeklyReviewQueryKeys.longUnwornClothes(memberId),
                }),
          ]);
        }}
        getActionErrorMessage={getActionErrorMessage}
      />
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
