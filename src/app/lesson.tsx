import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SkillBar } from '@/components/skill-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contextById } from '@/content/contexts';
import { dialogueForWord } from '@/content/dialogues';
import { phrases as allPhrases, phrasesForWord, vocabulary, vocabularyById } from '@/content/vocabulary';
import { analyzeConversation } from '@/lib/conversationAnalysis';
import {
  analyzeConversationWithGemini,
  generateAiTurn,
  isGeminiConfigured,
  type ConversationTurn,
  type GeminiConversationAnalysis,
} from '@/lib/gemini';
import { isSttSupported, isTtsSupported, speak, startListening } from '@/lib/speech';
import { CURRENT_USER_ID } from '@/lib/storage';
import { useLearnerStore } from '@/store/learnerStore';
import { useTheme } from '@/hooks/use-theme';

type Step = 'learn' | 'listen' | 'shadow' | 'express' | 'conversation' | 'analysis';

const STEP_ORDER: Step[] = ['learn', 'listen', 'shadow', 'express', 'conversation', 'analysis'];
const STEP_LABEL: Record<Step, string> = {
  learn: 'Learn',
  listen: 'Listen',
  shadow: 'Shadow',
  express: 'Express',
  conversation: 'Conversation',
  analysis: 'Analysis',
};

// How many exchanges a live Gemini roleplay runs for. Scripted dialogues use
// their own turns.length instead (see totalTurns below).
const DYNAMIC_MAX_TURNS = 5;

interface FinalAnalysis {
  wordUsage: { vocabularyItemId: string; used: boolean }[];
  alternativeSuggestions: { matchedPhrase: string; suggestVocabularyId: string }[];
}

