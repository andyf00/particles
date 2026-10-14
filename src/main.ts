import './style.css'
import { ParticleSystem } from './sim/ParticleSystem'
import { pointer, initPointer } from './input/pointer'
import { settings } from './config'
import { initPanel } from './ui/panel'
import { BUCKETS, buildPalette } from './render/palettes'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
if (!context) throw new Error('Canvas 2D not supported')
const ctx: CanvasRenderingContext2D = context

// Size of the canvas in CSS pixels
let width = 0
let height = 0

function resize() {
  const dpr = window.devicePixelRatio || 1
  width = window.innerWidth
  height = window.innerHeight
  
  // Scale canvas size to match device
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  // Map CSS-pixel coordinates onto device pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

window.addEventListener('resize', resize)
resize()

const sim = new ParticleSystem(settings.count, width, height)
initPointer(canvas)
initPanel((count) => sim.setCount(count, width, height))

// ---- Rendering ----
let fps = 0
const hud = document.getElementById('hud') as HTMLDivElement

const MAX_SPEED = 400 // px/s that maps to the "fastest" colour
const MIN_FADE = 0.1 // smallest background fill we draw

let paletteName = settings.palette
let colours = buildPalette(paletteName)
let bucketOf = new Uint8Array(0) // which colour bucket each particle is in
let fadeAcc = 1 // brightness remaining since the last fade was drawn

function render(elapsed: number) {
  // Fade old frame, but only once the saved-up fade is big enough
  const decay = Math.pow(settings.trail, elapsed * 60)
  fadeAcc = Math.min(1, fadeAcc * (Number.isFinite(decay) ? decay : 0))
  if (fadeAcc <= 1 - MIN_FADE) {
    ctx.fillStyle = `rgba(4, 5, 8, ${1 - fadeAcc})`
    ctx.fillRect(0, 0, width, height)
    fadeAcc = 1
  }

  console.log(fadeAcc);
  

  // Rebuild colours only when the palette actually changed
  if (settings.palette !== paletteName) {
    paletteName = settings.palette
    colours = buildPalette(paletteName)
  }
  
  const { x, y, vx, vy, count} = sim
  if (bucketOf.length < count) bucketOf = new Uint8Array(count)
  
  // Pass 1: decide each particle's bucket from its speed
  const scale = (BUCKETS - 1) / MAX_SPEED
  for (let i = 0; i < count; i++) {
    const b = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) * scale
    bucketOf[i] = b > BUCKETS - 1 ? BUCKETS - 1 : b
  }

  // Pass 2: one pass and one fill per bucket
  for (let b = 0; b < BUCKETS; b++) {
    ctx.fillStyle = colours[b]
    ctx.beginPath()
    for (let i = 0; i < count; i++) {
      if (bucketOf[i] === b) ctx.rect(x[i] - 1, y[i] - 1, 2, 2)
    }
    ctx.fill()
  }
}

// ---- Loop: fixed-timestep simulation, one render per frame ----
const STEP = 1 / 120 // simulation/physics tick (in seconds)
const MAX_STEPS = 5 // most physics tick allowed per frame

let last = performance.now() //	timestamp of the previous frame (in milliseconds)
let accumulator = 0 // simulated time we still “owe” the physics (in seconds)
let frames = 0 // frames drawn since last FPS reading
let fpsTimer = 0 // real time passed since last FPS reading (in seconds)

let paused = false

function reset() {
  sim.seedAll(width, height)
  ctx.fillStyle = '#040508'
  ctx.fillRect(0, 0, width, height) // wipe leftover trails
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    paused = !paused
    e.preventDefault() // stop Space from scrolling or clicking buttons
  } else if (e.code === 'KeyR') {
    reset()
  }
})

function frame(now: number) {
  // Real time (in seconds) since the last frame, capped so a background tab can't make us "owe" seconds of simulation when we come back
  const elapsed = Math.min(Math.max((now - last) / 1000, 0), 0.1)
  last = now

  sim.gravityX = settings.gravityX
  sim.gravityY = settings.gravityY
  sim.drag = settings.drag
  sim.bounce = settings.bounce
  sim.pointerRadius = settings.pointerRadius
  sim.pointerStrength = pointer.mode === 'repel' ? -settings.pointerStrength : settings.pointerStrength
  sim.pointerSwirl = settings.pointerSwirl

  sim.centerPull = settings.centerPull
  sim.centerSwirl = settings.centerSwirl
  sim.centerX = width / 2
  sim.centerY = height / 2

  sim.pointerActive = pointer.active
  sim.pointerX = pointer.x
  sim.pointerY = pointer.y

  if (paused) {
    accumulator = 0
  } else {
    accumulator += elapsed
    let steps = 0
    while (accumulator >= STEP && steps < MAX_STEPS) {
      sim.step(STEP, width, height)
      accumulator -= STEP
      steps++
    }
    if (steps === MAX_STEPS) accumulator = 0
  }

  frames++
  fpsTimer += elapsed
  if (fpsTimer >= 0.5) {
    fps = Math.round(frames / fpsTimer)
    hud.textContent = `${fps} fps · ${sim.count} particles`
    frames = 0
    fpsTimer = 0
  }

  render(elapsed)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
