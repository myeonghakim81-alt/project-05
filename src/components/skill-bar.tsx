import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function SkillBar({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  const barColor = value >= 70 ? theme.success : value >= 45 ? theme.warning : theme.danger;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <ThemedText type="small">{label}</ThemedText>
        <ThemedText type="smallBold">{value}</ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: 'rgba(74,63,53,0.12)' }]}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
