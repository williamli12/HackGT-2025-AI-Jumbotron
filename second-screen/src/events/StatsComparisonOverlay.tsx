import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import type { EventComponentProps } from './registry';

type StatItem = {
  label: string;
  gameValue: number;
  baselineValue: number;
  unit: string;
  icon: string;
  isHigherBetter: boolean;
};

export default function StatsComparisonOverlay({ event }: EventComponentProps) {
  const [stats] = useState<StatItem[]>([
    { label: 'Total Yards', gameValue: 387, baselineValue: 320, unit: '', icon: '📏', isHigherBetter: true },
    { label: 'Passing Yards', gameValue: 285, baselineValue: 240, unit: '', icon: '🎯', isHigherBetter: true },
    { label: 'Rushing Yards', gameValue: 102, baselineValue: 80, unit: '', icon: '🏃', isHigherBetter: true },
    { label: 'First Downs', gameValue: 23, baselineValue: 18, unit: '', icon: '⬇️', isHigherBetter: true },
    { label: 'Time of Possession', gameValue: 32.5, baselineValue: 30.0, unit: 'min', icon: '⏱️', isHigherBetter: true },
    { label: 'Turnovers', gameValue: 1, baselineValue: 2, unit: '', icon: '🔄', isHigherBetter: false },
    { label: 'Penalties', gameValue: 6, baselineValue: 8, unit: '', icon: '🚩', isHigherBetter: false },
    { label: 'Red Zone %', gameValue: 75, baselineValue: 60, unit: '%', icon: '🎯', isHigherBetter: true },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(stats.map(() => new Animated.Value(0))).current;
  const barAnims = useRef(stats.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Staggered slide-in animation for stats
    const slideAnimations = slideAnims.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    // Bar fill animations
    const barAnimations = barAnims.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        delay: 500 + (index * 80),
        useNativeDriver: false,
      })
    );

    Animated.parallel([
      ...slideAnimations,
      ...barAnimations,
    ]).start();

    // Pulse animation for header
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const getPerformanceColor = (stat: StatItem) => {
    const isImproved = stat.isHigherBetter 
      ? stat.gameValue > stat.baselineValue 
      : stat.gameValue < stat.baselineValue;
    
    return isImproved ? '#4CAF50' : '#FF5722';
  };

  const getPerformanceText = (stat: StatItem) => {
    const isImproved = stat.isHigherBetter 
      ? stat.gameValue > stat.baselineValue 
      : stat.gameValue < stat.baselineValue;
    
    const diff = Math.abs(stat.gameValue - stat.baselineValue);
    const percentChange = Math.round((diff / stat.baselineValue) * 100);
    
    return {
      text: isImproved ? `+${percentChange}%` : `-${percentChange}%`,
      color: isImproved ? '#4CAF50' : '#FF5722',
      icon: isImproved ? '↗️' : '↘️'
    };
  };

  const getBarWidth = (stat: StatItem) => {
    const maxValue = Math.max(stat.gameValue, stat.baselineValue) * 1.2;
    return {
      game: (stat.gameValue / maxValue) * 100,
      baseline: (stat.baselineValue / maxValue) * 100,
    };
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.title}>GAME PERFORMANCE 📊</Text>
        <Text style={styles.subtitle}>vs Season Average</Text>
      </Animated.View>

      {/* Stats Grid */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const performance = getPerformanceText(stat);
            const barWidths = getBarWidth(stat);
            
            return (
              <Animated.View
                key={stat.label}
                style={[
                  styles.statCard,
                  {
                    opacity: slideAnims[index],
                    transform: [{
                      translateY: slideAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }]
                  }
                ]}
              >
                {/* Stat Header */}
                <View style={styles.statHeader}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.performanceBadge}>
                    <Text style={[styles.performanceText, { color: performance.color }]}>
                      {performance.icon} {performance.text}
                    </Text>
                  </View>
                </View>

                {/* Values */}
                <View style={styles.valuesContainer}>
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Today</Text>
                    <Text style={[styles.gameValue, { color: getPerformanceColor(stat) }]}>
                      {stat.gameValue}{stat.unit}
                    </Text>
                  </View>
                  <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Average</Text>
                    <Text style={styles.baselineValue}>
                      {stat.baselineValue}{stat.unit}
                    </Text>
                  </View>
                </View>

                {/* Comparison Bars */}
                <View style={styles.barsContainer}>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Today</Text>
                    <View style={styles.barTrack}>
                      <Animated.View 
                        style={[
                          styles.gameBar,
                          { 
                            backgroundColor: getPerformanceColor(stat),
                            width: barAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${barWidths.game}%`],
                            })
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Avg</Text>
                    <View style={styles.barTrack}>
                      <Animated.View 
                        style={[
                          styles.baselineBar,
                          { 
                            width: barAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${barWidths.baseline}%`],
                            })
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {stats.filter(s => {
                const isImproved = s.isHigherBetter 
                  ? s.gameValue > s.baselineValue 
                  : s.gameValue < s.baselineValue;
                return isImproved;
              }).length}
            </Text>
            <Text style={styles.summaryLabel}>Stats Improved</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {Math.round(
                (stats.filter(s => {
                  const isImproved = s.isHigherBetter 
                    ? s.gameValue > s.baselineValue 
                    : s.gameValue < s.baselineValue;
                  return isImproved;
                }).length / stats.length) * 100
              )}%
            </Text>
            <Text style={styles.summaryLabel}>Performance</Text>
          </View>
        </View>
        <Text style={styles.footerText}>🏆 Outstanding Performance Today!</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  header: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    color: '#00D4FF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,212,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  statsGrid: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  statLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  performanceBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  valueRow: {
    alignItems: 'center',
  },
  valueLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  baselineValue: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 20,
    fontWeight: '700',
  },
  barsContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    width: 40,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginLeft: 8,
  },
  gameBar: {
    height: '100%',
    borderRadius: 4,
  },
  baselineBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    color: '#00D4FF',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,212,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
  },
  footerText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
