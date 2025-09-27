import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import TapOverlay from '../components/TapOverlay';

export default function EventScreen({ kind = 'TOUCHDOWN' as 'TOUCHDOWN'|'PENALTY'|'TURNOVER'|'GENERIC' }) {
  const message = kind === 'TOUCHDOWN' ? 'TOUCHDOWN!' :
                  kind === 'PENALTY'   ? 'FLAG ON THE PLAY!' :
                  kind === 'TURNOVER'  ? 'TURNOVER!' : 'BIG MOMENT!';

  return (
    <View style={styles.root}>
      <Text style={styles.msg}>{message}</Text>
      {kind === 'TOUCHDOWN' && <ConfettiCannon count={100} origin={{x: 0, y: 0}} fadeOut />}
      <Text style={styles.sub}>Home 13 — 0 Away</Text>
      <TapOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:'#10182b', alignItems:'center', justifyContent:'center' },
  msg: { color:'white', fontSize:48, fontWeight:'900' },
  sub: { color:'white', marginTop:8, fontSize:18, opacity:0.9 },
});
