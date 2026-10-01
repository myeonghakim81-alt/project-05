import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

// Always the light navigation theme — see hooks/use-theme.ts for why this
// app doesn't follow the device's dark mode setting.
export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="lesson" />
        <Stack.Screen name="placement-test" />
        <Stack.Screen name="level-study" />
        <Stack.Screen name="review" />
      </Stack>
    </ThemeProvider>
  );
}
