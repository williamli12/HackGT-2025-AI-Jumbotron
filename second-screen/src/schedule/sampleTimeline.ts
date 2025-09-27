import { Timeline } from '../types';

export const demoTimeline: Timeline = {
  clips: [
    { id: 'clip-1', startSec: 0, endSec: 20, label: 'Q1 Opening Drive' },
    { id: 'clip-2', startSec: 20, endSec: 45, label: 'Q1 Mid Drive' },
  ],
  events: [
    { id: 'ev-tap',    kind: 'TAP_FOR_LIKES', at: 10, durationSec: 7 },
    { id: 'ev-battle', kind: 'LIKE_BATTLE', at: 20, durationSec: 10 },
    { id: 'ev-td',     kind: 'TOUCHDOWN', at: 32, durationSec: 5 },
    { id: 'ev-flag',   kind: 'PENALTY',   at: 40, durationSec: 4 },
    { id: 'ev-turnover', kind: 'TURNOVER', at: 47, durationSec: 5 },
  ],
};