import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import CheckActiveIcon from "../../../../assets/check-active.svg";
import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import { colors } from "@/constants/colors";
import { createCloset } from "@/features/clothes-registration/api/createCloset";
import { ClosetRegistrationHeader } from "@/features/clothes-registration/screens/ClosetRegistrationHeader";
import {
  getClosetTemplate,
  getClosetTemplateSections,
} from "@/features/clothes-registration/screens/closet-template-data";
import { invalidateRegistrationQueries } from "@/features/onboarding/utils/invalidateRegistrationQueries";
import { ApiError } from "@/lib/api/errors";
import { showToast } from "@/lib/ui/showToast";
import { useClosetRegistrationStore } from "@/stores/useClosetRegistrationStore";
import { useClosetStore } from "@/stores/useClosetStore";
import { useQuestRegistrationStore } from "@/stores/useQuestRegistrationStore";

const maxClosetNameLength = 10;
const maxSectionNameLength = 10;

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
  inputProps,
}: {
  value: string;
  index: number;
  showError: boolean;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  isLast: boolean;
  inputProps?: TextInputProps & { ref?: (input: TextInput | null) => void };
}) {
  const completed = value.trim().length > 0;

  return (
    <TextInput
      className={[
        [
          "h-[44px] rounded-lg px-[22px] font-pretendard text-[14px] text-bg-dark",
          completed ? "w-[230px]" : "w-[270px]",
        ].join(" "),
        completed
          ? "border-[0.5px] border-disabled bg-cool"
          : showError
            ? "border-[0.5px] border-dashed border-error bg-white text-text-subdued"
            : "border-[0.5px] border-dashed border-disabled bg-white text-text-subdued",
      ].join(" ")}
      maxLength={maxSectionNameLength}
      onBlur={onBlur}
      onChangeText={onChangeText}
      placeholder={`칸 이름을 입력해주세요 (0/${maxSectionNameLength})`}
      placeholderTextColor={colors.disabled}
      returnKeyType={isLast ? "done" : "next"}
      style={{ includeFontPadding: false, lineHeight: 16, paddingBottom: 2, paddingTop: 0 }}
      textAlignVertical="center"
      value={value}
      {...inputProps}
    />
  );
}

