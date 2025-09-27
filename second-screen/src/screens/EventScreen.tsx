import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import TapOverlay from '../components/TapOverlay';

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
};

type FloatingEmoji = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
};

export default function EventScreen({ kind = 'TOUCHDOWN' as 'TOUCHDOWN'|'PENALTY'|'TURNOVER'|'GENERIC'|'TAP_FOR_LIKES'|'LIKE_BATTLE' }) {
  const [tapEmojis, setTapEmojis] = useState<FloatingHeart[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const pressableRef = useRef<View>(null);
  const lastTapTime = useRef<number>(0);
  
  // Like Battle state
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [battleEmojis, setBattleEmojis] = useState<FloatingEmoji[]>([]);
  
  // Text animation values - using same Animated API as hearts for consistency
  const textScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  
  // Like Battle animation values
  const dislikeBgWidth = useRef(new Animated.Value(50)).current; // Start at 50% width

  // Start continuous pulsing animation when TAP_FOR_LIKES is active
  useEffect(() => {
    if (kind === 'TAP_FOR_LIKES') {
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
    }
  }, [kind, pulseOpacity]);

  // Animate dislike background growing effect
  useEffect(() => {
    if (kind === 'LIKE_BATTLE') {
      const total = likeCount + dislikeCount;
      if (total > 0) {
        const dislikePercentage = Math.max(20, Math.min(80, (dislikeCount / total) * 100));
        
        console.log('Battle stats - Likes:', likeCount, 'Dislikes:', dislikeCount, 'Dislike %:', dislikePercentage);
        
        Animated.spring(dislikeBgWidth, {
          toValue: dislikePercentage,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  }, [likeCount, dislikeCount, kind, dislikeBgWidth]);

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

  const addBattleEmoji = useCallback((x: number, y: number, emoji: string, isDislike: boolean) => {
    console.log('Adding battle emoji:', emoji, 'at:', x, y);
    
    // Increment appropriate counter
    if (isDislike) {
      setDislikeCount(current => current + 1);
    } else {
      setLikeCount(current => current + 1);
    }
    
    // Create animated values for floating effect
    const animatedY = new Animated.Value(0);
    const animatedX = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    
    // Random horizontal drift
    const randomDrift = (Math.random() - 0.5) * 30;
    
    const newEmoji: FloatingEmoji = { 
      id: Date.now() + Math.random(),
      x: x, 
      y: y,
      emoji,
      animatedY,
      animatedX,
      opacity
    };
    
    // Add battle emoji
    setBattleEmojis(current => [...current, newEmoji]);
    
    // Start floating animation
    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: -100,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: randomDrift,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Remove emoji after animation
    setTimeout(() => {
      setBattleEmojis(current => current.filter(emoji => emoji.id !== newEmoji.id));
    }, 1200);
  }, []);

  // Simulate likes and dislikes over time - dislikes win by the end
  useEffect(() => {
    if (kind === 'LIKE_BATTLE') {
      const simulationIntervals: NodeJS.Timeout[] = [];
      
      // Schedule likes and dislikes over 7 seconds
      const scheduleSimulation = () => {
        // Likes schedule (slower, fewer) - total: ~8 likes
        const likeSchedule = [500, 1200, 2100, 2800, 3900, 4600, 5800, 6400];
        
        // Dislikes schedule (faster, more frequent) - total: ~15 dislikes  
        const dislikeSchedule = [300, 800, 1000, 1500, 1800, 2200, 2600, 3100, 3400, 3700, 4200, 4800, 5200, 5600, 6200];
        
        // Schedule likes
        likeSchedule.forEach(delay => {
          const timeout = setTimeout(() => {
            // Random position on right side for likes
            const x = Math.random() * 150 + 250; // Right side of screen
            const y = Math.random() * 400 + 200;
            addBattleEmoji(x, y, '👍', false);
          }, delay);
          simulationIntervals.push(timeout);
        });
        
        // Schedule dislikes (more frequent)
        dislikeSchedule.forEach(delay => {
          const timeout = setTimeout(() => {
            // Random position on left side for dislikes
            const x = Math.random() * 150 + 50; // Left side of screen
            const y = Math.random() * 400 + 200;
            addBattleEmoji(x, y, '👎', true);
          }, delay);
          simulationIntervals.push(timeout);
        });
      };
      
      // Start simulation after a brief delay
      const startTimeout = setTimeout(scheduleSimulation, 500);
      simulationIntervals.push(startTimeout);
      
      // Cleanup function
      return () => {
        simulationIntervals.forEach(interval => clearTimeout(interval));
      };
    }
  }, [kind, addBattleEmoji]);

  // Gradually grow text based on tap count - cumulative effect
  useEffect(() => {
    if (kind === 'TAP_FOR_LIKES') {
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
    }
  }, [tapCount, textScale, kind]);
  
  // Reset scale when switching away from TAP_FOR_LIKES
  useEffect(() => {
    if (kind !== 'TAP_FOR_LIKES') {
      textScale.setValue(1);
      setTapCount(0);
      setTapEmojis([]);
    }
    if (kind !== 'LIKE_BATTLE') {
      // Reset battle state
      setLikeCount(0);
      setDislikeCount(0);
      setBattleEmojis([]);
      dislikeBgWidth.setValue(50);
    }
  }, [kind, textScale, dislikeBgWidth]);

  const handleTapForLikes = (event: any) => {
    // Use pageX/pageY for absolute screen coordinates, fallback to locationX/locationY
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || 0;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || 0;
    
    console.log('Tap coordinates:', x, y);
    
    addHeartAtPosition(x, y);
  };

  const handleLikePress = (event: any) => {
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || 0;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || 0;
    addBattleEmoji(x, y, '👍', false);
  };

  const handleDislikePress = (event: any) => {
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || 0;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || 0;
    addBattleEmoji(x, y, '👎', true);
  };

  const message = kind === 'TOUCHDOWN' ? 'TOUCHDOWN!' :
                  kind === 'PENALTY'   ? 'FLAG ON THE PLAY!' :
                  kind === 'TURNOVER'  ? 'TURNOVER!' :
                  kind === 'TAP_FOR_LIKES' ? 'TAP TO SHOW SUPPORT!' :
                  kind === 'LIKE_BATTLE' ? 'LIKE BATTLE!' :
                  'BIG MOMENT!';

  if (kind === 'TAP_FOR_LIKES') {
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

  if (kind === 'LIKE_BATTLE') {
    return (
      <View style={styles.battleRoot}>
        {/* Animated background that grows with dislikes */}
        <Animated.View 
          style={[
            styles.dislikeBackground,
            {
              width: dislikeBgWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
        
        {/* Left side - Dislikes */}
        <Pressable style={styles.battleSide} onPress={handleDislikePress}>
          <Text style={styles.battleEmoji}>👎</Text>
          <Text style={styles.battleLabel}>DISLIKE</Text>
          <Text style={styles.battleCount}>{dislikeCount}</Text>
        </Pressable>
        
        {/* Right side - Likes */}
        <Pressable style={styles.battleSide} onPress={handleLikePress}>
          <Text style={styles.battleEmoji}>👍</Text>
          <Text style={styles.battleLabel}>LIKE</Text>
          <Text style={styles.battleCount}>{likeCount}</Text>
        </Pressable>
        
        {/* Floating battle emojis */}
        {battleEmojis.map(emoji => (
          <Animated.Text
            key={emoji.id}
            style={[
              styles.floatingBattleEmoji,
              {
                left: emoji.x - 20,
                top: emoji.y - 20,
                transform: [
                  { translateY: emoji.animatedY },
                  { translateX: emoji.animatedX }
                ],
                opacity: emoji.opacity
              }
            ]}
          >
            {emoji.emoji}
          </Animated.Text>
        ))}
      </View>
    );
  }

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
    textShadowRadius: 3
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
  },
  
  // LIKE_BATTLE specific styles
  battleRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10182b',
  },
  dislikeBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 53, 69, 0.4)', // Red background for dislikes
    zIndex: 1,
  },
  battleSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  battleEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  battleLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  battleCount: {
    color: 'white',
    fontSize: 48,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  floatingBattleEmoji: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 3,
  },
});