export type PointerMode = 'attract' | 'repel'

export const pointer = {
  x: 0,
  y: 0,
  active: false,
  mode: 'attract' as PointerMode
}

export function initPointer(target: HTMLElement) {
  target.addEventListener('pointerdown', (e) => {
    target.setPointerCapture(e.pointerId) // handles when dragging outside window while holding down the button
    pointer.active = true
    pointer.mode = e.button === 2 || e.shiftKey ? 'repel' : 'attract'
    pointer.x = e.clientX
    pointer.y = e.clientY
  })

  target.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
  })

  const release = () => {
    pointer.active = false
  }
  target.addEventListener('pointerup', release)
  target.addEventListener('pointercancel', release)

  // Right-click is a gesture for us, so suppress the browser menu
  target.addEventListener('contextmenu', (e) => e.preventDefault())
}