import { create } from 'zustand';
import { TimelineEvent } from '../types';

type EventTestingState = {
  testEvent: TimelineEvent | null;
  isTestMode: boolean;
  triggerTestEvent: (kind: string, durationSec?: number, payload?: Record<string, any>) => void;
  clearTestEvent: () => void;
};

export const useEventTesting = create<EventTestingState>((set) => ({
  testEvent: null,
  isTestMode: false,
  triggerTestEvent: (kind, durationSec = 5, payload) => {
    const testEvent: TimelineEvent = {
      id: 'test-event',
      kind: kind as any,
      at: 0,
      durationSec,
      payload
    };
    set({
      testEvent,
      isTestMode: true
    });
  },
  clearTestEvent: () => {
    set({
      testEvent: null,
      isTestMode: false
    });
  }
}));
