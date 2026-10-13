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
    this.seed(width, height)
  }

  seed(width: number, height:number) {
    for(let i = 0; i < this.count; i++) {
      this.x[i] = Math.random() * width
      this.y[i] = Math.random() * height
      this.vx[i] = (Math.random() - 0.5) * 200
      this.vy[i] = (Math.random() - 0.5) * 200
    }
  }
}