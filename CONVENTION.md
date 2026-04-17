# CONVENTION.md

이 문서는 `WEARTRACK` 프로젝트의 코드 작성 규칙과 Git 활동 지침을 담고 있습니다. 모든 팀원은 원활한 협업을 위해 아래 규칙을 준수합니다.

## 1. Code Convention
코드의 가독성과 일관성을 위해 아래 명명 규칙을 따릅니다.

### Naming Rules
- **Component & File**: `PascalCase` 사용 (예: `ClosetCard.tsx`, `NicknameInput.tsx`)
- **Variables & Functions**: `camelCase` 사용 (예: `const userNickname`, `const handleLogin = () => {}`)
- **Styles (NativeWind)**: Tailwind CSS 규칙을 따르며, 가독성을 위해 긴 클래스명은 줄바꿈을 권장합니다.

### Folder Structure
`src` 폴더 하위는 도메인 기반으로 관리합니다.
- `src/components/common`: 여러 페이지에서 재사용되는 공통 컴포넌트 (Button, Input 등)
- `src/features/[domain]`: 각 기능별 특화 컴포넌트 및 로직 (closet, search, auth 등)
- `src/hooks`: 커스텀 훅
- `src/types`: TypeScript 타입 정의 파일
- `src/lib`: API 통신(axios) 및 외부 라이브러리 설정

---

## 2. Pull Request (PR) Convention
작업 완료 후 `develop` 브랜치로 PR을 보낼 때는 아래 양식을 준수합니다.

### PR Template
```markdown
## 📌 관련 이슈
## ✨ 작업 내용
- [ ] 작업 내용 1
- [ ] 작업 내용 2

## 📸 스크린샷 (선택)
## 📚 참고 사항
- 리뷰어에게 전달할 특이사항이나 질문을 적어주세요.
```

---

## 4. Collaboration Rules
- **상태 관리**: 전역 상태는 `Zustand`, 서버 데이터는 `TanStack Query`를 사용합니다.
- **이미지/아이콘**: `assets/` 폴더에서 관리하며, 해상도 대응을 위해 가능한 경우 `SVG` 형식을 권장합니다.
- **검증**: 머지(Merge) 전 본인의 코드가 아래 명령어를 통과하는지 반드시 확인합니다.
  - `npm run lint`
  - `npm run typecheck`