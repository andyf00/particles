import './style.css'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('Canvas 2D not supported')

// Size of the canvas in CSS pixels
let width = 0
let height = 0

function resize() {
  const dpr = window.devicePixelRatio || 1
  width = window.innerWidth
  height = window.innerHeight
  
  // Scale canvas size to match device
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  // Map CSS-pixel coordinates onto device pixels
  ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
}

window.addEventListener('resize', resize)
resize()
