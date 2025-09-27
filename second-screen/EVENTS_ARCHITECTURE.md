# 🎯 Modular Event System Architecture

## Overview

The Secondary Jumbotron app now uses a **modular event system** that allows multiple team members to work on different event screens simultaneously without merge conflicts.

## 📁 Project Structure

```
second-screen/
├── src/
│   ├── events/                    # 🆕 Modular Event System
│   │   ├── README.md             # Team documentation
│   │   ├── index.ts              # Barrel exports
│   │   ├── registry.ts           # Event registry core
│   │   ├── EventHost.tsx         # Dynamic event renderer
│   │   ├── registerAll.ts        # Event registration
│   │   ├── devUtils.ts           # Development utilities
│   │   ├── TouchdownOverlay.tsx  # Individual event components
│   │   ├── PenaltyOverlay.tsx    # ↓ One file per event type
│   │   ├── TurnoverOverlay.tsx   # ↓ Easy parallel development
│   │   └── ExampleAdvancedEvent.tsx # Example with payload data
│   │
│   ├── screens/
│   │   ├── BasicScreen.tsx       # Main game screen
│   │   └── EventScreen.tsx       # 🗑️ Can be removed (replaced by modular system)
│   │
│   ├── store/                    # State management
│   │   ├── useTimer.ts           # Timer logic
│   │   └── useSchedule.ts        # Event scheduling
│   │
│   ├── schedule/
│   │   └── sampleTimeline.ts     # Event timeline data
│   │
│   ├── components/               # Shared UI components
│   └── services/                 # API and utilities
│
├── AppNavigator.tsx              # 🔄 Updated to use EventHost
└── ...
```

## 🔄 How It Works

### 1. **Event Registration**
```ts
// Each event registers itself with a unique kind
registerEvent('TOUCHDOWN', TouchdownOverlay);
registerEvent('PENALTY', PenaltyOverlay);
registerEvent('TURNOVER', TurnoverOverlay);
```

### 2. **Dynamic Event Rendering**
```tsx
// EventHost automatically picks the right component
<EventHost event={activeEvent} />
// ↓ Renders TouchdownOverlay for TOUCHDOWN events
// ↓ Renders PenaltyOverlay for PENALTY events
// ↓ Renders GenericOverlay for unknown events
```

### 3. **Timeline Integration**
```ts
// Timeline data drives which events show when
events: [
  { id: 'td-1', kind: 'TOUCHDOWN', at: 10, durationSec: 5 },
  { id: 'flag-1', kind: 'PENALTY', at: 25, durationSec: 4 },
  { id: 'turnover-1', kind: 'TURNOVER', at: 38, durationSec: 5 },
]
```

## 👥 Team Collaboration Benefits

### ✅ **Parallel Development**
- Each team member can own one or more event files
- No merge conflicts on event screens
- Independent development and testing

### ✅ **Modular Architecture**
- Add new events without touching existing code
- Easy to remove or modify individual events
- Clear separation of concerns

### ✅ **Type Safety**
- TypeScript ensures event components match expected interface
- Props validation through `EventComponentProps`
- Compile-time error checking

### ✅ **Developer Experience**
- Hot reload works on individual event components
- Debug utilities to list registered events
- Clear documentation and examples

## 🚀 Adding New Events

### Quick Start:
1. **Create component file**: `src/events/YourEventOverlay.tsx`
2. **Register the event**: Add to `registerAll.ts`
3. **Add to timeline**: Update `sampleTimeline.ts`
4. **Test**: Component works immediately

### Example Component:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EventComponentProps } from './registry';

export default function FieldGoalOverlay({ event }: EventComponentProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.msg}>FIELD GOAL!</Text>
      <Text style={styles.icon}>🏈</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#228B22', alignItems: 'center', justifyContent: 'center' },
  msg: { color: 'white', fontSize: 48, fontWeight: '900' },
  icon: { fontSize: 72, marginVertical: 16 },
});
```

## 🛠️ Development Tools

### Console Commands (in browser dev tools):
```js
// List all registered events
logRegisteredEvents()

// Check if event is registered
isEventRegistered('TOUCHDOWN') // → true

// Get all event kinds
getRegisteredEventKinds() // → ['TOUCHDOWN', 'PENALTY', 'TURNOVER']
```

### Testing Individual Events:
```tsx
import { TouchdownOverlay } from '../events';

const mockEvent = {
  id: 'test',
  kind: 'TOUCHDOWN',
  at: 0,
  durationSec: 5
};

<TouchdownOverlay event={mockEvent} />
```

## 🎨 Styling Guidelines

- Each event should have a unique background color
- Use consistent text styling (48px for main message)
- Include emoji/icons for visual distinction  
- Add `TapOverlay` for user interaction
- Keep animations lightweight for performance

## 📈 Next Steps

1. **Team Assignment**: Assign each team member specific event types
2. **Custom Events**: Create sport-specific events (sacks, interceptions, etc.)
3. **Advanced Features**: Add team colors, player names via payload data
4. **Integration**: Connect events to real NFL API data
5. **Polish**: Add sound effects, advanced animations

The modular system is ready for your hackathon team to build amazing event experiences! 🏈🎉
