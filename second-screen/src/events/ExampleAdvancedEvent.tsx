import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EventComponentProps } from './registry';
import TapOverlay from '../components/TapOverlay';

/**
 * Example of an advanced event that uses payload data
 * This shows how to access custom data passed through the timeline
 */
export default function ExampleAdvancedEvent({ event }: EventComponentProps) {
  // Extract data from event payload
  const playerName = event.payload?.playerName || 'Unknown Player';
  const teamColor = event.payload?.teamColor || '#10182b';
  const yards = event.payload?.yards || 0;

  return (
    <View style={[styles.root, { backgroundColor: teamColor }]}>
      <Text style={styles.msg}>AMAZING PLAY!</Text>
      <Text style={styles.player}>{playerName}</Text>
      {yards > 0 && <Text style={styles.yards}>{yards} yard gain!</Text>}
      <TapOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msg: { color: 'white', fontSize: 48, fontWeight: '900' },
  player: { color: 'white', fontSize: 24, fontWeight: '600', marginTop: 8 },
  yards: { color: 'white', fontSize: 18, opacity: 0.9, marginTop: 4 },
});

/*
To use this event with custom data, add to your timeline:

{
  id: 'amazing-play',
  kind: 'AMAZING_PLAY',
  at: 45,
  durationSec: 4,
  payload: {
    playerName: 'A.J. Brown',
    teamColor: '#004c54', // Eagles green
    yards: 67
  }
}

Then register it:
registerEvent('AMAZING_PLAY', ExampleAdvancedEvent);
*/
