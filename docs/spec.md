# English Learning App — Codex Implementation Specification

## 1. 목적

이 문서는 Codex가 영어학습 앱을 구현할 때 사용하는 **제품/학습 시스템의 기준 명세(Source of Truth)**다.

핵심 목표:

> 배운 단어를 다양한 상황에서 듣고 이해한 뒤, 필요한 순간 자연스럽게 말할 수 있도록 한다.

학습은 다음 하나의 순환으로 동작한다.

**Learn → Hear → Understand → Recall → Express → Converse → Analyze → Review → Transfer → Automate**

---

## 2. 핵심 제품 원칙

### 2.1 단어·듣기·말하기를 분리하지 않는다

잘못된 구조:

```text
단어 학습 → 듣기 학습 → 회화 학습
```

권장 구조:

```text
단어
 ↓
핵심 표현
 ↓
다양한 상황에서 듣기
 ↓
의미/뉘앙스 이해
 ↓
따라 말하기
 ↓
표현 변형
 ↓
상황 회화
 ↓
사용 분석
 ↓
취약점 보강
 ↓
새로운 상황에서 재사용
 ↓
재평가
```

듣기는 말하기를 위한 입력이고, 말하기는 듣기를 통해 익힌 표현을 실제로 꺼내 쓰는 출력이다.

### 2.2 단어를 '암기 완료'로 판단하지 않는다

단어를 보면 뜻을 아는 것과 실제 대화에서 사용하는 것은 별개의 능력이다.

따라서 단어별로 다음 능력을 독립적으로 측정한다.

- Recognition
- Listening
- Context Understanding
- Recall
- Expression
- Conversation Usage
- Context Transfer
- Automaticity
- Pronunciation

---

## 3. 단어 숙련 상태

각 학습자의 단어 상태는 다음 단계로 관리한다.

```text
EXPOSURE
  ↓
RECOGNITION
  ↓
CONTEXTUAL
  ↓
LISTENING_READY
  ↓
RECALL_READY
  ↓
EXPRESSIVE
  ↓
CONVERSATIONAL
  ↓
TRANSFERABLE
  ↓
AUTOMATIC
  ↓
MASTERED
```

`MASTERED`는 단어 테스트만 통과해서는 부여하지 않는다.

최소한 여러 문맥에서 듣고, 회상하고, 표현하고, 실제 대화에서 사용하고, 시간이 지난 뒤에도 유지되는지를 확인해야 한다.

---

## 4. Passive / Active / Automatic Vocabulary

대시보드에서 다음을 구분한다.

### Passive Vocabulary

보고 듣고 의미를 이해할 수 있는 단어.

### Active Vocabulary

필요한 순간 기억에서 꺼내 말할 수 있는 단어.

### Automatic Vocabulary

생각하는 시간이 거의 없이 자연스럽게 사용할 수 있는 단어.

예:

```text
Passive Vocabulary       1,250
Active Vocabulary          680
Automatic Vocabulary       320
```

학습자에게 "1,250단어를 외웠다"고만 표시하지 않는다.

---

## 5. Vocabulary-to-Speech Gap

핵심 진단 지표:

> 알고 있는 것에 비해 실제로 말할 수 있는 정도가 얼마나 부족한가?

예:

```text
Recognition       88
Listening         82
Recall            69
Expression        65
Conversation      61
Automaticity      42
```

초기 계산 정책:

```text
Vocabulary-to-Speech Gap
= average(Recognition, Listening)
  - average(Conversation Usage, Automaticity)
```

정확한 공식은 향후 데이터에 따라 조정 가능하도록 설정값으로 관리한다.

Gap이 크면 단어 암기를 늘리는 대신 표현·회화·상황 전이 비중을 높인다.

---

## 6. Phrase / Chunk 중심 학습

단어 하나만 가르치지 않는다.

예:

```text
Word: available

Phrases:
- Is this available?
- Is anything available?
- What time is available?
- Are you available tomorrow?
```

학습 progression:

**Word → Phrase → Variation → Spontaneous Usage**

표현 단위도 별도 성취 데이터를 갖도록 설계한다.

---

## 7. 다양한 상황에서 듣기

같은 단어를 하나의 예문에서만 듣게 하지 않는다.

예: `recommend`

### Restaurant

> What do you recommend?

### Travel

> Can you recommend a good hotel?

### Movie

> Would you recommend this movie?

### Shopping

> Can you recommend something for a gift?

### Casual Conversation

> What would you recommend?

목표는 `recommend = 추천하다`를 암기하는 것이 아니라, 추천을 요청하거나 추천할 때 `recommend`가 자연스럽게 떠오르게 하는 것이다.

---

## 8. 듣기 난이도

