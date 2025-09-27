import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { EventComponentProps } from './registry';

type PollOption = {
  id: 'twoPt' | 'kick';
  title: string;
  description: string;
  icon: string;
  votes: number;
  successRate: string;
};

export default function TwoPointKickPollOverlay({ event }: EventComponentProps) {
  const [userVote, setUserVote] = useState<'twoPt' | 'kick' | null>(null);
  const [options, setOptions] = useState<PollOption[]>([
    { 
      id: 'twoPt', 
      title: 'GO FOR 2', 
      description: 'Two-Point Conversion', 
      icon: '💪', 
      votes: 0, 
      successRate: '47%' 
    },
    { 
      id: 'kick', 
      title: 'KICK IT', 
      description: 'Extra Point Kick', 
      icon: '🦵', 
      votes: 0, 
      successRate: '94%' 
    }
  ]);
  
  // Animated values for split screen
  const splitPosition = useRef(new Animated.Value(50)).current; // Start at 50% (center)
  const twoPtScale = useRef(new Animated.Value(1)).current;
  const kickScale = useRef(new Animated.Value(1)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate entry
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate live dot
  useEffect(() => {
    const animateDot = () => {
      Animated.sequence([
        Animated.timing(liveDotOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(liveDotOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(() => animateDot());
    };
    animateDot();
  }, []);

  // Simulate other users voting
  useEffect(() => {
    const simulateVotes = () => {
      if (Math.random() < 0.85) { // 85% chance every interval
        const isKickVote = Math.random() < 0.6; // Slightly favor kick (more conservative)
        const voteCount = Math.floor(Math.random() * 7) + 2; // 2-8 votes
        
        setOptions(prev => prev.map(option => 
          option.id === (isKickVote ? 'kick' : 'twoPt')
            ? { ...option, votes: option.votes + voteCount }
            : option
        ));
      }
    };

    const interval = setInterval(simulateVotes, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update split animation when votes change
  useEffect(() => {
    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
    if (totalVotes > 0) {
      const twoPtPercentage = (options[0].votes / totalVotes) * 100;
      
      Animated.spring(splitPosition, {
        toValue: twoPtPercentage,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [options]);

  const handleVote = (optionId: 'twoPt' | 'kick') => {
    if (userVote) return;

    setUserVote(optionId);
    
    setOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, votes: option.votes + 1 }
        : option
    ));

    // Scale animation
    const scaleAnim = optionId === 'twoPt' ? twoPtScale : kickScale;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  const twoPtPercentage = totalVotes > 0 ? Math.round((options[0].votes / totalVotes) * 100) : 50;
  const kickPercentage = 100 - twoPtPercentage;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WHAT'S THE CALL? 🏈</Text>
        <Text style={styles.subtitle}>4th & Goal - Down by 5</Text>
      </View>

      {/* Voting Options */}
      <View style={styles.votingArea}>
        {/* Two Point Option */}
        <Pressable 
          style={[
            styles.optionContainer,
            userVote === 'twoPt' && styles.votedOption
          ]}
          onPress={() => handleVote('twoPt')}
          disabled={userVote !== null}
        >
          <Animated.View 
            style={[
              styles.optionContent,
              { transform: [{ scale: twoPtScale }] }
            ]}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionIcon}>{options[0].icon}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{options[0].title}</Text>
                <Text style={styles.optionDescription}>{options[0].description}</Text>
                <Text style={styles.successRate}>Success Rate: {options[0].successRate}</Text>
              </View>
              <View style={styles.voteStats}>
                <Text style={styles.voteCount}>{options[0].votes}</Text>
                <Text style={styles.votePercentage}>{twoPtPercentage}%</Text>
              </View>
            </View>
            
            {/* Growing Bar */}
            <View style={styles.barContainer}>
              <Animated.View 
                style={[
                  styles.voteBar,
                  styles.twoPtBar,
                  {
                    width: splitPosition.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', `${twoPtPercentage}%`],
                      extrapolate: 'clamp',
                    }),
                  }
                ]} 
              />
            </View>
            
            {userVote === 'twoPt' && (
              <View style={styles.votedBadge}>
                <Text style={styles.votedText}>YOUR VOTE ✓</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>

        {/* Kick Option */}
        <Pressable 
          style={[
            styles.optionContainer,
            userVote === 'kick' && styles.votedOption
          ]}
          onPress={() => handleVote('kick')}
          disabled={userVote !== null}
        >
          <Animated.View 
            style={[
              styles.optionContent,
              { transform: [{ scale: kickScale }] }
            ]}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionIcon}>{options[1].icon}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{options[1].title}</Text>
                <Text style={styles.optionDescription}>{options[1].description}</Text>
                <Text style={styles.successRate}>Success Rate: {options[1].successRate}</Text>
              </View>
              <View style={styles.voteStats}>
                <Text style={styles.voteCount}>{options[1].votes}</Text>
                <Text style={styles.votePercentage}>{kickPercentage}%</Text>
              </View>
            </View>
            
            {/* Growing Bar */}
            <View style={styles.barContainer}>
              <Animated.View 
                style={[
                  styles.voteBar,
                  styles.kickBar,
                  {
                    width: splitPosition.interpolate({
                      inputRange: [0, 100],
                      outputRange: [`${kickPercentage}%`, '0%'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]} 
              />
            </View>
            
            {userVote === 'kick' && (
              <View style={styles.votedBadge}>
                <Text style={styles.votedText}>YOUR VOTE ✓</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>

      {/* User feedback */}
      {userVote && (
        <View style={styles.userFeedback}>
          <Text style={styles.thankYou}>
            You voted {userVote === 'twoPt' ? 'GO FOR 2!' : 'KICK IT!'} 
            {userVote === 'twoPt' ? ' 💪' : ' 🦵'}
          </Text>
          <Text style={styles.liveVoting}>See what others think...</Text>
        </View>
      )}

      {/* Live indicator */}
      <View style={styles.liveIndicator}>
        <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
        <Text style={styles.liveText}>LIVE POLL • {totalVotes} coaches voting</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  votingArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  optionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  votedOption: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  optionContent: {
    position: 'relative',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 40,
    marginRight: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  successRate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  voteStats: {
    alignItems: 'center',
    minWidth: 60,
  },
  voteCount: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  votePercentage: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  voteBar: {
    height: '100%',
    borderRadius: 6,
  },
  twoPtBar: {
    backgroundColor: '#8E44AD',
  },
  kickBar: {
    backgroundColor: '#27AE60',
  },
  votedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76,175,80,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  votedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  userFeedback: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thankYou: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  liveVoting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginRight: 8,
  },
  liveText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
