import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import type { EventComponentProps } from './registry';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Particle = {
  id: number;
  x: number;
  y: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  type: 'confetti' | 'star' | 'fire' | 'lightning' | 'trophy';
  color: string;
};

type EnergyBurst = {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
};

type FireworkParticle = {
  id: number;
  x: number;
  y: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
};

const PARTICLE_EMOJIS = {
  confetti: ['🎉', '🎊', '✨', '💥', '🌟', '🎈'],
  star: ['⭐', '🌟', '✨', '💫', '🔥'],
  fire: ['🔥', '💥', '⚡', '🌪️'],
  lightning: ['⚡', '💥', '🌟', '✨'],
  trophy: ['🏆', '🥇', '👑', '💎', '🎯']
};

const FIREWORK_COLORS = [
  '#FF1744', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#FFFFFF', '#FFD700', '#FF69B4', '#00FFFF'
];

const TEAM_COLORS = [
  ['#FF6B35', '#F7931E'], // Orange gradient
  ['#FF1744', '#E91E63'], // Red-Pink gradient
  ['#3F51B5', '#2196F3'], // Blue gradient
  ['#4CAF50', '#8BC34A'], // Green gradient
  ['#9C27B0', '#E91E63'], // Purple-Pink gradient
  ['#FF9800', '#FFC107'], // Amber gradient
];

