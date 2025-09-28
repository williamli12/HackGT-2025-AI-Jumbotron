import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import type { EventComponentProps } from './registry';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Team colors like CelebrationOverlay
const TEAM_COLORS = [
  ['#FF6B35', '#F7931E'], // Orange gradient
  ['#FF1744', '#E91E63'], // Red-Pink gradient
  ['#3F51B5', '#2196F3'], // Blue gradient
  ['#4CAF50', '#8BC34A'], // Green gradient
  ['#9C27B0', '#E91E63'], // Purple-Pink gradient
  ['#FF9800', '#FFC107'], // Amber gradient
];

export default function ControversialCallOverlay({ event }: EventComponentProps) {
  const [goodCallCount, setGoodCallCount] = useState(0);
  const [badCallCount, setBadCallCount] = useState(0);
  const [userVote, setUserVote] = useState<'good' | 'bad' | null>(null);
  const [tapCount, setTapCount] = useState(0);
  
  // Animation refs - enhanced with more effects
  const textScale = useRef(new Animated.Value(1)).current;
  const smallShake = useRef(new Animated.Value(0)).current;
  const bigShake = useRef(new Animated.Value(0)).current;
  const backgroundPulse = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  // borderPulse removed - no longer needed
  const splitPosition = useRef(new Animated.Value(50)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;
  const backgroundShimmer = useRef(new Animated.Value(0)).current;
  
  // Dynamic gradient colors
  const [currentGradient, setCurrentGradient] = useState(TEAM_COLORS[0]);

  // Enhanced continuous animations
  useEffect(() => {
    // Background pulse animation
    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Text glow animation - removed (causing JS errors)
    // Icon glow animation - removed (causing JS errors)
    
    // Border pulse animation - removed
    
    // Live dot animation
    const liveDotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Background shimmer
    const shimmerAnimation = Animated.loop(
      Animated.timing(backgroundShimmer, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    
    backgroundAnimation.start();
    liveDotAnimation.start();
    shimmerAnimation.start();
    
    return () => {
      backgroundAnimation.stop();
      liveDotAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  // Vote simulation - increased velocity
  useEffect(() => {
    const simulateVotes = () => {
      if (Math.random() < 0.9) { // Increased chance from 0.7 to 0.9
        const isGoodCall = Math.random() < 0.5;
        const voteCount = Math.floor(Math.random() * 5) + 2; // Increased from 1-3 to 2-6 votes
        
        if (isGoodCall) {
          setGoodCallCount(prev => prev + voteCount);
        } else {
          setBadCallCount(prev => prev + voteCount);
        }
      }
    };

    const interval = setInterval(simulateVotes, 600); // Reduced from 1200ms to 600ms (2x faster)
    return () => clearInterval(interval);
  }, []);

  // Update battle bar when votes change
  useEffect(() => {
    const totalVotes = goodCallCount + badCallCount;
    if (totalVotes > 0) {
      const badPercentage = (badCallCount / totalVotes) * 100;
      
      Animated.spring(splitPosition, {
        toValue: badPercentage,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [goodCallCount, badCallCount]);

  // Text scaling based on tap count
  useEffect(() => {
    const baseScale = 1.0;
    const tapMultiplier = 0.015;
    
    const targetScale = Math.min(
      baseScale + (tapCount * tapMultiplier),
      1.3
    );
    
    Animated.spring(textScale, {
      toValue: targetScale,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [tapCount, textScale]);

  const handleVote = (voteType: 'good' | 'bad') => {
    if (userVote) return;

    setUserVote(voteType);
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    
    // Change gradient occasionally
    if (newTapCount % 3 === 0) {
      const randomGradient = TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
      setCurrentGradient(randomGradient);
    }
    
    // Screen effects
    triggerScreenEffects(newTapCount % 5 === 0);
    
    if (voteType === 'good') {
      setGoodCallCount(prev => prev + 1);
    } else {
      setBadCallCount(prev => prev + 1);
    }
  };

  const triggerScreenEffects = (isSpecial: boolean = false) => {
    if (isSpecial) {
      // Big shake for special moments
      const bigShakeIntensity = 25;
      
      Animated.sequence([
        Animated.timing(bigShake, {
          toValue: bigShakeIntensity,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: -bigShakeIntensity,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: bigShakeIntensity * 0.6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Flash for special moments
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Small shake always happens
    const smallShakeIntensity = 4;
    
    Animated.sequence([
      Animated.timing(smallShake, {
        toValue: smallShakeIntensity,
        duration: 15,
        useNativeDriver: true,
      }),
      Animated.timing(smallShake, {
        toValue: -smallShakeIntensity,
        duration: 15,
        useNativeDriver: true,
      }),
      Animated.timing(smallShake, {
        toValue: 0,
        duration: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const totalVotes = goodCallCount + badCallCount;
  const goodPercentage = totalVotes > 0 ? Math.round((goodCallCount / totalVotes) * 100) : 50;
  const badPercentage = 100 - goodPercentage;

  return (
    <Pressable style={styles.container} onPress={() => {}}>
      {/* Animated gradient background */}
      <Animated.View 
        style={[
          styles.gradientBackground,
          {
            opacity: backgroundPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.7]
            })
          }
        ]}
      >
        <View 
          style={[
            styles.gradient,
            {
              backgroundColor: currentGradient[0],
            }
          ]}
        />
        <View 
          style={[
            styles.gradientOverlay,
            {
              backgroundColor: currentGradient[1],
            }
          ]}
        />
      </Animated.View>
      
      {/* Background shimmer effect */}
      <Animated.View 
        style={[
          styles.shimmerOverlay,
          {
            transform: [{
              translateX: backgroundShimmer.interpolate({
                inputRange: [0, 1],
                outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH]
              })
            }]
          }
        ]}
      />
      
      {/* Battle bar background */}
      <View style={styles.battleBar}>
        <Animated.View 
          style={[
            styles.badSide,
            {
              width: splitPosition.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.goodSide,
            {
              left: splitPosition.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              width: splitPosition.interpolate({
                inputRange: [0, 100],
                outputRange: ['100%', '0%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
        
        {/* Divider line removed */}
      </View>

      {/* Screen shake container */}
      <Animated.View 
        style={[
          styles.shakeContainer,
          {
            transform: [
              { 
                translateX: Animated.add(smallShake, bigShake)
              },
              { 
                translateY: Animated.add(
                  smallShake.interpolate({
                    inputRange: [-10, 10],
                    outputRange: [-3, 3]
                  }),
                  bigShake.interpolate({
                    inputRange: [-25, 25],
                    outputRange: [-12, 12]
                  })
                )
              }
            ]
          }
        ]}
      >
        {/* Border effect removed - was pulsing rectangle */}
        
        {/* Corner decorations removed */}
        
        {/* Main content */}
        <View style={styles.centerContent}>
          <Animated.Text 
            style={[
              styles.celebrationText,
              {
                transform: [{ scale: textScale }],
                color: '#FFFFFF', // White text as requested
              }
            ]}
          >
            WHAT'S THE CALL?
          </Animated.Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
              {badPercentage}%
            </Text>
            <Text style={styles.scoreVs}>VS</Text>
            <Text style={styles.score}>
              {goodPercentage}%
            </Text>
          </View>
          
          {/* Vote indicator removed - using color changes instead */}
        </View>

        {/* Voting areas with enhanced icons */}
        <View style={styles.votingAreas}>
          <Pressable 
            style={styles.leftVote}
            onPress={() => handleVote('bad')}
            disabled={userVote !== null}
          >
            <View style={[
              styles.voteIconContainer,
              userVote === 'bad' && styles.selectedVote
            ]}>
              <Text style={styles.voteIcon}>
                ✕
              </Text>
            </View>
            <Text style={styles.voteText}>BAD</Text>
          </Pressable>

          <Pressable 
            style={styles.rightVote}
            onPress={() => handleVote('good')}
            disabled={userVote !== null}
          >
            <View style={[
              styles.voteIconContainer,
              userVote === 'good' && styles.selectedVote
            ]}>
              <Text style={styles.voteIcon}>
                ✓
              </Text>
            </View>
            <Text style={styles.voteText}>GOOD</Text>
          </Pressable>
        </View>

        {/* Hype meter removed */}
        
        {/* Live indicator at bottom */}
        <View style={styles.liveContainer}>
          <View style={styles.liveIndicator}>
            <Animated.View 
              style={[
                styles.liveDot, 
                { 
                  opacity: liveDotOpacity,
                  backgroundColor: currentGradient[0],
                  shadowColor: currentGradient[0],
                }
              ]} 
            />
            <Text style={styles.liveText}>LIVE • {totalVotes} VOTES</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Flash overlay */}
      <Animated.View 
        style={[
          styles.flashOverlay,
          {
            opacity: flashOpacity,
          }
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  
  // Background effects
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    transform: [{ rotate: '45deg' }, { scale: 1.5 }],
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Battle bar
  battleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badSide: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F44336',
    opacity: 0.6,
  },
  goodSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    opacity: 0.6,
  },
  // Divider line styles removed
  
  // Screen effects
  shakeContainer: {
    flex: 1,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    pointerEvents: 'none',
  },
  
  // Decorative elements removed
  
  // Content
  centerContent: {
    position: 'absolute',
    top: '15%', // Moved from 30% to 15% to be higher up
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  celebrationText: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    lineHeight: 48,
    marginBottom: 20,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Ensure centered
    gap: 15,
    marginTop: 10,
  },
  score: {
    color: '#FFFFFF', // White text for better contrast
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  scoreVs: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  // Vote indicator styles removed - using color changes instead
  
  // Counter styles removed
  
  // Voting areas
  votingAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftVote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10%',
  },
  rightVote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '10%',
  },
  voteIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 14, // Reduced from 20 (30% smaller)
    paddingVertical: 7,    // Reduced from 10 (30% smaller)
    borderRadius: 12,      // Reduced from 15 (20% smaller for proportions)
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedVote: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  voteIcon: {
    fontSize: 90,
    color: '#FFFFFF', // Always white
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
  },
  voteText: {
    color: '#FFFFFF', // Always white
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  
  // Live indicator container and styling
  liveContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center', // Centers the live indicator
    justifyContent: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16, // Horizontal padding to wrap around text
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Reduced opacity from 0.5 to 0.3
    borderRadius: 20, // More rounded for tighter fit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Reduced shadow opacity from 0.3 to 0.2
    shadowRadius: 4,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});