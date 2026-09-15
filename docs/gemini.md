# AI 대화 고도화: Gemini 무료 API 연동

기본값은 `src/content/dialogues.ts`의 사전 작성된 롤플레이 스크립트라, 아무 설정 없이도 Conversation 단계가 완전히 동작합니다. Google의 Gemini API 키를 추가하면 같은 화면이 **매번 다른, 실시간으로 생성되는 대화**로 바뀌고, 대화 종료 후 분석도 (사전 정의한 목표 단어 사용 여부 확인 이상으로) fluency/grammar/naturalness/appropriateness까지 채점합니다.

## 1. 무료 API 키 발급

1. https://aistudio.google.com/apikey 접속 (Google 계정으로 로그인)
2. "Create API key" 클릭
3. 발급된 키를 복사

무료 티어는 분당/일일 요청 수 제한이 있지만, 개인 학습용으로는 충분합니다.

## 2. 앱에 연결

`.env.example`을 `.env`로 복사한 뒤:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=여기에_발급받은_키
```

앱을 재시작하면 `src/lib/gemini.ts`의 `isGeminiConfigured`가 자동으로 `true`가 되어 Conversation 단계가 실시간 모드로 전환됩니다. 키를 지우거나 `.env`를 삭제하면 즉시 스크립트 대화로 돌아갑니다 — 코드 변경이 필요 없습니다.

## 3. 동작 방식

- `generateAiTurn()`이 상황(situation)과 지금까지의 대화 기록만 Gemini에 전달해 AI의 다음 대사 한두 문장을 받아옵니다. spec 10 원칙대로, 목표 단어를 "반드시 사용하라"고 지시하지 않고 참고 정보로만 넘깁니다.
- 대화가 끝나면 `analyzeConversationWithGemini()`가 전체 transcript를 넘겨 JSON 형식으로 단어 사용 여부 + 4개 말하기 지표 + 짧은 피드백을 받아옵니다.
- 두 함수 모두 실패(네트워크 오류, 키 오류, 요청 제한, 잘못된 JSON 등)하면 자동으로 `src/lib/conversationAnalysis.ts`의 로컬 키워드 분석 + 스크립트 대화로 폴백합니다 — 무료 API가 단일 장애점이 되지 않습니다.
- 모델은 `EXPO_PUBLIC_GEMINI_MODEL`로 바꿀 수 있습니다 (기본값 `gemini-3.6-flash`). Google이 모델명을 바꾸거나 폐지하면 이 값만 갱신하면 됩니다 (실제로 이 문서를 쓰는 동안 `gemini-2.0-flash`가 폐지되어 한 번 바뀌었습니다).

## 4. 참고

- 이 프로젝트는 이 기능을 위해 Google 계정/API 키를 대신 발급해줄 수 없습니다 — 위 1번 과정은 사용자가 직접 진행해야 합니다.
- API 키는 `EXPO_PUBLIC_` 접두사가 붙어 클라이언트 번들에 그대로 포함됩니다(Expo의 공개 환경변수 방식). 프로덕션에 배포할 경우 이 키가 공개돼도 되는 수준인지(무료 티어 남용 가능성) 검토하고, 필요하면 서버를 경유하는 프록시로 바꾸는 것을 권장합니다.
