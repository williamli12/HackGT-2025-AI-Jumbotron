// Event system exports
export { registerEvent, getEventComponent } from './registry';
export type { EventComponent, EventComponentProps } from './registry';
export { default as EventHost } from './EventHost';
export { registerAllEvents } from './registerAll';

// Development utilities
export { getRegisteredEventKinds, isEventRegistered, logRegisteredEvents } from './devUtils';

// Individual event components (for testing/debugging)
export { default as TouchdownOverlay } from './TouchdownOverlay';
export { default as PenaltyOverlay } from './PenaltyOverlay';
export { default as TurnoverOverlay } from './TurnoverOverlay';
export { default as CelebrationOverlay } from './CelebrationOverlay';
export { default as ControversialCallOverlay } from './ControversialCallOverlay';
export { default as ExampleAdvancedEvent } from './ExampleAdvancedEvent';
