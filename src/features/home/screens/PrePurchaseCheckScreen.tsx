import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CameraIcon from "../../../../assets/camera-line.svg";
import ChatLogo from "../../../../assets/chat-logo.svg";
import CloseIcon from "../../../../assets/close.svg";
import DotIcon from "../../../../assets/dot.svg";
import LinkIcon from "../../../../assets/link-line.svg";
import UploadIcon from "../../../../assets/upload-icon.svg";
import { BackButton } from "@/components/common/BackButton";
import {
  launchClothesCamera,
  launchClothesImageLibrary,
} from "@/features/clothes-registration/utils/launchClothesCamera";
import { fetchProductLinkPreview } from "@/features/clothes-registration/api/link-preview-api";
import type {
  PurchaseCheckClothesItem,
  PurchaseCheckLinkResult,
} from "@/features/home/api/purchase-check-link-api";
import { usePurchaseCheckLink } from "@/features/home/hooks/usePurchaseCheckLink";
import { usePurchaseCheckPhoto } from "@/features/home/hooks/usePurchaseCheckPhoto";
import { showToast } from "@/lib/ui/showToast";

type ComparisonStatus = "idle" | "loading" | "noSimilar" | "similar";

const SCREEN_HORIZONTAL_PADDING = 24;
const SIMILAR_CARD_GAP = 22;

function ChatBubble() {
  return (
    <View className="mt-[14px] self-start rounded-[14px] rounded-tl-none bg-gray px-[19px] py-[17px]">
      <Text className="font-pretendard text-[14px] leading-[20px] text-text">
        지금 구매를 고민하는 옷이 있나요?{"\n"}내 옷장에 비슷한 옷이 있는지 알려드릴게요.
      </Text>
    </View>
  );
}

function UserImageBubble({ imageUri }: { imageUri: string }) {
  return (
    <View className="mt-[48px] items-end">
      <Image
        className="h-[224px] w-[202px] rounded-[12px] rounded-br-none"
        resizeMode="cover"
        source={{ uri: imageUri }}
      />
    </View>
  );
}

