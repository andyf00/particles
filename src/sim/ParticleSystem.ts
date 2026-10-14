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
  pointerSwirl = 0

  // Center force
  centerPull = 0
  centerSwirl = 0
  centerX = 0
  centerY = 0

  constructor(count: number, width: number, height: number) {
    this.count = count
    this.x = new Float32Array(count)
    this.y = new Float32Array(count)
    this.vx = new Float32Array(count)
    this.vy = new Float32Array(count)
    this.seedAll(width, height)
  }

  seedAll(width: number, height: number) {
    for (let i = 0; i < this.count; i++) this.spawn(i, width, height)
  }

  spawn(i: number, width: number, height:number) {
    this.x[i] = Math.random() * width
    this.y[i] = Math.random() * height
    this.vx[i] = (Math.random() - 0.5) * 200
    this.vy[i] = (Math.random() - 0.5) * 200
  }

  setCount(newCount: number, width: number, height: number) {
    if (newCount === this.count) return
    const keep = Math.min(this.count, newCount)

    const resize = (old: Float32Array) => {
      const next = new Float32Array(newCount)
      next.set(old.subarray(0, keep)) // keep existing particles
      return next
    }
    this.x = resize(this.x)
    this.y = resize(this.y)
    this.vx = resize(this.vx)
    this.vy = resize(this.vy)

    const oldCount = this.count
    this.count = newCount
    for (let i = oldCount; i < newCount; i++) this.spawn(i, width, height)
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
    const swirl = this.pointerSwirl
    const radial = 1 - Math.abs(swirl)
    const cPull = this.centerPull * dt
    const cSwirl = this.centerSwirl * dt
    const cx = this.centerX
    const cy = this.centerY

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
          const ux = dx * invDist // direction to cursor
          const uy = dy * invDist
          vx[i] += (ux * radial - uy * swirl) * accel // (-uy, ux) is sideways
          vy[i] += (uy * radial + ux * swirl) * accel
        }
      }
      if (cPull !== 0 || cSwirl !== 0) {
        const cdx = cx - x[i]
        const cdy = cy - y[i]
        const cd2 = cdx * cdx + cdy * cdy
        const cInv = 1 / Math.sqrt(cd2 + SOFT)
        const ux = cdx * cInv // direction to center
        const uy = cdy * cInv
        vx[i] += ux * cPull - uy * cSwirl
        vy[i] += uy * cPull + ux * cSwirl
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