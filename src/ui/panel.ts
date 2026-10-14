import { Pane } from 'tweakpane'
import { settings } from '../config'

export function initPanel(onCountChange: (count: number) => void) {
  const pane = new Pane({ title: 'Settings' })

  const count = pane.addBinding(settings, 'count', {
    min: 1000,
    max: 100000,
    step: 1000,
  })
  count.on('change', (ev) => onCountChange(ev.value))

  const physics = pane.addFolder({ title: 'Physics' })
  physics.addBinding(settings, 'gravityX', { min: -2000, max: 2000 })
  physics.addBinding(settings, 'gravityY', { min: -2000, max: 2000 })
  physics.addBinding(settings, 'drag', { min: 0, max: 5 })
  physics.addBinding(settings, 'bounce', { min: 0, max: 1 })

  const pointer = pane.addFolder({ title: 'Pointer' })
  pointer.addBinding(settings, 'pointerRadius', { min: 20, max: 600 })
  pointer.addBinding(settings, 'pointerStrength', { min: 0, max: 20000 })

  return pane
}