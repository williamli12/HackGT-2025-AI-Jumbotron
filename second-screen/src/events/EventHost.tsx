import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getEventComponent } from './registry';
import type { TimelineEvent } from '../types';
import TapOverlay from '../components/TapOverlay';

function GenericOverlay({ event }: { event: TimelineEvent }) {
  return (
    <View style={styles.root}>
      <Text style={styles.msg}>{event.kind || 'BIG MOMENT!'}</Text>
      <Text style={styles.sub}>Home 13 — 0 Away</Text>
      <TapOverlay />
    </View>
  );
}

type Props = {
  event: TimelineEvent;
};

export default function EventHost({ event }: Props) {
  const EventComponent = getEventComponent(event?.kind);
  
  if (!EventComponent) {
    return <GenericOverlay event={event} />;
  }
  
  return <EventComponent event={event} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#10182b', alignItems: 'center', justifyContent: 'center' },
  msg: { color: 'white', fontSize: 48, fontWeight: '900' },
  sub: { color: 'white', marginTop: 8, fontSize: 18, opacity: 0.9 },
});
