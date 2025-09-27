import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { EventComponentProps } from './registry';

type FloatingEmoji = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  opacity: Animated.Value;
};

export default function TurnoverOverlay({ event }: EventComponentProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [battleEmojis, setBattleEmojis] = useState<FloatingEmoji[]>([]);
  
  // Animation values for the background split
  const dislikeBgWidth = useRef(new Animated.Value(50)).current; // Start at 50% width

  // Get turnover details from payload
  const turnoverType = event.payload?.turnoverType || 'INTERCEPTION';
  const team = event.payload?.team || 'Defense';

  const getTurnoverMessage = () => {
    switch (turnoverType) {
      case 'INTERCEPTION':
        return 'INTERCEPTION!';
      case 'FUMBLE':
        return 'FUMBLE RECOVERY!';
      case 'TURNOVER_ON_DOWNS':
        return 'TURNOVER ON DOWNS!';
      default:
        return 'TURNOVER!';
    }
  };

  // Animate background split effect
  useEffect(() => {
    const total = likeCount + dislikeCount;
    if (total > 0) {
      const dislikePercentage = Math.max(20, Math.min(80, (dislikeCount / total) * 100));
      
      Animated.spring(dislikeBgWidth, {
        toValue: dislikePercentage,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [likeCount, dislikeCount, dislikeBgWidth]);

  const addBattleEmoji = useCallback((x: number, y: number, emoji: string, isDislike: boolean) => {
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
    const randomDrift = (Math.random() - 0.5) * 40;
    
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
        toValue: -120,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: randomDrift,
        duration: 1400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Remove emoji after animation
    setTimeout(() => {
      setBattleEmojis(current => current.filter(emoji => emoji.id !== newEmoji.id));
    }, 1400);
  }, []);

  // Simulate battle over time - dislikes slightly win for turnover drama
  useEffect(() => {
    const simulationIntervals: NodeJS.Timeout[] = [];
    
    const scheduleSimulation = () => {
      // Likes schedule (moderate) - total: ~6 likes
      const likeSchedule = [400, 1000, 1800, 2600, 3400, 4200];
      
      // Dislikes schedule (more frequent for turnover drama) - total: ~10 dislikes  
      const dislikeSchedule = [200, 600, 1200, 1600, 2000, 2400, 3000, 3600, 4000, 4400];
      
      // Schedule likes
      likeSchedule.forEach(delay => {
        const timeout = setTimeout(() => {
          // Random position on right side for likes
          const x = Math.random() * 120 + 280; // Right side of screen
          const y = Math.random() * 300 + 200;
          addBattleEmoji(x, y, '👍', false);
        }, delay);
        simulationIntervals.push(timeout);
      });
      
      // Schedule dislikes (more frequent for turnover negativity)
      dislikeSchedule.forEach(delay => {
        const timeout = setTimeout(() => {
          // Random position on left side for dislikes
          const x = Math.random() * 120 + 50; // Left side of screen
          const y = Math.random() * 300 + 200;
          addBattleEmoji(x, y, '👎', true);
        }, delay);
        simulationIntervals.push(timeout);
      });
    };
    
    // Start simulation after a brief delay
    const startTimeout = setTimeout(scheduleSimulation, 300);
    simulationIntervals.push(startTimeout);
    
    // Cleanup function
    return () => {
      simulationIntervals.forEach(interval => clearTimeout(interval));
    };
  }, [addBattleEmoji]);

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

  const totalVotes = likeCount + dislikeCount;
  const likePercentage = totalVotes > 0 ? Math.round((likeCount / totalVotes) * 100) : 50;
  const dislikePercentage = 100 - likePercentage;

  return (
    <View style={styles.battleRoot}>
      {/* Header with turnover info */}
      <View style={styles.header}>
        <Text style={styles.turnoverTitle}>{getTurnoverMessage()}</Text>
        <Text style={styles.teamInfo}>{team} creates the turnover!</Text>
        <Text style={styles.votePrompt}>How do you feel about this play?</Text>
      </View>

      {/* Vote counts display */}
      <View style={styles.countsContainer}>
        <Text style={styles.voteCount}>
          👎 {dislikeCount} ({dislikePercentage}%)
        </Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.voteCount}>
          👍 {likeCount} ({likePercentage}%)
        </Text>
      </View>

      {/* Split screen battle area */}
      <View style={styles.votingArea}>
        {/* Animated background split */}
        <Animated.View 
          style={[
            styles.dislikeBg,
            {
              width: dislikeBgWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
        
        <Animated.View 
          style={[
            styles.likeBg,
            {
              width: dislikeBgWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['100%', '0%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />

        {/* Dislike Side */}
        <Pressable 
          style={[styles.voteSide, styles.leftSide]}
          onPress={handleDislikePress}
        >
          <View style={styles.voteContent}>
            <Text style={styles.battleEmoji}>👎</Text>
            <Text style={styles.voteLabel}>BAD PLAY</Text>
            <Text style={styles.sideCount}>{dislikeCount}</Text>
          </View>
        </Pressable>

        {/* Like Side */}
        <Pressable 
          style={[styles.voteSide, styles.rightSide]}
          onPress={handleLikePress}
        >
          <View style={styles.voteContent}>
            <Text style={styles.battleEmoji}>👍</Text>
            <Text style={styles.voteLabel}>GREAT PLAY</Text>
            <Text style={styles.sideCount}>{likeCount}</Text>
          </View>
        </Pressable>

        {/* Center divider line */}
        <Animated.View 
          style={[
            styles.dividerLine,
            {
              left: dislikeBgWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
      </View>

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

      {/* Live voting indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE REACTIONS • {totalVotes} total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  battleRoot: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  turnoverTitle: {
    color: '#FF4500',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  teamInfo: {
    color: '#ffd93d',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  votePrompt: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  voteCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  vs: {
    color: '#FF4500',
    fontSize: 18,
    fontWeight: '900',
  },
  votingArea: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
  },
  dislikeBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#e74c3c',
  },
  likeBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#27ae60',
  },
  voteSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  leftSide: {
    borderRightWidth: 2,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  rightSide: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  voteContent: {
    alignItems: 'center',
  },
  battleEmoji: {
    fontSize: 100,
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  voteLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sideCount: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'white',
    transform: [{ translateX: -2 }],
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  floatingBattleEmoji: {
    position: 'absolute',
    fontSize: 36,
    zIndex: 3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4500',
    marginRight: 8,
  },
  liveText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