export default function Lesson() {
  const params = useLocalSearchParams<{ wordId?: string }>();
  const wordId = params.wordId ?? 'word-recommend';
  const word = vocabularyById(wordId) ?? vocabulary[0];
  // Unshuffled on first render (server-rendered static export and initial
  // client hydration must match exactly), then shuffled client-side after
  // mount — shuffling during render would use a different Math.random()
  // result on the server than on the client and break hydration.
  const [phrases, setPhrases] = useState(() => phrasesForWord(word.id));
  useEffect(() => {
    setPhrases(shuffle(phrasesForWord(word.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id]);
  const dialogue = useMemo(() => dialogueForWord(word.id, phrases[0]?.contextId), [word.id, phrases]);
  const targetWords = useMemo(
    () => dialogue.targetVocabularyIds.map((id) => vocabularyById(id)?.word ?? id),
    [dialogue],
  );

  const router = useRouter();
  const theme = useTheme();
  const bumpTowards = useLearnerStore((s) => s.bumpTowards);
  const recordConversationSession = useLearnerStore((s) => s.recordConversationSession);

  const [step, setStep] = useState<Step>('learn');

  // --- Listen step state ---
  const [listenIndex, setListenIndex] = useState(0);
  const [listenCorrect, setListenCorrect] = useState(0);
  const [listenAnswered, setListenAnswered] = useState<string | null>(null);
  // A fixed 3-way "which meaning did you hear?" choice — the correct
  // translation plus two unrelated distractors — instead of picking the
  // right category out of every category in the content set. Categories
  // like "casual" legitimately overlap with "hotel"/"travel"/etc., so
  // asking learners to pick one exact category doesn't have a clean right
  // answer and only gets more confusing as more contexts are added.
  const listenChoices = useMemo(() => {
    const current = phrases[listenIndex];
    if (!current) return [];
    const distractors = uniqueByMeaning(allPhrases.filter((p) => p.vocabularyItemId !== word.id && p.meaning !== current.meaning)).slice(0, 2);
    return shuffle([
      { id: 'correct', meaning: current.meaning, correct: true },
      ...distractors.map((d, i) => ({ id: `distractor-${i}`, meaning: d.meaning, correct: false })),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenIndex, phrases, word.id]);

  // --- Shadow step state ---
  const shadowPhrases = phrases.slice(0, 2);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [shadowTranscript, setShadowTranscript] = useState('');
  const [shadowListening, setShadowListening] = useState(false);
  // Confidence comes from the browser/OS speech recognizer (0-1) and is only
  // meaningful right after a recording — if the learner hand-edits the
  // transcript afterwards, usedVoice flips off so we score on word match
  // alone instead of stale confidence.
  const [shadowConfidence, setShadowConfidence] = useState(0);
  const [shadowUsedVoice, setShadowUsedVoice] = useState(false);

  // --- Express step state ---
  const [expressText, setExpressText] = useState('');
  const [expressSubmitted, setExpressSubmitted] = useState(false);

  // --- Conversation step state ---
  // aiTurns holds the AI's line for every turn reached so far. In scripted
  // mode it's filled upfront from dialogue.turns; in live Gemini mode it
  // grows one line at a time. Rendering always just reads aiTurns[i], so the
  // two modes share one code path.
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentReply, setCurrentReply] = useState('');
  const [learnerTurns, setLearnerTurns] = useState<string[]>([]);
  const [conversationListening, setConversationListening] = useState(false);
  const [aiTurns, setAiTurns] = useState<string[]>([]);
  const [aiTurnLoading, setAiTurnLoading] = useState(false);
  const [geminiFailed, setGeminiFailed] = useState(false);
  const [geminiNotice, setGeminiNotice] = useState<string | null>(null);

  const useDynamicConversation = isGeminiConfigured && !geminiFailed;
  const totalTurns = useDynamicConversation ? DYNAMIC_MAX_TURNS : dialogue.turns.length;

  // --- Analysis result (computed once, when entering analysis step) ---
  const [analysisDone, setAnalysisDone] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiConversationAnalysis | null>(null);

  async function goToStep(next: Step) {
    setStep(next);
  }

  async function finishLearn() {
    await bumpTowards(word.id, { recognition: 75, contextUnderstanding: 55 }, 0.6);
    goToStep('listen');
  }

  async function answerListen(choiceId: string, correct: boolean) {
    if (listenAnswered) return;
    setListenAnswered(choiceId);
    if (correct) setListenCorrect((c) => c + 1);
  }

  async function nextListen() {
    if (listenIndex + 1 < phrases.length) {
      setListenIndex((i) => i + 1);
      setListenAnswered(null);
      return;
    }
    const accuracy = Math.round((listenCorrect / phrases.length) * 100);
    await bumpTowards(word.id, { listening: accuracy, contextUnderstanding: accuracy }, 0.6);
    goToStep('shadow');
  }

  async function recordShadow() {
    setShadowListening(true);
    setShadowTranscript('');
    setShadowConfidence(0);
    const result = await startListening();
    setShadowTranscript(result.transcript);
    setShadowConfidence(result.confidence);
    setShadowUsedVoice(true);
    setShadowListening(false);
  }

  async function nextShadow() {
    const target = shadowPhrases[shadowIndex].text;
    const recallScore = wordOverlap(shadowTranscript, target);
    const pronunciationScore = estimatePronunciationScore(recallScore, shadowConfidence, shadowUsedVoice);
    await bumpTowards(word.id, { recall: recallScore, pronunciation: pronunciationScore }, 0.5);
    if (shadowIndex + 1 < shadowPhrases.length) {
      setShadowIndex((i) => i + 1);
      setShadowTranscript('');
      setShadowConfidence(0);
      setShadowUsedVoice(false);
      return;
    }
    goToStep('express');
  }

  async function submitExpress() {
    setExpressSubmitted(true);
    const usesWord = new RegExp(`\\b${word.word}(s|ed|ing)?\\b`, 'i').test(expressText);
    const wordCount = expressText.trim().split(/\s+/).filter(Boolean).length;
    const target = usesWord && wordCount >= 3 ? 85 : usesWord ? 60 : 25;
    await bumpTowards(word.id, { expression: target }, 0.5);
  }

  async function beginConversation() {
    setTurnIndex(0);
    setLearnerTurns([]);
    setAiTurns([]);
    setGeminiAnalysis(null);
    setGeminiNotice(null);

    if (isGeminiConfigured && !geminiFailed) {
      setAiTurnLoading(true);
      try {
        const line = await generateAiTurn(dialogue.situation, targetWords, [], DYNAMIC_MAX_TURNS <= 1);
        setAiTurns([line]);
      } catch {
        setGeminiFailed(true);
        setGeminiNotice('실시간 AI 연결에 실패해 준비된 대화로 진행합니다.');
        setAiTurns(dialogue.turns.map((t) => t.aiText));
      }
      setAiTurnLoading(false);
    } else {
      setAiTurns(dialogue.turns.map((t) => t.aiText));
    }
  }

  function goToConversation() {
    setExpressSubmitted(false);
    setExpressText('');
    beginConversation();
    goToStep('conversation');
  }

  async function submitConversationTurn() {
    const reply = currentReply.trim();
    const nextTurns = [...learnerTurns, reply];
    setLearnerTurns(nextTurns);
    setCurrentReply('');

    const nextIndex = turnIndex + 1;
    if (nextIndex < totalTurns) {
      if (useDynamicConversation) {
        setAiTurnLoading(true);
        try {
          const history = buildHistory(aiTurns, nextTurns);
          const line = await generateAiTurn(dialogue.situation, targetWords, history, nextIndex + 1 >= totalTurns);
          setAiTurns((prev) => [...prev, line]);
          setAiTurnLoading(false);
          setTurnIndex(nextIndex);
        } catch {
          setAiTurnLoading(false);
          setGeminiFailed(true);
          setGeminiNotice('실시간 AI 연결에 문제가 생겨 준비된 대화로 다시 시작합니다.');
          setAiTurns(dialogue.turns.map((t) => t.aiText));
          setTurnIndex(0);
          setLearnerTurns([]);
        }
      } else {
        setTurnIndex(nextIndex);
      }
      return;
    }

    await finishConversation(nextTurns);
  }

  async function finishConversation(nextTurns: string[]) {
    const transcript = aiTurns
      .map((text, i) => [
        { speaker: 'ai' as const, text, atMs: i * 2 },
        { speaker: 'learner' as const, text: nextTurns[i] ?? '', atMs: i * 2 + 1 },
      ])
      .flat();

    await recordConversationSession({
      id: `conv-${Date.now()}`,
      userId: CURRENT_USER_ID,
      contextId: dialogue.contextId,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      transcript,
      overallScore: null,
    });

    let wordUsage: { vocabularyItemId: string; used: boolean }[];
    let alternativeSuggestions: { matchedPhrase: string; suggestVocabularyId: string }[] = [];

    if (useDynamicConversation) {
      try {
        const history = buildHistory(aiTurns, nextTurns);
        const result = await analyzeConversationWithGemini(history, targetWords);
        wordUsage = dialogue.targetVocabularyIds.map((id) => {
          const w = vocabularyById(id)?.word.toLowerCase();
          const match = result.wordUsage.find((u) => u.word.toLowerCase() === w);
          return { vocabularyItemId: id, used: match?.used ?? false };
        });
        setGeminiAnalysis(result);
      } catch {
        const local = analyzeConversation(nextTurns, dialogue, vocabulary);
        wordUsage = local.wordUsage;
        alternativeSuggestions = local.alternativeSuggestions;
      }
    } else {
      const local = analyzeConversation(nextTurns, dialogue, vocabulary);
      wordUsage = local.wordUsage;
      alternativeSuggestions = local.alternativeSuggestions;
    }

    for (const usage of wordUsage) {
      const suggested = alternativeSuggestions.some((s) => s.suggestVocabularyId === usage.vocabularyItemId);
      const target = usage.used ? 82 : suggested ? 55 : 30;
      await bumpTowards(usage.vocabularyItemId, { conversationUsage: target, contextTransfer: usage.used ? 65 : 40 }, 0.5);
    }

    setFinalAnalysis({ wordUsage, alternativeSuggestions });
    setAnalysisDone(true);
    goToStep('analysis');
  }

  async function startConversationVoice() {
    setConversationListening(true);
    const result = await startListening();
    setCurrentReply((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript));
    setConversationListening(false);
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {STEP_LABEL[step]} ({stepIndex + 1}/{STEP_ORDER.length})
            </ThemedText>
            <ThemedText type="linkPrimary" onPress={() => router.replace('/')}>
              나가기
            </ThemedText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>

          {step === 'learn' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={{ fontSize: 36 }}>
                {word.word}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: 4 }}>
                {word.partOfSpeech} · {word.pronunciation}
              </ThemedText>
              <ThemedText style={{ marginBottom: Spacing.three }}>{word.definition}</ThemedText>
              <ThemedText type="smallBold" style={{ marginBottom: 8 }}>
                다양한 상황에서:
              </ThemedText>
              {phrases.map((p) => (
                <ThemedText key={p.id} themeColor="textSecondary" style={{ marginBottom: 4 }}>
                  • {p.text} — {contextById(p.contextId)?.category}
                </ThemedText>
              ))}
              <View style={{ height: Spacing.three }} />
              <PrimaryButton label="계속하기" onPress={finishLearn} />
            </View>
          )}

          {step === 'listen' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.two }}>
                어느 상황일까요?
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                아래 버튼을 눌러 문장을 듣고, 무슨 뜻인지 맞는 해석을 골라보세요.
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 문장 듣기' : '🔊 문장 듣기 (이 브라우저는 TTS 미지원)'}
                variant="secondary"
                onPress={() => speak(phrases[listenIndex].text)}
              />
              <View style={{ height: Spacing.three }} />
              {listenChoices.map((choice) => {
                const isAnswered = listenAnswered !== null;
                const isPicked = listenAnswered === choice.id;
                const variant: 'success' | 'danger' | 'secondary' = isAnswered && choice.correct ? 'success' : isPicked ? 'danger' : 'secondary';
                return (
                  <View key={choice.id} style={{ marginBottom: 8 }}>
                    <PrimaryButton
                      label={`${choice.meaning}${isAnswered && choice.correct ? '  정답' : isPicked ? '  오답' : ''}`}
                      variant={variant}
                      disabled={isAnswered}
                      onPress={() => answerListen(choice.id, choice.correct)}
                    />
                  </View>
                );
              })}
              {listenAnswered && (
                <>
                  <ThemedText style={{ marginVertical: Spacing.two }}>
                    정답 문장: "{phrases[listenIndex].text}" — {phrases[listenIndex].meaning}
                  </ThemedText>
                  <PrimaryButton label="다음" onPress={nextListen} />
                </>
              )}
            </View>
          )}

          {step === 'shadow' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.two }}>
                듣고 따라 말해보세요
              </ThemedText>
              <ThemedText style={{ marginBottom: Spacing.three }}>{shadowPhrases[shadowIndex].text}</ThemedText>
              <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(shadowPhrases[shadowIndex].text)} />
              <View style={{ height: 8 }} />
              {isSttSupported() && (
                <>
                  <PrimaryButton
                    label={shadowListening ? '🎙 듣는 중...' : '🎙 녹음해서 말하기'}
                    onPress={recordShadow}
                    disabled={shadowListening}
                  />
                  <View style={{ height: 8 }} />
                </>
              )}
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="말한(또는 입력할) 문장을 여기서 확인·수정하세요"
                placeholderTextColor={theme.textSecondary}
                value={shadowTranscript}
                onChangeText={(text) => {
                  setShadowTranscript(text);
                  setShadowUsedVoice(false);
                }}
              />
              {shadowUsedVoice && shadowTranscript && (
                <ThemedText
                  themeColor={
                    estimatePronunciationScore(wordOverlap(shadowTranscript, shadowPhrases[shadowIndex].text), shadowConfidence, true) >= 70
                      ? 'success'
                      : 'warning'
                  }
                  style={{ marginBottom: Spacing.two }}
                >
                  🎯 발음·정확도 추정: {estimatePronunciationScore(wordOverlap(shadowTranscript, shadowPhrases[shadowIndex].text), shadowConfidence, true)}%
                  (녹음 기반 참고용 점수예요)
                </ThemedText>
              )}
              <View style={{ height: Spacing.three }} />
              <PrimaryButton label="다음" onPress={nextShadow} disabled={!shadowTranscript} />
            </View>
          )}

          {step === 'express' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.two }}>
                새로운 상황에서 "{word.word}"를 사용해 문장을 만들어보세요
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                예: 친구에게 추천을 물어볼 때는 어떻게 말할까요?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="Write a sentence with the word..."
                placeholderTextColor={theme.textSecondary}
                value={expressText}
                onChangeText={setExpressText}
                multiline
              />
              {!expressSubmitted ? (
                <PrimaryButton label="제출" onPress={submitExpress} disabled={expressText.trim().length === 0} />
              ) : (
                <>
                  <ThemedText style={{ marginVertical: Spacing.two }}>좋아요! 계속 진행할게요.</ThemedText>
                  <PrimaryButton label="AI 대화로 이동" onPress={goToConversation} />
                </>
              )}
            </View>
          )}

          {step === 'conversation' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.headerRow}>
                <ThemedText type="subtitle" style={{ fontSize: 20 }}>
                  {dialogue.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {useDynamicConversation ? '🔮 실시간 AI' : '📜 준비된 대화'}
                </ThemedText>
              </View>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                {dialogue.situation}
              </ThemedText>
              {geminiNotice && (
                <ThemedText themeColor="warning" style={{ marginBottom: Spacing.two }}>
                  ⚠️ {geminiNotice}
                </ThemedText>
              )}

              {Array.from({ length: turnIndex + 1 }).map((_, i) => (
                <View key={i} style={{ marginBottom: Spacing.two }}>
                  <ThemedText type="smallBold">AI</ThemedText>
                  <ThemedText style={{ marginBottom: 4 }}>{aiTurns[i] ?? '...'}</ThemedText>
                  {i === turnIndex && aiTurns[i] && (
                    <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(aiTurns[i])} />
                  )}
                  {learnerTurns[i] ? (
                    <>
                      <ThemedText type="smallBold" style={{ marginTop: 4 }}>
                        You
                      </ThemedText>
                      <ThemedText themeColor="textSecondary">{learnerTurns[i]}</ThemedText>
                    </>
                  ) : null}
                </View>
              ))}

              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder={useDynamicConversation ? 'Type your reply...' : dialogue.turns[turnIndex]?.placeholder}
                placeholderTextColor={theme.textSecondary}
                value={currentReply}
                onChangeText={setCurrentReply}
                multiline
                editable={!aiTurnLoading}
              />
              {isSttSupported() && (
                <>
                  <PrimaryButton
                    label={conversationListening ? '🎙 듣는 중...' : '🎙 말로 답하기'}
                    variant="secondary"
                    onPress={startConversationVoice}
                    disabled={conversationListening || aiTurnLoading}
                  />
                  <View style={{ height: 8 }} />
                </>
              )}
              <PrimaryButton
                label={aiTurnLoading ? 'AI가 답변을 준비 중...' : '전송'}
                onPress={submitConversationTurn}
                disabled={currentReply.trim().length === 0 || aiTurnLoading || !aiTurns[turnIndex]}
              />
            </View>
          )}

          {step === 'analysis' && analysisDone && finalAnalysis && (
            <AnalysisSummary
              wordUsage={finalAnalysis.wordUsage}
              alternativeSuggestions={finalAnalysis.alternativeSuggestions}
              geminiAnalysis={geminiAnalysis}
              onDone={() => router.replace('/')}
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function AnalysisSummary({
  wordUsage,
  alternativeSuggestions,
  geminiAnalysis,
  onDone,
}: {
  wordUsage: { vocabularyItemId: string; used: boolean }[];
  alternativeSuggestions: { matchedPhrase: string; suggestVocabularyId: string }[];
  geminiAnalysis: GeminiConversationAnalysis | null;
  onDone: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.three }}>
        회화 분석 결과
      </ThemedText>

      {geminiAnalysis && (
        <View style={{ marginBottom: Spacing.three }}>
          <SkillBar label="Fluency" value={geminiAnalysis.fluency} />
          <SkillBar label="Grammar" value={geminiAnalysis.grammar} />
          <SkillBar label="Naturalness" value={geminiAnalysis.naturalness} />
          <SkillBar label="Appropriateness" value={geminiAnalysis.appropriateness} />
        </View>
      )}

      {wordUsage.map((u) => {
        const item = vocabularyById(u.vocabularyItemId);
        return (
          <ThemedText key={u.vocabularyItemId} style={{ marginBottom: 4 }}>
            {u.used ? '✅' : '⬜️'} {item?.word} {u.used ? '— 자연스럽게 사용했어요' : '— 이번엔 사용하지 않았어요'}
          </ThemedText>
        );
      })}

      {alternativeSuggestions.map((s, i) => {
        const item = vocabularyById(s.suggestVocabularyId);
        return (
          <ThemedText key={i} themeColor="textSecondary" style={{ marginTop: 8 }}>
            💡 "{s.matchedPhrase}"라고 잘 말했어요. 최근 배운 "{item?.word}"도 사용해볼 수 있어요.
          </ThemedText>
        );
      })}

      {geminiAnalysis?.feedback && (
        <ThemedText themeColor="textSecondary" style={{ marginTop: 8 }}>
          💬 {geminiAnalysis.feedback}
        </ThemedText>
      )}

      <View style={{ height: Spacing.four }} />
      <PrimaryButton label="대시보드로 돌아가기" onPress={onDone} />
    </View>
  );
}

