import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SkillBar } from '@/components/skill-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { summarizeDashboard, weakestSkill } from '@/lib/masteryEngine';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const { loaded, entries, reviewQueue, load } = useLearnerStore();
  const levelStore = useLevelStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([load(), levelStore.load()]).then(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  useEffect(() => {
    if (ready && !levelStore.placementCompleted) {
      router.replace('/placement-test');
    }
  }, [ready, levelStore.placementCompleted, router]);

  if (!loaded || !ready || !levelStore.placementCompleted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>불러오는 중...</ThemedText>
      </ThemedView>
    );
  }

  const entryList = Object.values(entries);
  const summary = summarizeDashboard(entryList);
  const bottleneck = entryList.length > 0 ? weakestSkill(summary.scores) : 'recognition';
  const levelWordCount = vocabularyByLevel(levelStore.currentLevel).length;

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedText type="title">MY ENGLISH</ThemedText>
          <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
            Overall {summary.overall}
          </ThemedText>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              현재 레벨
            </ThemedText>
            <ThemedText type="title" style={{ fontSize: 40, marginBottom: 4 }}>
              Level {levelStore.currentLevel}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              단어 {levelWordCount}개 · 병목: {bottleneck}
            </ThemedText>
            <PrimaryButton label={`Level ${levelStore.currentLevel} 학습 시작`} onPress={() => router.push('/level-study')} />
            <View style={{ height: 8 }} />
            <PrimaryButton label="레벨 테스트 다시 보기" variant="secondary" onPress={() => router.push('/placement-test')} />
          </View>

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

          {reviewQueue.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                복습 큐
              </ThemedText>
              {reviewQueue.map((id) => {
                const word = vocabulary.find((v) => v.id === id);
                return (
                  <View key={id} style={styles.wordRow}>
                    <ThemedText style={{ flex: 1 }}>• {word?.word ?? id}</ThemedText>
                    <PrimaryButton
                      label="복습"
                      variant="secondary"
                      onPress={() => router.push({ pathname: '/lesson', params: { wordId: id } })}
                    />
                  </View>
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
  wordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
});
