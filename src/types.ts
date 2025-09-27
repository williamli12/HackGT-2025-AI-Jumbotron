export type TimelineEvent = {
  id: string;
  kind: 'TOUCHDOWN' | 'PENALTY' | 'TURNOVER' | 'GENERIC';
  at: number;          // absolute seconds from start of the stitched clips
  durationSec: number; // how long the event overlay should remain visible
  payload?: Record<string, any>;
};

export type Clip = {
  id: string;
  startSec: number;    // absolute start in the global timeline
  endSec: number;      // absolute end in the global timeline
  label?: string;
};

export type Timeline = {
  clips: Clip[];
  events: TimelineEvent[];
};
