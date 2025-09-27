import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { EventComponentProps } from './registry';

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
};

export default function CelebrationOverlay({ event }: EventComponentProps) {
  const [tapEmojis, setTapEmojis] = useState<FloatingHeart[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const pressableRef = useRef<View>(null);
  
  // Text animation values - using same Animated API as hearts for consistency
  const textScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

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
    
    const newEmoji: FloatingHeart = { 
      id: Date.now() + Math.random(),
      x: x, 
      y: y,
      animatedY,
      animatedX,
      opacity
    };
    
    // Add heart emoji
    setTapEmojis(current => [...current, newEmoji]);
    
    // Start floating animation
    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: -120,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: randomDrift,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Remove emoji after animation
    setTimeout(() => {
      setTapEmojis(current => current.filter(emoji => emoji.id !== newEmoji.id));
    }, 1500);
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
      <Animated.Text 
        style={[
          styles.tapMessageTop,
          {
            transform: [{ scale: textScale }],
            opacity: pulseOpacity
          }
        ]}
      >
        TAP ANYWHERE TO
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.tapMessageBottom,
          {
            transform: [{ scale: textScale }],
            opacity: pulseOpacity
          }
        ]}
      >
        SHOW YOUR SUPPORT!
      </Animated.Text>
      
      {/* Tap counter - replaces TapOverlay */}
      <Text style={styles.tapCounter}>👏 {tapCount}</Text>
      
      {/* Floating heart emojis */}
      {tapEmojis.map(emoji => (
        <Animated.Text
          key={emoji.id}
          style={[
            styles.floatingHeart,
            {
              left: emoji.x - 25,
              top: emoji.y - 25,
              transform: [
                { translateY: emoji.animatedY },
                { translateX: emoji.animatedX }
              ],
              opacity: emoji.opacity
            }
          ]}
        >
          ❤️
        </Animated.Text>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // TAP_FOR_LIKES specific styles
  tapForLikesRoot: { 
    flex: 1, 
    backgroundColor: '#10182b', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  tapMessageTop: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 105, 180, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 15,
  },
  tapMessageBottom: {
    color: '#FF1493',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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