function buildHistory(aiTurnsArr: string[], learnerTurnsArr: string[]): ConversationTurn[] {
  const history: ConversationTurn[] = [];
  const len = Math.max(aiTurnsArr.length, learnerTurnsArr.length);
  for (let i = 0; i < len; i++) {
    if (aiTurnsArr[i] !== undefined) history.push({ speaker: 'ai', text: aiTurnsArr[i] });
    if (learnerTurnsArr[i] !== undefined && learnerTurnsArr[i] !== '') {
      history.push({ speaker: 'learner', text: learnerTurnsArr[i] });
    }
  }
  return history;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueByMeaning<T extends { meaning: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.meaning)) return false;
    seen.add(item.meaning);
    return true;
  });
}

// Combines how many target words the recognizer actually heard (a proxy for
// pronunciation accuracy — mispronounced words are usually misheard as
// different words) with the recognizer's own confidence in what it heard.
// Manual text edits have no meaningful confidence, so they fall back to word
// match alone.
function estimatePronunciationScore(recallScore: number, confidence: number, usedVoice: boolean): number {
  if (!usedVoice) return recallScore;
  return Math.round(recallScore * 0.6 + confidence * 100 * 0.4);
}

function wordOverlap(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  const aWords = new Set(normalize(a));
  const bWords = normalize(b);
  if (bWords.length === 0) return 0;
  const matched = bWords.filter((w) => aWords.has(w)).length;
  return Math.round((matched / bWords.length) * 100);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.four },
  progressFill: { height: 6, borderRadius: 3 },
  card: { borderRadius: 16, padding: Spacing.four },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    marginBottom: Spacing.three,
    fontSize: 16,
  },
});
