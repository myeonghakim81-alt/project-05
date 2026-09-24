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

- 단어 4,700개(문구 11,665개), **Level 1~6은 전부 550개, Level 7~10은 전부 350개**로 10단계 커리큘럼 전체에 두터운 콘텐츠 확보(레벨 테스트/레벨별 학습을 실제로 테스트할 수 있는 규모). Level 2~5는 주제별로 직접 구성한 원래 커리큘럼(Restaurant/Hotel/Cafe/Directions/Transportation, 가족/직업/취미/취향/일과/날씨/약속, 친구/초대/부탁/사과/감정/주말/경험, 스몰토크/관심사/문화/영화·음악/음식/여행 경험/대화 이어가기) 단어는 문맥 문장 3개 이상 + 상황별 롤플레이 대화(총 17종, 새 단어는 기존 대화의 targetVocabularyIds에 연결)가 있고, 단어량 확보가 우선이었던 나머지(여행/서비스, 집/직장, 관계/감정, 문화/사회 등 일반 어휘)와 Level 1/6 일부는 문장 2~3개 + 난이도 태그(easy/medium/hard)만 있고 전용 롤플레이 대화는 없음 — 대화 없는 단어는 Conversation 단계를 자동으로 건너뜀. 4차례의 확장 라운드(Level 2~6: 180→300→420→**550**개, Level 7~10: 70→150→250→**350**개)를 거치며 Level 1~6은 알파벳/기초어휘/숫자/시간/자기소개, 항공/호텔/카페/교통/쇼핑/길찾기, 가족/직업/취미/취향/일과/날씨/약속, 친구/초대/부탁/사과/감정/주말/경험, 스몰토크/관심사/문화/영화/음악/음식/여행/대화 이어가기, 클레임/취소/환불/분실물/지연/고객센터/병원/은행/공공서비스 등 실생활 어휘를 각 주제별로 균등 증량했고, Level 7~10은 회의/발표/전화/이메일/보고/일정/협상/고객소통 등 직장 영어, 기술/교육/경제/환경/사회/AI/문화/미래 등 시사 토론, 구동사/콜로케이션/관용구/뉘앙스/공손함/완곡어법/유머/문화적 맥락 등 자연스러운 영어, 담화 표지·추상 개념·관용적 연결어·뉘앙스 있는 논증 표현 등 고급 어휘를 라운드마다 새 하위 주제/어휘로 채워 넣었음. 새로 추가된 단어는 모두 문장 2~3개 + 상황 질문(`Phrase.question`)까지 채워져 있음. 최종 목표는 5,000단어 이상이며 이후 배치로 계속 추가 예정
- **레벨 테스트 → 레벨별 학습**으로 진입 구조가 바뀌었습니다. 대시보드에 전체 단어를 스크롤로 다 보여주던 방식은 제거했습니다.
  - 첫 진입(또는 "레벨 테스트 다시 보기") 시 `/placement-test`: Level 1부터 각 레벨 단어를 무작위로 몇 개씩(`PlacementSampleSize`, 기본 8개) 뽑아 단어의 한국어 뜻(`VocabularyItem.meaning`) 맞추기 퀴즈로 확인. 정답률 90% 이상이면 다음 레벨로 계속 올라가고, 90% 미만인 첫 레벨을 시작 레벨로 저장합니다.
  - `/level-study`: 현재 레벨에서 단어를 무작위로 몇 개(`LevelStudySampleSize`, 기본 10개) 뽑아 **단어 노출(카드 한 장씩) → 단어 테스트(단어의 한국어 뜻 맞추기) → 발음 테스트(예문을 따라 읽으며 녹음) → 문장 테스트(그 상황에 맞게 말하거나 쓰기)** 순서로 화면 전환하며 진행. 단어 노출은 10개를 한 번에 보여주지 않고 카드 한 장씩 넘겨가며 보여줍니다. 단어 테스트는 예문 번역이 아니라 그 단어 자체의 뜻(`buildWordMeaningChoices`)을 묻고, 정답을 고르면 약 0.7초 뒤 자동으로 다음 문제로 넘어갑니다(오답이면 정답을 확인하고 직접 "다음"을 눌러야 함). 발음 테스트는 단어 하나만이 아니라 그 단어가 들어간 예문 전체를 따라 읽게 하며(기존 Shadow 단계와 동일한 로직인 `estimatePronunciationScore`로 채점) 문항을 건너뛰면 문장 테스트로 넘어가기 전에 "그래도 진행할지" 확인을 한 번 더 받습니다. 문장 테스트는 그 단어가 쓰인 다른 예문의 상황(`ContextItem.description`)과, 있다면 실제 영어 질문(`Phrase.question`, 아직 일부만 채워짐 — 없으면 일반 문구로 대체)을 함께 보여주고, 그 질문에 그 단어를 써서 말(음성 인식)하거나 입력해서 답하게 합니다.
  - 종합 점수(3개 테스트 평균, 발음을 건너뛰면 그 항목은 평균에서 제외) 기준 **90% 이상 통과 → 다음 레벨, 60~89% → 같은 레벨 반복, 60% 미만 → 이전 레벨로 하락** (`src/lib/policy.ts`의 `LevelPassThreshold`/`LevelDropThreshold`).
  - 진행 상태(`currentLevel`/`placementCompleted`)는 학습 단어 점수와 마찬가지로 `LearnerRepository`(로컬/Supabase)에 저장됩니다.
- 전체 학습 루프(단어별 심화 학습, 위 레벨 루프의 각 단계가 재사용하는 기반): Learn → Listen(다양한 문맥 듣기) → Shadow(따라 말하기) → Express(문장 만들기) → Conversation(AI 롤플레이, 없으면 자동 생략) → Analysis. Listen/Shadow 단계는 듣기·말하기가 어려운 상황이면 건너뛰기 가능
- 학습자별 9개 능력치 독립 추적 (Recognition/Listening/Recall/Expression/Conversation/Context Transfer/Automaticity/Pronunciation/Context Understanding)
- Vocabulary-to-Speech Gap, Passive/Active/Automatic 어휘 수 대시보드
- **간격 반복(spaced repetition) 복습 큐** (`src/lib/srs.ts`, spec 14/16): 레벨 학습(`/level-study`)이나 개별 단어 학습(`/lesson`)을 한 번 마치면 그 단어에 복습 일정이 잡힙니다. 처음엔 1일 뒤, 그 다음은 2일 → 4일 → 7일 → 14일 → 30일로 통과할 때마다 간격이 늘어나고(`SpacedReviewIntervalsDays`), 실패하면 한 단계 앞으로 돌아가 더 빨리 다시 옵니다. 대시보드의 "오늘의 복습" 카드에 오늘 복습할 단어 수가 뜨고, `/review`에서 최대 `DailyReviewCap`(기본 15)개씩 **뜻 확인(자동 진행) → 새로운 상황에서 그 단어 떠올려 답하기** 2단계로 빠르게 복습합니다(발음 테스트는 생략, 레벨은 바뀌지 않음). 이것과 별개로 스킬 점수가 낮은 단어를 즉시 큐에 넣는 기존 약점 기반 복습 큐(대시보드 "복습 큐" 카드 → `/lesson`)도 그대로 남아 있습니다 — 하나는 "시간이 지나 잊기 전에", 하나는 "지금 당장 약한 것"을 다룹니다.
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
