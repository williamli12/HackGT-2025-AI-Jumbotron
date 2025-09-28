import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import type { EventComponentProps } from './registry';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Philadelphia Eagles Colors
const EAGLES_COLORS = [
  '#004C54', // Midnight Green
  '#A5ACAF', // Silver
  '#ACC0C6', // Light Silver
  '#000000', // Black
  '#FFFFFF', // White
  '#565A5C', // Charcoal
];

export default function TouchdownOverlay({ event }: EventComponentProps) {
  const [scoreDigits, setScoreDigits] = useState<ScoreDigit[]>([]);
  const [energyRings, setEnergyRings] = useState<EnergyRing[]>([]);
  const [lightBeams, setLightBeams] = useState<LightBeam[]>([]);
  const [geometricShapes, setGeometricShapes] = useState<GeometricShape[]>([]);
  
  // Professional Eagles-themed animation refs
  const scrollingText = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const textGlow = useRef(new Animated.Value(1)).current;
  const backgroundGradient = useRef(new Animated.Value(0)).current;
  const borderPulse = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const screenShake = useRef(new Animated.Value(0)).current;
  const backgroundShimmer = useRef(new Animated.Value(0)).current;
  
  // Creative Eagles-themed animation types
  type EnergyRing = {
    id: number;
    x: number;
    y: number;
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
  };
  
  type LightBeam = {
    id: number;
    x: number;
    y: number;
    width: Animated.Value;
    height: Animated.Value;
    opacity: Animated.Value;
    rotation: number;
  };
  
  type GeometricShape = {
    id: number;
    x: number;
    y: number;
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
    shape: 'triangle' | 'diamond' | 'hexagon';
    color: string;
  };
  
  type ScoreDigit = {
    id: number;
    digit: string;
    x: number;
    y: number;
    animatedY: Animated.Value;
    animatedX: Animated.Value;
    animatedScale: Animated.Value;
    animatedOpacity: Animated.Value;
    animatedRotation: Animated.Value;
    color: string;
  };
  
  // Professional Eagles touchdown sequence on mount
  useEffect(() => {
    launchProfessionalTouchdownSequence();
    
    // Creative continuous animations
    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundGradient, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundGradient, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    
    const shimmerAnimation = Animated.loop(
      Animated.timing(backgroundShimmer, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    );
    
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, {
          toValue: 2.2,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(textGlow, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    
    const borderAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulse, {
          toValue: 1.1, // Reduced pulse distance as requested
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(borderPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    backgroundAnimation.start();
    shimmerAnimation.start();
    glowAnimation.start();
    borderAnimation.start();
    
    return () => {
      backgroundAnimation.stop();
      shimmerAnimation.stop();
      glowAnimation.stop();
      borderAnimation.stop();
    };
  }, []);
  
  const launchProfessionalTouchdownSequence = () => {
    // 1. Professional screen shake and flash
    triggerProfessionalShake();
    
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);
    
    // 2. Scrolling TOUCHDOWN text entrance
    setTimeout(() => {
      launchScrollingTouchdown();
    }, 400);
    
    // 3. Light beams and geometric shapes
    setTimeout(() => {
      createLightBeamShow();
    }, 800);
    
    setTimeout(() => {
      createGeometricShapeShow();
    }, 1000);
    
    // 4. Energy rings
    setTimeout(() => {
      createEnergyRingShow();
    }, 1200);
    
    // 5. Flying footballs
    setTimeout(() => {
      launchFlyingFootballs();
    }, 1400);
    
    // 6. Continuous effects
    setTimeout(() => {
      startContinuousEffects();
    }, 2000);
  };
  
  const launchScrollingTouchdown = () => {
    // Enhanced scrolling TOUCHDOWN text that scrolls then returns centered
    Animated.sequence([
      // Phase 1: Scroll across screen
      Animated.parallel([
        Animated.timing(scrollingText, {
          toValue: SCREEN_WIDTH + 200,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1.1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: Return to center and grow big
      Animated.parallel([
        Animated.spring(scrollingText, {
          toValue: 0, // Center position (text is already centered with textAlign)
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1.5, // Bigger when centered
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Phase 3: Start continuous pulsing after text settles
      startTouchdownTextPulsing();
    });
  };
  
  const startTouchdownTextPulsing = () => {
    // Continuous pulsing animation for the settled TOUCHDOWN text
    const pulsingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(textScale, {
          toValue: 1.6, // Slightly bigger pulse
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1.4, // Back to slightly smaller than max
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulsingAnimation.start();
  };
  
  const createLightBeamShow = () => {
    // Create dramatic light beams
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createLightBeam();
      }, i * 200);
    }
  };
  
  const createLightBeam = () => {
    const width = new Animated.Value(0);
    const height = new Animated.Value(0);
    const opacity = new Animated.Value(0.8);
    
    const beam: LightBeam = {
      id: Date.now() + Math.random(),
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      width,
      height,
      opacity,
      rotation: Math.random() * 360
    };
    
    setLightBeams(current => [...current, beam]);
    
    Animated.parallel([
      Animated.timing(width, {
        toValue: 8,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(height, {
        toValue: SCREEN_HEIGHT * 0.6,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setTimeout(() => {
      setLightBeams(current => current.filter(b => b.id !== beam.id));
    }, 1200);
  };
  
  const createGeometricShapeShow = () => {
    // Create geometric shapes for visual interest
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        createGeometricShape();
      }, i * 150);
    }
  };
  
  const createGeometricShape = () => {
    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(0.7);
    const rotation = new Animated.Value(0);
    
    const shapes: GeometricShape['shape'][] = ['triangle', 'diamond', 'hexagon'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const geometricShape: GeometricShape = {
      id: Date.now() + Math.random(),
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      scale,
      opacity,
      rotation,
      shape,
      color: EAGLES_COLORS[Math.floor(Math.random() * EAGLES_COLORS.length)]
    };
    
    setGeometricShapes(current => [...current, geometricShape]);
    
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 720,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setTimeout(() => {
      setGeometricShapes(current => current.filter(s => s.id !== geometricShape.id));
    }, 1400);
  };
  
  const createEnergyRingShow = () => {
    // Create energy rings
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createEnergyRing();
      }, i * 300);
    }
  };
  
  const createEnergyRing = () => {
    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(0.6);
    const rotation = new Animated.Value(0);
    
    const ring: EnergyRing = {
      id: Date.now() + Math.random(),
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      scale,
      opacity,
      rotation
    };
    
    setEnergyRings(current => [...current, ring]);
    
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 4,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 360,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setTimeout(() => {
      setEnergyRings(current => current.filter(r => r.id !== ring.id));
    }, 1700);
  };
  
  const launchFlyingFootballs = () => {
    // Flying footballs instead of numbers
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        createFlyingFootball();
      }, i * 200);
    }
  };
  
  const createFlyingFootball = () => {
    const animatedY = new Animated.Value(-100);
    const animatedX = new Animated.Value(Math.random() * SCREEN_WIDTH);
    const animatedScale = new Animated.Value(0.3);
    const animatedOpacity = new Animated.Value(1);
    const animatedRotation = new Animated.Value(0);
    
    // All footballs now instead of numbers
    const digit = '🏈';
    
    const scoreDigit: ScoreDigit = {
      id: Date.now() + Math.random(),
      digit,
      x: Math.random() * SCREEN_WIDTH,
      y: -50,
      animatedY,
      animatedX,
      animatedScale,
      animatedOpacity,
      animatedRotation,
      color: EAGLES_COLORS[Math.floor(Math.random() * EAGLES_COLORS.length)]
    };
    
    setScoreDigits(current => [...current, scoreDigit]);
    
    // Dynamic flying animation with curves
    const targetX = Math.random() * SCREEN_WIDTH;
    const targetY = SCREEN_HEIGHT + 100;
    
    Animated.parallel([
      // Curved path
      Animated.timing(animatedY, {
        toValue: targetY,
        duration: 3200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: targetX,
        duration: 3200,
        useNativeDriver: true,
      }),
      // Dynamic scaling
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 1.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 1.2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 0.6,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
      // Spinning rotation
      Animated.timing(animatedRotation, {
        toValue: 1080,
        duration: 3200,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    setTimeout(() => {
      setScoreDigits(current => current.filter(d => d.id !== scoreDigit.id));
    }, 3400);
  };
  
  const startContinuousEffects = () => {
    // Continuous effects to keep screen active
    const continuousInterval = setInterval(() => {
      // Random geometric shapes
      if (Math.random() > 0.7) {
        createGeometricShape();
      }
      
      // Random flying footballs
      if (Math.random() > 0.8) {
        createFlyingFootball();
      }
      
      // Random energy rings
      if (Math.random() > 0.85) {
        createEnergyRing();
      }
    }, 800);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      clearInterval(continuousInterval);
    }, 10000);
  };
  
  const triggerProfessionalShake = () => {
    Animated.sequence([
      Animated.timing(screenShake, {
        toValue: 20,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: -20,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: -15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(screenShake, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Eagles gradient background */}
      <Animated.View 
        style={[
          styles.gradientBackground,
          {
            opacity: backgroundGradient.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1.0]
            })
          }
        ]}
      />
      
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
      
      {/* Enhanced screen shake container */}
      <Animated.View 
        style={[
          styles.shakeContainer,
          {
            transform: [
              { translateX: screenShake },
              { translateY: screenShake.interpolate({
                inputRange: [-20, 20],
                outputRange: [-10, 10]
              })}
            ]
          }
        ]}
      >
        {/* Enhanced border effect */}
        <Animated.View 
          style={[
            styles.borderEffect,
            {
              transform: [{ scale: borderPulse }]
            }
          ]}
        />
        
        {/* Light beams */}
        {lightBeams.map(beam => (
          <Animated.View
            key={beam.id}
            style={[
              styles.lightBeam,
              {
                left: beam.x,
                top: beam.y,
                transform: [
                  { scaleX: beam.width },
                  { scaleY: beam.height },
                  { rotate: `${beam.rotation}deg` }
                ],
                opacity: beam.opacity
              }
            ]}
          />
        ))}
        
        {/* Geometric shapes */}
        {geometricShapes.map(shape => (
          <Animated.View
            key={shape.id}
            style={[
              styles.geometricShape,
              styles[shape.shape],
              {
                left: shape.x - 15,
                top: shape.y - 15,
                backgroundColor: shape.color,
                transform: [
                  { scale: shape.scale },
                  { rotate: shape.rotation.interpolate({
                    inputRange: [0, 720],
                    outputRange: ['0deg', '720deg']
                  })}
                ],
                opacity: shape.opacity
              }
            ]}
          />
        ))}
        
        {/* Energy rings */}
        {energyRings.map(ring => (
          <Animated.View
            key={ring.id}
            style={[
              styles.energyRing,
              {
                left: ring.x - 40,
                top: ring.y - 40,
                transform: [
                  { scale: ring.scale },
                  { rotate: ring.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })}
                ],
                opacity: ring.opacity
              }
            ]}
          />
        ))}
        
        {/* Scrolling TOUCHDOWN text */}
        <Animated.Text 
          style={[
            styles.scrollingTouchdownText,
            {
              transform: [
                { translateX: scrollingText },
                { scale: textScale }
              ]
            }
          ]}
        >
          TOUCHDOWN
        </Animated.Text>
        
        {/* Flying footballs */}
        {scoreDigits.map(digit => (
          <Animated.Text
            key={digit.id}
            style={[
              styles.scoreDigit,
              {
                left: digit.x - 20,
                top: digit.y - 20,
                color: digit.color,
                transform: [
                  { translateY: digit.animatedY },
                  { translateX: digit.animatedX },
                  { scale: digit.animatedScale },
                  { rotate: digit.animatedRotation.interpolate({
                    inputRange: [0, 1080],
                    outputRange: ['0deg', '1080deg']
                  })}
                ],
                opacity: digit.animatedOpacity
              }
            ]}
          >
            {digit.digit}
          </Animated.Text>
        ))}
      </Animated.View>
      
      {/* Enhanced flash overlay */}
      <Animated.View 
        style={[
          styles.flashOverlay,
          {
            opacity: flashOpacity,
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Eagles black
    overflow: 'hidden',
  },
  
  // Enhanced Eagles background
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#004C54', // Eagles midnight green
  },
  
  // Background shimmer effect
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(165, 172, 175, 0.1)', // Subtle silver shimmer
  },
  
  // Enhanced screen effects
  shakeContainer: {
    flex: 1,
  },
  borderEffect: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 8,
    borderRadius: 30,
    borderColor: '#A5ACAF', // Eagles silver
    opacity: 0.95,
    shadowColor: '#A5ACAF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
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
  
  // Creative light beams
  lightBeam: {
    position: 'absolute',
    width: 4,
    height: 100,
    backgroundColor: '#A5ACAF',
    opacity: 0.6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 1000,
  },
  
  // Geometric shapes
  geometricShape: {
    position: 'absolute',
    width: 30,
    height: 30,
    shadowColor: '#A5ACAF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    zIndex: 1001,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  diamond: {
    width: 20,
    height: 20,
    transform: [{ rotate: '45deg' }],
  },
  hexagon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  
  // Energy rings
  energyRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#A5ACAF',
    opacity: 0.7,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    zIndex: 1002,
  },
  
  // Enhanced scrolling TOUCHDOWN text
  scrollingTouchdownText: {
    position: 'absolute',
    top: '38%',
    fontSize: 64, // Reduced from 78 to avoid edge touching
    fontWeight: '900',
    color: '#FFFFFF', // Eagles white
    textShadowColor: '#A5ACAF', // Eagles silver glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25, // Reduced glow to match smaller text
    textTransform: 'uppercase',
    letterSpacing: 8, // Reduced letter spacing
    lineHeight: 70, // Adjusted line height
    textAlign: 'center',
    width: SCREEN_WIDTH, // Full screen width to prevent wrapping
    flexWrap: 'nowrap',
    paddingHorizontal: 20, // Add padding to prevent edge touching
  },
  
  // Enhanced flying footballs
  scoreDigit: {
    position: 'absolute',
    fontSize: 48,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 12,
    zIndex: 1003,
  },
});
