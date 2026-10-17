export const isTouch = window.matchMedia('(pointer: coarse)').matches
export const maxCount = isTouch ? 20000 : 100000

export interface NumberSpec {
  default: number
  min: number
  max: number
  step?: number
}

export const spec = {
  count: { default: 20000, min: 1000, max: maxCount, step: 1000 },
  gravityX: { default: 0, min: -2000, max: 2000 },
  gravityY: { default: 0, min: -2000, max: 2000 },
  drag: { default: 0.2, min: 0, max: 5 },
  bounce: { default: 0.8, min: 0, max: 1 },
  pointerRadius: { default: 200, min: 20, max: 600 },
  pointerStrength: { default: 3000, min: 0, max: 20000 },
  pointerSwirl: { default: 0, min: -1, max: 1 },
  centerPull: { default: 0, min: 0, max: 1000 },
  centerSwirl: { default: 0, min: -1000, max: 1000 },
  trail: { default: 0, min: 0, max: 0.9 },
  colourSpeed: { default: 400, min: 100, max: 2000, step: 10 },
  burstCount: { default: 0, min: 0, max: 2000, step: 50 },
  burstSpeed: { default: 700, min: 100, max: 2000 },
} satisfies Record<string, NumberSpec>

export type NumericKey = keyof typeof spec
export type Settings = Record<NumericKey, number> & { palette: string }

const numericKeys = Object.keys(spec) as NumericKey[]

export const defaults: Settings = {
  ...(Object.fromEntries(numericKeys.map((k) => [k, spec[k].default])) as Record<NumericKey, number>),
  palette: 'Ice',
}

// The live, mutable copy. The panel writes to it, the loop reads from it.
export const settings: Settings = { 
  ...defaults,
  count: isTouch ? 5000 : defaults.count
}

export function clampValue(key: NumericKey, value: number): number {
  const { min, max } = spec[key]
  return Math.min(max, Math.max(min, value))
}

export function clampSettings(s: Settings) {
  for (const key of numericKeys) s[key] = clampValue(key, s[key])
}