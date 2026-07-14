# 마이페이지·필수 약관 동의 구현 계획

## 1. 목표와 완료 조건

### 목표

- 회원가입 성공 화면과 닉네임 설정 사이에 필수 약관 동의 흐름을 추가한다.
- 마이페이지에서 회원 정보 조회, 닉네임 수정, 약관 전문 확인, 로그아웃, 회원탈퇴를 제공한다.
- Figma UI와 `member-api.md`, `logout-api.md`, Swagger 계약을 기준으로 API를 연동한다.
- 필수 라우팅 값과 인증 종료 흐름을 방어적으로 처리해 약관·프로필 미완료 사용자가 메인 화면으로 진입하지 못하게 한다.

### 전체 완료 조건

- `requiredTermsAgreed`와 `profileCompleted`가 모두 유효한 Boolean일 때만 정상 후속 라우팅이 결정된다.
- 필수 라우팅 값이 누락되거나 타입이 잘못되면 부분 세션을 저장하지 않고 `/auth`로 안전하게 복귀한다.
- 약관 저장 성공 전에는 동의 완료 상태를 확정하거나 닉네임 단계로 이동하지 않는다.
- 마이페이지 회원 정보와 닉네임 변경 결과가 서버, TanStack Query 캐시, Zustand 세션에 일치한다.
- 로그아웃·회원탈퇴 동작은 Alert 확인 버튼과 화면 CTA를 연속으로 눌러도 한 번만 실행된다.
- 로그아웃·회원탈퇴 후 뒤로가기로 인증된 화면에 복귀할 수 없다.
- 각 태스크의 구현·테스트·subagent 리뷰·피드백 반영·재검증이 모두 끝난다.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`가 통과한다.

## 2. 모든 태스크에 적용할 공통 원칙

### 디자인 토큰과 공통 컴포넌트

- 색상, 타이포그래피, 간격, radius, 버튼 상태는 `tailwind.config.js`, `src/constants/colors.ts`와 기존 공통 컴포넌트의 토큰을 우선 사용한다.
- `Button`, `SignupInput`, `BackButton`, 기존 헤더·아이콘 등 공통 요소를 우선 재사용하며 화면별로 같은 UI를 중복 구현하지 않는다.
- Figma 값을 맞추기 위해 토큰에 없는 숫자나 색상을 하드코딩해야 하면 적용 전에 사용자에게 다음 내용을 고지한다.
  - 하드코딩이 필요한 화면·요소
  - 사용할 값과 Figma 근거
  - 기존 공통 토큰으로 대체할 수 없는 이유
  - 공통 토큰 추가와 화면 한정 하드코딩 중 선택한 방식
- 사전 고지 없이 임의의 색상·간격·크기·문구를 하드코딩하지 않는다.

### 공통 피드백 UI

- 모든 확인/재확인 UI는 커스텀 `showAlert` → `FeedbackProvider` → `AlertDialog` 흐름을 사용한다.
- 모든 성공·실패·안내 메시지는 커스텀 `showToast`와 `Toast`를 사용한다.
- React Native 기본 `Alert.alert`, 화면 전용 임시 Modal, 별도 Toast 구현을 추가하지 않는다.
- 공통 Alert/Toast로 표현할 수 없는 요구가 발견되면 새 UI를 만들기 전에 사용자에게 사유와 공통 컴포넌트 확장안을 고지한다.

### API와 안전한 실패

- API 응답은 HTTP 성공 여부뿐 아니라 `isSuccess`, `code`, `message`, `result`의 런타임 타입을 검증한다.
- 라우팅 필수값이 누락되거나 잘못된 경우 추정값으로 메인 화면을 선택하지 않는다.
- API 요청이 진행 중일 때 ref 기반 동기 lock과 mutation pending 상태를 함께 사용해 같은 작업의 중복 실행을 차단한다.
- 인증·회원별 Query 캐시와 전역 상태는 다른 계정에 노출되지 않도록 명시적으로 초기화한다.

### 태스크별 subagent 리뷰 게이트

각 태스크는 아래 절차를 모두 거쳐야 완료로 표시한다.

1. 구현자가 태스크 범위의 코드와 테스트를 완료하고 관련 검사를 실행한다.
2. 해당 구현에 직접 참여하지 않은 subagent에게 변경 diff, 관련 API 문서, Figma 요구, 테스트 결과를 전달한다.
3. subagent는 API 계약, 상태 전이, 실패 경로, UI 일치, 접근성, 회귀, 테스트 누락을 리뷰한다.
4. 모든 피드백을 분류하고 유효한 피드백은 코드와 테스트에 반영한다. 반영하지 않는 의견은 기술적 사유를 기록한다.
5. 피드백 반영 후 관련 테스트와 정적 검사를 다시 실행한다. 중요한 수정이 있었다면 같은 subagent에게 재리뷰를 요청한다.
6. 리뷰 결과와 반영 내역이 정리된 후에만 다음 태스크로 이동한다.

## 3. 태스크 목록

## Task 1. 인증 정책·세션 계약·안전 라우팅 기반

### 작업 범위

- 소셜 로그인 응답에 필수 `requiredTermsAgreed: boolean`을 추가하고 `profileCompleted`와 함께 엄격하게 검증한다.
- 두 필드 중 하나라도 누락되거나 Boolean이 아니면 `INVALID_RESPONSE`로 거부하고 부분 세션을 저장하지 않는다.
- persisted session에 `requiredTermsAgreed`를 추가하고, 이전 저장 데이터에서 두 필수 Boolean이 누락되거나 잘못된 경우 `false`로 정규화하는 migration/merge를 구현한다.
- 약관 완료, 닉네임, 프로필 완료 상태를 부분 갱신할 세션 action을 추가한다.
- 로그인 콜백과 기존 로그인 mutation이 공유하는 순수 route resolver를 구현한다.
- 라우팅 우선순위를 아래와 같이 고정한다.
  1. 필수값 오류 → `/auth`
  2. 회원가입 intent이며 약관·프로필 모두 미완료 → 회원가입 성공
  3. 약관 미동의 → 약관 동의
  4. 약관 완료·프로필 미완료 → 닉네임 설정
  5. 약관·프로필 완료 → 기존 onboarding resolver의 `/quest` 또는 `/home`
- `/api/members/me` GET·DELETE를 Access Token과 refresh 재시도가 적용되는 일반 보호 API로 분류한다.
- `/api/auth/logout`은 최초 Access Token은 첨부하지만 401에서 refresh/replay하지 않는 인증 종료 예외 API로 분류한다.
- 현재 코드에 전체 refresh interceptor가 없다면 새 refresh 기능을 만들지 않고, 경로 정책을 `requiresAccessToken`과 `allowRefresh`로 분리해 테스트 가능한 형태로 둔다.
- 공개 소셜 로그인 API에는 Authorization 헤더를 추가하지 않는다.

### 완료 기준

- 필수 라우팅 값의 모든 조합과 잘못된 타입에 대한 resolver 테스트가 통과한다.
- 비정상 로그인 응답에서 세션 저장과 `/home` 이동이 발생하지 않는다.
- 이전 persisted session이 안전하게 migration된다.
- `/api/members/me`에는 토큰이 첨부되고 refresh 허용으로 분류된다.
- `/api/auth/logout`에는 토큰이 첨부되지만 refresh/replay 금지로 분류된다.
- 테스트용 세션도 `requiredTermsAgreed`를 명시한다.

### subagent 리뷰·피드백 반영

- subagent에게 로그인 응답 validator, session migration, route truth table, API 경로 정책과 테스트를 집중 리뷰하도록 요청한다.
- 약관 우회, 잘못된 값의 `/home` fallback, logout refresh 재시도 가능성에 관한 피드백을 우선 반영한다.
- 반영 후 인증 interceptor 테스트, 로그인 API 테스트, resolver 테스트와 typecheck를 다시 실행한다.

## Task 2. 필수 약관 동의 UI·정적 전문·API 연동

### 작업 범위

- 실제 `SignUpSuccessScreen`의 시작하기 다음에 약관 동의 route를 추가하고, 기존 닉네임 설정 route로 직접 이동하는 동작을 제거한다.
- Figma의 동의 전·후 상태를 구현한다.
  - 전체동의 행만 체크 상태를 변경한다.
  - 서비스 이용 약관과 개인정보처리방침 행은 전문 화면으로 이동하며 체크 상태를 변경하지 않는다.
  - 전체동의 전에는 `동의하고 계속하기` CTA를 비활성화한다.
- `POST /api/members/me/terms-agreement`에 `{ requiredTermsAgreed: true }`를 전달하고 빈 result 성공 envelope를 검증한다.
- CTA에는 single-flight guard를 적용해 연속 탭에도 POST를 한 번만 실행한다.
- 성공한 경우에만 세션의 `requiredTermsAgreed=true`를 반영하고 프로필 상태에 따라 닉네임 설정 또는 기존 onboarding resolver로 이동한다.
- 실패·비정상 응답에서는 미동의 상태와 현재 화면을 유지하고 커스텀 Toast로 오류를 알린다.
- 서비스 약관과 개인정보처리방침을 공용 정적 데이터와 공용 전문 화면으로 구현해 온보딩과 마이페이지에서 공유한다.
- 전문 화면은 safe area, 긴 본문 ScrollView, 뒤로가기, 제목 접근성, 마지막 문단까지의 스크롤을 지원한다.
- Figma 원문은 다음 확정 기준으로 교정한다.
  - `gamil.com` → `gmail.com`
  - 비밀번호 수집 문구 → 소셜 계정 이메일·프로필 및 닉네임 수집
  - 6개월 완전삭제·영구삭제 표현 제거
  - 소프트 삭제, 7일 재가입 제한, 7일 이후 기존 계정 재활성화 정책 적용

### 완료 기준

- 회원가입 성공 → 약관 → 닉네임/온보딩 순서가 지켜진다.
- 전체동의 전에는 CTA가 실행되지 않는다.
- 약관 전문을 보고 돌아와도 체크 상태가 유지된다.
- POST 성공 전에는 세션과 라우팅이 변경되지 않는다.
- 연속 탭에도 POST가 한 번만 호출된다.
- 실패 시 커스텀 Toast가 표시되고 재시도할 수 있다.
- 두 전문이 정적 공용 소스를 사용하며 마이페이지에서도 동일한 내용이 표시된다.

### subagent 리뷰·피드백 반영

- subagent에게 Figma 전후 상태, 체크/전문 행 동작 분리, API 성공 전 상태 확정 여부, 단일 실행, 정적 문구와 접근성을 리뷰하도록 요청한다.
- 유효한 UI 간격·상태 피드백을 반영하되 새 하드코딩이 필요하면 먼저 사용자에게 고지한다.
- 반영 후 약관 API·라우팅 테스트, typecheck, lint와 iOS/Android 수동 흐름을 재검증한다.

## Task 3. 마이페이지 기본 화면·회원 정보 조회·상세 라우팅

### 작업 범위

- 현재 마이페이지 placeholder를 Figma 기반의 내 정보 화면으로 교체한다.
- `GET /api/members/me`로 `memberId`, `nickname`, `email`을 조회하고 응답 타입을 엄격히 검증한다.
- 마이페이지 화면이 focus될 때 member Query를 invalidate한 뒤 refetch해 서버의 최신 정보를 확인한다.
- 닉네임 수정 성공 시 `setQueryData`로 member Query 캐시를 즉시 갱신한다.
- 닉네임 수정 화면에서 마이페이지로 복귀하면 캐시의 변경값을 즉시 표시하고 background refetch로 서버 값과 다시 검증한다.
- 로딩, 오류, 재시도 상태를 구현하고 모든 안내는 커스텀 Toast를 사용한다.
- 닉네임 수정 진입, 서비스 약관, 개인정보처리방침, 로그아웃, 회원탈퇴 CTA를 연결한다.
- 닉네임 수정과 약관 전문에서는 하단 탭을 숨기고 회원탈퇴 화면에서는 Figma대로 하단 탭을 유지한다.
- 편집·chevron·뒤로가기 아이콘은 기존 assets와 공통 버튼을 우선 사용한다.

### 완료 기준

- 마이페이지 진입 시 서버의 닉네임과 이메일이 표시된다.
- 마이페이지가 다시 focus될 때 member Query invalidate/refetch가 실행된다.
- 닉네임 수정 성공 직후 `setQueryData` 결과가 화면에 반영되고, 복귀 후 background refetch 결과와 일치한다.
- 로딩 중 오래된 사용자 정보를 최종값처럼 표시하지 않는다.
- 조회 실패 시 인증 상태를 임의로 지우지 않고 재시도할 수 있다. 인증 오류는 안전한 인증 흐름으로 처리한다.
- 모든 CTA가 올바른 화면이나 커스텀 Alert로 연결된다.
- 상세 화면별 하단 탭 노출 정책과 직접 route 진입이 모두 동작한다.

### subagent 리뷰·피드백 반영

- subagent에게 Query 생명주기, 오래된 데이터 노출, 상세 route 구조, 탭 표시 정책, Figma 레이아웃과 접근성을 리뷰하도록 요청한다.
- 리뷰에서 발견된 캐시·라우팅 회귀를 우선 반영하고, UI 하드코딩 요청은 공통 토큰 적용 가능성을 먼저 검토한다.
- 반영 후 member GET 테스트, route 테스트, typecheck, lint와 수동 탭 전환을 재검증한다.

## Task 4. 기존 중복 확인 API를 이용한 닉네임 수정

### 작업 범위

- 닉네임 수정 화면에 현재 닉네임을 프리필하고 실제로 변경된 경우에만 중복 확인과 저장을 허용한다.
- 기존 최초 닉네임 설정의 입력 검증, 400ms debounce, 중복/사용 가능 field 스타일을 공용 hook/component로 추출한다.
- 신규 중복 확인 API를 만들지 않고 Swagger의 기존 계약을 재사용한다.
  - `GET /api/members/nickname/check?nickname={nickname}`
  - `result.nickname: string`
  - `result.available: boolean`
  - 화면 모델은 `isDuplicate = !available`로 변환
- 기존 parser가 허용하던 추정 응답 형태를 제거하고 Swagger envelope와 `nickname`, `available` 타입을 엄격히 검증한다.
- 응답 nickname이 현재 요청 nickname과 다르면 stale/비정상 응답으로 처리하고 성공 상태를 확정하지 않는다.
- PATCH 성공 시 member Query 캐시와 세션 nickname을 함께 갱신한다.
- 성공 메시지는 커스텀 Toast로 `닉네임이 변경되었습니다.`를 표시한다.
- 최초 닉네임 설정 성공 시에도 세션 nickname과 `profileCompleted`를 갱신한다.

### 완료 기준

- 현재값은 표시되지만 변경 전에는 저장되지 않는다.
- 잘못된 형식, debounce 대기, 중복, 사용 가능, 중복 확인 실패 상태가 기존 설정 화면과 동일하게 표현된다.
- 빠르게 입력을 바꿔도 이전 응답이 현재 입력의 성공 상태를 덮어쓰지 않는다.
- 중복 확인과 PATCH는 진행 중 중복 실행되지 않는다.
- PATCH 성공 직후 마이페이지와 세션에서 새 닉네임이 보인다.
- 409와 네트워크 오류는 커스텀 Toast/field 상태로 처리되고 서버 성공 전 값을 확정하지 않는다.

### subagent 리뷰·피드백 반영

- subagent에게 Swagger 계약 일치, parser 엄격성, debounce 경쟁 상태, 동일값 차단, 캐시·세션 동기화를 리뷰하도록 요청한다.
- 입력 UI 피드백은 최초 설정 화면과 수정 화면 모두에 일관되게 반영한다.
- 반영 후 중복 확인 API 테스트, nickname validator 테스트, PATCH 테스트, typecheck와 키보드 수동 QA를 재실행한다.

## Task 5. 공통 Alert 확장과 단일 실행 기반

### 작업 범위

- 공통 Alert action에 확인·취소·파괴적 동작의 의미와 Figma에 맞는 버튼 배치를 표현할 수 있도록 기존 `showAlert`/`AlertDialog` 인터페이스를 확장한다.
- Alert action에 `pending`, `disabled`, `loading` 상태를 전달하고 시각 상태와 접근성 상태가 함께 반영되도록 한다.
- 화면 CTA와 Alert action이 공유할 수 있는 범용 single-flight controller를 구현한다.
  - ref lock으로 같은 이벤트 루프의 중복 실행을 즉시 차단한다.
  - 하나의 pending 상태를 CTA와 Alert action의 공통 disabled/loading 근거로 사용한다.
  - Alert를 열기 위한 CTA, Alert 확인 action, 동일 작업의 다른 진입점이 같은 lock을 사용한다.
  - 작업 정책에 따라 성공·실패 후 lock을 해제하거나 navigation 완료까지 유지할 수 있도록 한다.
- Alert가 닫힌 뒤 비동기 action이 실행되는 기존 `FeedbackProvider` 동작에서도 lock이 유실되지 않도록 한다.
- 기존 Alert 사용 화면의 action 순서, backdrop dismiss, alert queue, async action 실행, 접근성 동작이 유지되는지 회귀 테스트를 추가한다.
- 이 태스크에서는 로그아웃·회원탈퇴 API나 사용자 데이터 cleanup을 구현하지 않고, Task 6에서 사용할 공통 기반만 완성한다.

### 완료 기준

- Alert action이 의미와 버튼 배치를 명시적으로 표현한다.
- pending 중 Alert action과 연결된 화면 CTA가 동시에 disabled/loading 상태가 된다.
- CTA와 Alert 확인을 같은 프레임에 연속 실행해도 single-flight callback은 한 번만 실행된다.
- 진행 중 같은 Alert를 다시 열거나 같은 CTA를 재실행할 수 없다.
- 작업 완료 정책에 따라 lock 유지·해제가 예측 가능하게 동작한다.
- 기존 Alert 사용 화면의 action, queue, dismiss, async callback 동작에 회귀가 없다.
- React Native 기본 Alert나 화면 전용 임시 Modal을 추가하지 않는다.

### subagent 리뷰·피드백 반영

- subagent에게 Alert action API의 의미 명확성, 버튼 배치, pending/disabled/loading 접근성, single-flight 경쟁 조건, 기존 Alert 회귀 테스트를 집중 리뷰하도록 요청한다.
- 공통 컴포넌트 변경으로 기존 호출부가 잘못 해석될 가능성과 동시 실행 우회 경로를 우선 수정한다.
- 반영 후 Alert/FeedbackProvider/single-flight 관련 테스트, 기존 Alert 사용처 회귀 테스트, typecheck와 lint를 재실행한다.

## Task 6. 로그아웃·회원탈퇴·사용자 데이터 정리

### 작업 범위

- Task 5의 공통 Alert action 상태와 single-flight controller를 로그아웃·회원탈퇴의 화면 CTA와 확인 Alert에 적용한다.
- 진행 중에는 Alert 재오픈, 화면 CTA 재실행, Alert 확인 action 재실행을 모두 차단한다.
- 회원탈퇴 실패처럼 화면에 남아 재시도가 필요한 경우에만 작업 종료 후 lock을 해제한다.
- 공통 사용자 데이터 cleanup 함수로 다음 현재 회원 데이터를 정리한다.
  - 세션과 Access/Refresh Token
  - closet 및 등록 draft store
  - TanStack Query 캐시
  - quest registration 상태
  - social auth intent
  - notification token sync 상태
  - 현재 memberId의 쇼핑몰 약관 캐시
- 다른 회원의 로컬 키와 앱 공통 설정은 유지한다.
- cleanup은 일부 저장소 정리에 실패해도 나머지 정리를 계속하는 best-effort 방식으로 실행하고 각 실패를 추적 가능하게 남긴다.
- 로그아웃의 best-effort 순서를 고정한다.
  1. memberId, Access Token, FCM snapshot 캡처
  2. FCM 해제와 refresh 예외 logout API를 best-effort로 실행
  3. logout 성공·네트워크 오류·401/403·500과 무관하게 로컬 데이터 정리
  4. `/auth`로 스택 초기화
- 회원탈퇴 순서를 고정한다.
  1. 세션과 FCM snapshot 캡처
  2. FCM 해제 best-effort 실행
  3. `DELETE /api/members/me` 단일 실행
  4. 성공 시에만 로컬 데이터 정리 및 `/auth` 이동
  5. 실패 시 세션·캐시 유지
  6. FCM 해제가 이미 성공했다면 snapshot으로 best-effort 재등록 후 재시도 가능 상태로 복구
- 로그아웃·탈퇴 확인은 커스텀 Alert만 사용하고, 결과 안내는 커스텀 Toast만 사용한다.
- 탈퇴 문구는 영구삭제를 단정하지 않고 계정 소프트 삭제와 7일 재가입 제한만 안내한다.
- `/auth` 이동 시 navigation stack을 reset해 뒤로가기로 main 화면에 복귀하지 못하게 한다.
- cleanup 대상은 현재 memberId로 한정하고 다른 계정의 persisted key와 캐시가 삭제되거나 현재 계정 데이터와 섞이지 않도록 한다.

### 완료 기준

- CTA와 Alert 확인을 연속으로 눌러도 각 서버 작업이 한 번만 실행된다.
- 진행 중 CTA와 Alert action이 모두 비활성화되고 Alert를 다시 열 수 없다.
- logout 401에서 refresh/replay가 실행되지 않는다.
- logout API와 FCM 해제 결과와 무관하게 나머지 로컬 정리가 best-effort로 계속되고 `/auth`로 이동한다.
- 회원탈퇴는 성공한 경우에만 로컬 데이터를 정리한다.
- 회원탈퇴 API 실패 시 세션·Query 캐시·전역 상태를 유지한다.
- 회원탈퇴 실패 후 FCM 상태가 보상되며 화면에서 다시 시도할 수 있다.
- 인증 화면 이동 후 하드웨어/제스처 뒤로가기로 main 화면에 복귀할 수 없다.
- 현재 계정의 Query/store/storage만 정리되고 다른 계정 데이터는 유지된다.

### subagent 리뷰·피드백 반영

- subagent에게 cleanup 누락·순서, logout best-effort, 탈퇴 성공/실패 분기, FCM 해제·보상, `/auth` navigation reset, 계정 간 데이터 격리를 집중 리뷰하도록 요청한다.
- 보안·개인정보·계정 간 데이터 노출과 중복 실행 관련 피드백은 우선 반영하고 실패 주입 테스트를 추가한다.
- 반영 후 logout/withdraw/cleanup/FCM/navigation 테스트, typecheck, lint와 오프라인·401·500 수동 QA를 재실행한다.

## Task 7. 통합 회귀·접근성·최종 검증

### 작업 범위

- 전체 사용자 흐름을 통합 검증한다.
  - 신규 가입 → 가입 성공 → 약관 → 닉네임 → quest/home
  - 약관 미동의 재로그인 → 약관
  - 약관 완료·프로필 미완료 재로그인 → 닉네임
  - 마이페이지 조회 → 닉네임 수정 → 즉시 반영
  - 약관 전문 확인
  - 로그아웃과 회원탈퇴 성공·실패
- iOS/Android, 393px 기준 화면과 작은 화면, safe area, 키보드, 긴 전문, 큰 글꼴을 확인한다.
- checkbox, button, alert, loading/disabled 상태의 스크린리더 정보를 확인한다.
- 공통 Alert/Toast 사용 여부와 임시 피드백 UI가 추가되지 않았는지 검사한다.
- 공통 토큰 대신 고지 없이 추가된 하드코딩이 없는지 검사한다.
- 전체 자동 검사와 변경 파일 범위 검토를 수행한다.

### 완료 기준

- 모든 통합 시나리오와 수동 QA 체크가 통과한다.
- 공통 Alert/Toast 이외의 임시 피드백 UI가 없다.
- 고지되지 않은 하드코딩이 없고, 추가된 토큰 또는 예외 값의 근거가 기록돼 있다.
- 전체 테스트, typecheck, lint, format check가 통과한다.
- 알려진 회귀나 미반영된 유효 리뷰 의견이 없다.

### subagent 리뷰·피드백 반영

- 이전 태스크 구현에 참여하지 않은 subagent에게 전체 diff와 테스트 결과를 전달해 최종 독립 리뷰를 요청한다.
- subagent는 Figma/API 계약, 인증 경계, 안전한 실패, 계정 간 데이터 격리, 접근성, 공통 토큰과 공통 피드백 UI 사용 여부를 검토한다.
- 모든 유효한 피드백을 반영한 뒤 전체 자동 검사와 영향 화면 수동 QA를 다시 수행한다.
- 미반영 의견이 있다면 사유와 위험도를 기록하고 사용자에게 보고하기 전에는 완료 처리하지 않는다.

## 4. 태스크 진행 순서

`Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7`

- Task 1의 계약과 라우팅 기반이 완료되기 전에 화면 구현을 시작하지 않는다.
- 각 태스크의 subagent 리뷰 게이트를 통과하기 전에는 다음 태스크를 시작하지 않는다.
- 후속 태스크에서 선행 계약 변경이 필요해지면 임의 변경하지 않고 영향 범위와 이유를 먼저 사용자에게 고지한다.
