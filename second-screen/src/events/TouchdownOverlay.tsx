import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { EventComponentProps } from './registry';
export default function TouchdownOverlay({ event }: EventComponentProps) {
  // Emoji rain state
  type RainEmoji = {
    id: number;
    symbol: string;
    x: number;
    animatedY: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
  };
  const [rainEmojis, setRainEmojis] = useState<RainEmoji[]>([]);
  const EMOJI_SYMBOLS = ['👏', '🏈', '🏆', '🎉'];
  const RAIN_COUNT = 24;
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Trigger emoji rain on mount (touchdown event)
    const newEmojis: RainEmoji[] = Array.from({ length: RAIN_COUNT }).map((_, i) => {
      const symbol = EMOJI_SYMBOLS[Math.floor(Math.random() * EMOJI_SYMBOLS.length)];
      const x = Math.random() * (width - 40) + 20;
      return {
        id: Date.now() + i + Math.random(),
        symbol,
        x,
        animatedY: new Animated.Value(-60),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
      };
    });
    setRainEmojis(newEmojis);
    // Animate all emojis falling
    newEmojis.forEach((emoji, idx) => {
      Animated.parallel([
        Animated.timing(emoji.animatedY, {
          toValue: height + 60,
          duration: 1800 + Math.random() * 600,
          useNativeDriver: true,
        }),
        Animated.timing(emoji.opacity, {
          toValue: 0,
          duration: 1800 + Math.random() * 600,
          useNativeDriver: true,
        }),
        Animated.spring(emoji.scale, {
          toValue: 1.2 + Math.random() * 0.5,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    });
    // Remove emojis after animation
    const timeout = setTimeout(() => setRainEmojis([]), 2200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.centerContent}>
        <Text style={styles.msg}>TOUCHDOWN! 🏆</Text>
      </View>
      <ConfettiCannon count={120} origin={{x: 0, y: 0}} fadeOut />
      {/* Emoji rain effect */}
      {rainEmojis.map(e => (
        <Animated.Text
          key={e.id}
          style={{
            position: 'absolute',
            left: e.x,
            top: 0,
            fontSize: 40,
            opacity: e.opacity,
            transform: [
              { translateY: e.animatedY },
              { scale: e.scale },
            ],
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
            zIndex: 999,
          }}
        >
          {e.symbol}
        </Animated.Text>
      ))}
    </View>
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
