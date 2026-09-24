import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contexts } from '@/content/contexts';
import { phrasesForWord, vocabulary, vocabularyById } from '@/content/vocabulary';
import { DailyReviewCap, WeaknessThreshold } from '@/lib/policy';
import { average, buildWordMeaningChoices, scoreExpressSentence, shuffle, type MeaningChoice } from '@/lib/scoring';
import { dueForReview } from '@/lib/srs';
import { isSttSupported, isTtsSupported, speak, startListening } from '@/lib/speech';
import { useLearnerStore } from '@/store/learnerStore';
import { useTheme } from '@/hooks/use-theme';
import type { VocabularyItem } from '@/types/domain';

// A quick daily pass, not another full level-study session (spec 14: review
// means recall in a new context, not redoing the same drill) — meaning
// recall, then a situational answer using a phrase other than whichever one
// pronunciation-testing happened to land on before. No pronunciation step,
// no level change: this only feeds the spaced-repetition schedule.
type Phase = 'meaning-test' | 'recall-test' | 'result';

const PHASE_LABEL: Record<Phase, string> = {
  'meaning-test': '복습 · 뜻 확인',
  'recall-test': '복습 · 새 상황에서 떠올리기',
  result: '결과',
};

export default function Review() {
  const router = useRouter();
  const theme = useTheme();
  const entries = useLearnerStore((s) => s.entries);
  const recordReviewOutcome = useLearnerStore((s) => s.recordReviewOutcome);

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

  useEffect(() => {
    const dueIds = dueForReview(entries).slice(0, DailyReviewCap);
    const words = dueIds.map((id) => vocabularyById(id)).filter((w): w is VocabularyItem => Boolean(w));
    setSample(words);
    const picks: typeof phrasePick = {};
    for (const w of words) {
      const options = phrasesForWord(w.id);
      picks[w.id] = shuffle(options)[0];
    }
    setPhrasePick(picks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      for (let i = 0; i < sample.length; i++) {
        const perWordScores = [meaningResults[i] ? 100 : 0, recallScores[i]];
        const succeeded = average(perWordScores) >= WeaknessThreshold;
        await recordReviewOutcome(sample[i].id, succeeded);
      }
      setDone(true);
    })();
  }, [phase, done, sample, meaningResults, recallScores, recordReviewOutcome]);

  if (sample.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title" style={{ marginBottom: Spacing.two }}>
          오늘 복습할 단어가 없어요
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
          레벨 학습을 하고 나면, 익힌 단어가 며칠 뒤 여기 다시 나타나요.
        </ThemedText>
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
              {PHASE_LABEL[phase]}
              {phase !== 'result' ? ` (${index + 1}/${sample.length})` : ''}
            </ThemedText>
            <ThemedText type="linkPrimary" onPress={() => router.replace('/')}>
              나가기
            </ThemedText>
          </View>

          {phase === 'meaning-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={{ fontSize: 32, marginBottom: Spacing.two }}>
                {currentWord.word}
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 발음 듣기' : '🔊 발음 듣기 (미지원 브라우저)'}
                variant="secondary"
                onPress={() => speak(currentWord.word)}
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
                  <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(recallPhrase.question!)} />
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
                    오늘의 복습 완료! 🎉
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                    {sample.length}개 단어를 복습했어요. 다음 복습 시점은 단어별로 자동으로 조금씩 더 늘어나요.
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    marginBottom: Spacing.three,
    fontSize: 16,
  },
});
