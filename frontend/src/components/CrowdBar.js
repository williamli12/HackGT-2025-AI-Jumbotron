import React from 'react';
import { View, StyleSheet } from 'react-native';

const CrowdBar = ({ hype }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${hype}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
});

export default CrowdBar;