import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ArrowBackIcon from "../../../../assets/arrow_back.svg";
import CheckActiveIcon from "../../../../assets/check-active.svg";
import { Button } from "@/components/common/Button";
import { colors } from "@/constants/colors";
import { createCloset } from "@/features/clothes-registration/api/createCloset";
import { uploadClosetPhoto } from "@/features/clothes-registration/api/uploadClosetPhoto";
import {
  getClosetTemplateRequestId,
  getClosetTemplateSections,
} from "@/features/clothes-registration/screens/closet-template-data";
import { getParamString } from "@/features/clothes-registration/utils/clothesAnalysisParams";
import {
  parseNumericParam,
  parsePredictedSections,
} from "@/features/clothes-registration/utils/closetRegistrationParams";
import { showToast } from "@/lib/ui/showToast";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";
import { useClosetStore } from "@/stores/useClosetStore";

const maxNameLength = 10;

function SectionNumberBadge({ index, completed }: { index: number; completed: boolean }) {
  return (
    <View
      className={[
        "h-[32px] w-[32px] items-center justify-center rounded",
        completed ? "bg-bg-dark" : "border-[0.5px] border-disabled bg-white",
      ].join(" ")}
    >
      <Text
        className={[
          "font-pretendard text-[13px] leading-[20px]",
          completed ? "text-primary" : "text-text-subdued",
        ].join(" ")}
      >
        {index + 1}
      </Text>
    </View>
  );
}

function SectionNameInput({
  value,
  showError,
  onChangeText,
  onBlur,
  isLast,
}: {
  value: string;
  index: number;
  showError: boolean;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  isLast: boolean;
}) {
  const completed = value.trim().length > 0;

  return (
    <TextInput
      className={[
        [
          "h-[44px] rounded-lg px-[22px] font-pretendard text-[12px] text-bg-dark",
          completed ? "w-[208px]" : "w-[250px]",
        ].join(" "),
        completed
          ? "border-[0.5px] border-disabled bg-cool"
          : showError
            ? "border-[0.5px] border-dashed border-error bg-white text-text-subdued"
            : "border-[0.5px] border-dashed border-disabled bg-white text-text-subdued",
      ].join(" ")}
      maxLength={maxNameLength}
      onBlur={onBlur}
      onChangeText={onChangeText}
      placeholder={`칸 이름을 입력해주세요 (0/${maxNameLength})`}
      placeholderTextColor={colors.disabled}
      returnKeyType={isLast ? "done" : "next"}
      style={{ includeFontPadding: false, lineHeight: 16, paddingBottom: 2, paddingTop: 0 }}
      textAlignVertical="center"
      value={value}
    />
  );
}

