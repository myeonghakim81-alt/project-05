import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SkillBar } from '@/components/skill-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { vocabulary } from '@/content/vocabulary';
import { nextActivityFor, summarizeDashboard, weakestSkill } from '@/lib/masteryEngine';
import { useLearnerStore } from '@/store/learnerStore';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ACTIVITY_LABEL: Record<string, string> = {
  vocabulary_exposure: '새 단어 노출 학습',
  contextual_listening: '문맥 속 듣기 연습',
  retrieval_practice: '회상(retrieval) 연습',
  sentence_generation: '문장 만들기 연습',
  roleplay: 'AI 롤플레이 대화',
  new_context: '새로운 상황에서 재사용',
  delayed_free_conversation: '지연된 자유 대화',
  increase_review_interval: '복습 간격 늘리기 (안정적)',
};

const SKILL_LABELS: [key: string, label: string][] = [
  ['recognition', 'Recognition'],
  ['listening', 'Listening'],
  ['recall', 'Recall'],
  ['expression', 'Expression'],
  ['conversationUsage', 'Conversation'],
  ['contextTransfer', 'Context Transfer'],
  ['automaticity', 'Automaticity'],
];

export default function Dashboard() {
  const router = useRouter();
  const theme = useTheme();
  const { loaded, entries, reviewQueue, load, getOrCreate } = useLearnerStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load().then(() => setReady(true));
  }, [load]);

  if (!loaded || !ready) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>불러오는 중...</ThemedText>
      </ThemedView>
    );
  }

  const entryList = Object.values(entries);
  const summary = summarizeDashboard(entryList);

  const featuredWordId = 'word-recommend';
  const featuredEntry = getOrCreate(featuredWordId);
  const nextActivity = nextActivityFor(featuredEntry.scores);
  const bottleneck = entryList.length > 0 ? weakestSkill(summary.scores) : 'recognition';

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedText type="title">MY ENGLISH</ThemedText>
          <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
            Overall {summary.overall}
          </ThemedText>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            {SKILL_LABELS.map(([key, label]) => (
              <SkillBar key={key} label={label} value={(summary.scores as any)[key]} />
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              어휘 구분
            </ThemedText>
            <Row label="Passive Vocabulary" value={summary.passiveVocabularyCount} />
            <Row label="Active Vocabulary" value={summary.activeVocabularyCount} />
            <Row label="Automatic Vocabulary" value={summary.automaticVocabularyCount} />
            <View style={styles.divider} />
            <Row label="Vocabulary-to-Speech Gap" value={`${summary.vocabularyToSpeechGap} points`} />
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              다음 추천 활동
            </ThemedText>
            <ThemedText style={{ marginBottom: 8 }}>
              현재 병목: <ThemedText type="smallBold">{bottleneck}</ThemedText>
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              {ACTIVITY_LABEL[nextActivity]}
            </ThemedText>
            <PrimaryButton label="레슨 시작하기 (recommend)" onPress={() => router.push({ pathname: '/lesson', params: { wordId: featuredWordId } })} />
          </View>

          {reviewQueue.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                복습 큐
              </ThemedText>
              {reviewQueue.map((id) => {
                const word = vocabulary.find((v) => v.id === id);
                return (
                  <ThemedText key={id} style={{ marginBottom: 4 }}>
                    • {word?.word ?? id}
                  </ThemedText>
                );
              })}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  card: { borderRadius: 16, padding: Spacing.four, marginTop: Spacing.four },
  sectionTitle: { fontSize: 20, marginBottom: Spacing.three },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(128,128,128,0.2)', marginVertical: 8 },
});
