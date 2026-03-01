<template>
  <canvas
    ref="canvasRef"
    class="fixed-background"
    :style="blurStyle"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const canvasRef = ref(null)
const isBlurred = ref(true)
const blurAmount = ref(16)
let animId = null

// Blur control
const blurStyle = computed(() => ({
  filter: `blur(${blurAmount.value}px)`,
  transition: 'filter 0.5s ease-out',
}))

// Speed levels for the ship
const speeds = [0.4, 0.8, 1.6, 3.2, 6.0]
let speedIndex = ref(0)

// Time and Astronomy
const currentTime = ref(new Date())
let timeUpdateInterval = null
const isDarkTheme = ref(true) // Track VitePress theme

// detect theme change
if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    isDarkTheme.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  isDarkTheme.value = document.documentElement.classList.contains('dark')
}

// Get adjusted time based on theme override
const dayProgress = computed(() => {
  const hours = currentTime.value.getHours()
  const minutes = currentTime.value.getMinutes()
  let totalMinutes = hours * 60 + minutes

  const hourValue = totalMinutes / 60
  const isActuallyNight = hourValue < 6 || hourValue > 18

  // LOGIC: If theme doesn't match natural time, shift by 12 hours
  // Light theme at night -> Show day (+12h)
  // Dark theme in day -> Show night (+12h)
  if (!isDarkTheme.value && isActuallyNight) totalMinutes = (totalMinutes + 720) % 1440
  if (isDarkTheme.value && !isActuallyNight) totalMinutes = (totalMinutes + 720) % 1440

  return totalMinutes / 1440
})

const renderNight = computed(() => {
  const progress = dayProgress.value
  return progress < 0.25 || progress > 0.75
})

// Ship and Environment State
let shipX = -120
let time = 0
const numWaves = 6
const waves = []

function initWaves() {
  waves.length = 0
  for (let i = 0; i < numWaves; i++) {
    const power = (i + 1) / numWaves
    waves.push({
      depth: i,
      yOffset: i * 22,
      amplitude: 12 / (i + 1),
      frequency: 0.005 + (i * 0.002),
      speed: 0.004 + (i * 0.004),
      phase: Math.random() * Math.PI * 2,
    })
  }
}

const stars = Array.from({ length: 150 }, () => ({
  x: Math.random(),
  y: Math.random(),
  size: Math.random() * 1.5,
  blink: Math.random()
}))

function getSkyColors(progress) {
  if (progress < 0.2 || progress > 0.8) return { top: '#02050a', mid: '#050a14', horizon: '#0a1a35' }
  if (progress >= 0.2 && progress < 0.3) {
    const t = (progress - 0.2) / 0.1
    return { top: '#050a14', mid: '#2a1a35', horizon: '#f9a825' }
  }
  if (progress >= 0.3 && progress < 0.7) return { top: '#0d2137', mid: '#2a6a9f', horizon: '#FDF200' }
  return { top: '#0a1a35', mid: '#6a3a14', horizon: '#f44336' }
}

