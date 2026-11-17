import type { Register, ThemeSetArgs } from 'claude-code'

// A wallpaper behind the conversation: curtains of pale light over a dusk sky.
//
// It is a scene and not `backdrop: { image }`: the desktop app's surface takes a
// still ground of color, gradient or vector only, and shows its own background
// for an image. The scene is still (no animation), so it costs nothing to keep up.
const SCENE = 'dusk-curtains'

const LOOK: ThemeSetArgs = { backdrop: { scene: SCENE, glass: { blur: 12, opacity: 0.55 } } }

// The same streaks on every load.
function seeded(seed: number): () => number {
  let s = seed >>> 0

  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0

    return s / 4294967296
  }
}

function buildScene(): string {
  const W = 1600
  const H = 1000
  const rand = seeded(20261116)
  const n = (v: number) => v.toFixed(1)
  const streaks: string[] = []

  for (let x = -12; x < W + 12; ) {
    const u = x / W
    // Wide bands of brighter and dimmer curtains, calmer in the middle where the words sit.
    const band = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 3.2 + 0.6)
    const ripple = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 7.7 + 2.1)
    const calm = 0.5 + 0.5 * Math.min(1, Math.abs(u - 0.5) * 2.6)
    const kind = rand()
    const fromTop = rand() < 0.5
    const length = 380 + rand() * 640
    const y = fromTop ? 0 : H - length

    if (kind < 0.07) {
      // A thin warm thread.
      const w = 1.5 + rand() * 2
      streaks.push(
        `<rect x="${n(x)}" y="${n(H * 0.12 + rand() * H * 0.2)}" width="${n(w)}" height="${n(H * 0.6)}" fill="url(#warm)" opacity="${(0.55 + rand() * 0.35).toFixed(2)}"/>`,
      )
      x += w + 2 + rand() * 5
      continue
    }
    const w = 4 + rand() * 24

    if (kind < 0.68) {
      const o = (0.1 + 0.42 * band * (0.55 + 0.45 * ripple)) * calm
      streaks.push(
        `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(length)}" fill="url(#${fromTop ? 'lightTop' : 'lightBottom'})" opacity="${o.toFixed(2)}"/>`,
      )
    } else {
      const o = (0.12 + 0.3 * (1 - band)) * calm
      streaks.push(
        `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(length)}" fill="url(#${fromTop ? 'shadeTop' : 'shadeBottom'})" opacity="${o.toFixed(2)}"/>`,
      )
    }
    x += w + rand() * 5
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`,
    '<defs>',
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#2c4578"/><stop offset="0.45" stop-color="#5f7fb8"/>',
    '<stop offset="0.76" stop-color="#a892c4"/><stop offset="1" stop-color="#ecab86"/>',
    '</linearGradient>',
    '<radialGradient id="glow" cx="0.72" cy="1.02" r="0.62">',
    '<stop offset="0" stop-color="#fff0cf" stop-opacity="0.8"/><stop offset="1" stop-color="#fff0cf" stop-opacity="0"/>',
    '</radialGradient>',
    '<linearGradient id="lightTop" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="0.7" stop-color="#eef4ff" stop-opacity="0.35"/>',
    '<stop offset="1" stop-color="#eef4ff" stop-opacity="0"/>',
    '</linearGradient>',
    '<linearGradient id="lightBottom" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#fff4e6" stop-opacity="0"/><stop offset="0.35" stop-color="#fff4e6" stop-opacity="0.35"/>',
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0.9"/>',
    '</linearGradient>',
    '<linearGradient id="shadeTop" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#16224a" stop-opacity="0.75"/><stop offset="1" stop-color="#16224a" stop-opacity="0"/>',
    '</linearGradient>',
    '<linearGradient id="shadeBottom" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#3a2a5c" stop-opacity="0"/><stop offset="1" stop-color="#3a2a5c" stop-opacity="0.6"/>',
    '</linearGradient>',
    '<linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#ffd9a0" stop-opacity="0"/><stop offset="0.5" stop-color="#ffd9a0" stop-opacity="0.95"/>',
    '<stop offset="1" stop-color="#ff9f6e" stop-opacity="0"/>',
    '</linearGradient>',
    '</defs>',
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>`,
    `<rect width="${W}" height="${H}" fill="url(#glow)"/>`,
    ...streaks,
    '</svg>',
  ].join('')
}

const SVG = buildScene()

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // The theme stands even when no app window shows this session yet, and is
    // drawn once one does, so an undrawn answer here is nothing to report.
    await $.theme.set(LOOK)
    $.ui.status(undefined)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    if (e.props.scene !== SCENE) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SVG} alt="Curtains of pale light hanging over a dusk sky" isInteractive />
  })
}
