import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BasicScreen from './screens/BasicScreen';
import GameSummary from './screens/GameSummary';
import { useTimer } from './store/useTimer';
import { useSchedule } from './store/useSchedule';
import { useEventTesting } from './store/useEventTesting';
import DebugHUD from './components/DebugHUD';
import EventHost from './events/EventHost';
import { registerAllEvents } from './events/registerAll';
import { logRegisteredEvents } from './events/devUtils';

const Stack = createNativeStackNavigator();

// Register all event components on app start
registerAllEvents();

// Log registered events in development
if (__DEV__) {
  logRegisteredEvents();
}

function MainScreen() {
  const { elapsedMs } = useTimer();
  const { mode, activeEvent, currentClip, nextEvent, compute } = useSchedule();
  const { testEvent, isTestMode } = useEventTesting();

  const elapsedSec = Math.floor(elapsedMs / 1000);

  useEffect(() => {
    compute(elapsedSec);
  }, [elapsedSec]);

  // Determine which event to display - test event takes priority
  const displayEvent = isTestMode ? testEvent : activeEvent;
  const displayMode = isTestMode ? 'EVENT' : mode;

  return (
    <>
      {displayMode === 'EVENT' && displayEvent
        ? <EventHost event={displayEvent} />
        : <BasicScreen />
      }
      {/* <DebugHUD
        mode={displayMode}
        elapsedSec={elapsedSec}
        clipLabel={currentClip?.label ?? null}
        nextEventAt={nextEvent?.at ?? null}
        nextEventKind={nextEvent?.kind ?? null}
      /> */}
    </>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0b0d14',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ 
            title: 'Secondary Jumbotron',
            headerShown: false, // Hide header for main screen to preserve current design
          }} 
        />
        <Stack.Screen 
          name="GameSummary" 
          component={GameSummary} 
          options={{ 
            title: 'Game Summary',
            headerShown: true,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
