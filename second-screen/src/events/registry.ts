import type { TimelineEvent } from '../types';
import React from 'react';

export type EventComponentProps = { event: TimelineEvent };
export type EventComponent = React.ComponentType<EventComponentProps>;

const registry: Record<string, EventComponent> = {};

export function registerEvent(kind: string, Component: EventComponent) {
  registry[kind] = Component;
}

export function getEventComponent(kind?: string): EventComponent | null {
  if (!kind) return null;
  return registry[kind] ?? null;
}
