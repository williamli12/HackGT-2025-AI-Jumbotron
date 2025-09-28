import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTimer } from '../store/useTimer';
import { useSchedule } from '../store/useSchedule';
import { getTeams } from '../services/api';
import EventTestButtons from '../components/EventTestButtons';

function mmss(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${String(m).padStart(2,'0')}:${String(rs).padStart(2,'0')}`;
}

function getGameInfoForTime(elapsedSec: number, hasStarted: boolean): { quarter: number; gameTime: string; down: number; distance: number; yardLine: number } {
  // Show initial state until user starts the timeline
  if (!hasStarted) {
    return { 
      quarter: 1, 
      gameTime: '15:00', 
      down: 1, 
      distance: 10, 
      yardLine: 25 
    };
  }

  // Map timeline clips to realistic game situations after start
  if (elapsedSec < 25) {
    // Clip 1: Drive Setup & Penalty (0-25s) - 1st Quarter
    return { 
      quarter: 1, 
      gameTime: '8:42', 
      down: 1, 
      distance: 10, 
      yardLine: 35 
    };
  } else if (elapsedSec < 45) {
    // Clip 2: Touchdown & Decision (25-45s) - 2nd Quarter
    return { 
      quarter: 2, 
      gameTime: '3:15', 
      down: 3, 
      distance: 7, 
      yardLine: 12 
    };
  } else if (elapsedSec < 65) {
    // Clip 3: Defense & Celebration (45-65s) - 3rd Quarter
    return { 
      quarter: 3, 
      gameTime: '11:28', 
      down: 2, 
      distance: 4, 
      yardLine: 28 
    };
  } else if (elapsedSec < 85) {
    // Clip 4: MVP Voting (65-85s) - 4th Quarter
    return { 
      quarter: 4, 
      gameTime: '2:15', 
      down: 1, 
      distance: 10, 
      yardLine: 45 
    };
  } else {
    // Clip 5: Final Statistics (85-105s) - Game Over
    return { 
      quarter: 4, 
      gameTime: '0:00', 
      down: 0, 
      distance: 0, 
      yardLine: 0 
    };
  }
}

function getScoreForTime(elapsedSec: number, hasStarted: boolean): { home: number; away: number } {
  // Show 0-0 until user starts the timeline
  if (!hasStarted) {
    return { home: 0, away: 0 };
  }

  // Event-based scoring progression after start
  if (elapsedSec < 25) {
    // Clip 1: Drive Setup & Penalty (0-25s)
    return { home: 0, away: 7 }; // Cowboys leading
  } else if (elapsedSec < 42) {
    // Clip 2: Touchdown & Decision (25-45s) - before 2pt poll ends
    return { home: 7, away: 7 }; // Eagles tie it up
  } else if (elapsedSec < 61) {
    // After TWO_POINT_KICK_POLL event (27-42s) - Eagles score 2pt conversion
    return { home: 14, away: 13 }; // Eagles take the lead (Cowboys got FG)
  } else if (elapsedSec < 65) {
    // After CELEBRATION event (46-61s) - Cowboys score touchdown
    return { home: 14, away: 20 }; // Cowboys retake the lead
  } else {
    // Clip 4 & 5: MVP Voting & Final Stats (65s+) - Eagles final comeback
    return { home: 24, away: 20 }; // Eagles win
  }
}

export default function BasicScreen() {
  const { elapsedMs, start, pause, reset, seekTo, isRunning } = useTimer();
  const { currentClip } = useSchedule();
  const navigation = useNavigation();

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const hasStarted = elapsedMs > 0; // Timeline has been started if elapsed time > 0
  const score = getScoreForTime(elapsedSec, hasStarted);
  const gameInfo = getGameInfoForTime(elapsedSec, hasStarted);

  return (
    <View style={styles.root}>
      {/* Eagles Branding */}
      <View style={styles.brandingContainer}>
        <Text style={styles.eagleIcon}>🦅</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>JUMBOTRON - POCKET EDITION</Text>
          <Text style={styles.teamSupport}>FLY EAGLES FLY</Text>
        </View>
      </View>
      
      {/* Game Clock and Quarter */}
      <View style={styles.gameClockContainer}>
        <Text style={styles.quarter}>Q{gameInfo.quarter}</Text>
        <Text style={styles.gameClock}>{gameInfo.gameTime}</Text>
      </View>
      
      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreEagles}>Eagles {score.home}</Text>
        <Text style={styles.scoreDivider}> — </Text>
        <Text style={styles.scoreCowboys}>{score.away} Cowboys</Text>
      </View>
      
      {/* Down and Distance */}
      {gameInfo.down > 0 && (
        <Text style={styles.downDistance}>
          {gameInfo.down === 1 ? '1st' : gameInfo.down === 2 ? '2nd' : gameInfo.down === 3 ? '3rd' : '4th'} & {gameInfo.distance} at {gameInfo.yardLine} yard line
        </Text>
      )}
      
      {gameInfo.down === 0 && (
        <Text style={styles.gameOver}>FINAL</Text>
      )}
      
      {/* Debug Timer (smaller) */}
      {/* <Text style={styles.debugTimer}>Timeline: {mmss(elapsedMs)}</Text> */}
      <View style={styles.row}>
        <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? pause : start} />
        <Button title="Reset" onPress={reset} />
        {/* <Button title="+10s" onPress={() => seekTo(elapsedMs + 10000)} />
        <Button title="Fetch Teams" onPress={async () => {
          try {
            const teams = await getTeams();
            console.log('Teams length:', teams?.length);
          } catch (e) {
            console.warn('API not running:', String(e));
          }
        }} /> */}
      </View>
      {/* <View style={styles.row}>
        <Button 
          title="🏈 Game Summary" 
          onPress={() => navigation.navigate('GameSummary' as never)} 
        />
      </View>
      <EventTestButtons /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#001a1e', // Dark Eagles midnight green (very dark, professional)
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16 
  },
  // Eagles Branding
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  eagleIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.9,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: { 
    color: '#A5ACAF', // Eagles silver
    fontSize: 18, 
    fontWeight: '600', 
    letterSpacing: 1,
    marginBottom: 2,
  },
  teamSupport: {
    color: '#004C54', // Eagles midnight green
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  
  // Game Clock Display
  gameClockContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  quarter: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: '800', 
    marginRight: 16, 
    backgroundColor: 'rgba(0, 76, 84, 0.3)', // Subtle Eagles green accent
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(165, 172, 175, 0.3)' // Eagles silver border
  },
  gameClock: { color: 'white', fontSize: 48, fontWeight: '800', fontFamily: 'monospace' },
  
  // Score and Game Info
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  scoreEagles: { 
    color: '#A5ACAF', // Eagles silver - highlight our team
    fontSize: 26, 
    fontWeight: '800',
    textShadowColor: 'rgba(165, 172, 175, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreDivider: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: '400' 
  },
  scoreCowboys: { 
    color: 'rgba(255, 255, 255, 0.7)', // Dimmed opponent
    fontSize: 24, 
    fontWeight: '600' 
  },
  downDistance: { 
    color: '#A5ACAF', // Eagles silver for down/distance
    fontSize: 16, 
    marginBottom: 8, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  gameOver: { color: '#FF6B35', fontSize: 20, marginBottom: 8, fontWeight: '800', textAlign: 'center' },
  
  // Debug Info
  debugTimer: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 16, marginBottom: 8 },
  
  // Controls
  row: { flexDirection:'row', gap: 8, marginTop: 12 },
});
