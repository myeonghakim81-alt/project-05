import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contexts } from '@/content/contexts';
import { phrasesForWord, vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { buildDailySession, type DailySessionItem } from '@/lib/masteryEngine';
import { DailyCarryOverWords, DailyReviewCap, DailySessionSize, MasteryThreshold, WeaknessThreshold } from '@/lib/policy';
import { average, buildWordMeaningChoices, scoreExpressSentence, shuffle, type MeaningChoice } from '@/lib/scoring';
import { isSttSupported, isTtsSupported, speak, startListening, voiceGenderForLevel } from '@/lib/speech';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';
import { useTheme } from '@/hooks/use-theme';

// "오늘의 학습" — a single daily session that mixes spaced-repetition review
// (any level, so difficulty is naturally mixed) with a trickle of new words
// from the current level, instead of /level-study's single-level scope. See
// buildDailySession (src/lib/masteryEngine.ts) for the exact composition
// rule. Quick 2-phase pass per word (meaning recall, then a situational
// answer in a newly-picked example context) — deliberately lighter than
// level-study's 4-step loop, and no level change here.
type Phase = 'meaning-test' | 'recall-test' | 'result';

const PHASE_LABEL: Record<Phase, string> = {
  'meaning-test': '오늘의 학습 · 뜻 확인',
  'recall-test': '오늘의 학습 · 새 상황에서 떠올리기',
  result: '결과',
};

export default function Daily() {
  const router = useRouter();
  const theme = useTheme();
  const entries = useLearnerStore((s) => s.entries);
  const currentLevel = useLevelStore((s) => s.currentLevel);
  const recordReviewOutcome = useLearnerStore((s) => s.recordReviewOutcome);
  const recordWordTestResult = useLearnerStore((s) => s.recordWordTestResult);

  const [sample, setSample] = useState<DailySessionItem[]>([]);
  const [phrasePick, setPhrasePick] = useState<Record<string, ReturnType<typeof phrasesForWord>[number] | undefined>>({});
  const [phase, setPhase] = useState<Phase>('meaning-test');
  const [index, setIndex] = useState(0);

  const [meaningChoices, setMeaningChoices] = useState<MeaningChoice[]>([]);
  const [meaningAnswered, setMeaningAnswered] = useState<string | null>(null);
  const [meaningResults, setMeaningResults] = useState<boolean[]>([]);

  const [recallText, setRecallText] = useState('');
  const [recallSubmitted, setRecallSubmitted] = useState(false);
  const [recallScores, setRecallScores] = useState<number[]>([]);

  const [done, setDone] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  useEffect(() => {
    const words = buildDailySession(
      vocabulary,
      vocabularyByLevel(currentLevel),
      entries,
      DailySessionSize,
      DailyReviewCap,
      DailyCarryOverWords,
    );
    setSample(words);
    const picks: typeof phrasePick = {};
    for (const { item } of words) {
      const options = phrasesForWord(item.id);
      picks[item.id] = shuffle(options)[0];
    }
    setPhrasePick(picks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function prepareMeaningQuestion(word: DailySessionItem['item']) {
    setMeaningChoices(buildWordMeaningChoices(word, vocabulary));
    setMeaningAnswered(null);
  }

  useEffect(() => {
    if (sample.length > 0) prepareMeaningQuestion(sample[0].item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample]);

  function answerMeaning(choiceId: string) {
    if (meaningAnswered) return;
    setMeaningAnswered(choiceId);
  }

  useEffect(() => {
    if (phase !== 'meaning-test' || !meaningAnswered) return;
    const correct = meaningChoices.find((c) => c.id === meaningAnswered)?.correct ?? false;
    if (!correct) return;
    const timer = setTimeout(() => nextMeaning(), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meaningAnswered]);

  function nextMeaning() {
    const correct = meaningChoices.find((c) => c.id === meaningAnswered)?.correct ?? false;
    const results = [...meaningResults, correct];
    setMeaningResults(results);
    recordWordTestResult(sample[index].item.id, correct);
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
      prepareMeaningQuestion(sample[nextIndex].item);
    } else {
      setIndex(0);
      setRecallScores([]);
      setRecallText('');
      setRecallSubmitted(false);
      setPhase('recall-test');
    }
  }

  function submitRecall() {
    const score = scoreExpressSentence(sample[index].item.word, recallText);
    setRecallScores((prev) => [...prev, score]);
    setRecallSubmitted(true);
  }

  async function recordRecallSpeech() {
    const result = await startListening();
    setRecallText(result.transcript);
  }

  function nextRecall() {
    setRecallText('');
    setRecallSubmitted(false);
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
    } else {
      setPhase('result');
    }
  }

  useEffect(() => {
    if (phase !== 'result' || done || sample.length === 0) return;
    (async () => {
      const perWordAverages: number[] = [];
      for (let i = 0; i < sample.length; i++) {
        const perWordScores = [meaningResults[i] ? 100 : 0, recallScores[i]];
        const wordAverage = average(perWordScores);
        perWordAverages.push(wordAverage);
        await recordReviewOutcome(sample[i].item.id, wordAverage >= WeaknessThreshold);
      }
      setSessionScore(average(perWordAverages));
      setDone(true);
    })();
  }, [phase, done, sample, meaningResults, recallScores, recordReviewOutcome]);

  const scoreMessage =
    sessionScore >= MasteryThreshold ? '완벽해요! 👏' : sessionScore >= WeaknessThreshold ? '좋아요, 꾸준히 하고 있어요' : '조금 더 복습하면 금방 좋아져요';

  if (sample.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title" style={{ marginBottom: Spacing.two }}>
          오늘의 학습 단어가 없어요
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
          Level 학습을 하고 나면, 복습할 단어와 새 단어가 여기 매일 채워져요.
        </ThemedText>
        <PrimaryButton label="대시보드로 돌아가기" onPress={() => router.replace('/')} />
      </ThemedView>
    );
  }

  const current = sample[index];
  const currentWord = current.item;
  const recallPhrase = phrasePick[currentWord?.id];
  const recallContext = recallPhrase ? contexts.find((c) => c.id === recallPhrase.contextId) : undefined;
  const newCount = sample.filter((s) => s.isNew).length;

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {PHASE_LABEL[phase]}
                {phase !== 'result' ? ` (${index + 1}/${sample.length})` : ''}
              </ThemedText>
              {phase !== 'result' && (
                <ThemedText type="smallBold" style={[styles.levelChip, { backgroundColor: theme.backgroundSelected }]}>
                  Lv.{currentWord.level}
                </ThemedText>
              )}
            </View>
            <ThemedText type="linkPrimary" onPress={() => router.replace('/')}>
              나가기
            </ThemedText>
          </View>

          {phase === 'meaning-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {current.isCarryOver && (
                <View style={[styles.carryBadge, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="small" style={{ fontWeight: '700' }}>
                    어제도 만났던 단어예요
                  </ThemedText>
                </View>
              )}
              <ThemedText type="title" style={{ fontSize: 32, marginBottom: Spacing.two }}>
                {currentWord.word}
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 발음 듣기' : '🔊 발음 듣기 (미지원 브라우저)'}
                variant="secondary"
                onPress={() => speak(currentWord.word, { gender: voiceGenderForLevel(currentWord.level) })}
              />
              <View style={{ height: Spacing.three }} />
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                이 단어의 뜻은 무엇일까요?
              </ThemedText>
              {meaningChoices.map((choice) => {
                const isAnswered = meaningAnswered !== null;
                const isPicked = meaningAnswered === choice.id;
                const variant: 'success' | 'danger' | 'secondary' = isAnswered && choice.correct ? 'success' : isPicked ? 'danger' : 'secondary';
                return (
                  <View key={choice.id} style={{ marginBottom: 8 }}>
                    <PrimaryButton
                      label={`${choice.meaning}${isAnswered && choice.correct ? '  정답' : isPicked ? '  오답' : ''}`}
                      variant={variant}
                      disabled={isAnswered}
                      onPress={() => answerMeaning(choice.id)}
                    />
                  </View>
                );
              })}
              {meaningAnswered && (
                <>
                  <View style={{ height: Spacing.two }} />
                  <PrimaryButton label="다음" onPress={nextMeaning} />
                </>
              )}
            </View>
          )}

          {phase === 'recall-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {recallContext && (
                <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                  상황: {recallContext.description}
                </ThemedText>
              )}
              {recallPhrase?.question ? (
                <>
                  <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.one }}>
                    {recallPhrase.question}
                  </ThemedText>
                  <PrimaryButton
                    label="🔊 듣기"
                    variant="secondary"
                    onPress={() => speak(recallPhrase.question!, { gender: voiceGenderForLevel(currentWord.level) })}
                  />
                  <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, marginBottom: Spacing.two }}>
                    위 질문에 "{currentWord.word}"를 사용해서 대답해보세요
                  </ThemedText>
                </>
              ) : (
                <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.two }}>
                  이 상황에서 "{currentWord.word}"를 사용해 말하거나 써보세요
                </ThemedText>
              )}
              {isSttSupported() && !recallSubmitted && (
                <>
                  <PrimaryButton label="🎙 말로 하기" variant="secondary" onPress={recordRecallSpeech} />
                  <View style={{ height: 8 }} />
                </>
              )}
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="Write (or speak) a sentence with the word..."
                placeholderTextColor={theme.textSecondary}
                value={recallText}
                onChangeText={setRecallText}
                multiline
                editable={!recallSubmitted}
              />
              {!recallSubmitted ? (
                <PrimaryButton label="제출" onPress={submitRecall} disabled={recallText.trim().length === 0} />
              ) : (
                <PrimaryButton label="다음" onPress={nextRecall} />
              )}
            </View>
          )}

          {phase === 'result' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {!done ? (
                <ThemedText>결과를 계산하는 중...</ThemedText>
              ) : (
                <>
                  <ThemedText type="title" style={{ fontSize: 28, marginBottom: Spacing.two }}>
                    오늘의 학습 완료! 🎉
                  </ThemedText>
                  <View style={[styles.scoreBox, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText type="title" style={{ fontSize: 44 }}>
                      {sessionScore}
                      <ThemedText type="subtitle">점</ThemedText>
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ marginTop: 2 }}>
                      {scoreMessage}
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                    {sample.length}개 단어 중 복습 {sample.length - newCount}개 · 새 단어 {newCount}개를 했어요. 내일 또 만나요.
                  </ThemedText>
                  <PrimaryButton label="대시보드로 돌아가기" onPress={() => router.replace('/')} />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelChip: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  carryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: Spacing.two },
  card: { borderRadius: 22, padding: Spacing.four },
  scoreBox: { alignItems: 'center', borderRadius: 18, paddingVertical: Spacing.three, marginBottom: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    marginBottom: Spacing.three,
    fontSize: 16,
  },
});
