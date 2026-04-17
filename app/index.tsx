// import React, { useState } from "react";
// import { ScrollView, View, Text } from "react-native";
// import BasicInput from "@/components/common/BasicInput";
// import SignupInput from "@/components/common/SignupInput";

// export default function RootIndexRoute() {
//   const [nickname, setNickname] = useState("");
//   const [closetName, setClosetName] = useState("");
//   const [price, setPrice] = useState("");

//   return (
//     <ScrollView
//       className="bg-white"
//       contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
//     >
//       <Text className="mb-8 text-center text-xl font-bold">컴포넌트 검수 화면</Text>

//       {/* 1. 닉네임 입력창 케이스 */}
//       <View className="mb-10">
//         <Text className="mb-2 font-bold text-blue-500"># 닉네임 (SignupInput)</Text>
//         <SignupInput
//           label="닉네임"
//           placeholder="닉네임을 입력해주세요"
//           maxLength={10}
//           value={nickname}
//           onChangeText={setNickname}
//           error={nickname.length > 0 && nickname.length < 3 ? "사용중인 닉네임입니다" : ""} //임시 로직
//           isSuccess={nickname.length >= 3}
//         />
//       </View>

//       {/* 2. 옷장 칸 이름 케이스 */}
//       <View className="mb-10">
//         <Text className="mb-2 font-bold text-blue-500"># 옷장 칸 이름 (BasicInput)</Text>
//         <BasicInput
//           label="옷장 칸 이름"
//           placeholder="옷장 이름을 정해주세요"
//           value={closetName}
//           onChangeText={setClosetName}
//         />
//       </View>

//       {/* 3. 옷 가격 케이스 */}
//       <View className="mb-10">
//         <Text className="mb-2 font-bold text-blue-500"># 옷 가격 (BasicInput + unit)</Text>
//         <BasicInput
//           label="옷 가격"
//           placeholder="0"
//           unit="원"
//           isPrice={true}
//           value={price}
//           onChangeText={setPrice}
//           keyboardType="numeric"
//         />
//       </View>
//     </ScrollView>
//   );
// }
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/auth/sign-up-success" />;
}
