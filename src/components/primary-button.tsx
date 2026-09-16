import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const background =
    variant === 'success' ? theme.successBackground : variant === 'danger' ? theme.dangerBackground : isPrimary ? theme.primary : theme.backgroundElement;
  const textColor = variant === 'success' ? 'success' : variant === 'danger' ? 'danger' : isPrimary ? 'primaryText' : 'text';
  const borderColor = variant === 'success' ? theme.success : variant === 'danger' ? theme.danger : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          borderWidth: borderColor === 'transparent' ? 0 : 2,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText type="smallBold" themeColor={textColor}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
