import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contextById, contexts } from '@/content/contexts';
import { dialogueById } from '@/content/dialogues';
import { phrasesForWord, vocabulary, vocabularyById } from '@/content/vocabulary';
import { analyzeConversation } from '@/lib/conversationAnalysis';
import { isSttSupported, isTtsSupported, speak, startListening } from '@/lib/speech';
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

export default function Lesson() {
  const params = useLocalSearchParams<{ wordId?: string }>();
  const wordId = params.wordId ?? 'word-recommend';
  const word = vocabularyById(wordId) ?? vocabulary[0];
  const phrases = useMemo(() => shuffle(phrasesForWord(word.id)), [word.id]);
  const dialogue = dialogueById('dialogue-book-a-table')!;

  const router = useRouter();
  const theme = useTheme();
  const bumpTowards = useLearnerStore((s) => s.bumpTowards);
  const recordConversationSession = useLearnerStore((s) => s.recordConversationSession);

  const [step, setStep] = useState<Step>('learn');

  // --- Listen step state ---
  const [listenIndex, setListenIndex] = useState(0);
  const [listenCorrect, setListenCorrect] = useState(0);
  const [listenAnswered, setListenAnswered] = useState<string | null>(null);

  // --- Shadow step state ---
  const shadowPhrases = phrases.slice(0, 2);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [shadowTranscript, setShadowTranscript] = useState('');
  const [shadowListening, setShadowListening] = useState(false);

  // --- Express step state ---
  const [expressText, setExpressText] = useState('');
  const [expressSubmitted, setExpressSubmitted] = useState(false);

  // --- Conversation step state ---
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentReply, setCurrentReply] = useState('');
  const [learnerTurns, setLearnerTurns] = useState<string[]>([]);
  const [conversationListening, setConversationListening] = useState(false);

  // --- Analysis result (computed once, when entering analysis step) ---
  const [analysisDone, setAnalysisDone] = useState(false);

  async function goToStep(next: Step) {
    setStep(next);
  }

  async function finishLearn() {
    await bumpTowards(word.id, { recognition: 75, contextUnderstanding: 55 }, 0.6);
    goToStep('listen');
  }

  async function answerListen(contextId: string) {
    if (listenAnswered) return;
    setListenAnswered(contextId);
    const correct = contextId === phrases[listenIndex].contextId;
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
    const result = await startListening();
    setShadowTranscript(result.transcript);
    setShadowListening(false);
  }

  async function nextShadow() {
    const target = shadowPhrases[shadowIndex].text;
    const similarity = wordOverlap(shadowTranscript, target);
    await bumpTowards(word.id, { recall: similarity, pronunciation: similarity }, 0.5);
    if (shadowIndex + 1 < shadowPhrases.length) {
      setShadowIndex((i) => i + 1);
      setShadowTranscript('');
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

  function goToConversation() {
    setExpressSubmitted(false);
    setExpressText('');
    goToStep('conversation');
  }

  async function submitConversationTurn() {
    const reply = currentReply.trim();
    const nextTurns = [...learnerTurns, reply];
    setLearnerTurns(nextTurns);
    setCurrentReply('');

    if (turnIndex + 1 < dialogue.turns.length) {
      setTurnIndex((i) => i + 1);
      return;
    }

    // Conversation finished — analyze and update every target word independently.
    const analysis = analyzeConversation(nextTurns, dialogue, vocabulary);
    await recordConversationSession({
      id: `conv-${Date.now()}`,
      userId: 'local-user',
      contextId: dialogue.contextId,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      transcript: dialogue.turns.map((t, i) => [
        { speaker: 'ai' as const, text: t.aiText, atMs: i * 2 },
        { speaker: 'learner' as const, text: nextTurns[i] ?? '', atMs: i * 2 + 1 },
      ]).flat(),
      overallScore: null,
    });

    for (const usage of analysis.wordUsage) {
      const suggested = analysis.alternativeSuggestions.some((s) => s.suggestVocabularyId === usage.vocabularyItemId);
      const target = usage.used ? 82 : suggested ? 55 : 30;
      await bumpTowards(usage.vocabularyItemId, { conversationUsage: target, contextTransfer: usage.used ? 65 : 40 }, 0.5);
    }

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
              <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.three }}>
                어느 상황일까요?
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 문장 듣기' : '🔊 문장 듣기 (이 브라우저는 TTS 미지원)'}
                variant="secondary"
                onPress={() => speak(phrases[listenIndex].text)}
              />
              <View style={{ height: Spacing.three }} />
              {contexts.map((c) => {
                const isAnswered = listenAnswered !== null;
                const isThisCorrect = c.id === phrases[listenIndex].contextId;
                const isPicked = listenAnswered === c.id;
                return (
                  <View key={c.id} style={{ marginBottom: 8 }}>
                    <PrimaryButton
                      label={`${c.category}${isAnswered && isThisCorrect ? ' ✅' : isPicked ? ' ❌' : ''}`}
                      variant="secondary"
                      disabled={isAnswered}
                      onPress={() => answerListen(c.id)}
                    />
                  </View>
                );
              })}
              {listenAnswered && (
                <>
                  <ThemedText style={{ marginVertical: Spacing.two }}>
                    "{phrases[listenIndex].text}" — {phrases[listenIndex].meaning}
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
                onChangeText={setShadowTranscript}
              />
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
              <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: 4 }}>
                {dialogue.title}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                {dialogue.situation}
              </ThemedText>

              {dialogue.turns.slice(0, turnIndex + 1).map((t, i) => (
                <View key={t.id} style={{ marginBottom: Spacing.two }}>
                  <ThemedText type="smallBold">AI</ThemedText>
                  <ThemedText style={{ marginBottom: 4 }}>{t.aiText}</ThemedText>
                  {i === turnIndex && (
                    <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(t.aiText)} />
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
                placeholder={dialogue.turns[turnIndex].placeholder}
                placeholderTextColor={theme.textSecondary}
                value={currentReply}
                onChangeText={setCurrentReply}
                multiline
              />
              {isSttSupported() && (
                <>
                  <PrimaryButton
                    label={conversationListening ? '🎙 듣는 중...' : '🎙 말로 답하기'}
                    variant="secondary"
                    onPress={startConversationVoice}
                    disabled={conversationListening}
                  />
                  <View style={{ height: 8 }} />
                </>
              )}
              <PrimaryButton label="전송" onPress={submitConversationTurn} disabled={currentReply.trim().length === 0} />
            </View>
          )}

          {step === 'analysis' && analysisDone && (
            <AnalysisSummary dialogue={dialogue} learnerTurns={learnerTurns} onDone={() => router.replace('/')} />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function AnalysisSummary({
  dialogue,
  learnerTurns,
  onDone,
}: {
  dialogue: NonNullable<ReturnType<typeof dialogueById>>;
  learnerTurns: string[];
  onDone: () => void;
}) {
  const theme = useTheme();
  const analysis = useMemo(() => analyzeConversation(learnerTurns, dialogue, vocabulary), [dialogue, learnerTurns]);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="subtitle" style={{ fontSize: 22, marginBottom: Spacing.three }}>
        회화 분석 결과
      </ThemedText>

      {analysis.wordUsage.map((u) => {
        const item = vocabularyById(u.vocabularyItemId);
        return (
          <ThemedText key={u.vocabularyItemId} style={{ marginBottom: 4 }}>
            {u.used ? '✅' : '⬜️'} {item?.word} {u.used ? '— 자연스럽게 사용했어요' : '— 이번엔 사용하지 않았어요'}
          </ThemedText>
        );
      })}

      {analysis.alternativeSuggestions.map((s, i) => {
        const item = vocabularyById(s.suggestVocabularyId);
        return (
          <ThemedText key={i} themeColor="textSecondary" style={{ marginTop: 8 }}>
            💡 "{s.matchedPhrase}"라고 잘 말했어요. 최근 배운 "{item?.word}"도 사용해볼 수 있어요.
          </ThemedText>
        );
      })}

      <View style={{ height: Spacing.four }} />
      <PrimaryButton label="대시보드로 돌아가기" onPress={onDone} />
    </View>
  );
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
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
