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

## 현재 구현 범위 (MVP 1차)

- 단어 1개("recommend") + 관련 5개 단어를 하나의 레슨으로 묶은 전체 학습 루프
  Learn → Listen(다양한 문맥 듣기) → Shadow(따라 말하기) → Express(문장 만들기) → Conversation(AI 롤플레이) → Analysis
- 학습자별 9개 능력치 독립 추적 (Recognition/Listening/Recall/Expression/Conversation/Context Transfer/Automaticity/Pronunciation/Context Understanding)
- Vocabulary-to-Speech Gap, Passive/Active/Automatic 어휘 수 대시보드
- 약점 기반 복습 큐
- 음성 인식/합성은 **브라우저 내장 Web Speech API**로 무료 처리 (API 키 불필요)
- AI 대화는 사전 작성된 시나리오 스크립트 + 목표 단어 사용 여부 분석 방식 (실시간 LLM 호출 없이 동작)

콘텐츠(단어/문구/상황/대화 스크립트)는 `src/content/`에, 학습자 상태 저장은 `src/lib/storage.ts`(현재 로컬 저장, 추후 Supabase로 교체 가능한 구조)에 있습니다.

## 다음 단계

- Supabase 연동으로 로컬 저장 → 서버 저장 전환
- 레벨 1~10 커리큘럼 콘텐츠 확장
- 필요 시 Gemini 무료 API로 자유 대화 고도화
- 앱(iOS/Android) 빌드 전환
