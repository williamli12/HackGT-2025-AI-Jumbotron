import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BasicScreen from './screens/BasicScreen';
import EventScreen from './screens/EventScreen';
import { useTimer } from './store/useTimer';
import { useSchedule } from './store/useSchedule';
import DebugHUD from './components/DebugHUD';

export default function AppNavigator() {
  const { elapsedMs } = useTimer();
  const { mode, activeEvent, currentClip, nextEvent, compute } = useSchedule();

  const elapsedSec = Math.floor(elapsedMs / 1000);

  useEffect(() => {
    compute(elapsedSec);
  }, [elapsedSec]);

  return (
    <NavigationContainer>
      {mode === 'EVENT'
        ? <EventScreen kind={activeEvent?.kind ?? 'GENERIC'} />
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
