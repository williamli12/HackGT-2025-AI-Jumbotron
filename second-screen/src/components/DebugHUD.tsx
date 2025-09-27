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
  wrap: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    padding: 8, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    borderRadius: 8,
    minWidth: 180,
    zIndex: 1000,
  },
  line: { color: 'white', marginBottom: 2, fontSize: 12 },
  bold: { fontWeight: '700' },
});
