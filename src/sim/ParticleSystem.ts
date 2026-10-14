export class ParticleSystem {
  count: number

  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array

  // Tunable physics (units are CSS pixels and seconds)
  gravityX = 0
  gravityY = 600 // px/s²
  drag = 0.3 // fraction of speed lost per second (roughly)
  bounce = 0.8 // 1 = perfectly elastic, 0 = sticks to the wall
  radius = 1

  // Pointer force
  pointerActive = false
  pointerX = 0
  pointerY = 0
  pointerRadius = 200 // px: reach of the force
  pointerStrength = 4000 // px/s² at the cursor; negative = repel

  constructor(count: number, width: number, height: number) {
    this.count = count
    this.x = new Float32Array(count)
    this.y = new Float32Array(count)
    this.vx = new Float32Array(count)
    this.vy = new Float32Array(count)
    this.scatter(width, height)
  }

  scatter(width: number, height:number) {
    for(let i = 0; i < this.count; i++) {
      this.x[i] = Math.random() * width
      this.y[i] = Math.random() * height
      this.vx[i] = (Math.random() - 0.5) * 200
      this.vy[i] = (Math.random() - 0.5) * 200
    }
  }

  step(dt: number, width: number, height: number) {
    const {x, y, vx, vy, count, bounce} = this
    const gx = this.gravityX * dt
    const gy = this.gravityY * dt
    const dragFactor = Math.exp(-this.drag * dt)

    // computed once per step, not per particle
    const pActive = this.pointerActive
    const px = this.pointerX
    const py = this.pointerY
    const pR = this.pointerRadius
    const pR2 = pR * pR
    const pStrength = this.pointerStrength * dt
    const SOFT = 100 // px²: softening

    const minX = this.radius
    const maxX = width - this.radius
    const minY = this.radius
    const maxY = height - this.radius

    for (let i = 0; i < count; i++) {
      // Forces changes velocity
      if (pActive) {
        const dx = px - x[i]
        const dy = py - y[i]
        const d2 = dx * dx + dy * dy
        if (d2 < pR2) {
          const d = Math.sqrt(d2)
          const closeness = 1 - d / pR // 1 at cursor, 0 at edge
          const accel = pStrength * closeness * closeness // smooth falloff
          const invDist = 1 / Math.sqrt(d2 + SOFT) // multplier (1/d) for turning (dx, dy) into ~unit direction (softened)
          vx[i] += dx * invDist * accel
          vy[i] += dy * invDist * accel
        }
      }
      vx[i] = (vx[i] + gx) * dragFactor
      vy[i] = (vy[i] + gy) * dragFactor

      // Velocity changes postion
      x[i] += vx[i] * dt
      y[i] += vy[i] * dt

      // Walls: push back inside and flip (and damp) the velocity
      if (x[i] < minX) {
        x[i] = minX
        vx[i] = -vx[i] * bounce
      } else if (x[i] > maxX) {
        x[i] = maxX
        vx[i] = -vx[i] * bounce
      }
      if (y[i] < minY) {
        y[i] = minY
        vy[i] = -vy[i] * bounce
      } else if (y[i] > maxY) {
        y[i] = maxY
        vy[i] = -vy[i] * bounce
      }
    }
  }
}