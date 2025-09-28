import { Timeline } from '../types';

export const newGameTimeline: Timeline = {
  clips: [
    { id: 'clip-1', startSec: 0, endSec: 25, label: 'Drive Setup & Penalty' },
    { id: 'clip-2', startSec: 25, endSec: 45, label: 'Touchdown & Decision' },
    { id: 'clip-3', startSec: 45, endSec: 65, label: 'Defense & Celebration' },
    { id: 'clip-4', startSec: 65, endSec: 85, label: 'MVP Voting' },
    { id: 'clip-5', startSec: 85, endSec: 105, label: 'Final Statistics' },
  ],
  events: [
    // Flag @ 10 seconds (battle penalty)
    { 
      id: 'ev-penalty-flag', 
      kind: 'CONTROVERSIAL_CALL', 
      at: 10, 
      durationSec: 5, // Increased from 2 to 5 seconds (+3s more)
      payload: {
        callType: 'HOLDING',
        callDescription: 'Offensive Holding',
        team: 'Eagles',
        gameImpact: '10 yard penalty, 1st & 20'
      }
    },
    
    // Touchdown @ 23 (moved 1 second later)
    { 
      id: 'ev-touchdown', 
      kind: 'TOUCHDOWN', 
      at: 23, // Moved from 22 to 23 seconds (+1s later)
      durationSec: 4,
      payload: {
        playerName: 'J. Daniels',
        teamName: 'Eagles',
        homeScore: 26,
        awayScore: 20
      }
    },
    
    // 2pt vote starts @ 27 (kickoff @ 34)
    { 
      id: 'ev-2pt-decision', 
      kind: 'TWO_POINT_KICK_POLL', 
      at: 27, 
      durationSec: 10, // Reduced from 11 to 10 seconds (-1s more)
      payload: {
        situation: 'Go for 2 or kick the extra point?',
        timeRemaining: '2:15',
        quarter: 4,
        homeScore: 26,
        awayScore: 20
      }
    },
    
    // Defense hype up (tap for hype) @ 46
    { 
      id: 'ev-defense-hype', 
      kind: 'CELEBRATION', 
      at: 46, 
      durationSec: 12, // Reduced from 13 to 12 seconds (-1s more)
      payload: {
        celebrationType: 'DEFENSE_STOP',
        playerName: 'Defense',
        teamColor: '#004c54', // Eagles green
        homeScore: 27,
        awayScore: 20,
        gameContext: 'DEFENSE WINS CHAMPIONSHIPS!'
      }
    },
    
    // MVP vote starts right after game end @ 1:02 (62 seconds)
    { 
      id: 'ev-mvp-voting', 
      kind: 'MVP_VOTE', 
      at: 63, 
      durationSec: 13.5, // Reduced from 15 to 13.5 seconds (-1.5s)
      payload: {
        gameContext: 'Game Over! Who\'s your MVP?',
        players: [
          { 
            id: '1', 
            name: 'J. Daniels', 
            position: 'QB', 
            stats: '285 YDS, 3 TD', 
            teamColor: '#004c54'
          },
          { 
            id: '2', 
            name: 'M. Johnson', 
            position: 'RB', 
            stats: '142 YDS, 2 TD', 
            teamColor: '#004c54'
          },
          { 
            id: '3', 
            name: 'Defense', 
            position: 'DEF', 
            stats: '3 SACKS, 2 INT', 
            teamColor: '#004c54'
          }
        ],
        finalGame: true
      }
    },
    
    // Dashboard statistics after MVP vote
    { 
      id: 'ev-final-stats', 
      kind: 'STATS_COMPARISON', 
      at: 77, // Moved from 80 to 77 to start right after MVP vote (63 + 13.5 = 76.5)
      durationSec: 25, // Increased from 20 to 25 seconds (+5s longer)
      payload: {
        gameTitle: 'Final Game Performance',
        gameStats: {
          totalYards: 387,
          passingYards: 285,
          rushingYards: 102,
          firstDowns: 23,
          timeOfPossession: 32.5,
          turnovers: 1,
          penalties: 6,
          redZonePercent: 75
        },
        baselineStats: {
          totalYards: 320,
          passingYards: 240,
          rushingYards: 80,
          firstDowns: 18,
          timeOfPossession: 30.0,
          turnovers: 2,
          penalties: 8,
          redZonePercent: 60
        },
        performanceRating: 'Outstanding',
        finalScore: { home: 27, away: 20 }
      }
    },
  ],
};
