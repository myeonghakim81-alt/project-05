import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Expo Router matches routes against the actual URL path. When this app is
// hosted under a path it doesn't control (e.g. an artifact/preview host that
// serves index.html at some arbitrary sub-path instead of "/"), the first
// client-side match can miss and land here — so bounce straight to the
// dashboard instead of showing a dead end.
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText themeColor="textSecondary">이동 중...</ThemedText>
    </ThemedView>
  );
}
