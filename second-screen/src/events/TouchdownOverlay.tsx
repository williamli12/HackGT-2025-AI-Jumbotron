import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { EventComponentProps } from './registry';
export default function TouchdownOverlay({ event }: EventComponentProps) {
  // Floating clap emoji state
  type FloatingEmoji = {
    id: number;
    x: number;
    y: number;
    animatedY: Animated.Value;
    animatedX: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
  };
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const MAX_EMOJIS = 30;

  const handleTap = (event: any) => {
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || 0;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || 0;
    const id = Date.now() + Math.random();
    const emoji: FloatingEmoji = {
      id,
      x,
      y,
      animatedY: new Animated.Value(0),
      animatedX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0.8),
    };
    setEmojis(current => {
      const next = [...current, emoji];
      return next.length <= MAX_EMOJIS ? next : next.slice(next.length - MAX_EMOJIS);
    });
    // Animate
    const drift = (Math.random() - 0.5) * 40;
    Animated.parallel([
      Animated.timing(emoji.animatedY, {
        toValue: -140,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.timing(emoji.animatedX, {
        toValue: drift,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.timing(emoji.opacity, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.spring(emoji.scale, {
        toValue: 1.25,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      setEmojis(current => current.filter(e => e.id !== id));
    }, 1600);
  };

  return (
    <Pressable style={styles.root} onPress={handleTap}>
      <View style={styles.centerContent}>
        <Text style={styles.msg}>TOUCHDOWN! 🏆</Text>
      </View>
      <ConfettiCannon count={120} origin={{x: 0, y: 0}} fadeOut />
      {/* Floating clap emojis */}
      {emojis.map(e => (
        <Animated.Text
          key={e.id}
          style={{
            position: 'absolute',
            left: e.x - 25,
            top: e.y - 25,
            fontSize: 40,
            opacity: e.opacity,
            transform: [
              { translateY: e.animatedY },
              { translateX: e.animatedX },
              { scale: e.scale },
            ],
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
            zIndex: 999,
          }}
        >
          {'👏'}
        </Animated.Text>
      ))}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#10182b', alignItems: 'center', justifyContent: 'center' },
  centerContent: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  msg: { 
    color: '#FFD700', 
    fontSize: 48, 
    fontWeight: '900', 
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    lineHeight: 56,
  },
});
