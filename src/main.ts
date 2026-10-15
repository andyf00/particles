import './style.css'
import { settings } from './config'
import { ParticleSystem } from './sim/ParticleSystem'
import { Renderer } from './render/Renderer'
import { pointer, initPointer } from './input/pointer'
import { initPanel } from './ui/panel'
import { Hud } from './ui/hud'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const hint = document.getElementById('hint') as HTMLDivElement

const renderer = new Renderer(canvas)
const hud = new Hud(document.getElementById('hud') as HTMLDivElement)
const sim = new ParticleSystem(settings.count, renderer.width, renderer.height)

initPointer(canvas)
const pane = initPanel((count) => sim.setCount(count, renderer.width, renderer.height))

// ---- Copy settings and input into the simulation ----
function syncSim() {
  sim.gravityX = settings.gravityX
  sim.gravityY = settings.gravityY
  sim.drag = settings.drag
  sim.bounce = settings.bounce
  sim.pointerRadius = settings.pointerRadius
  sim.pointerSwirl = settings.pointerSwirl
  
  sim.centerPull = settings.centerPull
  sim.centerSwirl = settings.centerSwirl
  sim.centerX = renderer.width / 2
  sim.centerY = renderer.height / 2

  sim.pointerActive = pointer.active
  sim.pointerX = pointer.x
  sim.pointerY = pointer.y
  sim.pointerStrength = pointer.mode === 'repel' ? -settings.pointerStrength : settings.pointerStrength
}

// ---- Keyboard ----
let paused = false

function reset() {
  sim.seedAll(renderer.width, renderer.height)
  renderer.clear()
}

function dismissHint() {
  hint.classList.remove('show')
}

window.addEventListener('keydown', (e) => {
  // Don't hijack keys while the user is typing in a panel field.
  if (e.target instanceof HTMLInputElement) return
  dismissHint()
  if (e.code === 'Space') {
    paused = !paused
    e.preventDefault() // stop Space from scrolling or clicking buttons
  } else if (e.code === 'KeyR') {
    reset()
  } else if (e.code === 'KeyH') {
    pane.hidden = !pane.hidden
  }
})
window.addEventListener('pointerdown', dismissHint)

// ---- Loop: fixed-timestep simulation, one render per frame ----
const STEP = 1 / 120 // simulation/physics tick (in seconds)
const MAX_STEPS = 5 // most physics tick allowed per frame

let last = performance.now() //	timestamp of the previous frame (in milliseconds)
let accumulator = 0 // simulated time we still “owe” the physics (in seconds)

function frame(now: number) {
  // Real time (in seconds) since the last frame, capped so a background tab can't make us "owe" seconds of simulation when we come back
  const elapsed = Math.min(Math.max((now - last) / 1000, 0), 0.1)
  last = now

  for (const c of pointer.clicks) {
    if (settings.burstCount > 0) {
      sim.burst(c.x, c.y, settings.burstCount, settings.burstSpeed)
    }
  }
  pointer.clicks.length = 0 // empties queue

  syncSim()

  if (paused) {
    accumulator = 0
  } else {
    accumulator += elapsed
    let steps = 0
    while (accumulator >= STEP && steps < MAX_STEPS) {
      sim.step(STEP, renderer.width, renderer.height)
      accumulator -= STEP
      steps++
    }
    if (steps === MAX_STEPS) accumulator = 0
  }

  hud.tick(elapsed, sim.count)
  renderer.render(sim, elapsed)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)

// Fade canvas in, then show hint a moment later
requestAnimationFrame(() => canvas.classList.add('ready'))
setTimeout(() => hint.classList.add('show'), 800)
