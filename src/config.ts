export interface Settings {
  count: number
  gravityX: number
  gravityY: number
  drag: number
  bounce: number
  pointerRadius: number
  pointerStrength: number
  pointerSwirl: number // 0 = straight pull, 1 = pure sideways spin
  centerPull: number // px/s² toward screen center, 0 = off
  centerSwirl: number
  trail: number
  palette: string
  burstCount: number
  burstSpeed: number
}

export const defaults: Settings = {
  count: 20000,
  gravityX: 0,
  gravityY: 0,
  drag: 0.1,
  bounce: 0.9,
  pointerRadius: 200,
  pointerStrength: 2500,
  pointerSwirl: 0,
  centerPull: 0,
  centerSwirl: 0,
  trail: 0,
  palette: 'Ice',
  burstCount: 0,
  burstSpeed: 700,
}

export const isTouch = window.matchMedia('(pointer: coarse)').matches

// The live, mutable copy. The panel writes to it, the loop reads from it.
export const settings: Settings = { 
  ...defaults,
  count: isTouch ? 6000 : defaults.count
}

export const maxCount = isTouch ? 30000 : 100000