import { getEventComponent } from './registry';

/**
 * Development utilities for the event system
 * These functions help with debugging and development
 */

/**
 * Get all registered event kinds
 * Useful for debugging and development
 */
export function getRegisteredEventKinds(): string[] {
  const kinds: string[] = [];
  
  // Common event kinds to check
  const possibleKinds = [
    'TOUCHDOWN', 'PENALTY', 'TURNOVER', 'SACK', 'INTERCEPTION', 
    'FUMBLE', 'FIELD_GOAL', 'SAFETY', 'TIMEOUT', 'CELEBRATION',
    'FIRST_DOWN', 'KICKOFF', 'PUNT', 'AMAZING_PLAY', 'GENERIC'
  ];
  
  possibleKinds.forEach(kind => {
    if (getEventComponent(kind)) {
      kinds.push(kind);
    }
  });
  
  return kinds;
}

/**
 * Check if an event kind is registered
 */
export function isEventRegistered(kind: string): boolean {
  return getEventComponent(kind) !== null;
}

/**
 * Development function to log all registered events
 * Call this in console to see what events are available
 */
export function logRegisteredEvents(): void {
  const kinds = getRegisteredEventKinds();
  console.log('📋 Registered Event Kinds:', kinds);
  console.log(`✅ Total: ${kinds.length} events registered`);
}

// Make it available globally for debugging
if (__DEV__) {
  (global as any).logRegisteredEvents = logRegisteredEvents;
  (global as any).getRegisteredEventKinds = getRegisteredEventKinds;
}
