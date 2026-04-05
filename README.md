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
