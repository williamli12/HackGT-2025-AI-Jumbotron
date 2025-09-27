import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Banner = ({ banner, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(banner)}
    >
      <Text style={styles.text}>{banner.text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Banner;