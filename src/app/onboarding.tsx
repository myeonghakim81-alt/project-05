import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentPalette, MaxContentWidth, Spacing } from '@/constants/theme';
import { useLevelStore } from '@/store/levelStore';
import { useTheme } from '@/hooks/use-theme';

// First thing a brand-new (or just-reset) learner sees: a choice between the
// two study modes, instead of being forced straight into the ~80-question
// placement test with no other path. "오늘의 학습" skips placement entirely
// and starts at Level 1; "레벨 테스트" goes through the existing flow, which
// sets the level/placementCompleted itself when it finishes.
export default function Onboarding() {
  const router = useRouter();
  const theme = useTheme();
  const setLevel = useLevelStore((s) => s.setLevel);

  async function startDaily() {
    await setLevel(1, true);
    router.replace('/daily');
  }

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: Spacing.two }}>
            MY ENGLISH
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
            어떻게 시작할까요?
          </ThemedText>

          <View style={[styles.card, { backgroundColor: AccentPalette[0], borderColor: theme.primary }]}>
            <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: 4 }}>
              오늘의 학습 바로 시작하기
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              레벨 테스트 없이 Level 1부터 바로 학습을 시작해요. 공부하면서 자연스럽게 난이도가 맞춰져요.
            </ThemedText>
            <PrimaryButton label="바로 시작하기" onPress={startDaily} />
          </View>

          <View style={[styles.card, { backgroundColor: AccentPalette[1] }]}>
            <ThemedText type="subtitle" style={{ fontSize: 20, marginBottom: 4 }}>
              레벨 테스트 먼저 보기
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
              짧은 테스트로 지금 실력에 맞는 레벨을 찾고, 그 레벨부터 학습을 시작해요.
            </ThemedText>
            <PrimaryButton label="레벨 테스트 시작하기" variant="secondary" onPress={() => router.push('/placement-test')} />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingVertical: Spacing.five },
  container: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  card: { borderRadius: 22, padding: Spacing.four, marginTop: Spacing.four, borderWidth: 2, borderColor: 'transparent' },
});
