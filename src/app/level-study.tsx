import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { contexts } from '@/content/contexts';
import { maxContentLevel, phrasesForWord, vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { LevelDropThreshold, LevelPassThreshold, LevelStudySampleSize, WeaknessThreshold } from '@/lib/policy';
import {
  average,
  buildWordMeaningChoices,
  estimatePronunciationScore,
  scoreExpressSentence,
  shuffle,
  sortByDifficulty,
  wordOverlap,
  type MeaningChoice,
} from '@/lib/scoring';
import { isSttSupported, isTtsSupported, speak, startListening } from '@/lib/speech';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';
import { useTheme } from '@/hooks/use-theme';
import type { VocabularyItem } from '@/types/domain';

type Phase = 'expose' | 'word-test' | 'pronunciation-test' | 'sentence-test' | 'confirm-skip' | 'result';

const PHASE_LABEL: Record<Phase, string> = {
  expose: '단어 노출',
  'word-test': '단어 테스트',
  'sentence-test': '문장 테스트',
  'pronunciation-test': '발음 테스트',
  'confirm-skip': '발음 테스트',
  result: '결과',
};

interface Outcome {
  overall: number;
  wordScore: number;
  sentenceScore: number;
  pronScore: number | null;
  verdict: 'pass' | 'repeat' | 'drop';
}

// Example sentences for a word, easiest first — used to pick what the
// pronunciation step has the learner read aloud, and what "situation" the
// sentence-production step frames itself around.
function phrasesFor(word: VocabularyItem) {
  return sortByDifficulty(phrasesForWord(word.id));
}

export default function LevelStudy() {
  const router = useRouter();
  const theme = useTheme();
  const level = useLevelStore((s) => s.currentLevel);
  const setLevel = useLevelStore((s) => s.setLevel);
  const bumpTowards = useLearnerStore((s) => s.bumpTowards);
  const recordReviewOutcome = useLearnerStore((s) => s.recordReviewOutcome);

  const [sample, setSample] = useState<VocabularyItem[]>([]);
  const [phase, setPhase] = useState<Phase>('expose');
  const [index, setIndex] = useState(0);

  // word-test
  const [wordTestChoices, setWordTestChoices] = useState<MeaningChoice[]>([]);
  const [wordTestAnswered, setWordTestAnswered] = useState<string | null>(null);
  const [wordTestResults, setWordTestResults] = useState<boolean[]>([]);

  // sentence-test
  const [sentenceText, setSentenceText] = useState('');
  const [sentenceSubmitted, setSentenceSubmitted] = useState(false);
  const [sentenceScores, setSentenceScores] = useState<number[]>([]);

  // pronunciation-test
  const [pronTranscript, setPronTranscript] = useState('');
  const [pronConfidence, setPronConfidence] = useState(0);
  const [pronUsedVoice, setPronUsedVoice] = useState(false);
  const [pronListening, setPronListening] = useState(false);
  const [pronunciationScores, setPronunciationScores] = useState<(number | null)[]>([]);
  const [pronunciationSkippedCount, setPronunciationSkippedCount] = useState(0);

  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    const words = shuffle(vocabularyByLevel(level)).slice(0, LevelStudySampleSize);
    setSample(words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function startWordTest() {
    setIndex(0);
    setWordTestResults([]);
    prepareWordTestQuestion(sample[0]);
    setPhase('word-test');
  }

  function prepareWordTestQuestion(word: VocabularyItem) {
    setWordTestChoices(buildWordMeaningChoices(word, vocabulary));
    setWordTestAnswered(null);
  }

  function answerWordTest(choiceId: string) {
    if (wordTestAnswered) return;
    setWordTestAnswered(choiceId);
  }

  // A correct answer auto-advances after a beat so learners can move fast
  // without a tap for every word; a wrong answer still needs the manual
  // "다음" button so they have time to read the correct choice.
  useEffect(() => {
    if (phase !== 'word-test' || !wordTestAnswered) return;
    const correct = wordTestChoices.find((c) => c.id === wordTestAnswered)?.correct ?? false;
    if (!correct) return;
    const timer = setTimeout(() => nextWordTest(), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordTestAnswered]);

  function nextWordTest() {
    const correct = wordTestChoices.find((c) => c.id === wordTestAnswered)?.correct ?? false;
    const results = [...wordTestResults, correct];
    setWordTestResults(results);
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
      prepareWordTestQuestion(sample[nextIndex]);
    } else {
      setIndex(0);
      setPronunciationScores([]);
      setPronunciationSkippedCount(0);
      resetPronState();
      setPhase('pronunciation-test');
    }
  }

  function beginSentenceTest() {
    setIndex(0);
    setSentenceScores([]);
    setSentenceText('');
    setSentenceSubmitted(false);
    setPhase('sentence-test');
  }

  function submitSentence() {
    const score = scoreExpressSentence(sample[index].word, sentenceText);
    setSentenceScores((prev) => [...prev, score]);
    setSentenceSubmitted(true);
  }

  async function recordSentenceSpeech() {
    const result = await startListening();
    setSentenceText(result.transcript);
  }

  function nextSentence() {
    setSentenceText('');
    setSentenceSubmitted(false);
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
    } else {
      setPhase('result');
    }
  }

  function resetPronState() {
    setPronTranscript('');
    setPronConfidence(0);
    setPronUsedVoice(false);
    setPronListening(false);
  }

  async function recordPronunciation() {
    setPronListening(true);
    setPronTranscript('');
    setPronConfidence(0);
    const result = await startListening();
    setPronTranscript(result.transcript);
    setPronConfidence(result.confidence);
    setPronUsedVoice(true);
    setPronListening(false);
  }

  function advancePronunciation(score: number | null, skippedNow: boolean) {
    setPronunciationScores((prev) => [...prev, score]);
    const totalSkips = pronunciationSkippedCount + (skippedNow ? 1 : 0);
    if (skippedNow) setPronunciationSkippedCount(totalSkips);
    resetPronState();
    const nextIndex = index + 1;
    if (nextIndex < sample.length) {
      setIndex(nextIndex);
    } else if (totalSkips > 0) {
      setPhase('confirm-skip');
    } else {
      beginSentenceTest();
    }
  }

  function submitPronunciation() {
    const target = phrasesFor(sample[index])[0]?.text ?? sample[index].word;
    const recallScore = wordOverlap(pronTranscript, target);
    const score = estimatePronunciationScore(recallScore, pronConfidence, pronUsedVoice);
    advancePronunciation(score, false);
  }

  function skipPronunciation() {
    advancePronunciation(null, true);
  }

  function redoPronunciationFromScratch() {
    setIndex(0);
    setPronunciationScores([]);
    setPronunciationSkippedCount(0);
    resetPronState();
    setPhase('pronunciation-test');
  }

  useEffect(() => {
    if (phase !== 'result' || outcome || sample.length === 0) return;
    (async () => {
      const wordScore = Math.round((wordTestResults.filter(Boolean).length / sample.length) * 100);
      const sentenceScore = average(sentenceScores);
      const validPron = pronunciationScores.filter((s): s is number => s !== null);
      const pronScore = validPron.length > 0 ? average(validPron) : null;
      const categoryScores = [wordScore, sentenceScore, ...(pronScore !== null ? [pronScore] : [])];
      const overall = average(categoryScores);
      const verdict: Outcome['verdict'] = overall >= LevelPassThreshold ? 'pass' : overall < LevelDropThreshold ? 'drop' : 'repeat';

      for (let i = 0; i < sample.length; i++) {
        const w = sample[i];
        const pron = pronunciationScores[i];
        await bumpTowards(
          w.id,
          {
            recognition: wordTestResults[i] ? 85 : 30,
            expression: sentenceScores[i],
            ...(pron !== null ? { pronunciation: pron } : {}),
          },
          0.5,
        );
        // Feeds the spaced-repetition schedule (src/lib/srs.ts) — a word
        // this level-study pass went well for comes back for review later
        // instead of only ever being touched once, on level-up.
        const perWordScores = [wordTestResults[i] ? 100 : 0, sentenceScores[i], ...(pron !== null ? [pron] : [])];
        const wordSucceeded = average(perWordScores) >= WeaknessThreshold;
        await recordReviewOutcome(w.id, wordSucceeded);
      }

      const ceiling = maxContentLevel();
      const newLevel = verdict === 'pass' ? (level + 1 <= ceiling ? level + 1 : level) : verdict === 'drop' ? Math.max(1, level - 1) : level;
      await setLevel(newLevel);

      setOutcome({ overall, wordScore, sentenceScore, pronScore, verdict });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (sample.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={{ marginBottom: Spacing.three }}>Level {level}에는 아직 준비된 단어가 없어요.</ThemedText>
        <PrimaryButton label="대시보드로 돌아가기" onPress={() => router.replace('/')} />
      </ThemedView>
    );
  }

  const currentWord = sample[index];
  const wordPhrases = phrasesFor(currentWord);
  const pronPhrase = wordPhrases[0];
  const situationPhrase = wordPhrases[1] ?? wordPhrases[0];
  const situationContext = situationPhrase ? contexts.find((c) => c.id === situationPhrase.contextId) : undefined;

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Level {level} · {PHASE_LABEL[phase]}
              {phase !== 'result' && phase !== 'confirm-skip' ? ` (${index + 1}/${sample.length})` : ''}
            </ThemedText>
            <ThemedText type="linkPrimary" onPress={() => router.replace('/')}>
              나가기
            </ThemedText>
          </View>

          {phase === 'expose' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.two }}>
                이번에 배울 단어
              </ThemedText>
              <ThemedText type="title" style={{ fontSize: 32, marginBottom: Spacing.one }}>
                {currentWord.word}
              </ThemedText>
              <PrimaryButton
                label={isTtsSupported() ? '🔊 발음 듣기' : '🔊 발음 듣기 (미지원 브라우저)'}
                variant="secondary"
                onPress={() => speak(currentWord.word)}
              />
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three, marginBottom: Spacing.three }}>
                {currentWord.meaning} · {currentWord.definition}
              </ThemedText>
              <PrimaryButton
                label={index + 1 < sample.length ? '다음 단어' : '테스트 시작하기'}
                onPress={() => (index + 1 < sample.length ? setIndex(index + 1) : startWordTest())}
              />
            </View>
          )}

          {phase === 'word-test' && (
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
              {wordTestChoices.map((choice) => {
                const isAnswered = wordTestAnswered !== null;
                const isPicked = wordTestAnswered === choice.id;
                const variant: 'success' | 'danger' | 'secondary' = isAnswered && choice.correct ? 'success' : isPicked ? 'danger' : 'secondary';
                return (
                  <View key={choice.id} style={{ marginBottom: 8 }}>
                    <PrimaryButton
                      label={`${choice.meaning}${isAnswered && choice.correct ? '  정답' : isPicked ? '  오답' : ''}`}
                      variant={variant}
                      disabled={isAnswered}
                      onPress={() => answerWordTest(choice.id)}
                    />
                  </View>
                );
              })}
              {wordTestAnswered && (
                <>
                  <View style={{ height: Spacing.two }} />
                  <PrimaryButton label="다음" onPress={nextWordTest} />
                </>
              )}
            </View>
          )}

          {phase === 'pronunciation-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.two }}>
                예문을 따라 읽으며 발음해보세요
              </ThemedText>
              <ThemedText type="title" style={{ fontSize: 24, marginBottom: Spacing.one }}>
                {currentWord.word}
              </ThemedText>
              <ThemedText style={{ marginBottom: Spacing.three }}>{pronPhrase?.text ?? currentWord.word}</ThemedText>
              <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(pronPhrase?.text ?? currentWord.word)} />
              <View style={{ height: 8 }} />
              {isSttSupported() && (
                <>
                  <PrimaryButton
                    label={pronListening ? '🎙 듣는 중...' : '🎙 녹음해서 말하기'}
                    onPress={recordPronunciation}
                    disabled={pronListening}
                  />
                  <View style={{ height: 8 }} />
                </>
              )}
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="말한(또는 입력할) 문장을 여기서 확인·수정하세요"
                placeholderTextColor={theme.textSecondary}
                value={pronTranscript}
                onChangeText={(text) => {
                  setPronTranscript(text);
                  setPronUsedVoice(false);
                }}
              />
              <View style={{ height: Spacing.three }} />
              <PrimaryButton label="다음" onPress={submitPronunciation} disabled={!pronTranscript} />
              <ThemedText type="link" themeColor="textSecondary" onPress={skipPronunciation} style={{ marginTop: Spacing.two }}>
                말하기 어려운 상황이신가요? 건너뛰기 →
              </ThemedText>
            </View>
          )}

          {phase === 'sentence-test' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {situationContext && (
                <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                  상황: {situationContext.description}
                </ThemedText>
              )}
              {situationPhrase?.question ? (
                <>
                  <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.one }}>
                    {situationPhrase.question}
                  </ThemedText>
                  <PrimaryButton label="🔊 듣기" variant="secondary" onPress={() => speak(situationPhrase.question!)} />
                  <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, marginBottom: Spacing.two }}>
                    위 질문에 "{currentWord.word}"를 사용해서 대답해보세요
                  </ThemedText>
                </>
              ) : (
                <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.two }}>
                  이 상황에서 "{currentWord.word}"를 사용해 말하거나 써보세요
                </ThemedText>
              )}
              {isSttSupported() && !sentenceSubmitted && (
                <>
                  <PrimaryButton label="🎙 말로 하기" variant="secondary" onPress={recordSentenceSpeech} />
                  <View style={{ height: 8 }} />
                </>
              )}
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="Write (or speak) a sentence with the word..."
                placeholderTextColor={theme.textSecondary}
                value={sentenceText}
                onChangeText={setSentenceText}
                multiline
                editable={!sentenceSubmitted}
              />
              {!sentenceSubmitted ? (
                <PrimaryButton label="제출" onPress={submitSentence} disabled={sentenceText.trim().length === 0} />
              ) : (
                <PrimaryButton label="다음" onPress={nextSentence} />
              )}
            </View>
          )}

          {phase === 'confirm-skip' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: Spacing.two }}>
                발음 테스트를 {pronunciationSkippedCount}개 건너뛰었어요
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                건너뛴 문항은 점수에서 제외하고 진행할 수 있어요. 그래도 다음 단계(문장 테스트)로 넘어갈까요?
              </ThemedText>
              <PrimaryButton label="네, 이대로 진행할게요" onPress={beginSentenceTest} />
              <View style={{ height: 8 }} />
              <PrimaryButton label="아니요, 발음 테스트를 다시 할게요" variant="secondary" onPress={redoPronunciationFromScratch} />
            </View>
          )}

          {phase === 'result' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {!outcome ? (
                <ThemedText>결과를 계산하는 중...</ThemedText>
              ) : (
                <>
                  <ThemedText type="title" style={{ fontSize: 28, marginBottom: Spacing.two }}>
                    {outcome.verdict === 'pass' ? '통과! 🎉' : outcome.verdict === 'repeat' ? '이 레벨을 한 번 더' : '조금 쉬운 레벨로'}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                    {outcome.verdict === 'pass'
                      ? `Level ${level}을 통과했어요. Level ${Math.min(level + 1, maxContentLevel())}로 이동합니다.`
                      : outcome.verdict === 'repeat'
                        ? `Level ${level}을 조금 더 연습해봐요.`
                        : `Level ${Math.max(1, level - 1)}부터 다시 다져볼게요.`}
                  </ThemedText>
                  <Row label="단어 테스트" value={`${outcome.wordScore}%`} />
                  <Row label="발음 테스트" value={outcome.pronScore !== null ? `${outcome.pronScore}%` : '건너뜀'} />
                  <Row label="문장 테스트" value={`${outcome.sentenceScore}%`} />
                  <View style={styles.divider} />
                  <Row label="종합 점수" value={`${outcome.overall}%`} />
                  <View style={{ height: Spacing.four }} />
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

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.rowBetween}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  card: { borderRadius: 16, padding: Spacing.four },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    marginBottom: Spacing.three,
    fontSize: 16,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(128,128,128,0.2)', marginVertical: 8 },
});
