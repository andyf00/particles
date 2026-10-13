import { ParticleSystem } from './sim/ParticleSystem'
import './style.css'

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

const sim = new ParticleSystem(5000, width, height)

// ---- Rendering ----
let fps = 0

function render() {
  ctx.fillStyle = '#0a0b10'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#7c9cff'
  const {x, y, count} = sim
  for (let i = 0; i < count; i++) {
    ctx.fillRect(x[i], y[i], 2, 2)
  }

  ctx.fillStyle = '#8a8fa3'
  ctx.font = '12px monospace'
  ctx.fillText(`${fps} fps · ${sim.count} particles`, 16, 24)
}
