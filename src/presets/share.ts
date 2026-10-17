import { defaults, spec, clampValue, type NumericKey, type Settings } from '../config'
import { paletteNames } from '../render/palettes'

const numericKeys = Object.keys(spec) as NumericKey[]

// Settings -> short string. Only values that differ from the defaults are stored.
export function encodeSettings(s: Settings): string {
  const diff: Record<string, number | string> = {}
  for (const key of Object.keys(defaults) as (keyof Settings)[]) {
    if (s[key] !== defaults[key]) diff[key] = s[key]
  }
  const b64 = btoa(JSON.stringify(diff))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// String -> validated partial settings, or null if it's unusable.
export function decodeSettings(encoded: string): Partial<Settings> | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const raw = JSON.parse(atob(b64))
    if (typeof raw !== 'object' || raw === null) return null

    const out: Partial<Settings> = {}
    for (const key of numericKeys) {
      const value = raw[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        out[key] = clampValue(key, value)
      }
    }
    if (typeof raw.palette === 'string' && paletteNames.includes(raw.palette)) {
      out.palette = raw.palette
    }
    return out
  } catch {
    return null
  }
}

export function buildShareUrl(s: Settings): string {
  return `${location.origin}${location.pathname}#${encodeSettings(s)}`
}

export function readShared(): Partial<Settings> | null {
  const hash = location.hash.slice(1)
  return hash ? decodeSettings(hash) : null
}