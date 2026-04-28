import { Text, View } from "react-native";

export default function ReportTabRoute() {
  return (
    <View className="flex-1 bg-bg-light px-6 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1.5px] text-accent">
          3. Report
        </Text>
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">리포트</Text>
        <Text className="mt-3 font-pretendard text-body text-text-subdued">
          착용 기록 기반 통계와 인사이트 리포트가 이 탭에서 제공될 예정입니다.
        </Text>
      </View>
    </View>
  );
}
