import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClosetIcon from "../../../../assets/closet-icon.svg";
import MusinsaLogo from "../../../../assets/musinsa_logo.svg";
import ZgzgLogo from "../../../../assets/zgzg_logo.svg";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/common/Button";
import { useKeyboardAccessoryNavigation } from "@/components/common/KeyboardAccessoryToolbar";
import { colors } from "@/constants/colors";
import { fetchProductLinkPreview } from "@/features/clothes-registration/api/link-preview-api";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { showAlert } from "@/lib/ui/showAlert";
import { useShoppingMallRegistrationStore } from "@/stores/useShoppingMallRegistrationStore";

type FetchState = "idle" | "loading" | "error";

const supportedMalls = [
  { name: "지그재그", Logo: ZgzgLogo },
  { name: "무신사", Logo: MusinsaLogo },
];

function SupportedMallList() {
  return (
    <View className="mt-[8px] h-[90px] flex-row items-center justify-center gap-[70px] rounded-[3px] bg-white">
      {supportedMalls.map(({ name, Logo }) => (
        <View key={name} className="items-center">
          <Logo width={40} height={40} />
          <Text className="mt-[10px] font-pretendard text-[14px] leading-[14px] text-text-subdued">
            {name}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ErrorPanel({ message }: { message?: string }) {
  return (
    <View className="mt-[10px] h-[90px] justify-center rounded-[3px] border-[0.5px] border-error bg-[#FFE1E1] px-[17px]">
      <Text className="font-pretendard text-[15px] leading-[20px] text-error">
        {message ?? "정보를 불러올 수 없습니다."}
      </Text>
      <Text className="mt-[6px] font-pretendard-light text-[12px] leading-[14px] text-text-subdued">
        상품 페이지를 찾을 수 없습니다. 직접 입력해주세요.
      </Text>
    </View>
  );
}

export function ShoppingMallLinkRegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  const keyboardAccessory = useKeyboardAccessoryNavigation(1);
  const [errorMessage, setErrorMessage] = useState<string>();
  const setDraft = useShoppingMallRegistrationStore((state) => state.setDraft);

  const handleFetchProductInfo = async () => {
    if (!url.trim()) {
      showAlert({
        title: "상품 페이지 링크를 입력해주세요",
      });
      return;
    }

    setFetchState("loading");
    setErrorMessage(undefined);

    try {
      const preview = await fetchProductLinkPreview(url.trim());

      setDraft({
        sourceUrl: preview.sourceUrl,
        productName: preview.productName,
        imageUrl: preview.imageUrl,
        price: preview.price,
        color: preview.color,
        category: preview.category,
        purchaseDate: null,
        storageLocation: null,
        sectionId: null,
      });
      router.push(clothesRegistrationRoutes.shoppingMallStyle);
    } catch {
      setErrorMessage(
        "상품 정보를 불러올 수 없습니다. 상품 페이지를 확인하거나 직접 입력해 주세요.",
      );
      setFetchState("error");
    }
  };

  const handlePressBack = () => {
    if (fetchState === "loading" || fetchState === "error") {
      setFetchState("idle");
      return;
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View>
        <BackButton onPress={handlePressBack} />
        <Text className="mt-[35px] font-pretendard-semibold text-[20px] leading-[20px] text-text">
          쇼핑몰 링크로 등록
        </Text>
        <Text className="mt-[13px] font-pretendard text-[14px] leading-[16px] text-text-subdued">
          구매한 옷의 상품 페이지 링크를 입력해주세요.
        </Text>

        <Text className="mt-[24px] font-pretendard text-[14px] leading-[14px] text-text-subdued">
          상품 URL
        </Text>
        <TextInput
          {...keyboardAccessory.getInputAccessoryProps(0)}
          className={[
            "mt-[8px] h-[58px] rounded-[3px] border-[0.5px] bg-white px-[13px] font-pretendard text-[14px] leading-[16px] text-text",
            fetchState === "error" ? "border-error" : "border-cool",
          ].join(" ")}
          onChangeText={(nextUrl) => {
            setUrl(nextUrl);
            if (fetchState === "error") {
              setFetchState("idle");
              setErrorMessage(undefined);
            }
          }}
          placeholder="https://www.musinsa.com/..."
          placeholderTextColor={colors.disabled}
          style={{ paddingBottom: 0, paddingTop: 3 }}
          textAlignVertical="center"
          value={url}
        />

        {fetchState === "loading" ? (
          <View className="mt-[83px] items-center">
            <View className="opacity-70">
              <ClosetIcon width={124} height={172} />
            </View>
            <Text className="mt-[33px] font-pretendard-semibold text-[20px] leading-[32px] text-text">
              상품 정보를 불러오는 중..
            </Text>
          </View>
        ) : (
          <>
            <Text className="mt-[15px] font-pretendard text-[14px] leading-[14px] text-text-subdued">
              지원 쇼핑몰
            </Text>
            {fetchState === "error" ? <ErrorPanel message={errorMessage} /> : <SupportedMallList />}
          </>
        )}

        {fetchState === "idle" ? (
          <Pressable
            className="mt-[52px] h-[58px] items-center justify-center rounded-[4px] bg-bg-dark"
            onPress={handleFetchProductInfo}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[22px] text-white">
              정보 불러오기
            </Text>
          </Pressable>
        ) : null}

        {fetchState === "error" ? (
          <View className="mt-[260px] gap-[8px]">
            <Button
              label="직접 입력하기"
              variant="secondary"
              fullWidth
              className="h-[58px] rounded-[4px] border-[0.5px] border-text-subdued"
              textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
              onPress={() => router.push(clothesRegistrationRoutes.shoppingMallManualStyle)}
            />
            <Button
              label="다시 시도"
              fullWidth
              className="h-[58px] rounded-[4px]"
              textClassName="font-pretendard-semibold text-[18px] leading-[22px]"
              onPress={handleFetchProductInfo}
            />
          </View>
        ) : null}
      </View>

      {keyboardAccessory.toolbar}
    </KeyboardAvoidingView>
  );
}
