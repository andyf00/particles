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

    for (let i = 0; i < count; i++) {
      // Forces changes velocity
      vx[i] = (vx[i] + gx) * dragFactor
      vy[i] = (vy[i] + gy) * dragFactor

      // Velocity changes postion
      x[i] += vx[i] * dt
      y[i] += vy[i] * dt

      // Walls: push back inside and flip (and damp) the velocity
      if (x[i] < 0) {
        x[i] = 0
        vx[i] = -vx[i] * bounce
      } else if (x[i] > width) {
        x[i] = width
        vx[i] = -vx[i] * bounce
      }
      if (y[i] < 0) {
        y[i] = 0
        vy[i] = -vy[i] * bounce
      } else if (y[i] > height) {
        y[i] = height
        vy[i] = -vy[i] * bounce
      }
    }
  }
}