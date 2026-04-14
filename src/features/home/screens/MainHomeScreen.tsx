import { Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function MainHomeScreen() {
  return (
    <View className="flex-1 bg-bg-light px-6 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1.5px] text-accent">
          1. Main Home
        </Text>
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">메인홈</Text>
        <Text className="mt-3 font-pretendard text-body text-text-subdued">
          메인홈 구조만 먼저 분리해두고, 세부 기능 화면은 와이어프레임과 상세 기획이 나오는
          시점에 도메인별로 확장할 수 있도록 준비한 상태입니다.
        </Text>
      </View>

      <View className="mt-4 rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1px] text-text-subdued">
          Next Step
        </Text>
        <Text className="mt-3 font-pretendard text-body text-text">
          추후 `closet`, `search`, `inventory` 같은 기능이 확정되면 `app/(main)`과
          `src/features` 아래에 도메인 폴더를 추가하는 방식으로 자연스럽게 확장하면 됩니다.
        </Text>

        <Link href={"/(main)/typography" as Href} asChild>
          <Pressable className="mt-6 rounded-2xl border border-slate-200 px-4 py-4">
            <Text className="text-center font-pretendard-semibold text-body text-text">
              Typography Preview 보기
            </Text>
          </Pressable>
        </Link>

      </View>
    </View>
  );
}
