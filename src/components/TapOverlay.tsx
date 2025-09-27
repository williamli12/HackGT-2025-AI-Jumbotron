import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function TapOverlay() {
  const [count, setCount] = useState(0);
  return (
    <Pressable style={styles.fill} onPress={() => setCount(c => c + 1)}>
      <Text style={styles.counter}>👏 {count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  counter: { position: 'absolute', top: 16, right: 16, fontSize: 22, color: 'white', fontWeight: '800' },
});
