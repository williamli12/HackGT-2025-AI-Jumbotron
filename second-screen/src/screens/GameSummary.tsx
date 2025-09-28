/**
 * GameSummary.tsx
 *
 * Fetches and displays NFL game statistics from Sportradar API
 * for Cowboys vs Eagles game from September 4th, 2025 Week 1.
 *
 * Requirements:
 * - Set NFL_API_KEY environment variable with your Sportradar key
 * - Game ID: 56779053-89da-4939-bc22-9669ae1fe05a
 */

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet, Platform } from "react-native";
import { NFL_API_KEY } from '@env';
import { testEnvLoading } from '../utils/envTest';

// --------- CONFIG ---------
const ACCESS_LEVEL = "trial"; // "trial" | "production"
const LANG = "en";
const GAME_ID = "56779053-89da-4939-bc22-9669ae1fe05a";
const USE_PROXY = true; // Set to true to use local proxy server for CORS bypass

// Environment variable from @env
const API_KEY = NFL_API_KEY || "";

// --------- Types ---------
type TeamStub = {
  id?: string;
  name?: string;
  market?: string;
  alias?: string;
  points?: number;
  remaining_timeouts?: number;
  remaining_challenges?: number;
};

type GameInfo = {
  id?: string;
  status?: string; // scheduled, inprogress, closed, etc.
  clock?: string;  // "12:37" etc.
  quarter?: number;
  attendance?: number;
  duration?: string; // "3:12"
  title?: string;
};

type WeatherInfo = {
  condition?: string; // "Clear"
  temp?: number;      // Fahrenheit
  humidity?: number;  // %
};

type StatisticsResponse = {
  id?: string;
  status?: string;
  quarter?: number;
  clock?: string;
  attendance?: number;
  duration?: string;
  weather?: WeatherInfo;
  broadcast?: {
    network?: string;
    internet?: string;
    radio?: string;
    satellite?: string;
  };
  scoring?: {
    quarters?: Array<{
      number?: number;
      sequence?: number;
      home_points?: number;
      away_points?: number;
    }>;
  };
  statistics?: {
    home?: TeamStub & { 
      summary?: any;
      passing?: any;
      rushing?: any;
      receiving?: any;
      first_downs?: any;
      touchdowns?: any;
      efficiency?: any;
    };
    away?: TeamStub & { 
      summary?: any;
      passing?: any;
      rushing?: any;
      receiving?: any;
      first_downs?: any;
      touchdowns?: any;
      efficiency?: any;
    };
  };
};

