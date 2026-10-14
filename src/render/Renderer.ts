import { settings } from "../config"
import type { ParticleSystem } from "../sim/ParticleSystem"
import { BUCKETS, buildPalette } from "./palettes"

const BG_RGB = '4, 5, 8' // must match the background in style.css
const MAX_SPEED = 400 // px/s that maps to the "fastest" colour
const MIN_FADE = 0.1 // smallest background fill we draw

export class Renderer {
  width = 0 // CSS pixels, read by main.ts and the simulation
  height = 0

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private paletteName = settings.palette
  private colours = buildPalette(settings.palette)
  private bucketOf = new Uint8Array(0)
  private fadeAcc = 1

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D not supported')
    this.canvas = canvas
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    this.width = window.innerWidth
    this.height = window.innerHeight
    
    // Scale canvas size to match device
    this.canvas.width = Math.round(this.width * dpr)
    this.canvas.height = Math.round(this.height * dpr)

    // Map CSS-pixel coordinates onto device pixels
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.clear()
  }

  // Wipe the canvas and forget any pending trail fade
  clear() {
    this.ctx.fillStyle = `rgb(${BG_RGB})`
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.fadeAcc = 1
  }

  render(sim: ParticleSystem, elapsed: number) {
    const { ctx, width, height } = this

    // Fade old frame, but only once the saved-up fade is big enough
    const decay = Math.pow(settings.trail, elapsed * 60)
    this.fadeAcc = Math.min(1, this.fadeAcc * (Number.isFinite(decay) ? decay : 0))
    if (this.fadeAcc <= 1 - MIN_FADE) {
      ctx.fillStyle = `rgba(${BG_RGB}, ${1 - this.fadeAcc})`
      ctx.fillRect(0, 0, width, height)
      this.fadeAcc = 1
    }

    // Rebuild colours only when the palette actually changed
    if (settings.palette !== this.paletteName) {
      this.paletteName = settings.palette
      this.colours = buildPalette(this.paletteName)
    }

    const { x, y, vx, vy, count} = sim
    if (this.bucketOf.length < count) this.bucketOf = new Uint8Array(count)
    const bucketOf = this.bucketOf

    // Pass 1: decide each particle's bucket from its speed
    const scale = (BUCKETS - 1) / MAX_SPEED
    for (let i = 0; i < count; i++) {
      const b = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) * scale
      bucketOf[i] = b > BUCKETS - 1 ? BUCKETS - 1 : b
    }

    // Pass 2: one pass and one fill per bucket
    for (let b = 0; b < BUCKETS; b++) {
      ctx.fillStyle = this.colours[b]
      ctx.beginPath()
      for (let i = 0; i < count; i++) {
        if (bucketOf[i] === b) ctx.rect(x[i] - 1, y[i] - 1, 2, 2)
      }
      ctx.fill()
    }
  }
}