function draw(ctx, w, h) {
  time += 1
  const progress = dayProgress.value
  const nightMode = renderNight.value
  const horizonY = h * 0.42
  const sky = getSkyColors(progress)

  // ======= SKY =======
  ctx.fillStyle = sky.top; ctx.fillRect(0, 0, w, h)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
  skyGrad.addColorStop(0, sky.top); skyGrad.addColorStop(0.6, sky.mid); skyGrad.addColorStop(1, sky.horizon)
  ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, horizonY)

  if (nightMode) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    stars.forEach(star => {
      ctx.globalAlpha = Math.max(0, 0.3 + Math.sin(time * 0.04 + star.blink * 10) * 0.5)
      ctx.beginPath(); ctx.arc(star.x * w, star.y * horizonY * 0.9, star.size, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  // ======= CELESTIAL =======
  const angle = (progress - 0.25) * Math.PI * 2
  const cx = w / 2 + Math.cos(angle) * (w * 0.45)
  const cy = horizonY - Math.sin(angle) * (horizonY * 0.85)

  if (cy < horizonY + 80) {
    const bodyR = 30
    if (!nightMode) {
      // Sun
      ctx.save(); ctx.translate(cx, cy)
      for (let i = 0; i < 12; i++) {
        const rayA = (i / 12) * Math.PI * 2 + time * 0.004
        const len = 30 + Math.sin(time * 0.02 + i) * 15
        ctx.save(); ctx.rotate(rayA)
        const rg = ctx.createLinearGradient(0, bodyR, 0, bodyR+len)
        rg.addColorStop(0, 'rgba(253, 242, 0, 0.2)'); rg.addColorStop(1, 'rgba(253, 242, 0, 0)')
        ctx.fillStyle = rg; ctx.fillRect(-1.5, bodyR, 3, len); ctx.restore()
      }
      ctx.restore()
      ctx.fillStyle = '#FDF200'; ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill()
    } else {
      // PROPER MOON
      ctx.save()
      const moonGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR * 2)
      moonGlow.addColorStop(0, 'rgba(200, 220, 255, 0.3)'); moonGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = moonGlow; ctx.beginPath(); ctx.arc(cx, cy, bodyR * 2, 0, Math.PI * 2); ctx.fill()

      ctx.fillStyle = '#e0e0e0'
      ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill()
      // Shadow to make it a crescent
      ctx.fillStyle = sky.top
      ctx.beginPath(); ctx.arc(cx + bodyR * 0.5, cy - bodyR * 0.2, bodyR * 0.9, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
  }

  // ======= SEA =======
  const seaBase = nightMode ? '#000206' : '#001122'
  const seaDark = nightMode ? '#000000' : '#000509'
  const seaGrad = ctx.createLinearGradient(0, horizonY, 0, h)
  seaGrad.addColorStop(0, seaBase); seaGrad.addColorStop(1, seaDark)
  ctx.fillStyle = seaGrad; ctx.fillRect(0, horizonY, w, h - horizonY)

  // ======= WAVES (PERSPECTIVE) =======
  waves.forEach((wave, idx) => {
    wave.phase += wave.speed
    const power = (idx + 1) / numWaves
    ctx.beginPath(); ctx.moveTo(0, horizonY)
    for (let x = 0; x <= w; x += 15) {
      const y = horizonY + (idx * 25) + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude * power
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
    const alpha = (0.02 + (power * 0.08)) * (nightMode ? 0.25 : 0.4)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
  })

  // ======= SHIP =======
  const currentSpeed = speeds[speedIndex.value]
  shipX += currentSpeed
  if (shipX > w + 200) shipX = -150

  const speedFactor = 1 - (speedIndex.value / (speeds.length - 1))
  const shipRock = Math.sin(time * 0.04) * (1 + speedFactor * 12)
  const shipY = horizonY + 30 + Math.sin(time * 0.05) * 3
  const shipAlpha = nightMode ? 0.3 : 0.9

  ctx.save(); ctx.translate(shipX + 30, shipY + 30); ctx.rotate(shipRock * Math.PI / 180); ctx.translate(-30, -30)
  ctx.fillStyle = `rgba(255, 255, 255, ${shipAlpha})`
  ctx.beginPath(); ctx.moveTo(5, 40); ctx.lineTo(55, 40); ctx.lineTo(45, 55); ctx.lineTo(15, 55); ctx.closePath(); ctx.fill()
  ctx.fillStyle = `rgba(255, 255, 255, ${shipAlpha * 0.7})`
  ctx.beginPath(); ctx.moveTo(30, 5); ctx.lineTo(30, 40); ctx.lineTo(10, 35); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(32, 8); ctx.lineTo(32, 40); ctx.lineTo(50, 35); ctx.closePath(); ctx.fill()
  ctx.restore()

  if (currentSpeed > 0.5) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${shipAlpha * 0.2})`
    ctx.lineWidth = 1.5; ctx.beginPath()
    ctx.moveTo(shipX, shipY + 45)
    ctx.lineTo(shipX - 40, shipY + 48 + Math.sin(time * 0.1) * 3)
    ctx.stroke()
  }
}

function onLogoClick() {
  speedIndex.value = (speedIndex.value + 1) % speeds.length
  blurAmount.value = 0
  setTimeout(() => { if (window.scrollY < 50) blurAmount.value = 16 }, 9000)
}

if (typeof window !== 'undefined') {
  window.triggerShipSpeed = onLogoClick
  window.addEventListener('scroll', () => { if (window.scrollY > 20) blurAmount.value = 16 })
}

function animate() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr
  ctx.scale(dpr, dpr)
  draw(ctx, window.innerWidth, window.innerHeight)
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initWaves(); animId = requestAnimationFrame(animate)
  timeUpdateInterval = setInterval(() => { currentTime.value = new Date() }, 60000)
})
onUnmounted(() => { cancelAnimationFrame(animId); clearInterval(timeUpdateInterval) })
</script>

<style scoped>
.fixed-background { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; }
</style>
