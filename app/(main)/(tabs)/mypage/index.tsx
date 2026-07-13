import { Text, View } from "react-native";

export default function MyPageTabRoute() {
  return (
    <View className="flex-1 bg-bg-light px-6 pt-24">
      <View className="rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1.5px] text-accent">
          4. My Page
        </Text>
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">마이페이지</Text>
        <Text className="mt-3 font-pretendard text-body text-text-subdued">
          프로필/계정 설정 화면이 이 탭에서 확장될 예정입니다.
        </Text>
      </View>

      <View className="mt-4 rounded-3xl bg-white p-6">
        <Text className="font-pretendard-semibold text-caption uppercase tracking-[1px] text-text-subdued">
          Nickname API (Planned)
        </Text>
        <Text className="mt-3 font-pretendard text-body text-text">
          닉네임 설정 API는 인증 토큰이 필요하고, 닉네임은 중복 불가이며 최대 5자 제한이 있습니다.
        </Text>
        <Text className="mt-2 font-pretendard text-body text-text">
          설정 성공 시 `profileCompleted` 값이 `true`로 반환되도록 `member_api.md` 기준으로 연동할
          예정입니다.
        </Text>
      </View>
    </View>
  );
}