같은 표현을 단계적으로 현실화한다.

```text
1. Clear pronunciation
2. Short sentence
3. Natural sentence
4. Connected speech
5. Full dialogue
6. Different speakers
7. Different speeds
8. New related contexts
```

예:

```text
What do you recommend?
        ↓
자연스러운 속도
        ↓
연결 발음
        ↓
대화 속 표현
```

듣기 성취도는 단순 정답률뿐 아니라 실제 발화에서 목표 단어를 인식하는 능력을 반영한다.

---

## 9. Listening → Speaking 연결

듣기와 말하기 사이에 별도의 단절이 없어야 한다.

기본 활동 흐름:

```text
Listen
 ↓
Understand
 ↓
Listen Again
 ↓
Shadow / Repeat
 ↓
Modify
 ↓
Create Own Sentence
 ↓
Roleplay
```

예:

### Listen

> What do you recommend?

### Repeat

> What do you recommend?

### Modify

> What do you recommend for dinner?

### Roleplay

AI:

> I'm visiting Seoul for the first time. Any recommendations?

학습자:

> I recommend visiting Gyeongbokgung.

이 흐름은 하나의 연속된 학습 경험으로 구현한다.

---

## 10. 자연스러운 회화에서 목표 단어 사용 유도

AI가 "이 단어를 반드시 사용하세요"라고 강요해서는 안 된다.

대신 해당 단어가 자연스럽게 필요한 상황을 만든다.

예:

Target words:

- reservation
- available
- recommend
- crowded
- convenient

상황:

> You are calling a restaurant to book a table.

AI가 자연스럽게 질문하고 학습자가 대화하면서 `reservation`, `available` 등을 사용할 기회를 갖게 한다.

회화 종료 후:

> You used "book a table" naturally. You could also use "reservation", which you recently learned.

처럼 피드백한다.

---

## 11. 회화 분석

회화 종료 후 AI는 다음을 분석한다.

### Vocabulary

- 목표 단어를 사용했는가
- 사용했지만 의미가 틀렸는가
- 더 자연스러운 대체 표현이 있는가
- 알고 있는 단어를 사용하지 못했는가
- 새로운 상황에서 재사용했는가

### Speaking

- fluency
- grammar
- pronunciation
- vocabulary
- naturalness
- response appropriateness

### Context Transfer

원래 학습 상황과 다른 상황에서도 사용할 수 있었는지 평가한다.

예:

```text
recommend
Restaurant       92
Travel           81
Hotel            74
Movie            63
Shopping         58

Context Transfer = 74
```

---

## 12. 약점 진단

### Case A — 인식은 높고 회상이 낮음

```text
Recognition 90
Listening   85
Recall      50
```

진단:

> 단어는 이해하지만 필요한 순간 떠올리지 못함.

다음 활동:

- retrieval practice
- 상황 cue
- 문장 생성

### Case B — 인식은 높고 듣기가 낮음

```text
Recognition 90
Listening   45
```

진단:

> 글로는 알지만 실제 영어 발화에서 알아듣지 못함.

다음 활동:

- 연결 발음
- 다양한 화자
- 속도 변화
- 문맥 듣기

### Case C — 듣기/회상은 높고 회화 사용이 낮음

```text
Recognition 90
Listening   85
Recall      80
Conversation 45
```

진단:

> 알고 있지만 실제 대화에서 자연스럽게 꺼내지 못함.

다음 활동:

- roleplay
- guided conversation
- context transfer

---

## 13. 적응형 학습

학습자의 현재 병목을 찾아 다음 활동을 결정한다.

초기 의사코드:

```text
for each learner_vocabulary_item:

    if recognition_score < threshold:
        schedule vocabulary exposure

    else if listening_score < threshold:
        schedule contextual listening

    else if recall_score < threshold:
        schedule retrieval practice

    else if expression_score < threshold:
        schedule sentence generation

    else if conversation_usage_score < threshold:
        schedule roleplay

    else if context_transfer_score < threshold:
        schedule new context

    else if automaticity_score < threshold:
        schedule delayed free conversation

    else:
        increase review interval
```

단순히 가장 낮은 숫자만 따라가지 말고, 현재 학습 목표와 최근 실패 이력을 함께 고려한다.

---

## 14. 복습

복습은 같은 문제를 반복하는 방식이 아니다.

예:

```text
Day 1 — Restaurant
What do you recommend?

Day 2 — Travel
Can you recommend a good place to visit?

Day 4 — Movie
Would you recommend this movie?

Day 7 — Free Conversation
What would you recommend to someone visiting Korea?
```

목표는 **문제의 정답 기억**이 아니라 **새로운 문맥에서의 회상**이다.

---

