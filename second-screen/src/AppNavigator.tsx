import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BasicScreen from './screens/BasicScreen';
import { useTimer } from './store/useTimer';
import { useSchedule } from './store/useSchedule';
import DebugHUD from './components/DebugHUD';
import EventHost from './events/EventHost';
import { registerAllEvents } from './events/registerAll';
import { logRegisteredEvents } from './events/devUtils';

// Register all event components on app start
registerAllEvents();

// Log registered events in development
if (__DEV__) {
  logRegisteredEvents();
}

export default function AppNavigator() {
  const { elapsedMs } = useTimer();
  const { mode, activeEvent, currentClip, nextEvent, compute } = useSchedule();

  const elapsedSec = Math.floor(elapsedMs / 1000);

  useEffect(() => {
    compute(elapsedSec);
  }, [elapsedSec]);

  return (
    <NavigationContainer>
      {mode === 'EVENT' && activeEvent
        ? <EventHost event={activeEvent} />
        : <BasicScreen />
      }
      <DebugHUD
        mode={mode}
        elapsedSec={elapsedSec}
        clipLabel={currentClip?.label ?? null}
        nextEventAt={nextEvent?.at ?? null}
        nextEventKind={nextEvent?.kind ?? null}
      />
    </NavigationContainer>
  );
}
