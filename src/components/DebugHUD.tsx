import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  mode: string;
  elapsedSec: number;
  clipLabel?: string | null;
  nextEventAt?: number | null;
  nextEventKind?: string | null;
};

export default function DebugHUD({ mode, elapsedSec, clipLabel, nextEventAt, nextEventKind }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>Mode: <Text style={styles.bold}>{mode}</Text></Text>
      <Text style={styles.line}>Elapsed: {elapsedSec}s</Text>
      <Text style={styles.line}>Clip: {clipLabel ?? '—'}</Text>
      <Text style={styles.line}>Next: {nextEventAt != null ? `${nextEventAt}s (${nextEventKind})` : '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 16, left: 16, right: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12 },
  line: { color: 'white', marginBottom: 4 },
  bold: { fontWeight: '700' },
});
