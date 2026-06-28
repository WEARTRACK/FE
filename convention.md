# 💻 Code Convention

## 1. Naming Rules (네이밍 규칙)

### 1.1 Case Styles

| 스타일         | 대상                               | 예시                                       |
| :------------- | :--------------------------------- | :----------------------------------------- |
| **camelCase**  | 변수, 함수, 핸들러, 훅             | `userName`, `handleToggleClick`, `useAuth` |
| **PascalCase** | 컴포넌트, 클래스, 인터페이스, 타입 | `Button`, `UserService`, `UserInterface`   |
| **SNAKE_CASE** | 상수 (대문자)                      | `API_BASE_URL`, `MAX_COUNT`                |
| **kebab-case** | 파일명, 디렉토리명, Assets         | `auth-api.ts`, `search-icon.webp`          |

### 1.2 접두사 규칙

- **이벤트 핸들러**: `handle~` (예: `handleButtonClick`)
- **커텀 훅**: `use~` (예: `useClothes`)

## 2. File & Directory Rules

### 2.1 파일 확장자

- **컴포넌트**: `.tsx` (JSX 문법 포함 시)
- **로직 모듈**: `.ts` (유틸, API, 상수, 훅 등)
- **아이콘**: `.svg`
- **이미지**: `.webp`

### 2.2 상세 네이밍 가이드

- **컴포넌트**: PascalCase (`ClothesCard.tsx`)
- **훅**: camelCase (`useAuth.ts`)
- **API/유틸**: camelCase (`authApi.ts`, `formatDate.ts`)
- **Assets**: kebab-case (`nav-home-active.svg`)

## 3. Project Structure (features 중심)

핵심 로직은 도메인별로 `src/features/` 하위에서 관리합니다.

```text
src/
├── features/
│   ├── [domain]/          # clothes, closet, search 등
│   │   ├── components/    # 해당 도메인 전용 UI
│   │   ├── hooks/         # 도메인 비즈니스 로직
│   │   ├── api/           # API 통신 함수
│   │   ├── types/         # 타입 정의
│   │   └── utils/         # 도메인 관련 유틸
├── components/            # 공통 UI (Button, Input 등)
├── store/                 # Zustand 상태 관리
└── api/                   # 공통 Axios 설정
```
