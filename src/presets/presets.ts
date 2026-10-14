import { defaults, type Settings } from '../config'

export const presets: Record<string, Partial<Settings>> = {
  Default: {},

  Rain: {
    gravityY: 1400,
    drag: 0.05,
    bounce: 0.35,
    pointerStrength: 9000,
    pointerRadius: 160,
  },

  Nebula: {
    gravityY: 0,
    drag: 0.6,
    bounce: 0.9,
    pointerStrength: 2500,
    pointerRadius: 350,
    pointerSwirl: 0.4,
  },

  Swarm: {
    gravityY: 0,
    drag: 1.2,
    bounce: 0.6,
    pointerStrength: 6000,
    pointerRadius: 300,
    pointerSwirl: 0.8,
    centerPull: 250,
  },
}

export function applyPreset(name: string, target: Settings) {
  Object.assign(target, defaults, presets[name])
}