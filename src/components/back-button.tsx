import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

// A single, explicit in-app back/exit control, used on every study screen
// instead of relying on the browser's back button — this is headed for a
// native app build where there is no browser chrome to fall back on.
export function BackButton({ label = '나가기', onPress }: { label?: string; onPress?: () => void }) {
  const router = useRouter();
  return (
    <ThemedText type="linkPrimary" onPress={onPress ?? (() => router.replace('/'))}>
      ← {label}
    </ThemedText>
  );
}
