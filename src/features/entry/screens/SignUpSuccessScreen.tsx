import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SignUpSuccessScreen() {
  return (
    <ScrollView className="flex-1 bg-bg-dark" contentContainerClassName="px-6 pb-12 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-accent">
          0. Entry
        </Text>
        <Text className="mt-3 text-3xl font-semibold text-text">회원가입 성공 팝업</Text>
        <Text className="mt-3 text-base leading-6 text-text-subdued">
          지금은 독립 페이지로 뼈대만 잡아두고, 실제 구현 단계에서 modal 또는 bottom sheet로
          바꿔도 구조는 유지할 수 있습니다.
        </Text>

        <View className="mt-6 gap-3">
          <Link href="/home" asChild>
            <Pressable className="rounded-2xl bg-bg-dark px-4 py-4">
              <Text className="text-center text-base font-semibold text-white">
                메인홈으로 이동
              </Text>
            </Pressable>
          </Link>

          <Link href="/auth/sign-in" asChild>
            <Pressable className="rounded-2xl border border-slate-200 px-4 py-4">
              <Text className="text-center text-base font-semibold text-text">
                로그인으로 이동
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
