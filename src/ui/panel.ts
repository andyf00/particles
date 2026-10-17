import { FolderApi, Pane } from 'tweakpane'
import { settings, spec, type NumericKey, type NumberSpec } from '../config'
import { presets, applyPreset } from '../presets/presets'
import { paletteNames } from '../render/palettes'
import { pointer } from '../input/pointer'
import { buildShareUrl } from '../presets/share'

const folders: Record<string, NumericKey[]> = {
  Physics: ['gravityX', 'gravityY', 'drag', 'bounce', 'centerPull', 'centerSwirl'],
  Pointer: ['pointerStrength', 'pointerRadius', 'pointerSwirl'],
  Burst: ['burstCount', 'burstSpeed'],
  Look: ['trail', 'colourSpeed'],
}

export function initPanel(
  onCountChange: (count: number) => void,
  initialPreset = 'Default',
) {
  const pane = new Pane({ 
    title: 'Settings',
    container: document.getElementById('panel') as HTMLElement,
    expanded: window.innerWidth > 700 && window.innerHeight > 500,
  })

  // One slider, range read from spec table
  const bind = (parent: FolderApi, key: NumericKey) => {
    const { min, max, step } = spec[key] as NumberSpec
    return parent.addBinding(settings, key, step ? { min, max, step } : { min, max })
  }

  // ---- Preset dropdown ----
  const state = { preset: initialPreset }
  const names = [...Object.keys(presets), 'Custom']
  const presetBinding = pane.addBinding(state, 'preset', {
    options: Object.fromEntries(names.map((n) => [n, n]))
  })

  let applying = false
  presetBinding.on('change', (ev) => {
    if (ev.value === 'Custom') return
    applying = true
    applyPreset(ev.value, settings)
    onCountChange(settings.count)
    pane.refresh()
    applying = false
  })

  pane.on('change', (ev) => {
    if (applying || ev.target === presetBinding) return
    if (state.preset !== 'Custom') {
      state.preset = 'Custom'
      presetBinding.refresh()
    }
  })

  // ---- Sliders ----
  bind(pane, 'count').on('change', (ev) => onCountChange(ev.value))

  const made: Record<string, FolderApi> = {}
  for (const [title, keys] of Object.entries(folders)) {
    made[title] = pane.addFolder({ title })
    for (const key of keys) bind(made[title], key)
  }

  made.Look.addBinding(settings, 'palette', {
    options: Object.fromEntries(paletteNames.map((n) => [n, n]))
  })

  pane.addBinding(pointer, 'forceRepel', { label: 'repel (touch)' })

  // ---- Share ----
  pane.addButton({ title: 'Copy share link' }).on('click', async () => {
    const url = buildShareUrl(settings)
    history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard can be blocked; the URL is still in the address bar.
    }
  })

  return pane
}