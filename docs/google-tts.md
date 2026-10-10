# 자연스러운 TTS: Google Cloud Text-to-Speech 연동

브라우저 내장 TTS(Web Speech API)는 문장 전체에 속도/음높이 숫자 하나씩만 적용할 수 있어서, 아무리 조정해도 사람처럼 억양이 오르내리는 느낌을 낼 수 없습니다. Google Cloud TTS의 Neural2 음성은 실제 사람 목소리로 학습된 신경망 모델이라 훨씬 자연스럽습니다.

⚠️ Gemini API 키(aistudio.google.com)와는 **다른 키**가 필요합니다. Cloud TTS는 별도의 Google Cloud 프로젝트 + 결제 계정 등록이 필요해요 (무료 한도 안에서는 요금이 청구되지 않지만, 카드 등록 자체는 필요합니다).

## 1. 설정 절차

1. https://console.cloud.google.com 접속 → 새 프로젝트 생성
2. 결제(Billing) 계정 연결 (무료 한도 내 사용은 과금되지 않음)
3. "API 및 서비스" → "라이브러리"에서 **Cloud Text-to-Speech API** 검색 후 사용 설정
4. "API 및 서비스" → "사용자 인증 정보" → "API 키 만들기"로 키 발급
   - (권장) 키를 "Cloud Text-to-Speech API"에만 쓸 수 있도록 제한 설정
5. `.env.example`을 `.env`로 복사한 뒤:

```bash
EXPO_PUBLIC_GOOGLE_TTS_API_KEY=여기에_발급받은_키
EXPO_PUBLIC_GOOGLE_TTS_VOICE=en-US-Neural2-C
```

앱을 재시작하면 자동으로 적용됩니다 (`src/lib/googleTts.ts`의 `isGoogleTtsConfigured`).

## 2. 무료 한도

Neural2/WaveNet 음성 기준 매월 100만 자까지 무료입니다 (Google이 명시한 "Always Free" 한도로, 체험판이 아니라 계속 무료). 학습 앱에서 문장 하나가 보통 수십 자 정도이므로 개인 학습 용도로는 충분합니다. 초과 시에만 과금됩니다.

## 3. 다른 목소리로 바꾸기

`EXPO_PUBLIC_GOOGLE_TTS_VOICE`에 다른 음성 이름을 넣으면 됩니다. 예:

- `en-US-Neural2-C` (여성, 기본값)
- `en-US-Neural2-D` (남성)
- `en-US-Neural2-A`, `en-US-Neural2-F` 등

전체 목록: https://cloud.google.com/text-to-speech/docs/voices

## 4. 동작 방식 / 한계

- **웹에서만** 동작합니다 (지금은). 네이티브 앱(iOS/Android)에서 재생하려면 `expo-audio`(또는 `expo-av`) 연동이 추가로 필요합니다 — 현재는 네이티브에서는 자동으로 기존 기기 음성(`expo-speech`)으로 대체됩니다.
- 키가 없거나, 요청이 실패하거나(할당량 초과, 오프라인 등), 응답이 이상하면 **자동으로 기기 음성으로 대체**됩니다 — TTS가 앱을 멈추게 하지 않습니다.
- API 키가 `EXPO_PUBLIC_` 접두사로 클라이언트 번들에 그대로 노출됩니다. 실제 서비스로 배포한다면 키를 프로젝트/API 단위로 제한하고, 필요하면 서버 프록시를 두는 것을 고려하세요.
