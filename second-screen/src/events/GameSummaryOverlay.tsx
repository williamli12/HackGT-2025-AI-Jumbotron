/**
 * GameSummaryOverlay.tsx
 * 
 * Event overlay that displays live NFL game statistics from Sportradar API
 * Replaces the StatsComparisonOverlay with real-time data
 */

import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from "react-native";
import { NFL_API_KEY } from '@env';
import type { EventComponentProps } from './registry';
import TapOverlay from '../components/TapOverlay';
import { testEnvLoading } from '../utils/envTest';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --------- CONFIG ---------
const ACCESS_LEVEL = "trial";
const LANG = "en";
const GAME_ID = "56779053-89da-4939-bc22-9669ae1fe05a";
const USE_PROXY = true;
const API_KEY = NFL_API_KEY || "";

// --------- Types ---------
type TeamStub = {
  id?: string;
  name?: string;
  market?: string;
  alias?: string;
};

type StatisticsResponse = {
  id?: string;
  status?: string;
  quarter?: number;
  clock?: string;
  statistics?: {
    home?: TeamStub & { 
      summary?: any;
      passing?: any;
      rushing?: any;
      first_downs?: any;
      touchdowns?: any;
      efficiency?: any;
    };
    away?: TeamStub & { 
      summary?: any;
      passing?: any;
      rushing?: any;
      first_downs?: any;
      touchdowns?: any;
      efficiency?: any;
    };
  };
};

// --------- Helpers ---------
function buildUrl(gameId: string) {
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  if (isMobile) {
    // On mobile, always use direct API call (no CORS restrictions)
    const base = `https://api.sportradar.com/nfl/official/${ACCESS_LEVEL}/v7/${LANG}/games/${gameId}/statistics.json`;
    const join = base.includes("?") ? "&" : "?";
    return `${base}${join}api_key=${encodeURIComponent(API_KEY)}`;
  } else if (USE_PROXY) {
    // On web, use proxy server to bypass CORS
    return `http://localhost:3001/api/nfl/games/${gameId}/statistics?api_key=${encodeURIComponent(API_KEY)}`;
  } else {
    // Direct API call (may fail due to CORS in browser)
    const base = `https://api.sportradar.com/nfl/official/${ACCESS_LEVEL}/v7/${LANG}/games/${gameId}/statistics.json`;
    const join = base.includes("?") ? "&" : "?";
    return `${base}${join}api_key=${encodeURIComponent(API_KEY)}`;
  }
}

async function fetchStatistics(gameId: string): Promise<StatisticsResponse> {
  const url = buildUrl(gameId);
  console.log('🌐 GameSummaryOverlay fetching from URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 280)}`);
    }
    
    const data = await res.json();
    console.log('✅ GameSummaryOverlay API Response received');
    return data;
  } catch (error) {
    console.error('🚨 GameSummaryOverlay Fetch Error:', error);
    
    if (error instanceof TypeError && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
      const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
      if (isMobile) {
        throw new Error('Network Error: Cannot reach Sportradar API. Check internet connection.');
      } else {
        throw new Error('Proxy Server Error: Start proxy server with: npm run proxy');
      }
    }
    
    throw error;
  }
}

function safeTeamName(t?: TeamStub) {
  if (!t) return "—";
  return [t.market, t.name].filter(Boolean).join(" ") || t.alias || "—";
}

function label(v: any, fallback = "—") {
  return (v ?? v === 0) ? String(v) : fallback;
}

function calculateScore(team?: any) {
  if (!team) return "—";
  
  const touchdowns = team.touchdowns?.total || 0;
  const fieldGoals = team.field_goals?.totals?.made || 0;
  const extraPoints = team.extra_points?.kicks?.totals?.made || 0;
  const safeties = team.summary?.safeties || 0;
  
  const score = (touchdowns * 6) + (fieldGoals * 3) + extraPoints + (safeties * 2);
  return score.toString();
}

