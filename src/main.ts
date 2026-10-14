import './style.css'
import { ParticleSystem } from './sim/ParticleSystem'
import { pointer, initPointer } from './input/pointer'
import { settings } from './config'
import { initPanel } from './ui/panel'

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

function render(elapsed: number) {
  // Fade previous frame instead of erasing it
  const keep = Math.pow(settings.trail, elapsed * 60)
  ctx.fillStyle = `rgba(10, 11, 16, ${1 - keep})`
  ctx.fillRect(0, 0, width, height)

  // Draw each particle
  ctx.fillStyle = '#7c9cff'
  const {x, y, count} = sim
  for (let i = 0; i < count; i++) {
    ctx.fillRect(x[i] - 1, y[i] - 1, 2, 2)
  }
}

// ---- Loop: fixed-timestep simulation, one render per frame ----
const STEP = 1 / 120 // simulation/physics tick (in seconds)
const MAX_STEPS = 5 // most physics tick allowed per frame

let last = performance.now() //	timestamp of the previous frame (in milliseconds)
let accumulator = 0 // simulated time we still “owe” the physics (in seconds)
let frames = 0 // frames drawn since last FPS reading
let fpsTimer = 0 // real time passed since last FPS reading (in seconds)

function frame(now: number) {
  // Real time (in seconds) since the last frame, capped so a background tab can't make us "owe" seconds of simulation when we come back
  const elapsed = Math.min((now - last) / 1000, 0.1)
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

  accumulator += elapsed
  let steps = 0
  while (accumulator >= STEP && steps < MAX_STEPS) {
    sim.step(STEP, width, height)
    accumulator -= STEP
    steps++
  }
  if (steps === MAX_STEPS) accumulator = 0

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
