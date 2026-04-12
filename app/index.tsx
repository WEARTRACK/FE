import { View } from "react-native";
import CommonInput from "@/components/common/BasicInput";

export default function RootIndexRoute() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <CommonInput
        label="이메일"
        placeholder="이메일을 입력해주세요"
        error="올바른 이메일 형식이 아닙니다"
      />
      {/* 기존 화면은 잠시 주석 처리하거나 아래에 두기 */}
      {/* <SplashScreen /> */}
    </View>
  );
}