// --------- Component ---------
export default function GameSummaryOverlay({ event }: EventComponentProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatisticsResponse | null>(null);
  
  // Animation values for professional NFL presentation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liveDotOpacity = useRef(new Animated.Value(1)).current;

  const canFetch = useMemo(() => {
    const hasApiKey = typeof API_KEY === "string" && 
           API_KEY.length > 0 && 
           API_KEY !== "your_sportradar_api_key_here" &&
           API_KEY !== "your_actual_sportradar_api_key_here";
    console.log('🏈 GameSummaryOverlay: API Key check:', { hasApiKey, apiKeyLength: API_KEY.length, apiKeyType: typeof API_KEY });
    return hasApiKey;
  }, []);

  const run = async () => {
    try {
      setStatus("loading");
      setError(null);
      console.log('🏈 GameSummaryOverlay: Starting fetch for game', GAME_ID);
      const json = await fetchStatistics(GAME_ID);
      console.log('🏈 GameSummaryOverlay: Received data:', json ? 'Success' : 'No data');
      setData(json);
      setStatus("done");
    } catch (e: any) {
      console.error('🏈 GameSummaryOverlay: Error occurred:', e);
      setStatus("error");
      setError(e?.message || String(e));
    }
  };

  // Entrance animation and continuous effects
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Continuous pulse animation for live data feel
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    // Live dot animation
    const liveDotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotOpacity, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        Animated.timing(liveDotOpacity, { toValue: 1, duration: 1000, useNativeDriver: false }),
      ])
    );

    pulseAnimation.start();
    liveDotAnimation.start();

    return () => {
      pulseAnimation.stop();
      liveDotAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Test environment variable loading on component mount
    const envTest = testEnvLoading();
    console.log('🏈 GameSummaryOverlay: Environment test result:', envTest);
    console.log('🏈 GameSummaryOverlay: useEffect triggered, canFetch:', canFetch);
    
    if (canFetch) {
      console.log('🏈 GameSummaryOverlay: Attempting to fetch data...');
      run();
    } else {
      console.log('🏈 GameSummaryOverlay: Cannot fetch - API key not valid');
    }
  }, [canFetch]);

  const home = data?.statistics?.home;
  const away = data?.statistics?.away;

  // Error state - simplified for overlay
  if (!canFetch) {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🏈 GAME SUMMARY</Text>
          <Text style={styles.errorMsg}>⚠️ API KEY REQUIRED</Text>
          <Text style={styles.subtitle}>Configure NFL_API_KEY in .env</Text>
        </Animated.View>
        <TapOverlay />
      </View>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🏈 GAME SUMMARY</Text>
          <Animated.Text style={[styles.loadingMsg, { transform: [{ scale: pulseAnim }] }]}>
            📡 LOADING LIVE DATA...
          </Animated.Text>
        </Animated.View>
        <TapOverlay />
      </View>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🏈 GAME SUMMARY</Text>
          <Text style={styles.errorMsg}>❌ ERROR LOADING DATA</Text>
          <Text style={styles.subtitle}>{error}</Text>
        </Animated.View>
        <TapOverlay />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🏈 GAME SUMMARY</Text>
          <Text style={styles.subtitle}>NO DATA AVAILABLE</Text>
        </Animated.View>
        <TapOverlay />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Minimal Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.liveIndicator}>
              <Animated.View style={[styles.liveDot, { opacity: liveDotOpacity }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.gameStatus}>
              Q{label(data.quarter)} • {label(data.clock)}
            </Text>
          </View>
          <Text style={styles.title}>🏈 EAGLES WIN!</Text>
        </View>

        {/* Score Display */}
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{safeTeamName(away).toUpperCase()}</Text>
            <Text style={styles.scoreText}>{calculateScore(away)}</Text>
          </View>
          <Text style={styles.vs}>—</Text>
          <View style={styles.teamScore}>
            <Text style={styles.scoreText}>{calculateScore(home)}</Text>
            <Text style={styles.teamName}>{safeTeamName(home).toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Team vs Team Stats */}
        <View style={styles.statsSection}>
          {/* Team Headers */}
          <View style={styles.teamHeaders}>
            <Text style={styles.teamHeaderAway}>{safeTeamName(away).toUpperCase()}</Text>
            <Text style={styles.teamHeaderHome}>{safeTeamName(home).toUpperCase()}</Text>
          </View>
          
          {/* Stats Rows */}
          <StatRow 
            label="🎯 PASSING YARDS" 
            awayValue={away?.passing?.totals?.yards} 
            homeValue={home?.passing?.totals?.yards}
          />
          <StatRow 
            label="🏃 RUSHING YARDS" 
            awayValue={away?.rushing?.totals?.yards} 
            homeValue={home?.rushing?.totals?.yards}
          />
          <StatRow 
            label="⬇️ FIRST DOWNS" 
            awayValue={away?.first_downs?.total} 
            homeValue={home?.first_downs?.total}
          />
          <StatRow 
            label="🏆 TOUCHDOWNS" 
            awayValue={away?.touchdowns?.total} 
            homeValue={home?.touchdowns?.total}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          LIVE NFL DATA
        </Text>
      </Animated.View>
      
      <TapOverlay />
    </View>
  );
}

// Clear stat row with team columns
function StatRow({ label: statLabel, awayValue, homeValue }: { 
  label: string; 
  awayValue: any; 
  homeValue: any;
}) {
  const awayVal = label(awayValue);
  const homeVal = label(homeValue);
  
  return (
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{awayVal}</Text>
      <Text style={styles.statLabel}>{statLabel}</Text>
      <Text style={styles.statValue}>{homeVal}</Text>
    </View>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#004C54', // Philadelphia Eagles midnight green
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 5,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  gameStatus: {
    color: '#A5ACAF',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    lineHeight: 38,
  },
  errorMsg: {
    color: '#FF6B6B',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 16,
  },
  loadingMsg: {
    color: '#66C7FF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    color: '#A5ACAF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
  },
  vs: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '900',
    marginHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  statsSection: {
    width: '100%',
    marginVertical: 5,
  },
  teamHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  teamHeaderAway: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    flex: 1,
  },
  teamHeaderHome: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statLabel: {
    color: '#A5ACAF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    flex: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 15,
  },
});