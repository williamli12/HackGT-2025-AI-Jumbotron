import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import type { EventComponentProps } from './registry';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ControversialCallOverlay({ event }: EventComponentProps) {
  const [thumbsUpCount, setThumbsUpCount] = useState(0);
  const [thumbsDownCount, setThumbsDownCount] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  
  // Animated values for split screen
  const splitPosition = useRef(new Animated.Value(50)).current; // Start at 50% (center)
  const thumbsUpScale = useRef(new Animated.Value(1)).current;
  const thumbsDownScale = useRef(new Animated.Value(1)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

  // Get call details from payload
  const callType = event.payload?.callType || 'PENALTY';
  const callDescription = event.payload?.callDescription || 'Unnecessary Roughness';
  const team = event.payload?.team || 'Eagles';

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
      // Random chance to add votes from "other users"
      if (Math.random() < 0.95) { // 95% chance every interval (increased from 70%)
        const isUpVote = Math.random() < 0.5;
        const voteCount = Math.floor(Math.random() * 8) + 3; // 3-10 votes (increased from 1-3)
        
        if (isUpVote) {
          setThumbsUpCount(prev => prev + voteCount);
        } else {
          setThumbsDownCount(prev => prev + voteCount);
        }
      }
    };

    // Start simulation after a short delay
    const initialDelay = setTimeout(() => {
      const interval = setInterval(simulateVotes, 400); // Every 0.4 seconds (increased from 1.5s)
      return () => clearInterval(interval);
    }, 200); // Reduced initial delay from 1000ms to 200ms

    return () => {
      clearTimeout(initialDelay);
    };
  }, []);

  // Update split animation when votes change
  useEffect(() => {
    const totalVotes = thumbsUpCount + thumbsDownCount;
    if (totalVotes > 0) {
      const downPercentage = (thumbsDownCount / totalVotes) * 100;
      
      Animated.spring(splitPosition, {
        toValue: downPercentage,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [thumbsUpCount, thumbsDownCount]);

  const handleVote = (voteType: 'up' | 'down') => {
    // Prevent multiple votes from same user
    if (userVote) return;

    setUserVote(voteType);
    
    if (voteType === 'up') {
      setThumbsUpCount(prev => prev + 1);
      // Scale animation for thumbs up
      Animated.sequence([
        Animated.timing(thumbsUpScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(thumbsUpScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      setThumbsDownCount(prev => prev + 1);
      // Scale animation for thumbs down
      Animated.sequence([
        Animated.timing(thumbsDownScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(thumbsDownScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  };

  // Calculate percentages for display
  const totalVotes = thumbsUpCount + thumbsDownCount;
  const upPercentage = totalVotes > 0 ? Math.round((thumbsUpCount / totalVotes) * 100) : 50;
  const downPercentage = 100 - upPercentage;

  return (
    <View style={styles.container}>
      {/* Beautiful centered header */}
      <View style={styles.header}>
        <Text style={styles.callTitle}>HOW DO YOU FEEL ABOUT THAT? 🤔</Text>
      </View>

      {/* Vote counts display */}
      <View style={styles.countsContainer}>
        <Text style={styles.voteCount}>
          👎 {thumbsDownCount} ({downPercentage}%)
        </Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.voteCount}>
          👍 {thumbsUpCount} ({upPercentage}%)
        </Text>
      </View>

      {/* Split screen voting area */}
      <View style={styles.votingArea}>
        {/* Animated background split */}
        <Animated.View 
          style={[
            styles.thumbsDownBg,
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
            styles.thumbsUpBg,
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

        {/* Thumbs Down Side */}
        <Pressable 
          style={[styles.voteSide, styles.leftSide]}
          onPress={() => handleVote('down')}
          disabled={userVote !== null}
        >
          <Animated.View 
            style={[
              styles.voteContent,
              { transform: [{ scale: thumbsDownScale }] }
            ]}
          >
            <Text style={styles.thumbsIcon}>👎</Text>
            <Text style={styles.voteLabel}>BAD CALL</Text>
            <Text style={styles.sideCount}>{thumbsDownCount}</Text>
          </Animated.View>
        </Pressable>

        {/* Thumbs Up Side */}
        <Pressable 
          style={[styles.voteSide, styles.rightSide]}
          onPress={() => handleVote('up')}
          disabled={userVote !== null}
        >
          <Animated.View 
            style={[
              styles.voteContent,
              { transform: [{ scale: thumbsUpScale }] }
            ]}
          >
            <Text style={styles.thumbsIcon}>👍</Text>
            <Text style={styles.voteLabel}>GOOD CALL</Text>
            <Text style={styles.sideCount}>{thumbsUpCount}</Text>
          </Animated.View>
        </Pressable>

        {/* Center divider line */}
        <Animated.View 
          style={[
            styles.dividerLine,
            {
              left: splitPosition.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
      </View>

      {/* User feedback */}
      {userVote && (
        <View style={styles.userFeedback}>
          <Text style={styles.thankYou}>
            Thanks for voting! {userVote === 'up' ? '👍' : '👎'}
          </Text>
          <Text style={styles.liveVoting}>
            Live voting continues...
          </Text>
        </View>
      )}

      {/* Live indicator */}
      <View style={styles.liveIndicator}>
        <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
        <Text style={styles.liveText}>LIVE VOTING • {totalVotes} total votes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  callTitle: {
    color: '#ff6b6b',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    lineHeight: 34,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  voteCount: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  vs: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: '900',
  },
  votingArea: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
  },
  thumbsDownBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#e74c3c',
  },
  thumbsUpBg: {
    position: 'absolute',
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
  thumbsIcon: {
    fontSize: 80,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  voteLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sideCount: {
    color: 'white',
    fontSize: 36,
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
  userFeedback: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thankYou: {
    color: '#4ecdc4',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  liveVoting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 8,
  },
  liveText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
