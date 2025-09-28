/**
 * GameSummaryOverlay.tsx
 * 
 * Event overlay that displays live NFL game statistics from Sportradar API
 * Replaces the StatsComparisonOverlay with real-time data
 */

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { NFL_API_KEY } from '@env';
import type { EventComponentProps } from './registry';

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
  if (USE_PROXY) {
    return `http://localhost:3001/api/nfl/games/${gameId}/statistics?api_key=${encodeURIComponent(API_KEY)}`;
  } else {
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

  const canFetch = useMemo(() => {
    return typeof API_KEY === "string" && 
           API_KEY.length > 0 && 
           API_KEY !== "your_sportradar_api_key_here" &&
           API_KEY !== "your_actual_sportradar_api_key_here";
  }, []);

  const run = async () => {
    try {
      setStatus("loading");
      setError(null);
      const json = await fetchStatistics(GAME_ID);
      setData(json);
      setStatus("done");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || String(e));
    }
  };

  useEffect(() => {
    if (canFetch) {
      run();
    }
  }, [canFetch]);

  const home = data?.statistics?.home;
  const away = data?.statistics?.away;

  if (!canFetch) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>🏈 Game Summary</Text>
          <Text style={styles.subtitle}>Cowboys vs Eagles</Text>
        </View>
        <View style={styles.warningCard}>
          <Text style={styles.warn}>⚠️ Set NFL_API_KEY in your .env file</Text>
          <Text style={styles.warnSub}>Create .env file with: NFL_API_KEY=your_key</Text>
        </View>
      </View>
    );
  }

  if (status === "loading") {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>🏈 Game Summary</Text>
          <Text style={styles.subtitle}>Loading live data...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>📡 Fetching NFL Statistics...</Text>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>🏈 Game Summary</Text>
          <Text style={styles.subtitle}>Cowboys vs Eagles</Text>
        </View>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>❌ Error loading data</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>🏈 Game Summary</Text>
          <Text style={styles.subtitle}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🏈 Game Summary</Text>
          <Text style={styles.subtitle}>Cowboys vs Eagles • Week 1</Text>
          <Text style={styles.gameStatus}>
            {label(data.status)} • Q{label(data.quarter)} • {label(data.clock)}
          </Text>
        </View>

        {/* Live Score */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{safeTeamName(away)}</Text>
              <Text style={styles.scoreText}>{calculateScore(away)}</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{safeTeamName(home)}</Text>
              <Text style={styles.scoreText}>{calculateScore(home)}</Text>
            </View>
          </View>
        </View>

        {/* Team Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Team Statistics</Text>
          <TeamStats teamLabel={`🛣️ ${safeTeamName(away)} (Away)`} stats={away} />
          <TeamStats teamLabel={`🏠 ${safeTeamName(home)} (Home)`} stats={home} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Live NFL Data • {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Render team statistics component
function TeamStats({ teamLabel, stats }: { teamLabel: string; stats: any }) {
  if (!stats) return (
    <View style={styles.teamStatsContainer}>
      <Text style={styles.teamStatsTitle}>{teamLabel}</Text>
      <Text style={styles.noData}>No statistics available</Text>
    </View>
  );

  const passing = stats.passing?.totals;
  const rushing = stats.rushing?.totals;
  const firstdowns = stats.first_downs;
  const touchdowns = stats.touchdowns;
  const efficiency = stats.efficiency;

  return (
    <View style={styles.teamStatsContainer}>
      <Text style={styles.teamStatsTitle}>{teamLabel}</Text>
      
      <View style={styles.statsGrid}>
        {/* Passing Stats */}
        {passing && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🎯 Passing</Text>
            <Text style={styles.statValue}>
              {label(passing.yards)} yds • {label(passing.completions)}/{label(passing.attempts)}
            </Text>
            <Text style={styles.statDetail}>
              {label(passing.touchdowns)} TD • {label(passing.interceptions)} INT
            </Text>
          </View>
        )}
        
        {/* Rushing Stats */}
        {rushing && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🏃 Rushing</Text>
            <Text style={styles.statValue}>
              {label(rushing.yards)} yds • {label(rushing.attempts)} att
            </Text>
            <Text style={styles.statDetail}>
              {label(rushing.touchdowns)} TD • {label(rushing.avg_yards)} avg
            </Text>
          </View>
        )}
        
        {/* First Downs */}
        {firstdowns && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>⬇️ First Downs</Text>
            <Text style={styles.statValue}>{label(firstdowns.total)}</Text>
            <Text style={styles.statDetail}>
              {label(firstdowns.pass)} pass • {label(firstdowns.rush)} rush
            </Text>
          </View>
        )}
        
        {/* Touchdowns */}
        {touchdowns && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🏆 Touchdowns</Text>
            <Text style={styles.statValue}>{label(touchdowns.total)}</Text>
            <Text style={styles.statDetail}>
              {label(touchdowns.pass)} pass • {label(touchdowns.rush)} rush
            </Text>
          </View>
        )}
        
        {/* 3rd Down Efficiency */}
        {efficiency?.thirddown && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>📊 3rd Down</Text>
            <Text style={styles.statValue}>
              {label(efficiency.thirddown.successes)}/{label(efficiency.thirddown.attempts)}
            </Text>
            <Text style={styles.statDetail}>
              {label(efficiency.thirddown.pct)}%
            </Text>
          </View>
        )}
        
        {/* Red Zone */}
        {efficiency?.redzone && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🎯 Red Zone</Text>
            <Text style={styles.statValue}>
              {label(efficiency.redzone.successes)}/{label(efficiency.redzone.attempts)}
            </Text>
            <Text style={styles.statDetail}>
              {label(efficiency.redzone.pct)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0d14' },
  scrollContent: { padding: 16, paddingTop: Platform.select({ web: 24, default: 48 }) as number },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#aab0c2', fontSize: 16, marginTop: 4, textAlign: 'center' },
  gameStatus: { color: '#66c7ff', fontSize: 14, marginTop: 8, textAlign: 'center', fontWeight: '600' },
  scoreSection: { marginBottom: 24 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#141a2a', borderRadius: 12, padding: 20 },
  teamScore: { alignItems: 'center', flex: 1 },
  teamName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  scoreText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  vs: { color: '#aab0c2', fontSize: 16, fontWeight: '600', marginHorizontal: 20 },
  statsSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  teamStatsContainer: { backgroundColor: '#141a2a', borderRadius: 12, padding: 16, marginBottom: 16 },
  teamStatsTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  noData: { color: '#aab0c2', fontSize: 14, fontStyle: 'italic' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { backgroundColor: '#1a1d2e', borderRadius: 8, padding: 12, minWidth: '45%', flex: 1 },
  statLabel: { color: '#66c7ff', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  statDetail: { color: '#aab0c2', fontSize: 11 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { color: '#9fb0ff', fontSize: 11, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as any, textAlign: 'center', opacity: 0.7 },
  warningCard: { backgroundColor: '#2a1f0d', padding: 16, borderRadius: 12, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#ffd166' },
  warn: { color: '#ffd166', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  warnSub: { color: '#ffd166', fontSize: 12, opacity: 0.8 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  loading: { color: '#66c7ff', fontSize: 16, fontWeight: '600' },
  errorCard: { backgroundColor: '#2a0d0d', padding: 16, borderRadius: 12, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#ff6b6b' },
  errorText: { color: '#ff6b6b', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  errorDetail: { color: '#ff6b6b', fontSize: 12, opacity: 0.8 },
});