export function ClosetLabelingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const draftImageUri = useClosetRegistrationStore((state) => state.imageUri);
  const draftImageUrl = useClosetRegistrationStore((state) => state.imageUrl);
  const draftTemplateId = useClosetRegistrationStore((state) => state.templateId);
  const resetClosetDraft = useClosetRegistrationStore((state) => state.resetDraft);
  const setClosetId = useClosetStore((state) => state.setClosetId);
  const completeActiveQuestRegistration = useQuestRegistrationStore(
    (state) => state.completeActiveRegistration,
  );
  const selectedTemplate = getClosetTemplate(draftTemplateId);
  const templateId = selectedTemplate?.sectionCount ?? null;
  const detectedClosetSections = useMemo(() => {
    return getClosetTemplateSections(selectedTemplate?.id).map((section, index) => ({
      id: section.id,
      initialName: section.initialName,
      sectionOrder: index + 1,
    }));
  }, [selectedTemplate?.id]);
  const [sectionNames, setSectionNames] = useState(() =>
    detectedClosetSections.map((section) => section.initialName),
  );
  const [closetName, setClosetName] = useState("");
  const [isClosetNameTouched, setIsClosetNameTouched] = useState(false);
  const [touchedSectionIds, setTouchedSectionIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const keyboardAccessory = useKeyboardAccessoryNavigation(detectedClosetSections.length + 1);

  useEffect(() => {
    setSectionNames(detectedClosetSections.map((section) => section.initialName));
    setTouchedSectionIds([]);
  }, [detectedClosetSections]);

  const detectedSectionCount = detectedClosetSections.length;
  const completedSectionCount = useMemo(
    () => sectionNames.filter((name) => name.trim().length > 0).length,
    [sectionNames],
  );
  const isClosetNameComplete = closetName.trim().length > 0;
  const areSectionsComplete =
    detectedSectionCount > 0 && completedSectionCount === detectedSectionCount;
  const isComplete = isClosetNameComplete && areSectionsComplete;
  const shouldShowClosetNameError = isClosetNameTouched && !isClosetNameComplete;
  const shouldShowSectionError = !areSectionsComplete && touchedSectionIds.length > 0;
  const bottomErrorMessage = shouldShowClosetNameError
    ? "옷장 이름은 필수로 입력돼야 합니다."
    : shouldShowSectionError
      ? "모든 칸 이름이 입력돼야 합니다."
      : null;

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
      const createdCloset = await createCloset({
        templateId,
        closetName: closetName.trim(),
        imageUrl: draftImageUrl,
        sections: detectedClosetSections.map((section, index) => ({
          sectionOrder: section.sectionOrder,
          sectionName: sectionNames[index]?.trim() ?? "",
        })),
      });

      setClosetId(createdCloset.closetId);
      await invalidateRegistrationQueries(queryClient);
      const questReturnRoute = completeActiveQuestRegistration(draftImageUrl ?? draftImageUri);
      resetClosetDraft();

      if (questReturnRoute) {
        router.replace(questReturnRoute);
        return;
      }

      router.replace({
        pathname: "/closet/register/complete",
        params: { closetId: String(createdCloset.closetId) },
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "CLOSET_4014") {
        Alert.alert("옷장은 최대 3개까지 등록할 수 있습니다.");
        return;
      }

      showToast(
        error instanceof Error ? error.message : "옷장 등록에 실패했어요. 다시 시도해주세요.",
      );
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
        <ClosetRegistrationHeader />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-[30px] font-pretendard-semibold text-[20px] leading-[28px] text-text">
            옷장 이름을 입력해주세요.
          </Text>

          <View className="mt-[24px]">
            <View className="flex-row items-center">
              <TextInput
                className={[
                  "h-[56px] flex-1 rounded-lg px-[28px] font-pretendard text-[14px] text-bg-dark",
                  isClosetNameComplete
                    ? "border-[0.5px] border-disabled bg-white"
                    : shouldShowClosetNameError
                      ? "border-[0.5px] border-dashed border-error bg-white text-text-subdued"
                      : "border-[0.5px] border-disabled bg-white text-text-subdued",
                ].join(" ")}
                maxLength={maxClosetNameLength}
                onBlur={() => setIsClosetNameTouched(true)}
                onChangeText={(nextValue) => {
                  setClosetName(nextValue);
                  if (nextValue.trim().length > 0) {
                    setIsClosetNameTouched(true);
                  }
                }}
                placeholder="한글, 영문, 숫자 조합만 가능"
                placeholderTextColor={colors.text.subdued}
                returnKeyType="next"
                style={{
                  includeFontPadding: false,
                  lineHeight: 17,
                  paddingBottom: 2,
                  paddingTop: 0,
                }}
                textAlignVertical="center"
                value={closetName}
                {...keyboardAccessory.getInputAccessoryProps(0)}
              />

              <View className={isClosetNameComplete ? "ml-[14px] w-[28px] items-center" : "w-0"}>
                {isClosetNameComplete ? <CheckActiveIcon width={28} height={28} /> : null}
              </View>
            </View>

            <Text className="mt-[10px] font-pretendard text-[12px] leading-[16px] text-text-subdued">
              {closetName.length}/{maxClosetNameLength}
            </Text>
          </View>

          <Text className="mt-[29px] font-pretendard-semibold text-[20px] leading-[28px] text-text">
            칸 이름을 입력해주세요.
          </Text>
          <View className="mt-[24px] gap-[12px]">
            {detectedClosetSections.map((section, index) => {
              const value = sectionNames[index] ?? "";
              const completed = value.trim().length > 0;
              const isTouched = touchedSectionIds.includes(section.id);
              const showInputError = !completed && (shouldShowSectionError || isTouched);

              return (
                <View key={section.id} className="h-[44px] flex-row items-center">
                  <SectionNumberBadge completed={completed} index={index} />

                  <View className="ml-[16px]">
                    <SectionNameInput
                      inputProps={keyboardAccessory.getInputAccessoryProps(index + 1)}
                      index={index}
                      isLast={index === detectedClosetSections.length - 1}
                      onBlur={() => markSectionTouched(section.id)}
                      onChangeText={(nextValue) => updateSectionName(index, nextValue)}
                      showError={showInputError}
                      value={value}
                    />
                  </View>

                  <View className={completed ? "ml-[14px] w-[28px] items-center" : "w-0"}>
                    {completed ? <CheckActiveIcon width={28} height={28} /> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View className="mt-auto">
          {bottomErrorMessage ? (
            <Text className="mb-[18px] font-pretendard text-[12px] leading-[20px] text-error">
              {bottomErrorMessage}
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
                  : detectedSectionCount > 0
                    ? `저장하기(${completedSectionCount}/${detectedSectionCount})`
                    : "템플릿을 다시 선택해주세요"
            }
            className="h-[58px]"
            textClassName="font-pretendard-semibold text-[18px] leading-[30px]"
          />
        </View>
      </View>
      {keyboardAccessory.toolbar}
    </KeyboardAvoidingView>
  );
}
