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

  draw()
}

function draw() {
  ctx!.fillStyle = '#0a0b10'
  ctx!.fillRect(0, 0, width, height)

  // Test shapes: a circle in the centre, and a 1px frame near the edges.
  ctx!.fillStyle = '#7c9cff'
  ctx!.beginPath()
  ctx!.arc(width / 2, height / 2, 40, 0, Math.PI * 2)
  ctx!.fill()

  ctx!.strokeStyle = '#7c9cff'
  ctx!.lineWidth = 1
  ctx!.strokeRect(10.5, 10.5, width - 21, height - 21)
}

window.addEventListener('resize', resize)
resize()
