# WEARTRACK

WEARTRACK은 옷장 속 의류와 패션 소비를 한곳에서 기록하고 돌아볼 수 있는 iOS 옷장 관리 앱입니다. 사용자는 옷장과 옷을 사진 또는 쇼핑몰 링크로 등록하고, 구매 전 유사 의류를 확인해 중복 구매를 줄일 수 있습니다. 주간 착용 회고와 주·월간 소비 리포트를 통해 보유 의류의 활용도와 지출 흐름도 확인할 수 있습니다.

## 주요 기능

- **사진 기반 옷장 등록** — 옷장 사진을 분석해 칸 수에 맞는 템플릿을 추천하고 각 칸의 이름을 설정합니다.
- **다양한 의류 등록 방식** — 촬영·앨범 사진 분석 또는 쇼핑몰 상품 링크를 이용해 카테고리, 색상, 가격, 보관 위치를 등록합니다.
- **내 옷장 탐색 및 관리** — 옷장과 보관 칸별 의류를 그리드·목록으로 확인하고 필터링하며 상세 정보 수정과 삭제를 수행합니다.
- **구매 전 중복 확인** — 구매하려는 옷의 사진이나 상품 링크를 기존 옷장과 비교해 유사한 의류를 확인합니다.
- **주간 착용 회고** — 이번 주에 입은 옷을 기록하고 장기간 입지 않은 의류를 확인해 옷장 활용을 돌아봅니다.
- **패션 소비 리포트** — 주간·월간 지출과 카테고리별 소비 내역을 조회하고 알림 수신 항목을 직접 설정합니다.

## Tech Stack

| 구분               | 기술 및 역할                                                                          |
| ------------------ | ------------------------------------------------------------------------------------- |
| Core               | Expo SDK 54, React Native, TypeScript로 iOS 애플리케이션 개발                         |
| Navigation         | Expo Router의 파일 기반 라우팅과 인증 상태 기반 route guard                           |
| Server State / API | TanStack Query로 조회·캐시 무효화, Axios와 Fetch 기반 공통 인증 API 처리              |
| Client State       | Zustand로 세션과 다단계 등록 draft 상태 관리                                          |
| Styling            | NativeWind와 Pretendard 커스텀 폰트로 화면 스타일 구성                                |
| Storage / Auth     | Expo SecureStore에 인증 토큰을 보관하고 Google·Kakao·Naver·Apple 네이티브 로그인 연동 |
| Native             | React Native Firebase Messaging, Image Picker, DateTimePicker                         |
| Build / Quality    | EAS Build, ESLint, Prettier, Vitest                                                   |

## Technical Highlights

### 인증 토큰 수명주기

API interceptor가 인증 필요 여부를 판별해 Access Token을 주입하고, 401 응답에서는 중복 재발급 요청을 하나의 Promise로 합쳐 처리합니다. 토큰은 iOS Keychain 기반 SecureStore에 저장하며 재발급 실패 시 세션과 서버 상태 캐시를 정리한 뒤 인증 화면으로 이동합니다.

### 서버 상태와 화면 상태 분리

TanStack Query가 옷장·리포트·알림·회고 데이터의 로딩, 오류, 캐시 갱신을 담당하고 Zustand는 세션과 의류 등록 과정의 임시 입력만 관리합니다. 기능별 query key와 mutation 이후 무효화 범위를 분리해 화면 간 데이터 일관성을 유지합니다.

### 이미지 분석 및 등록 흐름

옷장과 의류 사진을 multipart 요청으로 업로드하고 분석 상태를 조회해 결과·실패·재시도 화면으로 연결합니다. API 응답은 런타임 타입 가드로 검증하며 네트워크 오류, 타임아웃, 잘못된 응답을 공통 오류 형태로 변환합니다.

### 설정 연동 푸시 알림

Firebase Messaging 토큰을 사용자와 기기 단위로 동기화하고 서버의 푸시 설정이 활성화된 경우에만 등록합니다. 포그라운드 알림, 알림 탭 이동, 토큰 갱신과 로그아웃 시 정리 흐름을 함께 처리합니다.

## Project Structure

```text
app/                         # Expo Router route 및 navigation layout
src/
  components/common/        # 공통 입력, 버튼, 헤더 등 재사용 UI
  config/                   # 환경변수 검증 및 앱 설정
  features/                 # 도메인별 화면·API·hook·utility
    closet/                 # 옷장 조회, 검색, 통계, 의류 관리
    clothes-registration/   # 옷장·의류 사진/링크 등록
    entry/                  # 로그인, 회원가입, 세션 진입 흐름
    home/                   # 홈 요약과 구매 전 중복 확인
    notifications/          # 알림 목록, 설정, FCM 토큰 동기화
    report/                 # 주간·월간 패션 소비 리포트
    weekly-review/          # 착용 기록과 장기 미착용 회고
  lib/
    api/                    # 공통 API client, 오류, 토큰 재발급
    storage/                # AsyncStorage 및 SecureStore adapter
  providers/                # QueryClient와 앱 전역 provider
  stores/                   # Zustand 전역·등록 draft store
assets/                     # 이미지, SVG 아이콘, Pretendard 폰트
app.config.js               # Expo 및 iOS native 설정
eas.json                    # development/preview/production 빌드 프로필
```

## Requirements

- Node.js `22.20.0`
- npm `10.9.3`
- 최신 Xcode 및 iOS Simulator
- 네이티브 로그인과 Firebase 설정이 포함된 Development Build

## Getting Started

```bash
nvm use
npm install
cp .env.example .env.local
```

`.env.local`에서 API 주소를 실행 환경에 맞게 설정합니다.

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com
```

iOS 시뮬레이터용 네이티브 앱을 빌드하고 실행합니다.

```bash
npm run ios
```

이미 Development Build가 설치되어 있다면 Metro만 실행할 수 있습니다.

```bash
npm run start
```

### 코드 품질 확인

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

## iOS / Native Setup

1. Xcode를 실행해 추가 컴포넌트와 Command Line Tools를 설치합니다.
2. Firebase Console에서 번들 ID `com.weartrack.app`용 `GoogleService-Info.plist`를 내려받습니다.
3. 로컬 빌드에서는 파일을 저장소 루트에 두고 Git에 커밋하지 않습니다.
4. EAS Build에서는 `GOOGLE_SERVICE_INFO_PLIST` 이름의 File 환경변수로 등록합니다.
5. 소셜 로그인 제공자 콘솔에 iOS Bundle ID와 URL Scheme을 등록합니다.

Development Build:

```bash
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client
```

## Git Workflow

`develop`을 개발 통합 브랜치로 사용하고 `feature/*`, `fix/*`, `hotfix/*` 브랜치에서 작업한 뒤 Pull Request로 반영합니다. `main`은 배포 가능한 버전을 유지합니다.
