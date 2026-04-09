import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SignUpScreen() {
  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-12 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-brand">
          0. Entry
        </Text>
        <Text className="mt-3 text-3xl font-semibold text-ink">간편 회원가입</Text>
        <Text className="mt-3 text-base leading-6 text-muted">
          약관 동의, 간편 인증, 기본 정보 입력처럼 실제 회원가입 단계가 확정되면 이 화면
          아래에서 세부 플로우를 확장하면 됩니다.
        </Text>

        <View className="mt-6 gap-3">
          <Link href="/auth/sign-up-success" asChild>
            <Pressable className="rounded-2xl bg-brand px-4 py-4">
              <Text className="text-center text-base font-semibold text-brand-foreground">
                회원가입 성공 팝업 보기
              </Text>
            </Pressable>
          </Link>

          <Link href="/auth/sign-in" asChild>
            <Pressable className="rounded-2xl border border-slate-200 px-4 py-4">
              <Text className="text-center text-base font-semibold text-ink">
                로그인으로 돌아가기
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
