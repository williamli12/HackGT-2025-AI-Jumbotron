import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RecapPanel = ({ recap, onClose }) => {
  if (!recap) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>Game Recap</Text>
        
        <View style={styles.statContainer}>
          <Text style={styles.label}>Biggest Run</Text>
          <Text style={styles.value}>
            {recap.biggest_run.team} +{recap.biggest_run.delta}
          </Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.label}>Lead Changes</Text>
          <Text style={styles.value}>{recap.lead_changes}</Text>
        </View>

        <View style={styles.statContainer}>
          <Text style={styles.label}>Fastest Burst</Text>
          <Text style={styles.value}>{recap.fastest_burst}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RecapPanel;