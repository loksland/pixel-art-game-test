// type Emitter {
//   config: string;
//   constructor(config: string): { config: string };
// }

import { Container } from 'pixi.js';

export function createEmitter(
  parent: Container,
  config: object,
  textures: string[],
): Emitter;

export type Emitter = {
  autoUpdate: boolean;
  emit: boolean;
  updateSpawnPos: (x: number, y: number) => void;
  updateOwnerPos: (x: number, y: number) => void;
  resetPositionTracking: () => void;
  initBehaviors: ParticleBehaviour[];
  update: (deltaSeconds: number) => void;
  playOnceAndDestroy: (callback: () => void) => void;
  playOnce: (callback: () => void) => void;
  rotate: (angleDegrees: number) => void;
  autoUpdate: boolean;
  destroy: () => void;
};

export type ParticleBehaviour = {
  shape?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};
