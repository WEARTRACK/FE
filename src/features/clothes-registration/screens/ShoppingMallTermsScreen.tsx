import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronRightIcon from "../../../../assets/chevron_right.svg";
import { Button } from "@/components/common/Button";
import {
  hasAgreedToShoppingMallTerms,
  saveShoppingMallTermsAgreement,
} from "@/features/clothes-registration/data/shopping-mall-terms-agreement";
import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";
import { showToast } from "@/lib/ui/showToast";
import { useSessionStore } from "@/stores/useSessionStore";

export function ShoppingMallTermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isCheckingAgreement, setIsCheckingAgreement] = useState(true);
  const [isSavingAgreement, setIsSavingAgreement] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAgreement = async () => {
      try {
        if (!useSessionStore.persist.hasHydrated()) {
          await useSessionStore.persist.rehydrate();
        }

        const memberId = useSessionStore.getState().memberId;
        const hasAgreed = memberId ? await hasAgreedToShoppingMallTerms(memberId) : false;

        if (!isMounted) {
          return;
        }

        if (hasAgreed) {
          router.replace(clothesRegistrationRoutes.shoppingMallLink);
          return;
        }
      } catch {
        // If the local cache cannot be read, show the agreement screen again.
      } finally {
        if (isMounted) {
          setIsCheckingAgreement(false);
        }
      }
    };

    void checkAgreement();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleContinue = async () => {
    if (!isAgreed || isSavingAgreement) {
      return;
    }

    const memberId = useSessionStore.getState().memberId;

    if (!memberId) {
      showToast("로그인 정보를 확인할 수 없어요. 다시 로그인해주세요.");
      return;
    }

    setIsSavingAgreement(true);

    try {
      await saveShoppingMallTermsAgreement(memberId);
      router.replace(clothesRegistrationRoutes.shoppingMallLink);
    } catch {
      showToast("약관 동의 정보를 저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsSavingAgreement(false);
    }
  };

  if (isCheckingAgreement) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-light">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 84,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-1">
        <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
          이용 약관 동의
        </Text>
        <Text className="mt-[18px] font-pretendard text-[13px] leading-[20px] text-text-subdued">
          외부 쇼핑몰 연동을 위한 약관에 동의해주세요.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isAgreed }}
          className={[
            "mt-[52px] h-[62px] flex-row items-center justify-between rounded-lg border-[0.5px] bg-white px-[25px]",
            isAgreed ? "border-text-subdued" : "border-cool",
          ].join(" ")}
          onPress={() => setIsAgreed((current) => !current)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <Text className="font-pretendard text-[14px] leading-[20px] text-text-subdued">
            [필수] 외부 쇼핑몰 연동 약관
          </Text>
          <ChevronRightIcon width={24} height={24} />
        </Pressable>
      </View>

      <Button
        label="동의하고 계속하기"
        disabled={!isAgreed || isSavingAgreement}
        fullWidth
        className="h-[62px]"
        textClassName="font-pretendard-semibold text-[18px] leading-[20px]"
        onPress={handleContinue}
      />
    </View>
  );
}
