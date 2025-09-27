# Event System

This directory contains the modular event system for the Secondary Jumbotron app. Each event type (TOUCHDOWN, PENALTY, etc.) has its own component file, making it easy for multiple team members to work on different events without conflicts.

## Architecture

- **`registry.ts`** - Central registry that maps event kinds to React components
- **`EventHost.tsx`** - Host component that renders the appropriate event overlay based on the active event
- **`registerAll.ts`** - Registers all event components with the registry
- **Individual event files** - Each event type has its own component file

## How to Add a New Event

1. **Create the event component:**
   ```tsx
   // src/events/SackOverlay.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   import type { EventComponentProps } from './registry';
   import TapOverlay from '../components/TapOverlay';

   export default function SackOverlay({ event }: EventComponentProps) {
     return (
       <View style={styles.root}>
         <Text style={styles.msg}>SACK!</Text>
         <Text style={styles.icon}>💥</Text>
         <TapOverlay />
       </View>
     );
   }

   const styles = StyleSheet.create({
     root: { flex: 1, backgroundColor: '#2F4F4F', alignItems: 'center', justifyContent: 'center' },
     msg: { color: 'white', fontSize: 48, fontWeight: '900' },
     icon: { fontSize: 72, marginVertical: 16 },
   });
   ```

2. **Register the event in `registerAll.ts`:**
   ```ts
   import SackOverlay from './SackOverlay';
   
   export function registerAllEvents() {
     // ... existing registrations
     registerEvent('SACK', SackOverlay);
   }
   ```

3. **Add the event to your timeline:**
   ```ts
   // src/schedule/sampleTimeline.ts
   events: [
     // ... existing events
     { id: 'ev-sack', kind: 'SACK', at: 30, durationSec: 3 },
   ]
   ```

4. **Update types if needed:**
   ```ts
   // src/types.ts
   kind: 'TOUCHDOWN' | 'PENALTY' | 'TURNOVER' | 'SACK' | 'GENERIC';
   ```

## Event Component Props

Each event component receives:
- `event: TimelineEvent` - The full event object with `id`, `kind`, `at`, `durationSec`, and optional `payload`

You can access event-specific data through `event.payload`:
```tsx
const playerName = event.payload?.playerName;
const teamColors = event.payload?.teamColors;
```

## Best Practices

- Each event should have its own unique background color
- Include a `TapOverlay` for user interaction
- Use consistent text styling (see existing events for reference)
- Keep animations lightweight for performance
- Add emojis or icons to make events visually distinct

## Testing Your Event

You can test your event component in isolation:
```tsx
import { SackOverlay } from './src/events';

const mockEvent = {
  id: 'test-sack',
  kind: 'SACK',
  at: 0,
  durationSec: 3,
  payload: { playerName: 'Aaron Donald' }
};

<SackOverlay event={mockEvent} />
```

## Team Collaboration

- Each team member can own one or more event files
- No merge conflicts since each event is a separate file
- Register new events in `registerAll.ts` (coordinate with team)
- Use descriptive component names ending in "Overlay"
