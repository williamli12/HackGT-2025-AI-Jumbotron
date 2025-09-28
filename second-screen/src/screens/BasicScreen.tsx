import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTimer } from '../store/useTimer';
import { getTeams } from '../services/api';
import EventTestButtons from '../components/EventTestButtons';

function mmss(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${String(m).padStart(2,'0')}:${String(rs).padStart(2,'0')}`;
}

export default function BasicScreen() {
  const { elapsedMs, start, pause, reset, seekTo, isRunning } = useTimer();
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>SECONDARY JUMBOTRON</Text>
      <Text style={styles.clock}>{mmss(elapsedMs)}</Text>
      <Text style={styles.score}>Home 7 — 0 Away</Text>
      <View style={styles.row}>
        <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? pause : start} />
        <Button title="Reset" onPress={reset} />
        <Button title="+10s" onPress={() => seekTo(elapsedMs + 10000)} />
        <Button title="Fetch Teams" onPress={async () => {
          try {
            const teams = await getTeams();
            console.log('Teams length:', teams?.length);
          } catch (e) {
            console.warn('API not running:', String(e));
          }
        }} />
      </View>
      <View style={styles.row}>
        <Button 
          title="🏈 Game Summary" 
          onPress={() => navigation.navigate('GameSummary' as never)} 
        />
      </View>
      <EventTestButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0f1a', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { color: 'white', fontSize: 20, marginBottom: 8, opacity: 0.8 },
  clock: { color: 'white', fontSize: 64, fontWeight: '800' },
  score: { color: 'white', fontSize: 22, marginVertical: 8 },
  row: { flexDirection:'row', gap: 8, marginTop: 12 },
});
