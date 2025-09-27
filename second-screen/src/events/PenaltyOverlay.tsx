import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EventComponentProps } from './registry';
import TapOverlay from '../components/TapOverlay';

export default function PenaltyOverlay({ event }: EventComponentProps) {
  return (
    <View style={styles.root}>
      <View style={styles.centerContent}>
        <Text style={styles.msg}>PENALTY! 🚩</Text>
      </View>
      <TapOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  centerContent: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: { 
    color: 'white', 
    fontSize: 48, 
    fontWeight: '900', 
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    lineHeight: 56,
  },
});
