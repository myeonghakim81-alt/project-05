import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contexts } from '@/content/contexts';
import { maxContentLevel, phrasesForWord, vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { pickLevelStudySample } from '@/lib/masteryEngine';
import { LevelDropThreshold, LevelPassThreshold, LevelStudySampleSize, MasteryThreshold, WeaknessThreshold } from '@/lib/policy';
import { average, buildWordMeaningChoices, scoreExpressSentence, shuffle, type MeaningChoice } from '@/lib/scoring';
import { isSttSupported, isTtsSupported, speak, startListening, voiceGenderForLevel } from '@/lib/speech';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';
import { useTheme } from '@/hooks/use-theme';
import type { VocabularyItem } from '@/types/domain';

// "Level N 학습" — same short 2-phase session format as /daily (meaning
// recall, then a situational answer), but scoped to only the learner's
// current level instead of /daily's level-agnostic mix. A pass/repeat/drop
// verdict (same thresholds the old 4-phase flow used) is still computed
// from the session score at the end, so the level can still move — just
// without dedicated pronunciation/sentence-test phases.
type Phase = 'meaning-test' | 'recall-test' | 'result';
type Verdict = 'pass' | 'repeat' | 'drop';

export default function LevelStudy() {
  const router = useRouter();
  const theme = useTheme();
  const level = useLevelStore((s) => s.currentLevel);
  const setLevel = useLevelStore((s) => s.setLevel);
  const entries = useLearnerStore((s) => s.entries);
  const recordReviewOutcome = useLearnerStore((s) => s.recordReviewOutcome);
  const recordWordTestResult = useLearnerStore((s) => s.recordWordTestResult);

  const [sample, setSample] = useState<VocabularyItem[]>([]);
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
  const [verdict, setVerdict] = useState<Verdict>('repeat');
  const [newLevel, setNewLevel] = useState(level);

  useEffect(() => {
    const words = pickLevelStudySample(vocabularyByLevel(level), entries, LevelStudySampleSize);
    setSample(words);
    const picks: typeof phrasePick = {};
    for (const item of words) {
      const options = phrasesForWord(item.id);
      picks[item.id] = shuffle(options)[0];
    }
    setPhrasePick(picks);
    // Deliberately keyed on `level` only, same reasoning as the old
    // level-study: `entries` changes constantly during the session and
    // re-picking mid-session would swap words out from under the learner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function prepareMeaningQuestion(word: VocabularyItem) {
    setMeaningChoices(buildWordMeaningChoices(word, vocabulary));
    setMeaningAnswered(null);
  }

  useEffect(() => {
    if (sample.length > 0) prepareMeaningQuestion(sample[0]);
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
    recordWordTestResult(sample[index].id, correct);
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
      prepareMeaningQuestion(sample[nextIndex]);
    } else {
      setIndex(0);
      setRecallScores([]);
      setRecallText('');
      setRecallSubmitted(false);
      setPhase('recall-test');
    }
  }

  function submitRecall() {
    const score = scoreExpressSentence(sample[index].word, recallText);
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
        await recordReviewOutcome(sample[i].id, wordAverage >= WeaknessThreshold);
      }
      const overall = average(perWordAverages);
      const nextVerdict: Verdict = overall >= LevelPassThreshold ? 'pass' : overall < LevelDropThreshold ? 'drop' : 'repeat';
      const ceiling = maxContentLevel();
      const nextLevel = nextVerdict === 'pass' ? Math.min(level + 1, ceiling) : nextVerdict === 'drop' ? Math.max(1, level - 1) : level;
      await setLevel(nextLevel);
      setSessionScore(overall);
      setVerdict(nextVerdict);
      setNewLevel(nextLevel);
      setDone(true);
    })();
  }, [phase, done, sample, meaningResults, recallScores, recordReviewOutcome, level, setLevel]);

  const scoreMessage =
    sessionScore >= MasteryThreshold ? '완벽해요! 👏' : sessionScore >= WeaknessThreshold ? '좋아요, 꾸준히 하고 있어요' : '조금 더 복습하면 금방 좋아져요';
  const verdictMessage =
    verdict === 'pass'
      ? `Level ${level}을 통과했어요. Level ${newLevel}로 이동합니다.`
      : verdict === 'drop'
        ? `Level ${newLevel}부터 다시 다져볼게요.`
        : `Level ${level}을 조금 더 연습해봐요.`;

  if (sample.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={{ marginBottom: Spacing.three }}>Level {level}에는 아직 준비된 단어가 없어요.</ThemedText>
        <PrimaryButton label="대시보드로 돌아가기" onPress={() => router.replace('/')} />
      </ThemedView>
    );
  }

  const currentWord = sample[index];
  const recallPhrase = phrasePick[currentWord?.id];
  const recallContext = recallPhrase ? contexts.find((c) => c.id === recallPhrase.contextId) : undefined;

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Level {level} 학습 · {phase === 'meaning-test' ? '뜻 확인' : phase === 'recall-test' ? '상황 적용' : '결과'}
              {phase !== 'result' ? ` (${index + 1}/${sample.length})` : ''}
            </ThemedText>
            <BackButton />
          </View>

          {phase === 'meaning-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={{ fontSize: 32, marginBottom: Spacing.two }}>
                {currentWord.word}
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 발음 듣기' : '🔊 발음 듣기 (미지원 브라우저)'}
                variant="secondary"
                onPress={() => speak(currentWord.word, { gender: voiceGenderForLevel(level) })}
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
                    onPress={() => speak(recallPhrase.question!, { gender: voiceGenderForLevel(level) })}
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
                    {verdict === 'pass' ? '통과! 🎉' : verdict === 'repeat' ? '이 레벨을 한 번 더' : '조금 쉬운 레벨로'}
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
                    {verdictMessage}
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
