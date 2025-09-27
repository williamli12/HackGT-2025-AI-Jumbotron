import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { useEventTesting } from '../store/useEventTesting';

const EVENT_TESTS = [
  {
    kind: 'TOUCHDOWN',
    label: 'Touchdown',
    payload: undefined
  },
  {
    kind: 'PENALTY',
    label: 'Penalty',
    payload: undefined
  },
  {
    kind: 'TURNOVER',
    label: 'Turnover',
    payload: {
      turnoverType: 'INTERCEPTION',
      team: 'Eagles Defense',
      player: 'Darius Slay'
    }
  },
  {
    kind: 'CELEBRATION',
    label: 'Celebration',
    payload: {
      celebrationType: 'TOUCHDOWN',
      playerName: 'A.J. Brown',
      teamColor: '#004c54',
      homeScore: 21,
      awayScore: 7
    }
  },
  {
    kind: 'CONTROVERSIAL_CALL',
    label: 'Controversial Call',
    payload: {
      callType: 'PASS INTERFERENCE',
      callDescription: 'Defensive Pass Interference',
      team: 'Cowboys',
      gameImpact: 'First down at the 5-yard line'
    }
  },
  {
    kind: 'MVP_VOTE',
    label: 'MVP Vote',
    payload: {
      players: [
        { name: 'J. Daniels', position: 'QB', stats: '285 YDS, 3 TD' },
        { name: 'M. Johnson', position: 'RB', stats: '142 YDS, 2 TD' },
        { name: 'K. Williams', position: 'WR', stats: '8 REC, 127 YDS, 1 TD' }
      ]
    }
  },
  {
    kind: 'TWO_POINT_KICK_POLL',
    label: '2pt vs Kick',
    payload: {
      situation: '4th & Goal - Down by 5',
      timeRemaining: '2:45',
      quarter: 4
    }
  },
  {
    kind: 'STATS_COMPARISON',
    label: 'Stats Dashboard',
    payload: {
      gameStats: {
        totalYards: 387,
        passingYards: 285,
        rushingYards: 102,
        turnovers: 1
      },
      baselineStats: {
        totalYards: 320,
        passingYards: 240,
        rushingYards: 80,
        turnovers: 2
      }
    }
  }
];

export default function EventTestButtons() {
  const { triggerTestEvent, clearTestEvent, isTestMode } = useEventTesting();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Testing</Text>
      <View style={styles.buttonGrid}>
        {EVENT_TESTS.map((test) => (
          <View key={test.kind} style={styles.buttonWrapper}>
            <Button
              title={test.label}
              onPress={() => triggerTestEvent(test.kind, 5, test.payload)}
              color="#4CAF50"
            />
          </View>
        ))}
      </View>
      {isTestMode && (
        <View style={styles.clearButtonWrapper}>
          <Button
            title="Clear Event"
            onPress={clearTestEvent}
            color="#f44336"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonWrapper: {
    minWidth: 120,
    marginBottom: 8,
  },
  clearButtonWrapper: {
    marginTop: 8,
  },
});
