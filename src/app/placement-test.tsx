import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { maxContentLevel, vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { LevelPassThreshold, PlacementSampleSize } from '@/lib/policy';
import { buildWordMeaningChoices, shuffle, type MeaningChoice } from '@/lib/scoring';
import { isTtsSupported, speak } from '@/lib/speech';
import { useLevelStore } from '@/store/levelStore';
import { useTheme } from '@/hooks/use-theme';
import type { VocabularyItem } from '@/types/domain';

interface LevelResult {
  level: number;
  correct: number;
  total: number;
}

export default function PlacementTest() {
  const router = useRouter();
  const theme = useTheme();
  const setLevel = useLevelStore((s) => s.setLevel);

  const [level, setLocalLevel] = useState(1);
  const [sample, setSample] = useState<VocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [choices, setChoices] = useState<MeaningChoice[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [history, setHistory] = useState<LevelResult[]>([]);
  const [phase, setPhase] = useState<'loading' | 'quiz' | 'result'>('loading');
  const [resultLevel, setResultLevel] = useState(1);
  const [mastered, setMastered] = useState(false);

  useEffect(() => {
    startLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startLevel(l: number) {
    const words = vocabularyByLevel(l);
    if (words.length === 0) {
      finish(Math.max(1, l - 1), true);
      return;
    }
    const picked = shuffle(words).slice(0, Math.min(PlacementSampleSize, words.length));
    setLocalLevel(l);
    setSample(picked);
    setIndex(0);
    setCorrect(0);
    setAnswered(null);
    prepareQuestion(picked[0]);
    setPhase('quiz');
  }

  function prepareQuestion(word: VocabularyItem) {
    setChoices(buildWordMeaningChoices(word, vocabulary));
    setAnswered(null);
  }

  function answer(choiceId: string, isCorrect: boolean) {
    if (answered) return;
    setAnswered(choiceId);
    if (isCorrect) setCorrect((c) => c + 1);
  }

  function next() {
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
      prepareQuestion(sample[nextIndex]);
      return;
    }
    const total = sample.length;
    const score = Math.round((correct / total) * 100);
    const nextHistory = [...history, { level, correct, total }];
    setHistory(nextHistory);

    if (score >= LevelPassThreshold) {
      const ceiling = maxContentLevel();
      if (level + 1 <= ceiling) {
        startLevel(level + 1);
      } else {
        finish(level, true);
      }
    } else {
      finish(level, false);
    }
  }

  async function finish(startingLevel: number, allMastered: boolean) {
    setResultLevel(startingLevel);
    setMastered(allMastered);
    setPhase('result');
    await setLevel(startingLevel, true);
  }

  if (phase === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>불러오는 중...</ThemedText>
      </ThemedView>
    );
  }

  if (phase === 'result') {
    return (
      <ThemedView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={{ fontSize: 30, marginBottom: Spacing.two }}>
                레벨 테스트 완료
              </ThemedText>
              {mastered ? (
                <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                  지금까지 준비된 레벨의 단어를 대부분 알고 계시네요! Level {resultLevel}부터 시작할게요.
                </ThemedText>
              ) : (
                <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                  Level {resultLevel}에서 모르는 단어가 늘어나기 시작했어요. 여기부터 시작할게요.
                </ThemedText>
              )}
              {history.map((h) => (
                <ThemedText key={h.level} style={{ marginBottom: 4 }}>
                  Level {h.level}: {h.correct}/{h.total} ({Math.round((h.correct / h.total) * 100)}%)
                </ThemedText>
              ))}
              <View style={{ height: Spacing.four }} />
              <PrimaryButton label="시작하기" onPress={() => router.replace('/')} />
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const currentWord = sample[index];
  if (!currentWord) return null;

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
            레벨 테스트 · Level {level} ({index + 1}/{sample.length})
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[styles.progressFill, { width: `${((index + 1) / sample.length) * 100}%`, backgroundColor: theme.primary }]}
            />
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="title" style={{ fontSize: 36, marginBottom: Spacing.two }}>
              {currentWord.word}
            </ThemedText>
            <PrimaryButton
              label={isTtsSupported() ? '🔊 발음 듣기' : '🔊 발음 듣기 (이 브라우저는 TTS 미지원)'}
              variant="secondary"
              onPress={() => speak(currentWord.word)}
            />
            <View style={{ height: Spacing.three }} />
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
              이 단어의 뜻은 무엇일까요?
            </ThemedText>
            {choices.map((choice) => {
              const isAnswered = answered !== null;
              const isPicked = answered === choice.id;
              const variant: 'success' | 'danger' | 'secondary' = isAnswered && choice.correct ? 'success' : isPicked ? 'danger' : 'secondary';
              return (
                <View key={choice.id} style={{ marginBottom: 8 }}>
                  <PrimaryButton
                    label={`${choice.meaning}${isAnswered && choice.correct ? '  정답' : isPicked ? '  오답' : ''}`}
                    variant={variant}
                    disabled={isAnswered}
                    onPress={() => answer(choice.id, choice.correct)}
                  />
                </View>
              );
            })}
            {answered && (
              <>
                <View style={{ height: Spacing.two }} />
                <PrimaryButton label="다음" onPress={next} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  card: { borderRadius: 22, padding: Spacing.four },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.four },
  progressFill: { height: 6, borderRadius: 3 },
});
