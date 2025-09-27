import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EventComponentProps } from './registry';
import TapOverlay from '../components/TapOverlay';

export default function PenaltyOverlay({ event }: EventComponentProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.msg}>FLAG ON THE PLAY!</Text>
      <Text style={styles.flag}>🚩</Text>
      <Text style={styles.sub}>Home 13 — 0 Away</Text>
      <TapOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  msg: { color: 'white', fontSize: 48, fontWeight: '900', textAlign: 'center' },
  flag: { fontSize: 72, marginVertical: 16 },
  sub: { color: 'white', marginTop: 8, fontSize: 18, opacity: 0.9 },
});
