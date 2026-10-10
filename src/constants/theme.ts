/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// A warm, "cute" palette (cream/peach base, coral accent) instead of the
// original cool blue-and-white look — this is a language-learning app meant
// to feel inviting for daily use, not a productivity tool.
export const Colors = {
  light: {
    text: '#4A3F35',
    background: '#FFFBF5',
    backgroundElement: '#FFF1E1',
    backgroundSelected: '#FFDFB8',
    textSecondary: '#8D7A6B',
    primary: '#F2665F',
    primaryText: '#FFFFFF',
    success: '#57B894',
    successBackground: '#E1F5EC',
    warning: '#F2A54A',
    danger: '#E14D4D',
    dangerBackground: '#FBE4E1',
    border: '#F3DDBF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

// Soft pastel hues for varying card backgrounds on screens with several
// distinct sections at once (e.g. the dashboard) — see index.tsx. Kept
// separate from Colors.light since these are for visual variety between
// sibling cards, not a semantic color like "danger" or "success".
export const AccentPalette = ['#FFE3E0', '#FFF1CC', '#E3F3E6', '#E1EEFB', '#F1E4FB'] as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
