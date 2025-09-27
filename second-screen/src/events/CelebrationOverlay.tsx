import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { EventComponentProps } from './registry';

export default function CelebrationOverlay({ event }: EventComponentProps) {
  const [clapCount, setClapCount] = useState(0);
  const [showClapAnimation, setShowClapAnimation] = useState(false);
  const [animatedValue] = useState(new Animated.Value(1));

  // Get celebration message based on event payload or default to touchdown
  const celebrationType = event.payload?.celebrationType || 'TOUCHDOWN';
  const playerName = event.payload?.playerName;
  const teamColor = event.payload?.teamColor || '#28A745'; // Default green

  const getMessage = () => {
    switch (celebrationType) {
      case 'TOUCHDOWN':
        return playerName ? `${playerName} TOUCHDOWN!` : 'TOUCHDOWN!';
      case 'FIELD_GOAL':
        return 'FIELD GOAL!';
      case 'INTERCEPTION':
        return 'INTERCEPTION!';
      case 'SACK':
        return 'SACK!';
      default:
        return 'AMAZING PLAY!';
    }
  };

  const handleTap = () => {
    setClapCount(prev => prev + 1);
    setShowClapAnimation(true);
    
    // Animate the screen pulse
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide clap animation after a short delay
    setTimeout(() => setShowClapAnimation(false), 500);
  };

  // Generate enthusiasm level based on clap count
  const getEnthusiasmLevel = () => {
    if (clapCount >= 20) return { level: 'INCREDIBLE!', color: '#FFD700' };
    if (clapCount >= 15) return { level: 'AMAZING!', color: '#FF6B35' };
    if (clapCount >= 10) return { level: 'FANTASTIC!', color: '#F7931E' };
    if (clapCount >= 5) return { level: 'GREAT!', color: '#4ECDC4' };
    return { level: 'Keep Clapping!', color: '#95E1D3' };
  };

  const enthusiasm = getEnthusiasmLevel();

  return (
    <Pressable style={[styles.container, { backgroundColor: teamColor }]} onPress={handleTap}>
      <Animated.View style={[styles.content, { transform: [{ scale: animatedValue }] }]}>
        {/* Confetti for touchdown celebrations */}
        {celebrationType === 'TOUCHDOWN' && (
          <ConfettiCannon 
            count={150} 
            origin={{x: 0, y: 0}} 
            fadeOut 
            explosionSpeed={350}
            fallSpeed={2000}
          />
        )}

        {/* Main celebration message */}
        <Text style={styles.mainMessage}>{getMessage()}</Text>

        {/* Clap counter and encouragement */}
        <View style={styles.clapSection}>
          <Text style={styles.clapPrompt}>👏 TAP TO CELEBRATE! 👏</Text>
          <Text style={styles.clapCounter}>{clapCount} CLAPS</Text>
          <Text style={[styles.enthusiasmLevel, { color: enthusiasm.color }]}>
            {enthusiasm.level}
          </Text>
        </View>

        {/* Animated clap feedback */}
        {showClapAnimation && (
          <View style={styles.clapAnimation}>
            <Text style={styles.clapEmoji}>👏</Text>
            <Text style={styles.clapText}>+1</Text>
          </View>
        )}

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((clapCount / 20) * 100, 100)}%`,
                  backgroundColor: enthusiasm.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {clapCount >= 20 ? 'MAX HYPE!' : `${20 - clapCount} more for MAX HYPE!`}
          </Text>
        </View>

        {/* Score display */}
        <Text style={styles.scoreDisplay}>
          {event.payload?.homeScore || '14'} — {event.payload?.awayScore || '7'}
        </Text>

        {/* Tap instruction */}
        <Text style={styles.tapInstruction}>
          Tap anywhere to show your excitement! 🎉
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  mainMessage: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  clapSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  clapPrompt: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  clapCounter: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  enthusiasmLevel: {
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  clapAnimation: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
  },
  clapEmoji: {
    fontSize: 60,
    opacity: 0.8,
  },
  clapText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  scoreDisplay: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tapInstruction: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
