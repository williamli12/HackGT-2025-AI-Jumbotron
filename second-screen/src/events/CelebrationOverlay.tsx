import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { EventComponentProps } from './registry';

type FloatingEmoji = {
  id: number;
  symbol: string;
  x: number;
  y: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  animatedScale?: Animated.Value;
  animatedRotate?: Animated.Value;
  opacity: Animated.Value;
};

const MAX_CONCURRENT_EMOJIS = 30;

export default function CelebrationOverlay({ event }: EventComponentProps) {
  const [tapEmojis, setTapEmojis] = useState<FloatingEmoji[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const pressableRef = useRef<View>(null);
  
  // Text animation values - using same Animated API as hearts for consistency
  const textScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const popScale = useRef(new Animated.Value(1)).current; // small pop on tap
  const confettiRef = useRef<any>(null);

  

  // Start continuous pulsing animation
  useEffect(() => {
    // Continuous subtle pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, [pulseOpacity]);

  const addHeartAtPosition = (x: number, y: number) => {
    console.log('Adding heart at:', x, y);
    
    // Increment counter
    setTapCount(current => current + 1);
    
    // Create animated values for floating effect
    const animatedY = new Animated.Value(0);
    const animatedX = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    
    // Random horizontal drift (-20 to +20 pixels)
    const randomDrift = (Math.random() - 0.5) * 40;
    
    // Decide randomly whether to spawn a heart or a fire emoji
    const chosenSymbol = Math.random() < 0.5 ? '❤️' : '🔥';

    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      symbol: chosenSymbol,
      x: x,
      y: y,
      animatedY: new Animated.Value(0),
      animatedX: new Animated.Value(0),
      animatedScale: new Animated.Value(0.8),
      animatedRotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };

    // Add the new emoji, but cap total count to avoid buildup
    setTapEmojis(current => {
      const combined = [...current, newEmoji];
      if (combined.length <= MAX_CONCURRENT_EMOJIS) return combined;
      // keep the most recent emojis
      return combined.slice(combined.length - MAX_CONCURRENT_EMOJIS);
    });

    // Start floating animation for the emoji
    {
      const e = newEmoji;
      const drift = (Math.random() - 0.5) * 40;
      Animated.parallel([
        Animated.timing(e.animatedY, {
          toValue: -140,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(e.animatedX, {
          toValue: drift,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(e.opacity, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.spring(e.animatedScale as Animated.Value, {
          toValue: 1.25,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(e.animatedRotate as Animated.Value, {
          toValue: (Math.random() - 0.5) * 2,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]).start();
      // Remove after animation
      setTimeout(() => {
        setTapEmojis(current => current.filter(emoji => emoji.id !== e.id));
      }, 1600);
    }

    // Pop the central text briefly
    Animated.sequence([
      Animated.timing(popScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(popScale, { toValue: 1.0, friction: 6, useNativeDriver: true }),
    ]).start();

    // Fire a confetti blast every 8 taps (if confetti available)
    if ((tapCount + 1) % 8 === 0 && confettiRef.current) {
      try {
        confettiRef.current.start();
      } catch (_) {
        // ignore if confettiRef not ready
      }
    }
  };

  // Gradually grow text based on tap count - cumulative effect
  useEffect(() => {
    // Calculate target scale based on tap count
    // Starts at 1.0, grows to 1.25 (125%) at 20+ taps
    const targetScale = Math.min(1.0 + (tapCount * 0.0125), 1.25);
    
    console.log('Tap count:', tapCount, 'Target scale:', targetScale);
    
    // Smooth transition to new scale
    Animated.spring(textScale, {
      toValue: targetScale,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [tapCount, textScale]);

  const handleTapForLikes = (event: any) => {
    // Use pageX/pageY for absolute screen coordinates, fallback to locationX/locationY
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || 0;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || 0;
    
    console.log('Tap coordinates:', x, y);
    
    addHeartAtPosition(x, y);
  };

  return (
    <Pressable ref={pressableRef} style={styles.tapForLikesRoot} onPress={handleTapForLikes}>
      {/* Beautiful centered text */}
      <View style={styles.centerContent}>
          <Animated.Text
            style={[
              styles.tapMessage,
              {
                transform: [{ scale: Animated.multiply(textScale, popScale) }],
                opacity: pulseOpacity,
              }
            ]}
          >
            TAP TO GET HYPE! 🔥
          </Animated.Text>
      </View>
      
  {/* Tap counter - replaces TapOverlay */}
  <Text style={styles.tapCounter}>👏 {tapCount}</Text>
      
      {/* Floating emojis (heart + fire) */}
      {tapEmojis.map((emoji: FloatingEmoji) => {
        const rotate = emoji.animatedRotate
          ? emoji.animatedRotate.interpolate({ inputRange: [-3, 3], outputRange: ['-180deg', '180deg'] })
          : '0deg';
        const scale = emoji.animatedScale ? emoji.animatedScale : new Animated.Value(1);
        return (
          <Animated.Text
            key={emoji.id}
            style={[
              styles.floatingHeart,
              {
                left: emoji.x - 25,
                top: emoji.y - 25,
                transform: [
                  { translateY: emoji.animatedY },
                  { translateX: emoji.animatedX },
                  { scale: scale },
                  { rotate }
                ],
                opacity: emoji.opacity
              }
            ]}
          >
            {emoji.symbol}
          </Animated.Text>
        );
      })}

      {/* Confetti cannon - hidden by default, triggered via ref */}
      <ConfettiCannon
        count={50}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        ref={confettiRef}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // TAP_FOR_LIKES specific styles
  tapForLikesRoot: { 
    flex: 1, 
    backgroundColor: '#10182b',
  },
  centerContent: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapMessage: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    lineHeight: 50,
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 999,
  },
  tapCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 22,
    color: 'white',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  }
});