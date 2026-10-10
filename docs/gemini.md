# AI 대화 고도화: Gemini (Supabase Edge Function 프록시)

기본값은 `src/content/dialogues.ts`의 사전 작성된 롤플레이 스크립트라, 아무 설정 없이도 Conversation 단계가 완전히 동작합니다. Gemini를 연결하면 같은 화면이 **매번 다른, 실시간으로 생성되는 대화**로 바뀌고, 대화 종료 후 분석도 (사전 정의한 목표 단어 사용 여부 확인 이상으로) fluency/grammar/naturalness/appropriateness까지 채점합니다.

⚠️ **아키텍처가 바뀌었습니다**: 클라이언트가 Gemini API를 직접 호출하지 않습니다. `EXPO_PUBLIC_` 접두사가 붙은 값은 전부 배포된 앱의 JS 파일 안에 그대로 노출되는데, Gemini 키처럼 실제 과금과 연결된 키를 그렇게 노출시키는 건 위험합니다. 그래서 대신 **Supabase Edge Function이 대리로 Gemini를 호출**하고, 진짜 키는 그 함수의 서버 환경에만 저장됩니다. 클라이언트는 이미 있는 Supabase URL/anon key로 이 함수를 호출할 뿐, Gemini 키를 전혀 몰라도 됩니다.

## 1. Gemini 키 발급 (무료)

1. https://aistudio.google.com/apikey 접속 (Google 계정으로 로그인)
2. "Create API key" 클릭
3. 발급된 키를 복사해두기 (2단계에서 사용)

## 2. Supabase Edge Function 배포

1. Supabase 프로젝트가 없다면 https://supabase.com 에서 무료로 생성
2. 대시보드 → **Edge Functions** → 새 함수 생성, 이름은 정확히 **`gemini-proxy`**
3. `supabase/functions/gemini-proxy/index.ts` 내용을 그대로 붙여넣고 배포
   - CLI가 있다면: `supabase functions deploy gemini-proxy`
   - 없다면 대시보드의 온라인 에디터에 붙여넣기만 해도 됨
4. 함수의 **Secrets**(또는 Project Settings → Edge Functions → Secrets)에 1단계에서 받은 키를 등록:
   - 이름: `GEMINI_API_KEY`
   - 값: 발급받은 Gemini 키
5. (선택) 모델을 바꾸고 싶으면 같은 방식으로 `GEMINI_MODEL` 시크릿 추가 (기본값 `gemini-3.6-flash`)

## 3. 앱에 연결

Gemini 전용 환경변수는 없습니다 — Supabase 연동에 쓰는 값과 동일합니다. `.env.example`을 `.env`로 복사한 뒤:

```bash
EXPO_PUBLIC_SUPABASE_URL=여기에_프로젝트_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=여기에_publishable_key
```

앱을 재시작하면 `src/lib/gemini.ts`의 `isGeminiConfigured`가 Supabase 설정 여부만 보고 자동으로 `true`가 되어 Conversation 단계가 실시간 모드로 전환됩니다. 함수를 아직 안 만들었거나 호출이 실패하면 자동으로 스크립트 대화로 돌아갑니다 — 코드 변경이 필요 없습니다.

## 4. 동작 방식

- 클라이언트는 `{prompt: "..."}` 만 함수에 보내고 `{text: "..."}`만 받습니다. Gemini API 형식(contents/generationConfig 등)은 전부 함수 안에 있습니다.
- `generateAiTurn()`이 상황(situation)과 지금까지의 대화 기록으로 만든 프롬프트를 보내 AI의 다음 대사 한두 문장을 받아옵니다. spec 10 원칙대로, 목표 단어를 "반드시 사용하라"고 지시하지 않고 참고 정보로만 넘깁니다. AI는 학습자가 아니라 **상대 역할**(식당 직원, 낯선 행인 등)을 연기하도록 프롬프트에 명시돼 있습니다 — 안 그러면 상황 설명 문장의 "you"를 AI 자신으로 착각해 반대 역할을 연기하는 문제가 있었습니다.
- 대화가 끝나면 `analyzeConversationWithGemini()`가 전체 transcript를 넘겨 JSON 형식으로 단어 사용 여부 + 4개 말하기 지표 + 짧은 피드백을 받아옵니다.
- 두 함수 모두 실패(함수 미배포, 네트워크 오류, 요청 제한, 잘못된 JSON 등)하면 자동으로 `src/lib/conversationAnalysis.ts`의 로컬 키워드 분석 + 스크립트 대화로 폴백합니다.
- Gemini 모델 자체가 답변 전에 내부 "thinking" 토큰을 쓰는 버전이라, `thinkingConfig: {thinkingBudget: 0}`을 꺼두지 않으면 응답 길이 제한을 그 생각하는 데 다 써버려 실제 답변이 잘립니다 (함수 코드에 이미 반영됨).

## 5. 참고

- 이 프로젝트는 Google/Supabase 계정을 대신 만들어줄 수 없습니다 — 1, 2단계는 직접 진행해야 합니다.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`는 브라우저에 노출돼도 안전하도록 설계된 값입니다(Supabase의 "publishable key"). 반면 `GEMINI_API_KEY`는 Edge Function의 서버 시크릿으로만 존재하고 클라이언트에는 전혀 내려가지 않습니다.
- 그래도 이 함수는 별도 인증 없이 누구나 호출할 수 있게 배포됩니다(개인 프로젝트 규모 기준 단순화) — Gemini 쪽이 선불 요금제라면 최악의 경우 피해가 충전한 금액으로 제한됩니다. 더 엄격하게 막고 싶다면 함수에 별도 검증 로직을 추가하세요.
