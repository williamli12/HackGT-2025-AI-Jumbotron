import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/AppNavigator';
import { startTicker } from './src/services/time';
import { useTimer } from './src/store/useTimer';

export default function App() {
  useEffect(() => {
    const stop = startTicker((t) => {
      useTimer.getState().tick(t);
    }, 10);
    return stop;
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