// --------- Helpers ---------
function buildUrl(gameId: string) {
  if (USE_PROXY) {
    // Use local proxy server to bypass CORS
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
  console.log('🌐 Attempting to fetch from URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response ok:', res.ok);
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error('❌ API Error Response:', text);
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 280)}`);
    }
    
    const data = await res.json();
    console.log('✅ API Response received:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('🚨 Fetch Error Details:', error);
    
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      if (USE_PROXY) {
        throw new Error('Proxy Server Error: Cannot connect to local proxy server at localhost:3001. Make sure to run: npm run proxy');
      } else {
        throw new Error('CORS/Network Error: Cannot access Sportradar API from browser. This is likely due to CORS restrictions. Enable USE_PROXY or test on mobile device.');
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

function labelAny(v: any, fallback = "—") {
  return (v ?? v === 0) ? String(v) : fallback;
}

function calculateScore(team?: any) {
  if (!team) return "—";
  
  // Calculate score from touchdowns, field goals, and extra points
  const touchdowns = team.touchdowns?.total || 0;
  const fieldGoals = team.field_goals?.totals?.made || 0;
  const extraPoints = team.extra_points?.kicks?.totals?.made || 0;
  const safeties = team.summary?.safeties || 0;
  
  const score = (touchdowns * 6) + (fieldGoals * 3) + extraPoints + (safeties * 2);
  return score.toString();
}

// --------- Component ---------
export default function GameSummary() {
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
    // Test environment variable loading on component mount
    const envTest = testEnvLoading();
    console.log('Environment test result:', envTest);
    
    if (canFetch) run();
  }, [canFetch]);

  const home = data?.statistics?.home;
  const away = data?.statistics?.away;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>🏈 Cowboys vs Eagles - Game Summary</Text>
      <Text style={styles.small}>September 4th, 2025 • Week 1</Text>
      <Text style={styles.small}>Game ID: {GAME_ID}</Text>

        {!canFetch && (
          <View style={styles.warningCard}>
            <Text style={styles.warn}>
              ⚠️ Set NFL_API_KEY in your .env file to fetch live data
            </Text>
            <Text style={styles.warnSub}>
              Create a .env file in the second-screen directory with:
            </Text>
            <Text style={styles.code}>NFL_API_KEY=your_sportradar_api_key</Text>
          </View>
        )}

        {canFetch && USE_PROXY && (
          <View style={styles.infoCard}>
            <Text style={styles.info}>
              🔄 Using Proxy Server Mode
            </Text>
            <Text style={styles.infoSub}>
              Make sure the proxy server is running:
            </Text>
            <Text style={styles.code}>npm run proxy</Text>
          </View>
        )}

      <View style={{ height: 8 }} />
      <Button 
        title={status === "loading" ? "Fetching..." : "Refresh Game Data"} 
        onPress={run}
        disabled={status === "loading"}
      />

      <View style={{ height: 14 }} />
      <Text style={styles.line}>Status: {status}</Text>
      {error && <Text style={styles.err}>Error: {error}</Text>}

      {data && (
        <View style={styles.card}>
          {/* --- Game Status --- */}
          <Text style={styles.h2}>🎮 Game Status</Text>
          <Text style={styles.line}>Status: {label(data.status)}</Text>
          <Text style={styles.line}>Quarter: {label(data.quarter)}</Text>
          <Text style={styles.line}>Clock: {label(data.clock)}</Text>
          <Text style={styles.line}>Attendance: {label(data.attendance)}</Text>
          <Text style={styles.line}>Duration: {label(data.duration)}</Text>

          {/* --- Live Score --- */}
          <View style={{ height: 10 }} />
          <Text style={styles.h2}>📊 Live Score</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{safeTeamName(away)}</Text>
              <Text style={styles.scoreText}>
                {calculateScore(away)}
              </Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{safeTeamName(home)}</Text>
              <Text style={styles.scoreText}>
                {calculateScore(home)}
              </Text>
            </View>
          </View>

          {/* --- Quarter Scoring --- */}
          {(data.scoring?.quarters?.length ?? 0) > 0 && (
            <>
              <View style={{ height: 10 }} />
              <Text style={styles.h3}>📈 Quarter by Quarter</Text>
              {data.scoring!.quarters!.map((q, i) => (
                <Text key={`${q.sequence ?? i}`} style={styles.line}>
                  Q{q.number}: {safeTeamName(away)} {label(q.away_points, "0")} — {safeTeamName(home)} {label(q.home_points, "0")}
                </Text>
              ))}
            </>
          )}

          {/* --- Team Info --- */}
          <View style={{ height: 10 }} />
          <Text style={styles.h2}>🏈 Team Information</Text>
          
          <View style={styles.teamInfo}>
            <Text style={styles.h3}>🛣️ {safeTeamName(away)} (Away)</Text>
            <Text style={styles.small2}>
              Total Yards: {label(away?.summary?.total_yards)} • Turnovers: {label(away?.summary?.turnovers)}
            </Text>
          </View>

          <View style={styles.teamInfo}>
            <Text style={styles.h3}>🏠 {safeTeamName(home)} (Home)</Text>
            <Text style={styles.small2}>
              Total Yards: {label(home?.summary?.total_yards)} • Turnovers: {label(home?.summary?.turnovers)}
            </Text>
          </View>


          {/* --- Team Statistics --- */}
          <View style={{ height: 10 }} />
          <Text style={styles.h3}>📊 Team Statistics</Text>
          <TeamTotals label={`🛣️ ${safeTeamName(away)}`} stats={away} />
          <TeamTotals label={`🏠 ${safeTeamName(home)}`} stats={home} />

          <View style={{ height: 6 }} />
          <Text style={styles.monoSmall}>
            Live data from Sportradar NFL API • Refreshed: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Render team statistics
function TeamTotals({ label, stats }: { label: string; stats: any }) {
  if (!stats) return <Text style={styles.line}>{label}: (no statistics available)</Text>;

  // Use the actual API structure
  const passing = stats.passing?.totals;
  const rushing = stats.rushing?.totals;
  const receiving = stats.receiving?.totals;
  const firstdowns = stats.first_downs;
  const touchdowns = stats.touchdowns;
  const efficiency = stats.efficiency;

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.lineBold}>{label}</Text>
      
      {passing && (
        <Text style={styles.small2}>
          🎯 Passing — Yds: {labelAny(passing.yards)} | Att: {labelAny(passing.attempts)} | Cmp: {labelAny(passing.completions)} | TD: {labelAny(passing.touchdowns)} | INT: {labelAny(passing.interceptions)} | Rating: {labelAny(passing.rating)}
        </Text>
      )}
      
      {rushing && (
        <Text style={styles.small2}>
          🏃 Rushing — Yds: {labelAny(rushing.yards)} | Att: {labelAny(rushing.attempts)} | TD: {labelAny(rushing.touchdowns)} | Avg: {labelAny(rushing.avg_yards)}
        </Text>
      )}
      
      {receiving && (
        <Text style={styles.small2}>
          🙌 Receiving — Yds: {labelAny(receiving.yards)} | Rec: {labelAny(receiving.receptions)} | TD: {labelAny(receiving.touchdowns)} | Avg: {labelAny(receiving.avg_yards)}
        </Text>
      )}
      
      {firstdowns && (
        <Text style={styles.small2}>
          ⬇️ First Downs — Total: {labelAny(firstdowns.total)} | Pass: {labelAny(firstdowns.pass)} | Rush: {labelAny(firstdowns.rush)} | Penalty: {labelAny(firstdowns.penalty)}
        </Text>
      )}
      
      {touchdowns && (
        <Text style={styles.small2}>
          🏆 Touchdowns — Total: {labelAny(touchdowns.total)} | Pass: {labelAny(touchdowns.pass)} | Rush: {labelAny(touchdowns.rush)}
        </Text>
      )}
      
      {efficiency?.thirddown && (
        <Text style={styles.small2}>
          📊 3rd Down — {labelAny(efficiency.thirddown.successes)}/{labelAny(efficiency.thirddown.attempts)} ({labelAny(efficiency.thirddown.pct)}%)
        </Text>
      )}
      
      {efficiency?.redzone && (
        <Text style={styles.small2}>
          🎯 Red Zone — {labelAny(efficiency.redzone.successes)}/{labelAny(efficiency.redzone.attempts)} ({labelAny(efficiency.redzone.pct)}%)
        </Text>
      )}
    </View>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    paddingTop: Platform.select({ web: 24, default: 48 }) as number,
    backgroundColor: "#0b0d14",
    minHeight: "100%",
  },
  h1: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  h2: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700", 
    marginTop: 10, 
    marginBottom: 6 
  },
  h3: { 
    color: "#fff", 
    fontSize: 15, 
    fontWeight: "700", 
    marginTop: 6 
  },
  small: { 
    color: "#aab0c2", 
    fontSize: 12, 
    marginTop: 2,
    textAlign: "center",
  },
  small2: { 
    color: "#c9d2ef", 
    fontSize: 12, 
    marginTop: 2 
  },
  monoSmall: { 
    color: "#9fb0ff", 
    fontSize: 11, 
    fontFamily: Platform.select({ 
      ios: "Menlo", 
      android: "monospace", 
      default: "monospace" 
    }) as any, 
    marginTop: 6,
    textAlign: "center",
    opacity: 0.7,
  },
  warn: { 
    color: "#ffd166", 
    fontSize: 14,
    fontWeight: "600",
  },
  warnSub: {
    color: "#ffd166",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  code: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Platform.select({ 
      ios: "Menlo", 
      android: "monospace", 
      default: "monospace" 
    }) as any,
    backgroundColor: "#1a1d2e",
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  err: { 
    color: "#ff6b6b", 
    marginTop: 4,
    fontSize: 12,
  },
  line: { 
    color: "#dfe6fb", 
    marginVertical: 2 
  },
  lineBold: { 
    color: "#fff", 
    marginVertical: 2, 
    fontWeight: "800" 
  },
  card: { 
    backgroundColor: "#141a2a", 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 10 
  },
  warningCard: {
    backgroundColor: "#2a1f0d",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ffd166",
  },
  infoCard: {
    backgroundColor: "#0d1f2a",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#66c7ff",
  },
  info: { 
    color: "#66c7ff", 
    fontSize: 14,
    fontWeight: "600",
  },
  infoSub: {
    color: "#66c7ff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  teamScore: {
    alignItems: "center",
    flex: 1,
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  scoreText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  vs: {
    color: "#aab0c2",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 20,
  },
  teamInfo: {
    marginVertical: 4,
  },
});
