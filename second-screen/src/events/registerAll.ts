import { registerEvent } from './registry';
import TouchdownOverlay from './TouchdownOverlay';
import PenaltyOverlay from './PenaltyOverlay';
import TurnoverOverlay from './TurnoverOverlay';

export function registerAllEvents() {
  registerEvent('TOUCHDOWN', TouchdownOverlay);
  registerEvent('PENALTY', PenaltyOverlay);
  registerEvent('TURNOVER', TurnoverOverlay);
}
