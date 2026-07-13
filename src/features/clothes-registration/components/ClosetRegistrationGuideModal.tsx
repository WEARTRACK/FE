import { Modal, Pressable, Text, View } from "react-native";

import ClosetExample from "../../../../assets/closetExample.svg";

type ClosetRegistrationGuideModalProps = {
  visible: boolean;
  onClose: () => void;
  onPressCapture: () => void;
  onPressSelectImage: () => void;
};

export function ClosetRegistrationGuideModal({
  visible,
  onClose,
  onPressCapture,
  onPressSelectImage,
}: ClosetRegistrationGuideModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center px-6">
        <Pressable
          className="absolute inset-0 bg-black/25"
          onPress={onClose}
          style={{ zIndex: 0 }}
        />
        <View
          className="items-center rounded-xl bg-white px-[38px] pb-[29px] pt-[27px]"
          style={{ position: "relative", elevation: 2, zIndex: 1 }}
        >
          <Text className="font-pretendard-bold text-[20px] leading-[24px] text-text">
            옷장 등록하기
          </Text>

          <View className="mt-[20px] h-[257px] w-[180px] items-center justify-center overflow-hidden bg-cool">
            <ClosetExample width={180} height={257} />
          </View>

          <Text className="mt-[18px] text-center font-pretendard text-[14px] leading-[20px] text-text">
            예시 이미지처럼 옷장 전체와{"\n"}보관 칸이 보이도록 촬영해주세요.
          </Text>

          <Pressable
            className="mt-[24px] h-[48px] w-full items-center justify-center rounded-lg bg-bg-dark"
            onPress={onPressCapture}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-white">
              촬영하기
            </Text>
          </Pressable>

          <Pressable
            className="mt-[8px] h-[48px] w-full items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white"
            onPress={onPressSelectImage}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-text">
              앨범에서 선택
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