export function ClosetLabelingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    imageUri: imageUriParam,
    imageUrl: imageUrlParam,
    templateId: templateIdParam,
    predictedSections: predictedSectionsParam,
  } = useLocalSearchParams<{
    imageUri?: string;
    imageUrl?: string;
    templateId?: string;
    predictedSections?: string;
  }>();
  const draftImageUri = useClosetRegistrationStore((state) => state.imageUri);
  const draftImageUrl = useClosetRegistrationStore((state) => state.imageUrl);
  const draftTemplateId = useClosetRegistrationStore((state) => state.templateId);
  const draftPredictedSections = useClosetRegistrationStore((state) => state.predictedSections);
  const setClosetDraft = useClosetRegistrationStore((state) => state.setDraft);
  const resetClosetDraft = useClosetRegistrationStore((state) => state.resetDraft);
  const setClosetId = useClosetStore((state) => state.setClosetId);
  const imageUri = getParamString(imageUriParam) ?? draftImageUri;
  const imageUrl = getParamString(imageUrlParam) ?? draftImageUrl;
  const rawTemplateId = getParamString(templateIdParam) ?? draftTemplateId;
  const templateId =
    parseNumericParam(templateIdParam) ??
    getClosetTemplateRequestId(rawTemplateId ?? undefined) ??
    getClosetTemplateRequestId(draftTemplateId ?? undefined);
  const predictedSections = useMemo(() => {
    const parsedSections = parsePredictedSections(predictedSectionsParam);
    return parsedSections.length > 0 ? parsedSections : draftPredictedSections;
  }, [draftPredictedSections, predictedSectionsParam]);
  const detectedClosetSections = useMemo(
    () => {
      if (predictedSections.length > 0) {
        return predictedSections.map((section) => ({
          id: `closet-section-${section.sectionOrder}`,
          initialName: "",
          sectionOrder: section.sectionOrder,
        }));
      }

      return getClosetTemplateSections(rawTemplateId ?? undefined).map((section, index) => ({
        id: section.id,
        initialName: section.initialName,
        sectionOrder: index + 1,
      }));
    },
    [predictedSections, rawTemplateId],
  );
  const [sectionNames, setSectionNames] = useState(() =>
    detectedClosetSections.map((section) => section.initialName),
  );
  const [touchedSectionIds, setTouchedSectionIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSectionNames(detectedClosetSections.map((section) => section.initialName));
    setTouchedSectionIds([]);
  }, [detectedClosetSections]);

  const detectedSectionCount = detectedClosetSections.length;
  const completedSectionCount = useMemo(
    () => sectionNames.filter((name) => name.trim().length > 0).length,
    [sectionNames],
  );
  const isComplete = completedSectionCount === detectedSectionCount;
  const shouldShowError = !isComplete && touchedSectionIds.length > 0;

  const updateSectionName = (index: number, value: string) => {
    setSectionNames((currentNames) =>
      currentNames.map((currentName, currentIndex) =>
        currentIndex === index ? value : currentName,
      ),
    );
  };

  const markSectionTouched = (sectionId: string) => {
    setTouchedSectionIds((currentIds) =>
      currentIds.includes(sectionId) ? currentIds : [...currentIds, sectionId],
    );
  };

  const handleSave = async () => {
    if (!isComplete || isSaving) {
      return;
    }

    if (templateId === null) {
      showToast("옷장 템플릿 정보를 확인할 수 없어요. 다시 시도해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      let resolvedImageUrl = imageUrl;

      if (!resolvedImageUrl && imageUri) {
        const uploadResult = await uploadClosetPhoto(imageUri, templateId);
        resolvedImageUrl = uploadResult.imageUrl;
        setClosetDraft({
          imageUrl: uploadResult.imageUrl,
          predictedSections:
            uploadResult.predictedSections.length > 0
              ? uploadResult.predictedSections
              : draftPredictedSections,
        });
      }

      if (!resolvedImageUrl) {
        showToast("옷장 사진 정보를 확인할 수 없어요. 다시 시도해주세요.");
        return;
      }

      const createdCloset = await createCloset({
        templateId,
        imageUrl: resolvedImageUrl,
        sections: detectedClosetSections.map((section, index) => ({
          sectionOrder: section.sectionOrder,
          sectionName: sectionNames[index]?.trim() ?? "",
        })),
      });

      setClosetId(createdCloset.closetId);
      resetClosetDraft();
      router.replace({
        pathname: "/closet/register/complete",
        params: { closetId: String(createdCloset.closetId) },
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "옷장 등록에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View
        className="flex-1 bg-bg-light px-6"
        style={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View className="h-[32px] flex-row items-center justify-between">
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
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
            옷장등록
          </Text>
          <View className="w-[32px]" />
        </View>

        <Text className="mt-[30px] font-pretendard-semibold text-[20px] leading-[24px] text-text">
          {isComplete ? "모든 칸 이름이 입력됐습니다." : "칸 이름을 입력해주세요."}
        </Text>

        <View className="mt-[26px] gap-[8px]">
          {detectedClosetSections.map((section, index) => {
            const value = sectionNames[index] ?? "";
            const completed = value.trim().length > 0;
            const isTouched = touchedSectionIds.includes(section.id);
            const showInputError = !completed && (shouldShowError || isTouched);

            return (
              <View key={section.id} className="h-[44px] flex-row items-center">
                <SectionNumberBadge completed={completed} index={index} />

                <View className="ml-[16px]">
                  <SectionNameInput
                    index={index}
                    isLast={index === detectedClosetSections.length - 1}
                    onBlur={() => markSectionTouched(section.id)}
                    onChangeText={(nextValue) => updateSectionName(index, nextValue)}
                    showError={showInputError}
                    value={value}
                  />
                </View>

                <View className={completed ? "ml-[16px] w-[28px] items-center" : "w-0"}>
                  {completed ? <CheckActiveIcon width={28} height={28} /> : null}
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-auto">
          {shouldShowError ? (
            <Text className="mb-[18px] font-pretendard text-[12px] leading-[20px] text-error">
              모든 칸 이름이 입력돼야 합니다.
            </Text>
          ) : null}

          <Button
            disabled={!isComplete || isSaving}
            fullWidth
            onPress={handleSave}
            label={
              isSaving
                ? "저장 중..."
                : isComplete
                  ? "저장하기"
                  : `저장하기(${completedSectionCount}/${detectedSectionCount})`
            }
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[30px]"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
