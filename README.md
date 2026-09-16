# project-05 — 영어학습용 앱

`docs/spec.md`(제품/학습 시스템 명세)을 기준으로 만드는 적응형 영어학습 앱입니다.
핵심 루프: **Learn → Hear → Understand → Recall → Express → Converse → Analyze → Review → Transfer → Automate**

Expo(React Native + Expo Router)로 만들어 **웹에서 먼저 검증한 뒤 동일 코드로 iOS/Android 앱으로 전환**합니다.

## 실행

```bash
npm install
npm run web       # 웹에서 실행 (브라우저: Chrome 권장 — 음성인식/합성 지원)
npm run ios       # (macOS 필요)
npm run android
```

## 현재 구현 범위

- 단어 144개: Level 1~5는 주제별로 직접 구성한 커리큘럼(인사/자기소개/기초 예절/시간·숫자, Restaurant/Hotel/Cafe/Directions/Transportation, 가족/직업/취미/취향/일과/날씨/약속, 친구/초대/부탁/사과/감정/주말/경험, 스몰토크/관심사/문화/영화·음악/음식/여행 경험/대화 이어가기)로 단어마다 문맥 문장 3개 이상 + 상황별 롤플레이 대화(총 17종)가 있음. Level 6부터는 실제 영어 단어 빈도 목록을 기준으로 고른 핵심 어휘(현재 79개)로, 단어량 확보가 우선이라 문장 2개 + 난이도 태그(easy/medium/hard)만 있고 전용 롤플레이 대화는 없음 — 대화 없는 단어는 Conversation 단계를 자동으로 건너뜀. 목표는 5,000단어 이상이며 이후 배치로 계속 추가 예정
- 전체 학습 루프: Learn → Listen(다양한 문맥 듣기) → Shadow(따라 말하기) → Express(문장 만들기) → Conversation(AI 롤플레이, 없으면 자동 생략) → Analysis. Listen/Shadow 단계는 듣기·말하기가 어려운 상황이면 건너뛰기 가능
- 학습자별 9개 능력치 독립 추적 (Recognition/Listening/Recall/Expression/Conversation/Context Transfer/Automaticity/Pronunciation/Context Understanding)
- Vocabulary-to-Speech Gap, Passive/Active/Automatic 어휘 수 대시보드, 단어별 학습 화면(대시보드 하단 전체 단어 목록)
- 약점 기반 복습 큐, 다음 학습 단어 자동 추천
- AI 대화는 사전 작성된 시나리오 스크립트 + 목표 단어 사용 여부 분석 방식으로 동작 (기본값: 실시간 LLM 호출 없음 — 아래 "AI 대화 고도화(Gemini)" 참고)

콘텐츠(단어/문구/상황/대화 스크립트)는 `src/content/`에 있습니다. 새 단어/문맥/대화를 추가해도 `src/lib/`의 학습 엔진 로직은 수정할 필요가 없습니다.

## 저장소: 로컬 ↔ Supabase

기본값은 기기(브라우저) 로컬 저장(AsyncStorage)이라 아무 설정 없이 바로 동작합니다. 서버 저장으로 바꾸려면:

1. [supabase.com](https://supabase.com)에서 무료 프로젝트 생성
2. Supabase SQL Editor에서 `supabase/schema.sql` 실행
3. `.env.example`을 `.env`로 복사하고 Project Settings → API에서 URL/anon key 입력
4. 앱 재시작 — `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`가 있으면 자동으로 Supabase를 사용합니다 (`src/lib/storage.ts`)

⚠️ 아직 로그인 기능이 없어 모든 학습자가 `local-user` 하나의 id를 공유합니다. 여러 사용자를 지원하려면 Supabase Auth 도입 후 `supabase/schema.sql`의 RLS 정책을 실제 사용자 기준으로 변경해야 합니다.

## 음성

- STT(듣고 인식): `expo-speech-recognition` — iOS `SFSpeechRecognizer` / Android `SpeechRecognizer` / 웹 Web Speech API. **API 키 없이 무료**, 웹에서는 지금 바로 동작합니다.
- TTS(듣기, 🔊 버튼): 기본은 `expo-speech`(iOS/Android OS 내장 음성, 웹은 브라우저 Web Speech API) — API 키 없이 무료지만, 억양 조절이 안 되는 API 특성상 다소 로봇처럼 들립니다. `EXPO_PUBLIC_GOOGLE_TTS_API_KEY`를 설정하면 자연스러운 Google Cloud Neural2 음성으로 자동 전환됩니다(현재 웹 한정) — `docs/google-tts.md` 참고. 키가 없거나 요청이 실패하면 자동으로 기존 기기 음성으로 대체됩니다.

## 앱(iOS/Android) 빌드로 전환

웹과 동일한 코드베이스로 네이티브 앱을 빌드합니다. `expo-speech-recognition`은 네이티브 모듈이 필요해 **Expo Go에서는 동작하지 않고 커스텀 개발 빌드가 필요**합니다.

```bash
# 계정 준비 (최초 1회, 무료)
npx eas-cli login

# 개발 빌드 (실기기/에뮬레이터에 설치해서 계속 개발)
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios   # Apple Developer 계정 필요(연 $99)

# 스토어 제출용 빌드
npx eas-cli build --profile production --platform android
```

`app.json`의 `ios.bundleIdentifier`/`android.package`(`com.englishlearning.app`)는 실제 배포 전에 원하는 값으로 바꿔주세요. `android/`, `ios/` 폴더는 커밋하지 않고(`npx expo prebuild`로 그때그때 생성, Continuous Native Generation 방식) `.gitignore`에서 제외되어 있습니다.

## AI 대화 고도화 (Gemini, 선택)

기본은 사전 작성된 스크립트 대화라 API 키가 전혀 필요 없습니다. 더 자유로운 대화를 원하면 `docs/gemini.md`를 참고하세요 — Gemini는 **Supabase Edge Function을 통해서만** 호출됩니다(클라이언트가 직접 키를 들고 있지 않도록). 위 Supabase 설정만 돼 있으면 자동으로 실시간 모드로 전환되고, 함수가 없거나 실패하면 스크립트 대화로 돌아갑니다.