## 15. 한 단어의 완료 조건

다음 능력을 종합한다.

```text
[ ] 의미를 안다
[ ] 다양한 발화를 알아듣는다
[ ] 여러 문맥에서 의미를 이해한다
[ ] 필요한 순간 단어가 떠오른다
[ ] 문장을 만들 수 있다
[ ] 실제 대화에서 사용한다
[ ] 다른 상황에서도 사용한다
[ ] 시간이 지난 후에도 유지한다
[ ] 자연스럽게 사용할 수 있다
```

모든 조건을 동일한 가중치로 볼 필요는 없으며, 학습 목적에 따라 가중치를 설정할 수 있다.

---

## 16. 학습 일정 예시

### Day 1

```text
Learn
→ Listen
→ Shadow
→ Express
→ Conversation
→ Analyze
```

### Day 2

```text
Weak vocabulary review
→ New sentences
→ Different context conversation
```

### Day 4

```text
Spaced recall
→ Context transfer
→ Conversation
```

### Day 7

```text
Retention check
→ Free conversation
```

### Day 14+

```text
Automaticity check
→ Unpredictable conversation
```

---

## 17. 10단계 커리큘럼

모든 레벨에 동일한 학습 엔진을 적용한다.

### Level 1 — English Foundations

- alphabet / sounds
- basic words
- numbers
- time / date
- basic sentences
- introductions

### Level 2 — Survival English

- airport
- hotel
- restaurant
- cafe
- transportation
- shopping
- directions

### Level 3 — Basic Conversation

- family
- job
- hobbies
- preferences
- daily routine
- weather
- appointments

### Level 4 — Everyday Life

- friends
- invitations
- requests
- apologies
- feelings
- weekends
- personal experiences

### Level 5 — Social Conversation

- small talk
- interests
- culture
- movies
- music
- food
- travel experiences
- maintaining conversation

### Level 6 — Real-World Situations

- complaints
- cancellations
- refunds
- lost items
- delays
- customer service
- hospital
- bank
- public services

### Level 7 — Professional English

- meetings
- presentations
- phone calls
- email
- reporting
- scheduling
- negotiation
- customer communication

### Level 8 — Advanced Discussion

- technology
- education
- economy
- environment
- society
- AI
- culture
- future

### Level 9 — Natural English

- phrasal verbs
- collocations
- idioms
- nuance
- politeness
- indirect language
- humor
- cultural context

### Level 10 — Real-World Fluency

- unpredictable questions
- topic switching
- spontaneous conversation
- fast speech
- multiple accents
- abstract discussion
- humor
- implicit meaning

레벨이 올라갈수록 단어 수만 증가시키지 않는다.

**문맥 다양성, 듣기 난이도, 표현 자유도, 대화 예측 불가능성**을 함께 높인다.

---

## 18. Lesson 기본 구조

모든 Lesson은 다음 데이터 구조를 기본으로 한다.

```text
Target Vocabulary
    ↓
Key Phrases
    ↓
Context
    ↓
Listening Exposure
    ↓
Comprehension
    ↓
Shadowing
    ↓
Guided Expression
    ↓
Sentence Variation
    ↓
AI Conversation
    ↓
Performance Analysis
    ↓
Weakness Extraction
    ↓
Context Transfer
    ↓
Delayed Review
```

UX에서는 이를 13개의 화면으로 강제하지 않는다. 자연스럽게 이어지는 하나의 학습 세션으로 구현한다.

---

## 19. 실력 대시보드

학습자는 하나의 종합 점수만 보지 않는다.

```text
MY ENGLISH

Overall              72

Vocabulary           88
Listening            82
Recall               69
Expression           65
Conversation          61
Context Transfer     54
Automaticity         42
```

추가:

```text
Passive Vocabulary    1,250
Active Vocabulary       680
Automatic Vocabulary    320

Vocabulary-to-Speech Gap
24 points
```

대시보드는 점수보다 **다음에 무엇을 연습해야 하는지**를 알려주는 것이 중요하다.

예:

> 단어를 이해하는 능력에 비해 실제 대화에서 사용하는 능력이 낮습니다. 새로운 단어 암기보다 배운 표현을 말하는 연습을 추천합니다.

---

## 20. 핵심 데이터 모델

### User

```text
id
level
goals
daily_goal_minutes
created_at
```

### VocabularyItem

```text
id
word
part_of_speech
definition
pronunciation
difficulty
```

### Phrase

```text
id
vocabulary_item_id
text
meaning
context_id
audio_id
```

### Context

```text
id
category
level
description
```

### LearnerVocabulary

```text
user_id
vocabulary_item_id
recognition_score
listening_score
context_understanding_score
recall_score
expression_score
conversation_usage_score
context_transfer_score
automaticity_score
pronunciation_score
mastery_state
review_count
failure_count
last_reviewed_at
next_review_at
```

