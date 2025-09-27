import { Timeline } from '../types';

export const demoTimeline: Timeline = {
  clips: [
    { id: 'clip-1', startSec: 0, endSec: 20, label: 'Q1 Opening Drive' },
    { id: 'clip-2', startSec: 20, endSec: 45, label: 'Q1 Mid Drive' },
  ],
  events: [
    { id: 'ev-td',     kind: 'TOUCHDOWN', at: 10, durationSec: 5 },
    { id: 'ev-flag',   kind: 'PENALTY',   at: 25, durationSec: 4 },
    { id: 'ev-turnover', kind: 'TURNOVER', at: 38, durationSec: 5 },
  ],
};
