/* ── AttractorEngine ──
 * The organism. One living mathematical system that multiple viewports
 * render from. No states, no modes — just energy that flows and dissipates.
 */

// ── Keyframes: 6 curated (a,b,c,d) configs → visually distinct shapes ──
export const KEYFRAMES: [number, number, number, number][] = [
  [-1.4,   1.6,   1.0,   0.7 ],  // rose / flower
  [-1.7,   1.3,  -0.1,  -1.2 ],  // butterfly
  [-1.8,  -2.0,  -0.5,  -0.9 ],  // spiral nebula
  [ 1.5,  -1.8,   1.6,   0.9 ],  // figure-8
  [-1.2,  -1.9,   1.8,  -1.6 ],  // organic tendrils
  [ 1.1,  -1.3,  -1.6,   1.5 ],  // compact core
]

const HOLD_S    = 12    // seconds at each keyframe
const MORPH_S   = 8     // seconds transitioning between keyframes
const NOISE_AMP = 0.05  // organic drift layered on params
const ENERGY_DECAY = 0.97  // per frame, half-life ~1.1s at 60fps

// ── Math utilities (shared with viewports) ──

export function noise1D(t: number): number {
  return Math.sin(t * 1.17 + 0.3) * 0.5
       + Math.sin(t * 2.31 + 1.7) * 0.25
       + Math.sin(t * 4.63 + 3.1) * 0.125
}

export function ease(t: number): number { return t * t * (3 - 2 * t) }
export function mix(a: number, b: number, t: number): number { return a + (b - a) * t }

// ── Types ──

export interface AttractorParams {
  a: number
  b: number
  c: number
  d: number
}

export interface EngineState extends AttractorParams {
  energy: number
  morphPosition: number
  mouseX: number
  mouseY: number
  mouseProximity: number
}

export interface AttractorPoint {
  x: number  // normalized 0–1 screen position
  y: number
}

type FrameCallback = (state: EngineState, dt: number) => void

// ── Engine ──

class AttractorEngine {
  private subscribers = new Set<FrameCallback>()
  private rafId = 0
  private running = false
  private lastTime = 0

  // Morph state — accumulated, not derived from wall clock.
  // This lets energy-driven speed changes integrate correctly.
  private morphPosition = 0

  // Current interpolated parameters
  private a = KEYFRAMES[0][0]
  private b = KEYFRAMES[0][1]
  private c = KEYFRAMES[0][2]
  private d = KEYFRAMES[0][3]

  // Energy: 0 = dormant, 1+ = highly stimulated. Decays naturally.
  energy = 0

  // Mouse influence (set by whichever viewport the cursor is nearest)
  private mouseX = 0
  private mouseY = 0
  private mouseProximity = 0

  // Gravitational attractor point — where the orb sits in normalized screen coords.
  // The hero background uses this to create a density gradient.
  attractorPoint: AttractorPoint = { x: 0.05, y: 0.9 }

  subscribe(cb: FrameCallback) {
    this.subscribers.add(cb)
    if (!this.running) this.start()
  }

  unsubscribe(cb: FrameCallback) {
    this.subscribers.delete(cb)
    if (this.subscribers.size === 0) this.stop()
  }

  injectEnergy(amount: number) {
    this.energy = Math.min(1.5, this.energy + amount)
  }

  setMouseInfluence(x: number, y: number, proximity: number) {
    this.mouseX = x
    this.mouseY = y
    this.mouseProximity = Math.max(0, Math.min(1, proximity))
  }

  setAttractorPoint(x: number, y: number) {
    this.attractorPoint = { x, y }
  }

  getState(): EngineState {
    return {
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      energy: this.energy,
      morphPosition: this.morphPosition,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      mouseProximity: this.mouseProximity,
    }
  }

  // ── Lifecycle ──

  private start() {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.tick)
  }

  private stop() {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  private tick = (now: number) => {
    if (!this.running) return

    const dt = Math.min((now - this.lastTime) / 1000, 0.1) // cap at 100ms to prevent jumps
    this.lastTime = now

    // ── Energy decay ──
    this.energy *= ENERGY_DECAY
    if (this.energy < 0.001) this.energy = 0

    // ── Morph parameters ──
    // Energy makes the organism think faster — morphing accelerates
    const morphSpeed = 1 + this.energy * 2.5
    this.morphPosition += dt * morphSpeed

    const cycle = HOLD_S + MORPH_S
    const totalCycle = cycle * KEYFRAMES.length
    const pos = this.morphPosition % totalCycle
    const idx = Math.floor(pos / cycle)
    const phase = pos % cycle

    // Interpolation factor within current transition
    let t = 0
    if (phase >= HOLD_S) {
      t = ease((phase - HOLD_S) / MORPH_S)
    }

    // Blend keyframes + organic noise
    const from = KEYFRAMES[idx]
    const to = KEYFRAMES[(idx + 1) % KEYFRAMES.length]
    const mp = this.morphPosition * 0.3 // noise time
    this.a = mix(from[0], to[0], t) + noise1D(mp) * NOISE_AMP
    this.b = mix(from[1], to[1], t) + noise1D(mp + 10) * NOISE_AMP
    this.c = mix(from[2], to[2], t) + noise1D(mp + 20) * NOISE_AMP
    this.d = mix(from[3], to[3], t) + noise1D(mp + 30) * NOISE_AMP

    // ── Notify all viewports ──
    const state = this.getState()
    this.subscribers.forEach(cb => cb(state, dt))

    this.rafId = requestAnimationFrame(this.tick)
  }

  destroy() {
    this.stop()
    this.subscribers.clear()
  }
}

// ── Singleton ──
// One organism for the entire app. Created lazily on first access.

let instance: AttractorEngine | null = null

export function getAttractorEngine(): AttractorEngine {
  if (!instance) {
    instance = new AttractorEngine()
  }
  return instance
}

export function destroyAttractorEngine() {
  if (instance) {
    instance.destroy()
    instance = null
  }
}

export type { AttractorEngine }
