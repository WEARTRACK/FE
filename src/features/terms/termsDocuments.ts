export type TermsDocumentId = "service" | "privacy";

type TermsDocumentItem = {
  text: string;
  indent?: 0 | 1;
};

type TermsDocumentSection = {
  title: string;
  items: TermsDocumentItem[];
  useBullets?: boolean;
};

export type TermsDocument = {
  id: TermsDocumentId;
  title: string;
  sections: TermsDocumentSection[];
};

export const termsDocuments: Record<TermsDocumentId, TermsDocument> = {
  service: {
    id: "service",
    title: "서비스 이용 약관",
    sections: [
      {
        title: "제1조 (목적)",
        items: [
          {
            text: "본 약관은 ON:TRACK(이하 “팀”)이 제공하는 WearTrack 서비스(이하 “서비스”)의 이용 조건 및 절차, 팀과 사용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.",
          },
        ],
      },
      {
        title: "제2조 (서비스 내용)",
        items: [
          { text: "디지털 옷장 등록 및 관리" },
          { text: "옷 착용 기록 및 통계 제공" },
          { text: "중복 구매 알림 및 장기 미착용 알림" },
          { text: "패션 소비 리포트 제공" },
          { text: "구매 전 확인하기 (AI 기반 유사 옷 탐색 · 외부 링크의 이미지 정보 활용 포함)" },
        ],
      },
      {
        title: "제3조 (회원가입 및 계정 관리)",
        items: [
          { text: "만 14세 이상 누구나 가입 가능 (만 14세 미만 회원가입 및 서비스 이용 제한)" },
          {
            text: "본인 정보를 정확하게 입력해야 하며, 허위 정보 입력 시 서비스 이용이 제한될 수 있음",
          },
          { text: "계정은 본인만 사용 가능하며 타인에게 양도 불가" },
          { text: "탈퇴 후 동일 계정으로 7일간 재가입 불가" },
        ],
      },
      {
        title: "제4조 (사용자의 의무)",
        items: [
          { text: "타인의 정보를 도용하거나 허위 정보를 등록하는 행위 금지" },
          { text: "서비스를 통해 타인의 저작권 또는 초상권을 침해하는 행위 금지" },
          { text: "서비스의 정상적인 운영을 방해하는 행위 금지" },
          { text: "옷 등록 시 본인 소유 또는 사용 권한이 있는 이미지만 업로드" },
        ],
      },
      {
        title: "제5조 (서비스 이용 제한)",
        items: [
          { text: "계정당 옷장 최대 3개, 옷장당 옷 최대 80개까지 등록 가능" },
          { text: "약관을 위반하거나 서비스 운영을 방해하는 경우 이용이 제한될 수 있음" },
        ],
      },
      {
        title: "제6조 (콘텐츠의 소유권)",
        items: [
          { text: "사용자가 직접 등록한 사진 및 정보의 저작권은 사용자에게 있음" },
          {
            text: "단, 서비스 개선 및 AI 학습 목적으로 익명화된 데이터로 활용할 수 있으며 이에 동의하지 않을 경우 별도 문의 가능",
          },
        ],
      },
      {
        title: "제7조 (서비스 변경 및 중단)",
        items: [
          { text: "서비스 내용은 사전 공지 후 변경될 수 있음" },
          { text: "불가피한 사유(서버 점검, 천재지변 등)로 서비스가 일시 중단될 수 있음" },
        ],
      },
      {
        title: "제8조 (책임의 한계)",
        items: [
          { text: "사용자가 등록한 정보의 정확성에 대한 책임은 사용자에게 있음" },
          {
            text: "AI 분석 결과(카테고리·색상 분류, 유사 옷 탐색)는 참고용이며 정확성을 보장하지 않음",
          },
        ],
      },
      {
        title: "제9조 (약관의 변경)",
        items: [
          { text: "약관 변경 시 적용일 7일 전 앱 내 공지" },
          { text: "변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있음" },
        ],
      },
      {
        title: "제10조 (준거법 및 분쟁 해결)",
        items: [
          { text: "본 약관은 대한민국 법령에 따라 해석됨" },
          {
            text: "분쟁 발생 시 팀과 사용자 간 협의를 우선으로 하며 해결되지 않을 경우 관할 법원에 제소할 수 있음",
          },
        ],
      },
      {
        title: "부칙",
        items: [{ text: "본 약관은 2026년 7월 1일부터 시행됩니다." }],
      },
    ],
  },
  privacy: {
    id: "privacy",
    title: "개인정보 처리 방침",
    sections: [
      {
        title: "1. 수집하는 개인정보 항목",
        useBullets: true,
        items: [
          { text: "필수: 소셜 계정 이메일, 프로필, 닉네임 (회원가입 시)" },
          { text: "서비스 이용 중 자동 수집: 기기 정보, 앱 접속 로그, 푸시 알림 토큰" },
          {
            text: "사용자 입력 정보: 옷 사진, 옷 카테고리·색상 등록일, 착용 기록, 패션 소비 금액",
          },
        ],
      },
      {
        title: "2. 개인정보 수집 및 이용 목적",
        useBullets: true,
        items: [
          { text: "회원 식별 및 서비스 제공" },
          { text: "옷장 관리 및 착용 기록 분석" },
          { text: "중복 구매 알림, 장기 미착용 알림 등 푸시 알림 발송" },
          { text: "패션 소비 리포트 생성" },
          { text: "서비스 개선 및 오류 대응" },
        ],
      },
      {
        title: "3. 개인정보 보유 및 이용 기간",
        useBullets: true,
        items: [
          { text: "회원 탈퇴 시 계정은 소프트 삭제 상태로 전환됨" },
          { text: "탈퇴 후 6개월간 보관 후 완전 삭제" },
          {
            text: "단, 관계 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관",
          },
          { text: "소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)", indent: 1 },
          { text: "접속 로그: 3개월 (통신비밀보호법)", indent: 1 },
        ],
      },
      {
        title: "4. 개인정보의 제3자 제공",
        useBullets: true,
        items: [
          { text: "원칙적으로 제3자에게 제공하지 않음" },
          { text: "예외: 법령에 의한 요청, 사용자의 사전 동의가 있는 경우" },
        ],
      },
      {
        title: "5. 개인정보 처리 위탁",
        useBullets: true,
        items: [
          { text: "클라우드 서버 운영: AWS (Amazon Web Services)" },
          { text: "AI 분석 서버 운영: Hugging Face Spaces" },
        ],
      },
      {
        title: "6. 사용자의 권리",
        useBullets: true,
        items: [
          { text: "개인정보 열람, 수정, 삭제 요청 가능" },
          { text: "마이페이지에서 직접 닉네임 변경 및 회원 탈퇴 가능" },
          { text: "개인정보 처리에 대한 동의 철회 가능" },
        ],
      },
      {
        title: "7. 개인정보 보호책임자",
        useBullets: true,
        items: [{ text: "팀명: ON:TRACK" }, { text: "문의: weartrackteam@gmail.com" }],
      },
      {
        title: "8. 시행일",
        useBullets: true,
        items: [{ text: "본 방침은 2026년 7월 1일부터 시행됩니다." }],
      },
    ],
  },
};

export function getTermsDocument(documentId: TermsDocumentId) {
  return termsDocuments[documentId];
}
