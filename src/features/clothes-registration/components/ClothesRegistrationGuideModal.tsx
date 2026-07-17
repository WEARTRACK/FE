import { Modal, Pressable, Text, View } from "react-native";

import ClotheExample from "../../../../assets/clotheExample.svg";

type ClothesRegistrationGuideModalProps = {
  visible: boolean;
  onClose: () => void;
  onPressCapture: () => void;
  onPressSelectImage: () => void;
  onPressShoppingMallLink: () => void;
};

export function ClothesRegistrationGuideModal({
  visible,
  onClose,
  onPressCapture,
  onPressSelectImage,
  onPressShoppingMallLink,
}: ClothesRegistrationGuideModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center px-6">
        <Pressable
          className="absolute inset-0 bg-black/25"
          onPress={onClose}
          style={{ zIndex: 0 }}
        />
        <View
          className="items-center rounded-xl bg-white px-[38px] pb-[29px] pt-[30px]"
          style={{ position: "relative", elevation: 2, zIndex: 1 }}
        >
          <Text className="font-pretendard-semibold text-[20px] leading-[24px] text-text">
            옷 등록하기
          </Text>

          <View className="mt-[24px] h-[240px] w-[180px] items-center justify-center overflow-hidden bg-cool">
            <ClotheExample width={180} height={257} />
          </View>

          <Text className="mt-[23px] text-center font-pretendard text-[14px] leading-[20px] text-bg-dark">
            예시 이미지처럼 옷 전체가 보이는{"\n"} 사진을 등록해주세요.
          </Text>

          <Pressable
            className="mt-[20px] h-[50px] w-full items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white"
            onPress={onPressCapture}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-text">
              촬영하기
            </Text>
          </Pressable>

          <Pressable
            className="mt-[8px] h-[50px] w-full items-center justify-center rounded-lg border-[0.5px] border-text-subdued bg-white"
            onPress={onPressSelectImage}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-text">
              앨범에서 선택
            </Text>
          </Pressable>

          <Pressable
            className="mt-[8px] h-[50px] w-full items-center justify-center rounded-lg bg-bg-dark"
            onPress={onPressShoppingMallLink}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text className="font-pretendard-semibold text-[18px] leading-[20px] text-white">
              쇼핑몰 링크
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
