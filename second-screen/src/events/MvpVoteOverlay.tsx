import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import type { EventComponentProps } from './registry';

type Player = {
  id: string;
  name: string;
  position: string;
  stats: string;
  votes: number;
};

export default function MvpVoteOverlay({ event }: EventComponentProps) {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Jalen Hurts', position: 'QB', stats: '285 YDS, 3 TD', votes: 0 },
    { id: '2', name: 'Saquon Barkley', position: 'RB', stats: '142 YDS, 2 TD', votes: 0 },
    { id: '3', name: 'Javonte Williams', position: 'RB', stats: '89 YDS, 1 TD', votes: 0 }
  ]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(players.map(() => new Animated.Value(1))).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

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

  // Simulate other users voting - increased velocity
  useEffect(() => {
    const simulateVotes = () => {
      if (Math.random() < 0.95) { // 95% chance every interval (increased from 80%)
        const randomPlayerIndex = Math.floor(Math.random() * players.length);
        const voteCount = Math.floor(Math.random() * 8) + 3; // 3-10 votes (increased from 1-5)
        
        setPlayers(prev => prev.map((player, index) => 
          index === randomPlayerIndex 
            ? { ...player, votes: player.votes + voteCount }
            : player
        ));
      }
    };

    const interval = setInterval(simulateVotes, 600); // Twice as fast (reduced from 1200ms)
    return () => clearInterval(interval);
  }, []);

  const handleVote = (playerId: string, index: number) => {
    if (userVote) return;

    setUserVote(playerId);
    
    // Add user's vote
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, votes: player.votes + 1 }
        : player
    ));

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const totalVotes = players.reduce((sum, player) => sum + player.votes, 0);
  const leadingPlayer = players.reduce((max, player) => player.votes > max.votes ? player : max, players[0]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WHO'S YOUR MVP?</Text>
      </View>

      {/* Player Cards */}
      <View style={styles.playersContainer}>
        {players.map((player, index) => {
          const percentage = totalVotes > 0 ? Math.round((player.votes / totalVotes) * 100) : 0;
          const isLeading = player.id === leadingPlayer.id && totalVotes > 0;
          const hasVoted = userVote === player.id;
          
          return (
            <Pressable
              key={player.id}
              style={[
                styles.playerCard,
                isLeading && styles.leadingCard,
                hasVoted && styles.votedCard
              ]}
              onPress={() => handleVote(player.id, index)}
              disabled={userVote !== null}
            >
              <Animated.View style={[
                styles.cardContent,
                { transform: [{ scale: scaleAnims[index] }] }
              ]}>
                {/* Vote percentage bar */}
                <View style={styles.voteBar}>
                  <Animated.View 
                    style={[
                      styles.voteBarFill,
                      { width: `${percentage}%` },
                      isLeading && styles.leadingBarFill
                    ]} 
                  />
                </View>
                
                {/* Player avatar placeholder */}
                <View style={[styles.avatar, isLeading && styles.leadingAvatar]}>
                  <Text style={styles.avatarText}>{player.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                
                {/* Player info */}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, isLeading && styles.leadingText]}>{player.name}</Text>
                  <Text style={[styles.playerPosition, isLeading && styles.leadingSubText]}>{player.position}</Text>
                  <Text style={[styles.playerStats, isLeading && styles.leadingSubText]}>{player.stats}</Text>
                </View>
                
                {/* Vote count */}
                <View style={styles.voteSection}>
                  <Text style={[styles.voteCount, isLeading && styles.leadingText]}>{player.votes}</Text>
                  <Text style={[styles.votePercentage, isLeading && styles.leadingSubText]}>{percentage}%</Text>
                </View>
                
                {/* Voted indicator */}
                {hasVoted && (
                  <View style={styles.votedIndicator}>
                    <Text style={styles.votedText}>✓ YOUR VOTE</Text>
                  </View>
                )}
                
                {/* Leading crown */}
                {isLeading && totalVotes > 5 && (
                  <View style={styles.crown}>
                    <Text style={styles.crownIcon}>👑</Text>
                  </View>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* User feedback */}
      {userVote && (
        <View style={styles.userFeedback}>
        </View>
      )}

      {/* Live indicator */}
      <View style={styles.liveIndicator}>
        <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
        <Text style={styles.liveText}>LIVE MVP VOTING • {totalVotes} total votes</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 4,
    transform: [{ scale: 1.05 }],
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  playersContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 5,
  },
  playerCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    marginBottom: 12,
    padding: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    minHeight: 90,
    shadowColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  leadingCard: {
    backgroundColor: 'rgba(255,215,0,0.18)',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    transform: [{ scale: 1.05 }, { rotateZ: '0.5deg' }],
  },
  votedCard: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderColor: '#4CAF50',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  voteBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    backgroundColor: 'rgba(33,150,243,0.3)',
    borderRadius: 12,
  },
  leadingBarFill: {
    backgroundColor: 'rgba(255,215,0,0.3)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  leadingAvatar: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  playerInfo: {
    flex: 1,
    zIndex: 2,
  },
  playerName: {
    color: 'white',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leadingText: {
    color: '#FFD700',
  },
  playerPosition: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  leadingSubText: {
    color: 'rgba(255,215,0,0.8)',
  },
  playerStats: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  voteSection: {
    alignItems: 'center',
    minWidth: 60,
    zIndex: 2,
  },
  voteCount: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    transform: [{ scale: 1.1 }],
  },
  votePercentage: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  votedIndicator: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -50 }, { translateY: -12 }, { scale: 1.15 }],
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  votedText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  crown: {
    position: 'absolute',
    right: -5,
    top: -5,
  },
  crownIcon: {
    fontSize: 20,
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
    backgroundColor: '#FFD700',
    marginRight: 8,
  },
  liveText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
