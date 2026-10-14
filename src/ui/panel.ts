import { Pane } from 'tweakpane'
import { settings } from '../config'
import { presets, applyPreset } from '../presets/presets'

export function initPanel(onCountChange: (count: number) => void) {
  const pane = new Pane({ title: 'Settings' })

  const state = { preset: 'Default'}
  pane
    .addBinding(state, 'preset', {
      // get all preset names and convert them into dropdown options
      options: Object.fromEntries(Object.keys(presets).map((n) => [n, n])),
    })
    .on('change', (ev) => {
      applyPreset(ev.value, settings)
      onCountChange(settings.count)
      pane.refresh()
    })

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
  physics.addBinding(settings, 'centerPull', { min: 0, max: 1000 })
  physics.addBinding(settings, 'centerSwirl', { min: 0, max: 1000 })

  const pointer = pane.addFolder({ title: 'Pointer' })
  pointer.addBinding(settings, 'pointerRadius', { min: 20, max: 600 })
  pointer.addBinding(settings, 'pointerStrength', { min: 0, max: 20000 })
  pointer.addBinding(settings, 'pointerSwirl', { min: 0, max: 1 })

  return pane
}