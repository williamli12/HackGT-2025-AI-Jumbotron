import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8001';

export default function App() {
  const [banners, setBanners] = useState([]);
  const [hype, setHype] = useState(0);
  const [explanation, setExplanation] = useState(null);
  const [recap, setRecap] = useState(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const tapAnim = React.useRef(new Animated.Value(0)).current;

  // Animation for new banners
  const animateBanner = () => {
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(5000), // Show banner for 5 seconds
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Polling for banners and hype
  useEffect(() => {
    const pollBanners = async () => {
      try {
        const response = await axios.get(`${API_URL}/overlays`);
        if (response.data.length > 0) {
          setBanners(prev => {
            const newBanners = [...response.data, ...prev].slice(0, 3);
            if (response.data.length > 0) {
              animateBanner(); // Animate when new banner arrives
            }
            return newBanners;
          });
        }
      } catch (error) {
        console.log('Error fetching banners:', error);
      }
    };

    const pollHype = async () => {
      try {
        const response = await axios.get(`${API_URL}/party/hype`);
        setHype(response.data.hype);
      } catch (error) {
        console.log('Error fetching hype:', error);
      }
    };

    const bannerInterval = setInterval(pollBanners, 1000);
    const hypeInterval = setInterval(pollHype, 1500);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(hypeInterval);
    };
  }, []);

  const handleTap = async () => {
    try {
      await axios.post(`${API_URL}/party/tap`);
      // Add visual feedback for tap
      Animated.sequence([
        Animated.timing(tapAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tapAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } catch (error) {
      console.log('Error sending tap:', error);
    }
  };

  const handleBannerPress = async (banner) => {
    try {
      const response = await axios.post(`${API_URL}/explain`, banner);
      setExplanation(response.data);
    } catch (error) {
      console.log('Error getting explanation:', error);
    }
  };

  const handleRecapPress = async () => {
    try {
      const response = await axios.get(`${API_URL}/recap`);
      setRecap(response.data);
    } catch (error) {
      console.log('Error getting recap:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.mainContainer} 
        activeOpacity={1}
        onPress={handleTap}
      >
        {/* Tap Feedback Overlay */}
        <Animated.View 
          style={[styles.tapOverlay, { opacity: tapAnim }]} 
          pointerEvents="none"
        />

        {/* Title */}
        <Text style={styles.title}>PHI vs DAL</Text>

        {/* Banners */}
        <View style={styles.bannerContainer}>
          {banners.map((banner, index) => (
            <Animated.View 
              key={banner.id}
              style={[
                styles.bannerWrapper,
                { opacity: fadeAnim }
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.banner,
                  { backgroundColor: getBannerColor(banner.kind) }
                ]}
                onPress={() => handleBannerPress(banner)}
              >
                <Text style={styles.bannerText}>{banner.text}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.crowdBar}>
            <Animated.View 
              style={[
                styles.crowdBarFill, 
                { 
                  width: `${hype}%`,
                  backgroundColor: getHypeColor(hype)
                }
              ]} 
            />
          </View>
          <TouchableOpacity 
            style={styles.recapButton}
            onPress={handleRecapPress}
          >
            <Text style={styles.recapButtonText}>Recap</Text>
          </TouchableOpacity>
        </View>

        {/* Explainer Modal */}
        {explanation && (
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[styles.modalContent, { opacity: fadeAnim }]}
            >
              <Text style={styles.modalText}>{explanation.why}</Text>
              <Text style={styles.modalText}>{explanation.next}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setExplanation(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Recap Modal */}
        {recap && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Game Recap</Text>
              <View style={styles.recapItem}>
                <Text style={styles.recapLabel}>Biggest Run</Text>
                <Text style={styles.recapValue}>
                  {recap.biggest_run.team} +{recap.biggest_run.delta}
                </Text>
              </View>
              <View style={styles.recapItem}>
                <Text style={styles.recapLabel}>Lead Changes</Text>
                <Text style={styles.recapValue}>{recap.lead_changes}</Text>
              </View>
              <View style={styles.recapItem}>
                <Text style={styles.recapLabel}>Fastest Burst</Text>
                <Text style={styles.recapValue}>{recap.fastest_burst}</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setRecap(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Helper functions for dynamic colors
const getBannerColor = (kind) => {
  switch (kind) {
    case 'RUN_SPIKE':
      return 'rgba(255, 69, 0, 0.9)'; // Orange for runs
    case 'LEAD_CHANGE':
      return 'rgba(138, 43, 226, 0.9)'; // Purple for lead changes
    case 'PACE_SPIKE':
      return 'rgba(0, 191, 255, 0.9)'; // Blue for pace
    default:
      return 'rgba(0, 0, 0, 0.8)';
  }
};

const getHypeColor = (hype) => {
  if (hype > 80) return '#FF4500'; // Very hyped - orange
  if (hype > 60) return '#FFD700'; // Pretty hyped - gold
  if (hype > 40) return '#9ACD32'; // Medium hype - yellow-green
  return '#4169E1'; // Low hype - blue
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  bannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  bannerWrapper: {
    width: '100%',
    marginVertical: 4,
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  crowdBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  crowdBarFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.3s ease-out',
  },
  recapButton: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recapItem: {
    marginBottom: 20,
  },
  recapLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 6,
  },
  recapValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});