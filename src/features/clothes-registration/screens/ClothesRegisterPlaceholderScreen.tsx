import { ClothesRegistrationRouteScaffold } from "@/features/clothes-registration/screens/ClothesRegistrationRouteScaffold";

export function ClothesRegisterPlaceholderScreen() {
  return (
    <ClothesRegistrationRouteScaffold
      step="1.x"
      title="옷 등록하기"
      description="옷 등록 플로우는 상세 기능명세가 확정되면 이 경로에 이어서 연결합니다."
      actions={[
        {
          label: "홈으로 돌아가기",
          href: "/home",
        },
      ]}
    />
  );
}

