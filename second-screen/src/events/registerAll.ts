import { registerEvent } from './registry';
import TouchdownOverlay from './TouchdownOverlay';
import PenaltyOverlay from './PenaltyOverlay';
import TurnoverOverlay from './TurnoverOverlay';
import CelebrationOverlay from './CelebrationOverlay';
import ControversialCallOverlay from './ControversialCallOverlay';

export function registerAllEvents() {
  registerEvent('TOUCHDOWN', TouchdownOverlay);
  registerEvent('PENALTY', PenaltyOverlay);
  registerEvent('TURNOVER', TurnoverOverlay);
  registerEvent('CELEBRATION', CelebrationOverlay);
  registerEvent('CONTROVERSIAL_CALL', ControversialCallOverlay);
}
