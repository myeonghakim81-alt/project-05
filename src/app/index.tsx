import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { SkillBar } from '@/components/skill-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { vocabulary, vocabularyByLevel } from '@/content/vocabulary';
import { buildDailySession, levelLabel, summarizeDashboard } from '@/lib/masteryEngine';
import { DailyCarryOverWords, DailyReviewCap, DailySessionSize } from '@/lib/policy';
import { confirmResetProgress, resetAllProgress } from '@/lib/resetProgress';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';
import { AccentPalette, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const levelWordCount = vocabularyByLevel(levelStore.currentLevel).length;

  const dailySample = buildDailySession(
    vocabulary,
    vocabularyByLevel(levelStore.currentLevel),
    entries,
    DailySessionSize,
    DailyReviewCap,
    DailyCarryOverWords,
  );
  const dailyNewCount = dailySample.filter((s) => s.isNew).length;
  const dailyReviewCount = dailySample.length - dailyNewCount;
  const dailyLevels = Array.from(new Set(dailySample.map((s) => s.item.level))).sort((a, b) => a - b);

  async function handleReset() {
    const confirmed = await confirmResetProgress();
    if (!confirmed) return;
    await resetAllProgress();
    router.replace('/placement-test');
  }

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedText type="title">MY ENGLISH</ThemedText>

          <View style={[styles.card, styles.levelCard, { backgroundColor: AccentPalette[2] }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              현재 내 영어 실력
            </ThemedText>
            <ThemedText type="title" style={{ fontSize: 22, marginTop: 2, marginBottom: Spacing.three }}>
              Lv.{levelStore.currentLevel} · {levelLabel(levelStore.currentLevel)}
            </ThemedText>
            <SkillBar label="종합 실력 점수" value={summary.overall} />
          </View>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.modeSectionLabel}>
            오늘 뭐 할래요?
          </ThemedText>

          <View style={[styles.card, styles.dailyCard, { backgroundColor: AccentPalette[0], borderColor: theme.primary }]}>
            <View style={[styles.recommendedBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="small" style={{ color: theme.primaryText, fontWeight: '800' }}>
                추천
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: 4 }}>
              오늘의 학습
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              여러 레벨 단어가 섞여서 나와요 — 복습 때 된 단어 + 새 단어
            </ThemedText>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <ThemedText type="title" style={{ fontSize: 20 }}>
                  {dailySample.length}
                  <ThemedText type="small">개</ThemedText>
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontWeight: '600', marginTop: 2 }}>
                  오늘 준비됨
                </ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText type="smallBold">
                  복습 {dailyReviewCount} · 새 단어 {dailyNewCount}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontWeight: '600', marginTop: 4 }}>
                  구성
                </ThemedText>
              </View>
            </View>

            {dailyLevels.length > 0 && (
              <View style={styles.chipRow}>
                {dailyLevels.slice(0, 5).map((lvl) => (
                  <View key={lvl} style={[styles.chip, { borderColor: theme.border }]}>
                    <ThemedText type="small" style={{ fontWeight: '700' }}>
                      Lv.{lvl}
                    </ThemedText>
                  </View>
                ))}
                {dailyLevels.length > 1 && (
                  <ThemedText type="small" themeColor="textSecondary" style={{ alignSelf: 'center', marginLeft: 2 }}>
                    난이도 섞임
                  </ThemedText>
                )}
              </View>
            )}

            <PrimaryButton label="시작하기" onPress={() => router.push('/daily')} />
          </View>

          <View style={[styles.card, { backgroundColor: AccentPalette[1] }]}>
            <ThemedText type="subtitle" style={{ fontSize: 18, marginBottom: 4 }}>
              Level {levelStore.currentLevel} 학습
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              단어 {levelWordCount}개 중 진행 · 이 레벨만 집중
            </ThemedText>
            <PrimaryButton label={`Level ${levelStore.currentLevel} 시작하기`} variant="secondary" onPress={() => router.push('/level-study')} />
            <View style={{ height: 8 }} />
            <PrimaryButton label="레벨 테스트 다시 보기" variant="secondary" onPress={() => router.push('/placement-test')} />
          </View>

          {reviewQueue.length > 0 && (
            <View style={[styles.card, { backgroundColor: AccentPalette[4] }]}>
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

          <ThemedText type="small" themeColor="textSecondary" style={styles.resetLink} onPress={handleReset}>
            처음부터 다시 시작 (학습 기록 초기화)
          </ThemedText>
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
  card: { borderRadius: 22, padding: Spacing.four, marginTop: Spacing.four },
  sectionTitle: { fontSize: 20, marginBottom: Spacing.three },
  wordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  levelCard: { marginTop: Spacing.three },
  modeSectionLabel: { marginTop: Spacing.four, marginBottom: 10, letterSpacing: 0.3 },
  dailyCard: { marginTop: 0, borderWidth: 2, position: 'relative' },
  recommendedBadge: {
    position: 'absolute',
    top: -11,
    left: Spacing.four,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.three },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 12, padding: 10 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Spacing.four },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  resetLink: { marginTop: Spacing.five, textAlign: 'center', textDecorationLine: 'underline' },
});
