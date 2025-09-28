import { registerEvent } from './registry';
import TouchdownOverlay from './TouchdownOverlay';
import PenaltyOverlay from './PenaltyOverlay';
import TurnoverOverlay from './TurnoverOverlay';
import CelebrationOverlay from './CelebrationOverlay';
import ControversialCallOverlay from './ControversialCallOverlay';
import MvpVoteOverlay from './MvpVoteOverlay';
import TwoPointKickPollOverlay from './TwoPointKickPollOverlay';
import GameSummaryOverlay from './GameSummaryOverlay';

export function registerAllEvents() {
  registerEvent('TOUCHDOWN', TouchdownOverlay);
  registerEvent('PENALTY', PenaltyOverlay);
  registerEvent('TURNOVER', TurnoverOverlay);
  registerEvent('CELEBRATION', CelebrationOverlay);
  registerEvent('CONTROVERSIAL_CALL', ControversialCallOverlay);
  registerEvent('MVP_VOTE', MvpVoteOverlay);
  registerEvent('TWO_POINT_KICK_POLL', TwoPointKickPollOverlay);
  registerEvent('STATS_COMPARISON', GameSummaryOverlay);
}
