export interface Settings {
  count: number
  gravityX: number
  gravityY: number
  drag: number
  bounce: number
  pointerRadius: number
  pointerStrength: number
}

export const defaults: Settings = {
  count: 20000,
  gravityX: 0,
  gravityY: 600,
  drag: 0.3,
  bounce: 0.8,
  pointerRadius: 200,
  pointerStrength: 4000,
}

// The live, mutable copy. The panel writes to it, the loop reads from it.
export const settings: Settings = { ...defaults }