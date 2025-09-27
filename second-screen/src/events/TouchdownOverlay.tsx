import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { EventComponentProps } from './registry';
import TapOverlay from '../components/TapOverlay';

export default function TouchdownOverlay({ event }: EventComponentProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.msg}>TOUCHDOWN!</Text>
      <ConfettiCannon count={120} origin={{x: 0, y: 0}} fadeOut />
      <Text style={styles.sub}>Home 13 — 0 Away</Text>
      <TapOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#10182b', alignItems: 'center', justifyContent: 'center' },
  msg: { color: 'white', fontSize: 48, fontWeight: '900' },
  sub: { color: 'white', marginTop: 8, fontSize: 18, opacity: 0.9 },
});