export default function CelebrationOverlay({ event }: EventComponentProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [energyBursts, setEnergyBursts] = useState<EnergyBurst[]>([]);
  const [fireworkParticles, setFireworkParticles] = useState<FireworkParticle[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [celebrationLevel, setCelebrationLevel] = useState(1);
  const [hasTriggeredLegendaryFireworks, setHasTriggeredLegendaryFireworks] = useState(false);
  const pressableRef = useRef<View>(null);
  
  // Performance optimization refs
  const lastTapTime = useRef(0);
  const maxParticles = useRef(25); // Reduced for spam tapping performance
  const tapThrottle = useRef(50); // Much faster throttle for spam tapping
  
  // Enhanced animation values
  const textScale = useRef(new Animated.Value(1)).current;
  const textGlow = useRef(new Animated.Value(1)).current;
  const smallShake = useRef(new Animated.Value(0)).current; // For regular taps
  const bigShake = useRef(new Animated.Value(0)).current; // For level ups
  const backgroundPulse = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const borderPulse = useRef(new Animated.Value(1)).current;
  
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
    
    // Text glow animation (can't use native driver for textShadowRadius)
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, {
          toValue: 1.5,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(textGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    
    // Border pulse animation
    const borderAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulse, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(borderPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    backgroundAnimation.start();
    glowAnimation.start();
    borderAnimation.start();
    
    return () => {
      backgroundAnimation.stop();
      glowAnimation.stop();
      borderAnimation.stop();
    };
  }, [backgroundPulse, textGlow, borderPulse]);

  // Optimized particle creation system
  const createParticleExplosion = (x: number, y: number) => {
    const now = Date.now();
    
    // Throttle taps to prevent spam
    if (now - lastTapTime.current < tapThrottle.current) {
      return;
    }
    lastTapTime.current = now;
    
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    
    // Update celebration level based on tap count
    const newLevel = Math.min(Math.floor(newTapCount / 10) + 1, 5);
    const leveledUp = newLevel > celebrationLevel;
    setCelebrationLevel(newLevel);
    
    // Change gradient colors based on level
    if (leveledUp) {
      setCurrentGradient(TEAM_COLORS[Math.min(newLevel - 1, TEAM_COLORS.length - 1)]);
      
      // Trigger LEGENDARY fireworks animation when reaching level 5!
      if (newLevel === 5 && !hasTriggeredLegendaryFireworks) {
        setHasTriggeredLegendaryFireworks(true);
        launchLegendaryFireworksShow();
      }
    }
    
    // Create energy burst less frequently during spam tapping
    if (newTapCount % 5 === 0) {
      createEnergyBurst(x, y);
    }
    
    // Reduced particle count for better performance during spam tapping
    const particleCount = Math.min(2 + Math.floor(celebrationLevel / 2), 4);
    
    // Check if we're at particle limit
    if (particles.length >= maxParticles.current) {
      // Remove oldest particles to make room
      setParticles(current => current.slice(-maxParticles.current + particleCount));
    }
    
    // Create particles immediately without staggering for better performance
    for (let i = 0; i < particleCount; i++) {
      createParticle(x, y, newLevel);
    }
    
    // Screen shake - small for taps, big for level ups
    triggerScreenEffects(newLevel, leveledUp);
  };
  
  const createParticle = (centerX: number, centerY: number, level: number) => {
    const animatedY = new Animated.Value(0);
    const animatedX = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(0.8);
    const rotation = new Animated.Value(0);
    
    // Reduced spread for better performance and less chaos
    const spreadRadius = 40 + (level * 15);
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * spreadRadius;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - (80 + level * 15);
    
    // Enhanced particle type selection with more variety
    let particleType: Particle['type'] = 'confetti';
    if (level >= 2 && Math.random() > 0.7) particleType = 'star';
    if (level >= 3 && Math.random() > 0.6) particleType = 'fire';
    if (level >= 4 && Math.random() > 0.5) particleType = 'lightning';
    if (level >= 5 && Math.random() > 0.4) particleType = 'trophy';
    
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: centerX,
      y: centerY,
      animatedY,
      animatedX,
      opacity,
      scale,
      rotation,
      type: particleType,
      color: currentGradient[Math.floor(Math.random() * currentGradient.length)]
    };
    
    setParticles(current => [...current, newParticle]);
    
    // Simplified, faster animation
    const animationDuration = 1500; // Shorter duration for faster cleanup
    
    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: targetY,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: targetX,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.2,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: (Math.random() - 0.5) * 360, // Reduced rotation
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800), // Shorter delay
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Faster cleanup
    setTimeout(() => {
      setParticles(current => current.filter(p => p.id !== newParticle.id));
    }, animationDuration + 100);
  };
  
  const createEnergyBurst = (x: number, y: number) => {
    // Limit energy bursts to prevent performance issues
    if (energyBursts.length >= 3) {
      return;
    }
    
    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(0.6);
    
    const burst: EnergyBurst = {
      id: Date.now() + Math.random(),
      x,
      y,
      scale,
      opacity
    };
    
    setEnergyBursts(current => [...current, burst]);
    
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2, // Reduced scale for better performance
        duration: 400, // Faster animation
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      setEnergyBursts(current => current.filter(b => b.id !== burst.id));
    }, 450);
  };

  // LEGENDARY FIREWORKS ANIMATION SYSTEM! 🎆
  const launchLegendaryFireworksShow = () => {
    // Launch 8 spectacular fireworks with staggered timing
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        launchSingleFirework();
      }, i * 350); // Stagger every 350ms
    }
    
    // Continue launching random fireworks for 4 seconds
    const continuousFireworks = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance
        launchSingleFirework();
      }
    }, 500);
    
    // Stop after 4 seconds
    setTimeout(() => {
      clearInterval(continuousFireworks);
    }, 4000);
  };
  
  const launchSingleFirework = () => {
    // Random explosion position in upper 60% of screen for sky effect
    const explodeX = SCREEN_WIDTH * 0.15 + Math.random() * SCREEN_WIDTH * 0.7;
    const explodeY = SCREEN_HEIGHT * 0.1 + Math.random() * SCREEN_HEIGHT * 0.5;
    
    createFireworkExplosion(explodeX, explodeY);
  };
  
  const createFireworkExplosion = (x: number, y: number) => {
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    
    // Create 18-24 particles in a perfect circle for spectacular effect
    const particleCount = 18 + Math.floor(Math.random() * 7);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 70 + Math.random() * 50; // Larger explosion radius
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      createFireworkParticle(x, y, targetX, targetY, color);
    }
  };
  
  const createFireworkParticle = (centerX: number, centerY: number, targetX: number, targetY: number, color: string) => {
    const animatedY = new Animated.Value(0);
    const animatedX = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(1);
    
    const particle: FireworkParticle = {
      id: Date.now() + Math.random(),
      x: centerX,
      y: centerY,
      animatedY,
      animatedX,
      opacity,
      scale,
      color
    };
    
    setFireworkParticles(current => [...current, particle]);
    
    // Spectacular firework explosion animation
    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: targetY,
        duration: 1200, // Longer duration for more dramatic effect
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: targetX,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 2, // Bigger initial burst
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(500), // Longer visibility
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Cleanup
    setTimeout(() => {
      setFireworkParticles(current => current.filter(p => p.id !== particle.id));
    }, 1300);
  };
  
  const triggerScreenEffects = (level: number, isLevelUp: boolean = false) => {
    if (isLevelUp) {
      // MASSIVE SHAKE for level up - extremely dramatic and noticeable!
      const bigShakeIntensity = Math.min(30 + level * 8, 50); // Much larger shake
      
      // Big shake runs independently and doesn't interfere with small shakes
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
          toValue: bigShakeIntensity * 0.8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: -bigShakeIntensity * 0.8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: bigShakeIntensity * 0.6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: -bigShakeIntensity * 0.6,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: bigShakeIntensity * 0.3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(bigShake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Intense flash for level up
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.6, // Much brighter flash
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
    
    // Small shake ALWAYS happens, even during big shake - runs independently
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

  // Enhanced text scaling based on celebration level
  useEffect(() => {
    const baseScale = 1.0;
    const levelMultiplier = 0.1;
    const tapMultiplier = 0.005;
    
    const targetScale = Math.min(
      baseScale + (celebrationLevel * levelMultiplier) + (tapCount * tapMultiplier),
      2.0
    );
    
    Animated.spring(textScale, {
      toValue: targetScale,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [tapCount, celebrationLevel, textScale]);

  const handleTapForCelebration = (event: any) => {
    const x = event.nativeEvent.pageX || event.nativeEvent.locationX || SCREEN_WIDTH / 2;
    const y = event.nativeEvent.pageY || event.nativeEvent.locationY || SCREEN_HEIGHT / 2;
    
    createParticleExplosion(x, y);
  };
  
  // Get celebration message based on level
  const getCelebrationMessage = () => {
    switch (celebrationLevel) {
      case 1: return "TAP TO GET HYPE! 🔥";
      case 2: return "KEEP IT GOING! ⚡";
      case 3: return "ON FIRE! 🌟";
      case 4: return "UNSTOPPABLE! 💥";
      case 5: return "LEGENDARY! 👑";
      default: return "TAP TO GET HYPE! 🔥";
    }
  };


  return (
    <Pressable 
      ref={pressableRef} 
      style={styles.container} 
      onPress={handleTapForCelebration}
    >
      {/* Animated gradient background */}
      <Animated.View 
        style={[
          styles.gradientBackground,
          {
            opacity: backgroundPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7]
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
      
      {/* Screen shake container - combines both small and big shakes */}
      <Animated.View 
        style={[
          styles.shakeContainer,
          {
            transform: [
              { 
                translateX: Animated.add(
                  smallShake,
                  bigShake
                )
              },
              { 
                translateY: Animated.add(
                  smallShake.interpolate({
                    inputRange: [-10, 10],
                    outputRange: [-3, 3]
                  }),
                  bigShake.interpolate({
                    inputRange: [-50, 50],
                    outputRange: [-25, 25]
                  })
                )
              }
            ]
          }
        ]}
      >
        {/* Pulsing border effect */}
        <Animated.View 
          style={[
            styles.borderEffect,
            {
              transform: [{ scale: borderPulse }],
            }
          ]}
        />
        
        {/* Main content */}
        <View style={styles.centerContent}>
          <Animated.Text 
            style={[
              styles.celebrationText,
              {
                transform: [{ scale: textScale }],
                color: currentGradient[0]
              }
            ]}
          >
            {getCelebrationMessage()}
          </Animated.Text>
          
          {/* Level indicator */}
          <View style={styles.levelContainer}>
            <Text style={[styles.levelText, { color: currentGradient[1] }]}>
              LEVEL {celebrationLevel}
            </Text>
            <View style={styles.levelBar}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.levelDot,
                    {
                      backgroundColor: i < celebrationLevel ? currentGradient[0] : 'rgba(255,255,255,0.3)'
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
        
        {/* Enhanced tap counter */}
        <View style={styles.counterContainer}>
          <Text style={[styles.tapCounter, { color: currentGradient[1] }]}>
            🎉 {tapCount}
          </Text>
          <Text style={styles.counterLabel}>HYPE METER</Text>
        </View>
        
        {/* Energy bursts */}
        {energyBursts.map(burst => (
          <Animated.View
            key={burst.id}
            style={[
              styles.energyBurst,
              {
                left: burst.x - 50,
                top: burst.y - 50,
                transform: [{ scale: burst.scale }],
                opacity: burst.opacity,
              }
            ]}
          />
        ))}
        
        {/* Optimized particles */}
        {particles.slice(0, maxParticles.current).map(particle => {
          // Pre-select emoji to avoid repeated calculations
          const emojiArray = PARTICLE_EMOJIS[particle.type];
          const emoji = emojiArray[Math.floor(particle.id * 1000) % emojiArray.length];
          
          return (
            <Animated.Text
              key={particle.id}
              style={[
                styles.particle,
                {
                  left: particle.x - 24,
                  top: particle.y - 24,
                  transform: [
                    { translateY: particle.animatedY },
                    { translateX: particle.animatedX },
                    { scale: particle.scale },
                    { rotate: particle.rotation.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg']
                    })}
                  ],
                  opacity: particle.opacity
                }
              ]}
            >
              {emoji}
            </Animated.Text>
          );
        })}
        
        {/* LEGENDARY FIREWORKS ANIMATION */}
        {fireworkParticles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.fireworkParticle,
              {
                left: particle.x - 8,
                top: particle.y - 8,
                transform: [
                  { translateY: particle.animatedY },
                  { translateX: particle.animatedX },
                  { scale: particle.scale }
                ],
                opacity: particle.opacity,
                backgroundColor: particle.color
              }
            ]}
          />
        ))}
      </Animated.View>
      
      {/* Flash overlay for intense moments */}
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
    opacity: 0.6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
    transform: [{ rotate: '45deg' }, { scale: 1.5 }],
  },
  
  // Screen effects
  shakeContainer: {
    flex: 1,
  },
  borderEffect: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 4,
    borderRadius: 20,
    borderStyle: 'solid',
    borderColor: '#FF6B35',
    opacity: 0.8,
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
  
  // Content
  centerContent: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  celebrationText: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    lineHeight: 56,
    marginBottom: 20,
  },
  
  // Level system
  levelContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  levelBar: {
    flexDirection: 'row',
    gap: 8,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Counter
  counterContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tapCounter: {
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  
  // Particles and effects
  particle: {
    position: 'absolute',
    fontSize: 36, // Larger size for better impact
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 1000,
  },
  fireworkParticle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1001,
  },
  energyBurst: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 999,
  },
});