import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SignInScreen() {
  return (
    <ScrollView className="flex-1 bg-bg-dark" contentContainerClassName="px-6 pb-12 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-accent">
          0. Entry
        </Text>
        <Text className="mt-3 text-3xl font-semibold text-text">간편 로그인</Text>
        <Text className="mt-3 text-base leading-6 text-text-subdued">
          MVP 단계에서는 간편 로그인 진입 화면부터 구현을 시작하고, 이후 실제 인증 API와 폼
          로직을 연결하면 됩니다.
        </Text>

        <View className="mt-6 gap-3">
          <Link href="/home" asChild>
            <Pressable className="rounded-2xl bg-bg-dark px-4 py-4">
              <Text className="text-center text-base font-semibold text-white">
                로그인 후 메인홈으로 이동
              </Text>
            </Pressable>
          </Link>

          <Link href="/auth/sign-up" asChild>
            <Pressable className="rounded-2xl border border-slate-200 px-4 py-4">
              <Text className="text-center text-base font-semibold text-text">
                회원가입으로 이동
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