### VocabularyContextPerformance

```text
user_id
vocabulary_item_id
context_id
score
successful_uses
failed_uses
last_used_at
```

### ConversationSession

```text
id
user_id
context_id
started_at
ended_at
transcript
overall_score
```

### ConversationVocabularyUsage

```text
conversation_id
vocabulary_item_id
usage_type
correctness
naturalness
confidence
```

---

## 21. MVP

### 반드시 구현

1. User / level
2. Vocabulary database
3. Phrase / chunk database
4. Context database
5. Vocabulary practice
6. Contextual listening
7. Speech recording
8. AI conversation
9. Conversation transcript
10. Vocabulary usage analysis
11. Learner vocabulary state
12. Weakness-based review
13. Progress dashboard
14. Basic spaced review

### 후순위

- social
- leaderboard
- advanced gamification
- marketplace
- community
- instructor features
- advanced pronunciation visualization

MVP의 성공 여부는 다음 Loop가 실제로 작동하는지로 판단한다.

> **Learn → Hear → Speak → Analyze → Review → Reuse**

---

## 22. Codex 구현 지침

1. 이 문서를 제품 동작의 기준으로 취급한다.
2. 콘텐츠 데이터와 학습자 상태 데이터를 분리한다.
3. 단어 숙련도를 boolean으로 구현하지 않는다.
4. 듣기와 말하기가 서로 학습 데이터를 공유하도록 설계한다.
5. 모든 의미 있는 회화 세션은 학습자 단어 상태를 업데이트해야 한다.
6. 취약 단어는 이후 듣기·표현·회화 콘텐츠 생성의 입력이 되어야 한다.
7. 콘텐츠를 코드에 하드코딩하지 말고 데이터 구조로 확장 가능하게 만든다.
8. 레벨, 상황, 단어, 표현, 오디오를 추가해도 핵심 로직을 수정하지 않아도 되도록 설계한다.
9. 학습 이력을 보존하여 과거 성과와 현재 상태를 재계산할 수 있게 한다.
10. 임계값과 점수 계산식은 가능한 한 설정 가능한 정책으로 분리한다.
11. AI가 목표 단어를 억지로 사용시키기보다 자연스러운 상황을 생성하도록 한다.
12. 동일한 단어가 여러 상황에서 사용되는지를 별도로 추적한다.
13. 듣기 성취도와 말하기 성취도를 하나의 점수로 합치지 않는다.
14. 학습자의 현재 병목에 따라 다음 활동을 동적으로 결정한다.

---

## 23. Acceptance Criteria

### Vocabulary

- [ ] 단어별 학습자 상태가 저장된다.
- [ ] Recognition과 Conversation Usage가 독립적으로 측정된다.
- [ ] Phrase/Chunk가 단어와 연결된다.
- [ ] 단어가 여러 mastery state를 거친다.

### Listening

- [ ] 동일 단어가 여러 문맥의 오디오에 등장한다.
- [ ] 다양한 화자/속도를 지원할 수 있다.
- [ ] 듣기 성과가 learner state에 반영된다.

### Speaking

- [ ] 듣기 후 바로 shadowing/표현으로 이어진다.
- [ ] 문장 변형 및 자유 표현이 가능하다.
- [ ] AI conversation 결과가 learner state를 업데이트한다.

### Transfer

- [ ] 같은 단어를 여러 context에서 평가한다.
- [ ] 한 context의 성공만으로 mastery 처리하지 않는다.
- [ ] Context Transfer score가 존재한다.

### Review

- [ ] 취약 단어가 자동으로 복습 큐에 들어간다.
- [ ] 복습은 새로운 문맥에서도 제공된다.
- [ ] spaced review가 지원된다.

### Assessment

- [ ] Vocabulary / Listening / Recall / Expression / Conversation / Transfer / Automaticity를 구분해 표시한다.
- [ ] Vocabulary-to-Speech Gap을 계산한다.
- [ ] 결과에 따라 다음 학습 비중이 달라진다.

---

## 24. 최종 제품 정의

이 제품은 단순한 단어장이나 AI 챗봇이 아니다.

**단어를 문맥 속에서 학습하고, 다양한 화자의 영어를 듣고, 들은 표현을 말하고, 실제 대화에서 사용한 결과를 분석하여, 부족한 단어와 표현을 새로운 상황에서 다시 듣고 말하게 하는 적응형 영어학습 시스템**이다.

최종 성공 기준:

> **학습자가 배운 단어를 다양한 상황에서 이해하고, 필요한 순간 자연스럽게 표현할 수 있는가?**

