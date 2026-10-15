import { Pane } from 'tweakpane'
import { settings, maxCount } from '../config'
import { presets, applyPreset } from '../presets/presets'
import { paletteNames } from '../render/palettes'
import { initPointer, pointer } from '../input/pointer'

export function initPanel(onCountChange: (count: number) => void) {
  const pane = new Pane({ title: 'Settings', expanded: window.innerWidth > 700 })

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
    max: maxCount,
    step: 1000,
  })
  count.on('change', (ev) => onCountChange(ev.value))

  const physics = pane.addFolder({ title: 'Physics' })
  physics.addBinding(settings, 'gravityX', { min: -2000, max: 2000 })
  physics.addBinding(settings, 'gravityY', { min: -2000, max: 2000 })
  physics.addBinding(settings, 'drag', { min: 0, max: 5 })
  physics.addBinding(settings, 'bounce', { min: 0, max: 1 })
  physics.addBinding(settings, 'centerPull', { min: 0, max: 1000 })
  physics.addBinding(settings, 'centerSwirl', { min: -1000, max: 1000 })

  const pointerUI = pane.addFolder({ title: 'Pointer' })
  pointerUI.addBinding(settings, 'pointerRadius', { min: 20, max: 600 })
  pointerUI.addBinding(settings, 'pointerStrength', { min: 0, max: 20000 })
  pointerUI.addBinding(settings, 'pointerSwirl', { min: -1, max: 1 })

  const burst = pane.addFolder({ title: 'Burst' })
  burst.addBinding(settings, 'burstCount', { min: 0, max: 2000, step: 50 })
  burst.addBinding(settings, 'burstSpeed', { min: 100, max: 2000 })

  const look = pane.addFolder({ title: 'Look' })
  look.addBinding(settings, 'trail', {min: 0, max: 0.9 })
  look.addBinding(settings, 'palette', {
    options: Object.fromEntries(paletteNames.map((n) => [n, n]))
  })

  pane.addBinding(pointer, 'forceRepel', { label: 'repel (touch)' })

  return pane
}