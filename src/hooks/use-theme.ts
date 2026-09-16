import { Colors } from '@/constants/theme';

// This is a language-learning app for a fixed, friendly bright look, so it
// always uses the light palette regardless of the device/browser's dark
// mode setting (see constants/theme.ts for the actual colors).
export function useTheme() {
  return Colors.light;
}
