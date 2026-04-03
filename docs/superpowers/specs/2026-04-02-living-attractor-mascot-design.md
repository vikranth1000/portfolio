# Living Attractor Mascot — Design Spec

## Core Concept

One living mathematical organism (Clifford strange attractor) with multiple viewports. The hero background, the chat orb, and the chat panel are all windows into the same creature. Behavior is emergent from energy physics, not scripted state machines.

---

## 1. AttractorEngine (singleton)

A shared class that owns the entire mathematical state. Runs one `requestAnimationFrame` loop regardless of how many viewports are active.

### State

- **Parameters** (a, b, c, d): Clifford attractor coefficients. Morph through 6 keyframes (same as current hero).
- **Energy**: Single float, 0.0–1.0+. Decays `energy *= 0.97` per frame (~60fps). Half-life ~1.1s, settles in ~3s.
- **Morph progress**: Current keyframe index + interpolation t.
- **Iteration state**: Current (x, y) position in the attractor, shared across viewports.
- **Mouse influence**: Normalized (x, y) vector of cursor proximity to nearest viewport.
- **Attractor point**: The orb's position in normalized screen coordinates (for gravitational bias).

### Energy Inputs

| Source | Amount | Behavior |
|--------|--------|----------|
| Mouse near orb | `0.15 * proximity` | Distance < 150px, linear falloff |
| Mouse near hero | `0.02 * proximity` | Distance to edge < 200px |
| Scroll velocity | `0.03 * speed` | Capped at 0.1 |
| Keystroke in chat | `0.05` impulse | Decays immediately |
| AI processing | `0.02/frame` | Sustained while waiting |
| Response arrives | `0.3` impulse | One-time burst |

### Energy Effects (continuous, no thresholds)

| Property | Formula |
|----------|---------|
| Morph speed | `baseMorphSpeed * (1 + energy * 2.5)` |
| Hero points/frame | `4000 + energy * 3000` |
| Orb points/frame | `300 + energy * 400` |
| Panel points/frame | `150 + energy * 250` |
| Particle brightness | `baseAlpha * (1 + energy * 0.5)` |
| Fade trail | `0.35 - energy * 0.15` |
| Gravitational bias | `1.0 + energy * 0.5` |

### API

- `subscribe(callback)` / `unsubscribe(callback)` — viewports register for frame ticks
- `injectEnergy(amount)` — add energy from any source
- `setMouseInfluence(x, y, proximity)` — update cursor state
- `getState()` — returns current { a, b, c, d, energy, x, y, morphProgress }
- `step(count)` — iterate the attractor `count` times, return array of (x, y) points

Exposed via React context (`AttractorProvider` wrapping the app).

---

## 2. Viewports

### Viewport 1 — Hero Background (refactored)

- Full-screen canvas. Reads state from shared engine instead of owning its own morph loop.
- Renders `4000 + energy * 3000` points/frame.
- **Gravitational bias**: Each rendered point gets a brightness/size boost based on proximity to `attractorPoint`. `boost = 1 + 0.5 * (1 / (1 + dist²)) * biasStrength`. Creates visible density gradient toward the orb — the organism's "heart."
- Scroll velocity feeds energy into the engine.
- Existing 6 keyframes, BATCH, WARMUP, FADE constants preserved.

### Viewport 2 — The Orb (new, replaces MascotIcon)

- 48px canvas (`w-12 h-12`), clipped to circle, position: `fixed bottom-6 left-6`.
- 96×96 internal resolution (2× for retina).
- Renders `300 + energy * 400` points/frame. Same iteration state = same shape, but concentrated into tiny space = glowing, dense.
- Mouse proximity injects energy (most visible cross-viewport effect).
- Framer Motion: gentle `y: [0, -3, 0]` bob, 3s ease-in-out loop.
- Border: `border-default` idle, `border-hover` on proximity. Glow: `box-shadow: 0 0 20px accent-green/15` scaled by proximity.
- `aria-label="Open AI chat"`, keyboard accessible (Enter/Space to toggle).

### Viewport 3 — Chat Panel (expanded orb)

- When orb is clicked, the container expands from circle → rounded rect via Framer Motion `layout` animation.
- Canvas re-renders at new dimensions each frame during transition.
- Open state: `150 + energy * 250` points/frame at 0.06–0.10 opacity. Living atmosphere behind chat UI.
- Chat UI layered on top: header, messages, input. All existing functionality preserved (rate limiting, message history, mobile sheet).
- Typing/AI processing inject energy → visible in all viewports simultaneously.
- Desktop: `w-[320px]` panel anchored bottom-left. Mobile: full-height sheet (85dvh).

