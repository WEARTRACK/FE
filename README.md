# WEARTRACK

Expo 기반 React Native 앱 `WEARTRACK`의 초기 개발 환경입니다.

## Stack

- Expo + React Native + TypeScript
- Expo Router
- TanStack Query
- Zustand
- NativeWind
- Axios
- AsyncStorage
- npm

## Requirements

- Node.js `22.20.0` LTS
- npm `10.9.3`
- Xcode 최신 버전
- iOS Simulator

## Getting Started

```bash
nvm use
npm install
npm run start
```

다른 실행 명령:

```bash
npm run ios
npm run android
npm run web
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Environment Variables

Expo에서는 `EXPO_PUBLIC_` 접두사가 붙은 변수를 앱에서 사용할 수 있습니다.

- `.env`: 기본값
- `.env.development`: 개발 환경
- `.env.production`: 운영 환경
- `.env.example`: 공유용 예시

현재 기본 변수:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Project Structure

```text
app/
src/
  config/
  lib/
    api/
    storage/
  providers/
  stores/
```

## Lint / Format

ESLint와 Prettier가 함께 설정되어 있고, VS Code 저장 시 자동 포맷이 동작하도록 맞춰져 있습니다.

- `npm run lint`: 린트 검사
- `npm run lint:fix`: 자동 수정 가능한 린트 문제 수정
- `npm run format`: 전체 파일 포맷 적용
- `npm run format:check`: 포맷 상태 검사

## iOS Setup

1. App Store 또는 Apple Developer에서 Xcode를 설치합니다.
2. Xcode를 한 번 실행해 추가 컴포넌트를 설치합니다.
3. `Xcode > Settings > Locations`에서 Command Line Tools가 지정되어 있는지 확인합니다.
4. iOS Simulator를 실행한 뒤 `npm run ios`로 앱을 시작합니다.

## Git / GitHub

현재 프로젝트는 로컬 Git 저장소에 추가할 수 있는 상태입니다. 원격 저장소를 연결하려면 GitHub에서 빈 레포지토리를 만든 뒤 아래 명령을 사용하면 됩니다.

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

## Git Workflow

이 프로젝트는 아래 브랜치 전략으로 작업합니다.

- `main`: 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 일반 버그 수정 브랜치
- `hotfix/*`: 운영 긴급 수정 브랜치

기본 작업 원칙:

- 기본 작업 시작 브랜치는 `develop`입니다.
- 새로운 기능은 항상 `develop`에서 브랜치를 분기합니다.
- 작업 완료 후 `feature/*` 브랜치를 `develop`으로 반영합니다.
- `main` 브랜치는 최종 배포 시점에만 반영합니다.
- `main` 브랜치에는 직접 작업하지 않습니다.

브랜치 네이밍 예시:

- `feature/login-ui`
- `feature/onboarding-flow`
- `feature/profile-edit`
- `fix/header-layout`
- `fix/token-refresh-bug`
- `hotfix/login-crash`

브랜치 이름은 아래 규칙을 따릅니다.

- 소문자 사용
- 단어 구분은 `-`
- 작업 내용을 짧고 명확하게 작성

작업 순서:

1. `develop` 최신화

```bash
git checkout develop
git pull origin develop
```

2. 작업 브랜치 생성

```bash
git checkout -b feature/login-ui
```

3. 작업 후 커밋

```bash
git add .
git commit -m "feat: add login ui"
```

4. 원격 푸시

```bash
git push -u origin feature/login-ui
```

5. GitHub에서 `develop` 대상으로 Pull Request 생성

커밋 메시지 규칙:

- `feat`: 기능 추가
- `fix`: 버그 수정
- `chore`: 설정, 패키지, 빌드 관련 변경
- `refactor`: 기능 변경 없는 구조 개선
- `style`: 포맷, 세미콜론 등 스타일 수정
- `docs`: 문서 수정

예시:

- `feat: add login screen`
- `fix: handle token refresh error`
- `chore: add eslint config`

배포 플로우:

- 기능 개발은 `feature/*` 브랜치에서 진행합니다.
- 기능이 완료되면 `develop`에 반영합니다.
- 통합 테스트 및 검증은 `develop`에서 진행합니다.
- 최종 배포 시점에 `develop`을 `main`에 반영합니다.