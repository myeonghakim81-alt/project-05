import { Alert, Platform } from 'react-native';

import { learnerRepository } from '@/lib/storage';
import { useLearnerStore } from '@/store/learnerStore';
import { useLevelStore } from '@/store/levelStore';

// react-native-web's Alert.alert is a no-op (see node_modules/react-native-web
// /src/exports/Alert) — there's no native confirm dialog to fall back on in a
// browser, so this branches to window.confirm there and only uses Alert on
// real native builds.
export function confirmResetProgress(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm('학습 기록을 모두 지우고 처음부터 다시 시작할까요?') : false);
  }
  return new Promise((resolve) => {
    Alert.alert('처음부터 다시 시작', '학습 기록을 모두 지우고 처음부터 다시 시작할까요?', [
      { text: '취소', style: 'cancel', onPress: () => resolve(false) },
      { text: '초기화', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

// Wipes all stored learner data and puts both stores back to their
// brand-new-learner defaults in memory, so the UI reflects the reset
// immediately without a reload.
export async function resetAllProgress(): Promise<void> {
  await learnerRepository.clearAll();
  useLearnerStore.setState({ entries: {}, reviewQueue: [], loaded: true });
  useLevelStore.setState({ currentLevel: 1, placementCompleted: false, loaded: true });
}
