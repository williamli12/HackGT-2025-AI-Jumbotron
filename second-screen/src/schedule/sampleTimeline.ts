import { Timeline } from '../types';

export const demoTimeline: Timeline = {
  clips: [
    { id: 'clip-1', startSec: 0, endSec: 20, label: 'Q1 Opening Drive' },
    { id: 'clip-2', startSec: 20, endSec: 45, label: 'Q1 Mid Drive' },
    { id: 'clip-3', startSec: 45, endSec: 70, label: 'Q2 Red Zone' },
    { id: 'clip-4', startSec: 70, endSec: 95, label: 'Q2 Controversial Play' },
  ],
  events: [
    { id: 'ev-td',     kind: 'TOUCHDOWN', at: 10, durationSec: 5 },
    { id: 'ev-flag',   kind: 'PENALTY',   at: 25, durationSec: 4 },
    { 
      id: 'ev-turnover', 
      kind: 'TURNOVER', 
      at: 38, 
      durationSec: 6,
      payload: {
        turnoverType: 'INTERCEPTION',
        team: 'Eagles Defense',
        player: 'Darius Slay'
      }
    },
    { 
      id: 'ev-celebration', 
      kind: 'CELEBRATION', 
      at: 50, 
      durationSec: 8,
      payload: {
        celebrationType: 'TOUCHDOWN',
        playerName: 'A.J. Brown',
        teamColor: '#004c54', // Eagles green
        homeScore: 21,
        awayScore: 7
      }
    },
    {
      id: 'ev-controversial',
      kind: 'CONTROVERSIAL_CALL',
      at: 75,
      durationSec: 12,
      payload: {
        callType: 'PASS INTERFERENCE',
        callDescription: 'Defensive Pass Interference',
        team: 'Cowboys',
        gameImpact: 'First down at the 5-yard line'
      }
    },
  ],
};
