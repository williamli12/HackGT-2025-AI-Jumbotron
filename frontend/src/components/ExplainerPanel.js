import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ExplainerPanel = ({ explanation, onClose }) => {
  if (!explanation) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.text}>{explanation.why}</Text>
        <Text style={styles.text}>{explanation.next}</Text>
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
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
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

export default ExplainerPanel;