function UserTextBubble({ text }: { text: string }) {
  return (
    <View className="mt-[48px] items-end">
      <View className="max-w-[82%] rounded-[12px] rounded-br-none bg-blue-1 px-[18px] py-[14px]">
        <Text className="font-pretendard text-[14px] leading-[20px] text-text" numberOfLines={2}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function ThinkingDots() {
  const dotProgresses = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const loops = dotProgresses.map((dotProgress, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(dotProgress, {
            duration: 240,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(dotProgress, {
            duration: 240,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.delay(420 - index * 140),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    return () => loops.forEach((loop) => loop.stop());
  }, [dotProgresses]);

  return (
    <View className="flex-row items-center gap-[4px]">
      {dotProgresses.map((dotProgress, index) => {
        const opacity = dotProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.45, 1],
        });
        const translateY = dotProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [2, -2],
        });

        return (
          <Animated.View key={index} style={{ opacity, transform: [{ translateY }] }}>
            <DotIcon height={6} width={6} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function getResultMessage(result: PurchaseCheckLinkResult | null) {
  if (result?.message) {
    return result.message;
  }

  if (result && result.totalCount === 0) {
    return "비슷한 옷이 없어요.\n새 옷을 들여도 될 것 같아요!";
  }

  return "이미 비슷한 옷이 있어요!";
}

function getStorageLabel(item: PurchaseCheckClothesItem) {
  if (item.sectionName && item.closetName) {
    return `${item.closetName} / ${item.sectionName}`;
  }

  return item.sectionName ?? item.closetName ?? item.category;
}

function getClothesName(item: PurchaseCheckClothesItem) {
  return item.productName ?? item.category;
}

function WeartrackResponse({
  result,
  status,
}: {
  result: PurchaseCheckLinkResult | null;
  status: ComparisonStatus;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const similarCardWidth = Math.max(
    140,
    (screenWidth - SCREEN_HORIZONTAL_PADDING * 2 - SIMILAR_CARD_GAP) / 2,
  );

  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return (
      <View className="mt-[24px]">
        <ChatLogo height={10} width={81} />
        <View className="mt-[14px] flex-row self-start rounded-[14px] rounded-tl-none bg-gray px-[19px] py-[15px]">
          <ThinkingDots />
          <Text className="ml-[18px] font-pretendard text-[14px] leading-[20px] text-text">
            옷장과 비교하는중...
          </Text>
        </View>
      </View>
    );
  }

  if (status === "noSimilar") {
    const message = getResultMessage(result);

    return (
      <View className="mt-[24px]">
        <ChatLogo height={10} width={81} />
        <View className="mt-[14px] self-start rounded-[10px] rounded-tl-none border border-green-3 bg-green-1 px-[19px] py-[15px]">
          <Text className="font-pretendard text-[14px] leading-[20px] text-text">
            {message}
          </Text>
        </View>
      </View>
    );
  }

  const clothes = result?.clothes ?? [];
  const message = getResultMessage(result);

  return (
    <View className="mt-[24px]">
      <ChatLogo height={10} width={81} />
      <View className="mt-[14px] self-start rounded-[10px] rounded-tl-none border border-yellow-3 bg-yellow-1 px-[19px] py-[15px]">
        <Text className="font-pretendard text-[14px] leading-[20px] text-text">
          {message}
        </Text>
      </View>

      <ScrollView
        className="mt-[15px]"
        contentContainerStyle={{ gap: SIMILAR_CARD_GAP, paddingRight: SCREEN_HORIZONTAL_PADDING }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {clothes.map((item) => (
          <View
            key={item.clothesId}
            className="overflow-hidden rounded-[8px] border-[0.5px] border-text-subdued bg-white"
            style={{ width: similarCardWidth }}
          >
            <Image
              className="h-[174px] w-full bg-cool"
              resizeMode="cover"
              source={{ uri: item.imageUrl }}
            />
            <View className="px-[14px] pb-[12px] pt-[10px]">
              <Text className="font-pretendard text-[14px] leading-[18px] text-text">
                {getClothesName(item)}
              </Text>
              <Text className="mt-[3px] font-pretendard-light text-[12px] leading-[16px] text-text-subdued">
                {getStorageLabel(item)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ActionRow({
  icon,
  isLast = false,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  isLast?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-[56px] px-6"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View className={`h-full flex-row items-center ${isLast ? "" : "border-b border-disabled"}`}>
        <View className="mr-[14px]">{icon}</View>
        <Text className="font-pretendard text-[14px] leading-[24px] text-text">{label}</Text>
      </View>
    </Pressable>
  );
}

function LinkInputModal({
  link,
  onChangeLink,
  onClose,
  onSubmit,
  visible,
}: {
  link: string;
  onChangeLink: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  visible: boolean;
}) {
  const canSubmit = link.trim().length > 0;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >
        <Pressable className="absolute inset-0 bg-black/35" onPress={onClose} />
        <View className="rounded-[18px] bg-bg-light px-[23px] pb-[34px] pt-[26px]">
          <View className="items-end">
            <Pressable
              accessibilityLabel="링크 입력 닫기"
              accessibilityRole="button"
              hitSlop={12}
              onPress={onClose}
            >
              <CloseIcon height={24} width={24} />
            </Pressable>
          </View>

          <View className="mt-[26px]">
            <Text className="font-pretendard-semibold text-[20px] leading-[28px] text-text">
              쇼핑몰 링크 붙여넣기
            </Text>
            <Text className="mt-[13px] font-pretendard text-[14px] leading-[20px] text-text-subdued">
              구매하고 싶은 옷의 상품 페이지 링크를 입력해주세요.
            </Text>
          </View>

          <View className="mt-[33px]">
            <Text className="font-pretendard text-[14px] leading-[20px] text-text-subdued">
              상품 URL
            </Text>
          </View>

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-[8px] h-[64px] rounded-[4px] border border-gray bg-white px-[18px] font-pretendard text-[14px] text-text"
            keyboardType="url"
            onChangeText={onChangeLink}
            placeholder="URL을 입력해주세요."
            placeholderTextColor="#6B7280"
            value={link}
          />

          <Pressable
            accessibilityLabel="링크 확인"
            accessibilityRole="button"
            className={`mt-[40px] h-[56px] items-center justify-center rounded-[12px] ${
              canSubmit ? "bg-bg-dark" : "bg-disabled"
            }`}
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
          >
            <Text className="font-pretendard text-[15px] leading-[20px] text-white">확인</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function PrePurchaseCheckScreen() {
  const insets = useSafeAreaInsets();
  const purchaseCheckLinkMutation = usePurchaseCheckLink();
  const purchaseCheckPhotoMutation = usePurchaseCheckPhoto();
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [comparisonStatus, setComparisonStatus] = useState<ComparisonStatus>("idle");
  const [comparisonResult, setComparisonResult] = useState<PurchaseCheckLinkResult | null>(null);
  const [purchaseLink, setPurchaseLink] = useState("");
  const [submittedLinkImageUri, setSubmittedLinkImageUri] = useState<string | null>(null);
  const [submittedLink, setSubmittedLink] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const startImageComparison = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setSubmittedLinkImageUri(null);
    setSubmittedLink(null);
    setComparisonResult(null);
    setComparisonStatus("loading");

    purchaseCheckPhotoMutation.mutate(
      { imageUri, page: 0, size: 10 },
      {
        onError: () => {
          setComparisonStatus("idle");
          showToast("사진 구매 전 중복 확인에 실패했어요. 다시 시도해주세요.");
        },
        onSuccess: (result) => {
          setComparisonResult(result);
          setComparisonStatus(result.totalCount > 0 ? "similar" : "noSimilar");
        },
      },
    );
  };

  const handlePressUpload = async () => {
    try {
      const imageUri = await launchClothesImageLibrary();

      if (!imageUri) {
        showToast("사진 접근 권한이 필요하거나 선택이 취소됐어요.");
        return;
      }

      startImageComparison(imageUri);
    } catch {
      showToast("사진을 불러오지 못했어요. 다시 시도해주세요.");
    }
  };

  const handlePressCamera = async () => {
    try {
      const imageUri = await launchClothesCamera();

      if (!imageUri) {
        showToast("카메라 권한이 필요하거나 촬영이 취소됐어요.");
        return;
      }

      startImageComparison(imageUri);
    } catch {
      showToast("카메라를 실행하지 못했어요. 다시 시도해주세요.");
    }
  };

  const handleSubmitLink = () => {
    const trimmedLink = purchaseLink.trim();

    if (!trimmedLink) {
      showToast("상품 링크를 입력해주세요.");
      return;
    }

    setIsLinkModalVisible(false);
    setSelectedImageUri(null);
    setSubmittedLinkImageUri(null);
    setSubmittedLink(trimmedLink);
    setComparisonResult(null);
    setComparisonStatus("loading");

    void fetchProductLinkPreview(trimmedLink)
      .then((preview) => setSubmittedLinkImageUri(preview.imageUrl))
      .catch(() => {
        setSubmittedLinkImageUri(null);
      });

    purchaseCheckLinkMutation.mutate(
      { page: 0, size: 10, url: trimmedLink },
      {
        onError: () => {
          setComparisonStatus("idle");
          showToast("구매 전 중복 확인에 실패했어요. 다시 시도해주세요.");
        },
        onSuccess: (result) => {
          setComparisonResult(result);
          setComparisonStatus(result.totalCount > 0 ? "similar" : "noSimilar");
        },
      },
    );
  };

  const handleResetComparison = () => {
    purchaseCheckLinkMutation.reset();
    purchaseCheckPhotoMutation.reset();
    setComparisonStatus("idle");
    setComparisonResult(null);
    setSubmittedLinkImageUri(null);
    setSubmittedLink(null);
    setSelectedImageUri(null);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="h-[72px] flex-row items-center px-6">
        <View className="w-8 items-start">
          <BackButton accessibilityLabel="홈으로 돌아가기" />
        </View>
        <Text className="flex-1 text-center font-pretendard-semibold text-[20px] leading-[24px] text-text-subdued">
          구매 전 확인하기
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-6 pt-[30px]"
        contentContainerStyle={{
          paddingBottom: comparisonStatus === "similar" ? Math.max(insets.bottom, 10) + 20 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ChatLogo height={10} width={81} />
        <ChatBubble />
        {selectedImageUri ? <UserImageBubble imageUri={selectedImageUri} /> : null}
        {submittedLinkImageUri ? <UserImageBubble imageUri={submittedLinkImageUri} /> : null}
        {submittedLink && !submittedLinkImageUri ? <UserTextBubble text={submittedLink} /> : null}
        <WeartrackResponse result={comparisonResult} status={comparisonStatus} />
        {comparisonStatus === "similar" ? (
          <Pressable
            accessibilityLabel="다른 옷 확인하기"
            accessibilityRole="button"
            className="mt-[26px] h-[65px] items-center justify-center rounded-[8px] bg-bg-dark"
            onPress={handleResetComparison}
            style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[24px] text-white">
              다른 옷 확인하기
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {comparisonStatus !== "similar" ? (
        <View
          className="rounded-t-[18px] bg-blue-0"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          <View className="items-center py-[14px]">
            <View className="h-[4px] w-[72px] rounded-full bg-disabled" />
          </View>
          <ActionRow
            icon={<UploadIcon height={24} width={24} />}
            label="사진 업로드"
            onPress={handlePressUpload}
          />
          <ActionRow
            icon={<CameraIcon height={24} width={24} />}
            label="사진 촬영"
            onPress={handlePressCamera}
          />
          <ActionRow
            icon={<LinkIcon height={24} width={24} />}
            isLast
            label="링크 붙여넣기"
            onPress={() => setIsLinkModalVisible(true)}
          />
        </View>
      ) : null}

      <LinkInputModal
        link={purchaseLink}
        onChangeLink={setPurchaseLink}
        onClose={() => setIsLinkModalVisible(false)}
        onSubmit={handleSubmitLink}
        visible={isLinkModalVisible}
      />
    </View>
  );
}
