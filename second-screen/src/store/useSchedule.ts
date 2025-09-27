import { create } from 'zustand';
import { newGameTimeline } from '../schedule/newGameTimeline';
import { TimelineEvent, Clip } from '../types';

export type Mode = 'BASIC' | 'EVENT';

function getActiveEvent(elapsedSec: number) {
  return newGameTimeline.events.find(ev => elapsedSec >= ev.at && elapsedSec < ev.at + ev.durationSec) ?? null;
}

function getCurrentClip(elapsedSec: number) {
  return newGameTimeline.clips.find(c => elapsedSec >= c.startSec && elapsedSec < c.endSec) ?? null;
}

function getNextEventAfter(elapsedSec: number) {
  const future = newGameTimeline.events.filter(ev => ev.at > elapsedSec);
  future.sort((a,b) => a.at - b.at);
  return future[0] ?? null;
}

type ScheduleState = {
  mode: Mode;
  activeEvent: TimelineEvent | null;
  currentClip: Clip | null;
  nextEvent: TimelineEvent | null;
  compute: (elapsedSec: number) => void;
};

export const useSchedule = create<ScheduleState>((set) => ({
  mode: 'BASIC',
  activeEvent: null,
  currentClip: null,
  nextEvent: null,
  compute: (elapsedSec) => {
    const activeEvent = getActiveEvent(elapsedSec);
    const currentClip = getCurrentClip(elapsedSec);
    const nextEvent = getNextEventAfter(elapsedSec);
    set({
      activeEvent,
      currentClip,
      nextEvent,
      mode: activeEvent ? 'EVENT' : 'BASIC',
    });
  },
}));
