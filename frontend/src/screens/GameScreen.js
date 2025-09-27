import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import axios from 'axios';

import Banner from '../components/Banner';
import CrowdBar from '../components/CrowdBar';
import ExplainerPanel from '../components/ExplainerPanel';
import RecapPanel from '../components/RecapPanel';

const API_URL = 'http://localhost:8000';

const GameScreen = () => {
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
      ReactNativeHapticFeedback.trigger('impactMedium');
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
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleTap}
    >
      {/* Title */}
      <Text style={styles.title}>PHI vs DAL</Text>

      {/* Banners */}
      <View style={styles.bannerContainer}>
        {banners.map((banner, index) => (
          <Banner 
            key={banner.id} 
            banner={banner}
            onPress={handleBannerPress}
          />
        ))}
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <CrowdBar hype={hype} />
        <TouchableOpacity 
          style={styles.recapButton}
          onPress={handleRecapPress}
        >
          <Text style={styles.recapButtonText}>Recap</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <ExplainerPanel 
        explanation={explanation}
        onClose={() => setExplanation(null)}
      />
      <RecapPanel 
        recap={recap}
        onClose={() => setRecap(null)}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
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
});

export default GameScreen;