---

## 3. Expand/Contract Transition

- Framer Motion `layoutId` on the container element.
- Circle (48px, `rounded-full`) → Rounded rect (320×auto, `rounded-xl`). Duration: 450ms, ease: `[0.22, 1, 0.36, 1]`.
- Canvas adapts to container size each frame — particles naturally spread into larger space (sparser = more atmospheric).
- Contract: reverse. UI fades first (100ms), then shape contracts (350ms). Particles densify as space shrinks.
- No scripted particle animations. The visual change is purely geometric: same points, different-shaped viewport.

---

## 4. Gravitational Bias (the "heart")

The hero canvas applies a gravitational pull toward the orb's screen position.

For each rendered point:
```
screenDist = distance(pointScreenPos, orbScreenPos)
boost = 1 + gravitationalStrength * (1 / (1 + (screenDist / falloffRadius)²))
pointAlpha *= boost
pointSize *= sqrt(boost)
```

- `gravitationalStrength`: `1.0 + energy * 0.5`
- `falloffRadius`: ~200px (in screen space)
- Effect: particles near the orb are subtly brighter and larger. The density gradient is visible but not heavy-handed.

---

## 5. Design System Integration

No new tokens. Every visual property maps to existing tokens:

| Token | Usage |
|-------|-------|
| `base` (#090909) | Canvas clear color |
| `surface` (#0f0f0f) | Orb background |
| `surface-alt` (#0a0a0a) | Panel background |
| `border-default` (#1f1f1f) | Orb + panel border |
| `border-subtle` (#1a1a1a) | Header/input separators |
| `border-hover` (#333333) | Orb border on proximity |
| `accent-green` (#22c55e) | Particle color, glow, status dot, caret |
| `text-label` (#767676) | "ask me anything" header |
| `text-secondary` (#888888) | Assistant message text |
| `text-primary` (#ffffff) | User message text |
| `text-muted` (#767676) | Placeholder text |

---

## 6. Mobile Adaptation

- Orb remains 48px, bottom-left.
- Expand target: full-height sheet (85dvh), `rounded-t-2xl`.
- Transition: slide-up (`y: '100%' → 0`, 350ms) instead of circular expand (layoutId morphing feels wrong at full-screen scale on mobile).
- Canvas particle count halved on mobile (performance).
- `env(safe-area-inset-bottom)` padding on input.
- Backdrop: `bg-black/60 backdrop-blur-sm`.
- `data-lenis-prevent` on scrollable message area.

---

## 7. Accessibility / Reduced Motion

- `prefers-reduced-motion`: Canvas renders one static frame, stops animating. Expand/contract uses opacity-only transition. Floating bob disabled. Energy model still runs (just not visible).
- `role="dialog"` `aria-modal="true"` on expanded panel.
- `aria-label="Open AI chat"` on orb.
- Focus: `focus-visible` ring (accent-green) on orb. Tab into panel focuses input.
- Keyboard: Enter/Space toggle orb. Escape closes panel.
- Screen reader: `aria-live="polite"` on message area.

---

## 8. File Architecture

| File | Purpose |
|------|---------|
| `lib/attractor-engine.ts` | AttractorEngine class + math utilities |
| `components/AttractorProvider.tsx` | React context, instantiates engine, provides to tree |
| `components/HeroBackground.tsx` | Refactored: reads from engine instead of owning state |
| `components/AttractorOrb.tsx` | New: the 48px orb viewport + expand/contract logic |
| `components/ChatPanel.tsx` | New: the chat UI (extracted from AskMeAnything.tsx) |
| `components/AskMeAnything.tsx` | Simplified: just composes AttractorOrb + ChatPanel |

---

## 9. Performance Budget

- Engine: One rAF loop, ~0.1ms per tick (just math, no rendering).
- Hero canvas: ~2ms/frame (same as current, slightly more during high energy).
- Orb canvas: ~0.3ms/frame (tiny canvas, few points).
- Panel canvas: ~0.5ms/frame when open.
- Total worst case: ~3ms/frame = well within 16ms budget (60fps).
- Mobile: Halved point counts. Engine can skip frames if `energy < 0.01` (dormant optimization).
