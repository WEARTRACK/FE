import { Text, View } from "react-native";

export default function ClosetTabRoute() {
  return (
    <View className="flex-1 bg-bg-light px-6 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1.5px] text-accent">
          2. Closet
        </Text>
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">내 옷장</Text>
        <Text className="mt-3 font-pretendard text-body text-text-subdued">
          옷장 카테고리, 아이템 목록, 검색/필터 기능이 이 탭에서 확장될 예정입니다.
        </Text>
      </View>
    </View>
  );
}
