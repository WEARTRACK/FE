import { Text, View } from "react-native";

import { Button } from "@/components/common/Button";

export function MainHomeScreen() {
  return (
    <View className="flex-1 bg-bg-light px-6 pt-8">
      <View className="rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1.5px] text-accent">
          Simulator QA
        </Text>
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">1.4 검색 플로우 확인</Text>
        <Text className="mt-3 font-pretendard text-body text-text-subdued">
          현재 작업 상태를 시뮬레이터에서 바로 확인할 수 있도록 진입 버튼을 제공합니다.
          검색 결과 데이터는 mock 저장소를 사용합니다.
        </Text>
      </View>

      <View className="mt-4 rounded-3xl bg-white p-6">
        <Button
          fullWidth
          href={{
            pathname: "/home/search/select",
            params: { mode: "color", entryKey: String(Date.now()) },
          }}
          label="1.4.1 색상 선택 화면 열기"
          size="lg"
          variant="secondary"
        />
        <Button
          className="mt-3"
          fullWidth
          href={{
            pathname: "/home/search/select",
            params: { mode: "category", entryKey: String(Date.now()) },
          }}
          label="1.4.2 카테고리 선택 화면 열기"
          size="lg"
          variant="secondary"
        />
      </View>
    </View>
  );
}
