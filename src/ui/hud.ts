export class Hud {
  private element: HTMLElement
  private frames = 0
  private timer = 0

  constructor(element: HTMLElement) {
    this.element = element
  }

  tick(elapsed: number, particleCount: number) {
    this.frames++
    this.timer += elapsed
    if (this.timer >= 0.5) {
      const fps = Math.round(this.frames / this.timer)
      this.element.textContent = `${fps} fps · ${particleCount} particles`
      this.frames = 0
      this.timer = 0
    }
  }
}