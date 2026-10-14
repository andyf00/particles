export const BUCKETS = 16

type RGB = [number, number, number]

// Each palette is a few colour stops, slowest to fastest
const stops: Record<string, RGB[]> = {
  Ice: [[60, 80, 160], [124, 156, 255], [200, 240, 255], [255, 255, 255]],
  Ember: [[90, 20, 20], [220, 60, 20], [255, 170, 40], [255, 245, 200]],
  Aurora: [[30, 60, 160], [40, 200, 160], [160, 255, 120], [255, 255, 200]],
}

export const paletteNames = Object.keys(stops)

// Turns a palette's stops into BUCKETS ready-to-use CSS colour strings
export function buildPalette(name: string): string[] {
  const s = stops[name] ?? stops.Ice
  const out: string[] = []
  for (let i = 0; i < BUCKETS; i++) {
    const p = (i / (BUCKETS - 1)) * (s.length - 1) // position along the stops
    const seg = Math.min(Math.floor(p), s.length - 2)
    const f = p - seg // 0..1 between two neighbouring stops
    const a = s[seg]
    const b = s[seg + 1]
    const r = Math.round(a[0] + (b[0] - a[0]) * f)
    const g = Math.round(a[1] + (b[1] - a[1]) * f)
    const bl = Math.round(a[2] + (b[2] - a[2]) * f)
    out.push(`rgb(${r}, ${g}, ${bl})`)
  }
  return out
}