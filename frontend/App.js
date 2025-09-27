import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [banners, setBanners] = useState([]);
  const [hype, setHype] = useState(0);
  const [explanation, setExplanation] = useState(null);
  const [recap, setRecap] = useState(null);

  // Polling for banners and hype
  useEffect(() => {
    const pollBanners = async () => {
      try {
        const response = await axios.get(`${API_URL}/overlays`);
        if (response.data.length > 0) {
          setBanners(prev => [...response.data, ...prev].slice(0, 3));
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
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.mainContainer} 
        activeOpacity={1}
        onPress={handleTap}
      >
        {/* Title */}
        <Text style={styles.title}>PHI vs DAL</Text>

        {/* Banners */}
        <View style={styles.bannerContainer}>
          {banners.map((banner, index) => (
            <TouchableOpacity 
              key={banner.id}
              style={styles.banner}
              onPress={() => handleBannerPress(banner)}
            >
              <Text style={styles.bannerText}>{banner.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.crowdBar}>
            <View style={[styles.crowdBarFill, { width: `${hype}%` }]} />
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
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{explanation.why}</Text>
              <Text style={styles.modalText}>{explanation.next}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setExplanation(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContainer: {
    flex: 1,
    padding: 20,
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
  },
  banner: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    width: '100%',
  },
  bannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  crowdBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  crowdBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  recapButton: {
    backgroundColor: '#444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  recapItem: {
    marginBottom: 16,
  },
  recapLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  recapValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});