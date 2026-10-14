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
}

export const defaults: Settings = {
  count: 20000,
  gravityX: 0,
  gravityY: 0,
  drag: 0,
  bounce: 1,
  pointerRadius: 200,
  pointerStrength: 4000,
  pointerSwirl: 0,
  centerPull: 0,
  centerSwirl: 0,
}

// The live, mutable copy. The panel writes to it, the loop reads from it.
export const settings: Settings = { ...defaults }