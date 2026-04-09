import { Text, View } from "react-native";

export function MainHomeScreen() {
  return (
    <View className="flex-1 bg-surface px-6 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-brand">
          1. Main Home
        </Text>
        <Text className="mt-3 text-3xl font-semibold text-ink">메인홈</Text>
        <Text className="mt-3 text-base leading-6 text-muted">
          메인홈 구조만 먼저 분리해두고, 세부 기능 화면은 와이어프레임과 상세 기획이 나오는
          시점에 도메인별로 확장할 수 있도록 준비한 상태입니다.
        </Text>
      </View>

      <View className="rounded-3xl bg-white p-6">
        <Text className="text-sm font-medium uppercase tracking-[1px] text-muted">
          Next Step
        </Text>
        <Text className="mt-3 text-base leading-6 text-ink">
          추후 `closet`, `search`, `inventory` 같은 기능이 확정되면 `app/(main)`과
          `src/features` 아래에 도메인 폴더를 추가하는 방식으로 자연스럽게 확장하면 됩니다.
        </Text>
      </View>
    </View>
  );
}
