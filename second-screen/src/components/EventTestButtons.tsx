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
