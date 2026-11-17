// Garden under the Moon (月下园林): one Suzhou garden sheet that brings together the motifs of Moon Gate and Pavilion by the Water.
// Above, right of the reading column: the moon (by day the sun), larger than on the other sheets, its glow round it and a thin band of
// cloud drifting across its lower part. It is the hero; everything else stays low.
// Left band, near: a tall narrow stretch of whitewashed wall under its dark coping, ending clean short of the column with its ridge
// turned up in a hook. Low in it a round moon gate trimmed with grey brick frames a Taihu peak (big above, small below, its head
// curling over) on a planted bed, with bamboo behind it whose crowns rise over the coping; outside the gate, against the wall's free end,
// a clump of banana (芭蕉) with one leaf arching across the edge of the opening.
// Right band, middle distance: a six-sided pavilion with flying eaves on a stone plinth among piled lake stones, a long zigzag bridge
// coming to it out of the mist by the column, the water suggested by a few level strokes; lotus in the water in front, and under the
// moon its light broken on the water.
// By day (晴日写真): soft blue-grey air warming to a pale haze round a pale vermilion sun, opaque white walls with cool shade under 黛 tiles,
// plants in muted greens, stone in cool grey. By night (月色): a warm black ground with one small pale yellow glow round the moon,
// moon-white plaster, near-black tiles, lines in a pale warm tone; the pavilion lit amber from within and the courtyard beyond the gate
// softly lit, both lights breathing a little; moonlight and lamplight broken on the water.
// The pavilion side is the Pavilion sheet's own drawing, carried onto this sheet at 0.8 of its size in one fixed group (nothing in that
// group turns or scales: its only motion is the sideways shimmer of the water strokes and the breathing of the lamp). The things beyond
// the gate and the banana are Moon Gate's drawing likewise carried over at fixed scales; the wall, the gate's rim and the bamboo, which
// sways, are drawn in this sheet's own units.
// Motion: the bamboo sways (each crown about a point behind the wall, each twig about its node), the water strokes shimmer, a ripple
// widens and fades, the cloud over the moon drifts, the lamps breathe. All CSS, all stopped under reduced motion.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000

/** One soft glow of colour in the sky: whole at its centre, gone at its radius. */
interface Glow {
  x: number
  y: number
  r: number
  colour: string
  alpha: number
}

/** The ground the mountains stand against: a vertical run of colours with glows laid over it. It takes the place of
 * flat paper, and its colours follow the wallpaper of the person's Token Counter app (orange, wine, violet), mirrored
 * so that the orange corner lies behind the disc on the right. */
interface Sky {
  /** Offsets 0..1 down the sheet, with their colours. */
  base: Array<[number, string]>
  glows: Glow[]
}

interface Stock {
  sky: Sky
  ink: string
  disc: string
  seal: string
  /** The whitewash of a low wall: a little lighter than the sky by day, a moonlit wash by night. */
  wall: string
  wallAlpha: number
  /** The blush on the lotus bud. */
  bloom: string
  /** The colour of real shadow (the inside of a blind hole, a cave mouth, the hollow under a stone's lip), and how much of
   * it those take. By day it is the ink; by night it is darker than the sky, so a hollow stays dark instead of turning
   * into a pale spot as the pale night ink would make it. */
  shade: string
  shadeAlpha: number
  /** How much ink a wash takes, relative to the day sheet. */
  wash: number
  /** The same for pen lines. */
  line: number
  /** Strength of the glow round the disc; 0 leaves it out. */
  halo: number
  /** The disc's own cover, and the glow round it: its colour and radius (unset: the disc's colour, 78). */
  discAlpha?: number
  haloColour?: string
  haloR?: number
  /** The photographic stocks (晴日写真 by day, 灯影夜游 by night) paint every thing in its own colour instead of washes of the
   * ink over the sky; `paint` holds those colours. Unset, the sheet is the old ink painting. */
  paint?: Paint
}

/** The colours of a photographic sheet. */
interface Paint {
  /** Opaque limewash: the sill walls under the benches. */
  plaster: string
  /** The plinth and the steps: dressed stone, as white as the plaster where it faces the light. */
  plinth: string
  /** The cool shade laid on whatever turns from the light (a plinth's side, the underside of the roof), and its strength. */
  cool: string
  coolAlpha: number
  /** The roof: tile colour, the light it takes on the face turned most to the sky (a share of `lime`), the pale crown of each
   * row of cover tiles and the dark channel beside it. */
  tile: string
  tileLight: number
  lime: string
  rib: number
  groove: string
  grooveAlpha: number
  /** The underside of the eaves, and how much of it shows. */
  soffit: string
  soffitAlpha: number
  /** Lacquered wood: columns, lintels, fretwork, bench; the far columns seen inside the pavilion. */
  wood: string
  woodFar: string
  woodFarAlpha: number
  /** The bench's rail along the slat heads (by night it catches the light). */
  rail: string
  /** Lake stone: its body, the light on the side turned to the light, the cool wash on its forms, the dark of its hollows, its line. */
  stone: string
  stoneLit: string
  stoneLitAlpha: number
  stoneWash: string
  stoneWashAlpha: number
  hollow: string
  hollowAlpha: number
  stoneLine: string
  /** The bridge's deck stone. */
  deck: string
  /** Plants: the willow's wood and its near and far strands; the lotus leaf (raised and floating), its line and veins; the
   * lotus bud's petal, the flush at its tip and its line. */
  bough: string
  boughAlpha: number
  willowNear: string
  willowFar: string
  willowAlpha: number
  leaf: string
  leafFloat: string
  leafLine: string
  leafLineAlpha: number
  vein: string
  veinAlpha: number
  petal: string
  flush: string
  petalLine: string
  petalLineAlpha: number
  /** Water: a breath bluer than the air (its colour and cover), and the strokes and rings on it. */
  water: string
  waterAlpha: number
  ripple: string
  /** By night, the pavilion is lit from within (灯影夜游): the light from its middle (0) out to the reach of its glow (1); the warm
   * light it throws on what is next to it (a colour, and its cover from the middle out); and its broken reflection on the water. */
  lamp?: {
    stops: ReadonlyArray<readonly [number, string, number]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    reflect: string
  }
}


interface Point {
  x: number
  y: number
}

interface Built {
  defs: string
  markup: string
}

/** A repeatable number in 0..1 from two integers, so every build draws the same sheet. */
function hashUnit(index: number, salt: number): number {
  let value = (Math.imul(index, 374761393) + Math.imul(salt, 668265263)) | 0
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

/** Smooth noise in 0..1 along a line: hashed values at whole numbers, eased between. */
function noise(at: number, salt: number): number {
  const cell = Math.floor(at)
  const part = at - cell
  const ease = part * part * (3 - 2 * part)
  return hashUnit(cell, salt) * (1 - ease) + hashUnit(cell + 1, salt) * ease
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function channels(hex: string): number[] {
  return [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))
}

/** How light a colour looks, 0..255. */
function luma(hex: string): number {
  const [r = 0, g = 0, b = 0] = channels(hex)
  return 0.3 * r + 0.59 * g + 0.11 * b
}

/** How a glow falls off: its share of full strength at each share of its radius. The gradient's stops and `skyAt` both read it. */
const FALLOFF: Array<[number, number]> = [[0, 1], [0.35, 0.72], [0.7, 0.24], [1, 0]]

function falloffAt(share: number): number {
  for (let index = 1; index < FALLOFF.length; index += 1) {
    const from = FALLOFF[index - 1]
    const to = FALLOFF[index]
    if (from && to && share <= to[0]) return from[1] + ((to[1] - from[1]) * (share - from[0])) / (to[0] - from[0])
  }
  return 0
}

/** The sky's own gradients: one down the sheet, one per glow, all in the sheet's units so that any shape painted with them matches the sky behind it. */
function skyDefs(sky: Sky): string {
  const base =
    `<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HEIGHT}">` +
    sky.base.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</linearGradient>'
  const glows = sky.glows
    .map(
      (glow, index) =>
        `<radialGradient id="glow${index}" gradientUnits="userSpaceOnUse" cx="${glow.x}" cy="${glow.y}" r="${glow.r}">` +
        FALLOFF.map(([offset, share]) => `<stop offset="${offset}" stop-color="${glow.colour}" stop-opacity="${round(glow.alpha * share * 100) / 100}"/>`).join('') +
        '</radialGradient>',
    )
    .join('')
  return base + glows
}

/** A path painted with the sky, layer by layer: an opaque piece of sky in the path's shape. A ridge stands on one, so it hides what is behind it and still fades into the same sky. */
function skyPainted(d: string, sky: Sky): string {
  return `<path d="${d}" style="fill:url(#sky)"/>` + sky.glows.map((_, index) => `<path d="${d}" style="fill:url(#glow${index})"/>`).join('')
}

/** The same for a long shape kept once in the defs: each layer of sky is a reference to it, so the shape is written once. */
function skyPaintedShape(id: string, sky: Sky): string {
  return `<use href="#${id}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<use href="#${id}" fill="url(#glow${index})"/>`).join('')
}

/** The sky's colour at a point, worked out as the gradients paint it. */
function skyAt(sky: Sky, x: number, y: number): string {
  const share = Math.min(1, Math.max(0, y / HEIGHT))
  let colour = channels(sky.base[0]?.[1] ?? '#000000')
  for (let index = 1; index < sky.base.length; index += 1) {
    const from = sky.base[index - 1]
    const to = sky.base[index]
    if (!from || !to) continue
    if (share >= from[0] && share <= to[0]) {
      const part = (share - from[0]) / (to[0] - from[0])
      const a = channels(from[1])
      const b = channels(to[1])
      colour = a.map((value, at) => value + ((b[at] ?? 0) - value) * part)
    }
  }
  for (const glow of sky.glows) {
    const distance = Math.hypot(x - glow.x, y - glow.y) / glow.r
    if (distance >= 1) continue
    const alpha = glow.alpha * falloffAt(distance)
    const over = channels(glow.colour)
    colour = colour.map((value, at) => value + ((over[at] ?? 0) - value) * alpha)
  }
  return '#' + colour.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')
}

// ---------------------------------------------------------------------------------------------------------------------
// Small tools of the pen.

function pt(x: number, y: number): Point {
  return { x, y }
}

function at(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

function polyline(points: Point[], closed = false): string {
  return 'M' + points.map(at).join('L') + (closed ? 'Z' : '')
}

/** An opacity in 0..1 with two decimals. */
function share(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100
}

/** A smooth open path through the midpoints of the points. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  const second = points[1]
  const third = points[2]
  const last = points[points.length - 1]
  if (!first || !second || !last) return ''
  if (points.length < 4 || !third) return 'M' + points.map(point => `${round(point.x)} ${round(point.y)}`).join('L')
  let path = `M${round(first.x)} ${round(first.y)}Q${round(second.x)} ${round(second.y)} ${round((second.x + third.x) / 2)} ${round((second.y + third.y) / 2)}`
  for (let index = 2; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (here && next) path += `T${round((here.x + next.x) / 2)} ${round((here.y + next.y) / 2)}`
  }
  return `${path}T${round(last.x)} ${round(last.y)}`
}

/** The same for a closed ring. */
function smoothRing(points: Point[]): string {
  const count = points.length
  let path = ''
  for (let index = 0; index < count; index += 1) {
    const before = points[(index + count - 1) % count]
    const here = points[index]
    const next = points[(index + 1) % count]
    if (!before || !here || !next) continue
    const middle = `${round((here.x + next.x) / 2)} ${round((here.y + next.y) / 2)}`
    if (index === 0) path = `M${round((before.x + here.x) / 2)} ${round((before.y + here.y) / 2)}Q${at(here)} ${middle}`
    else path += `T${middle}`
  }
  return path + 'Z'
}

/** A run of points through the given ones, rounded as a brush rounds a corner (Catmull-Rom). */
function spline(points: Point[], per: number): Point[] {
  const out: Point[] = []
  const last = points.length - 1
  for (let index = 0; index < last; index += 1) {
    const a = points[Math.max(0, index - 1)]
    const b = points[index]
    const c = points[index + 1]
    const d = points[Math.min(last, index + 2)]
    if (!a || !b || !c || !d) continue
    for (let step = 0; step < per; step += 1) {
      const t = step / per
      const t2 = t * t
      const t3 = t2 * t
      out.push(
        pt(
          0.5 * (2 * b.x + (c.x - a.x) * t + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * t2 + (3 * b.x - a.x - 3 * c.x + d.x) * t3),
          0.5 * (2 * b.y + (c.y - a.y) * t + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * t2 + (3 * b.y - a.y - 3 * c.y + d.y) * t3),
        ),
      )
    }
  }
  const end = points[last]
  if (end) out.push(end)
  return out
}

/** A stroke that swells and thins: the outline of a line whose width follows `widthAt` (0 at its start, 1 at its end). */
function taper(points: Point[], widthAt: (along: number) => number): string {
  const left: Point[] = []
  const right: Point[] = []
  const last = points.length - 1
  for (let index = 0; index <= last; index += 1) {
    const before = points[Math.max(0, index - 1)]
    const here = points[index]
    const after = points[Math.min(last, index + 1)]
    if (!before || !here || !after) continue
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const half = widthAt(index / last) / 2
    left.push(pt(here.x - (dy / length) * half, here.y + (dx / length) * half))
    right.unshift(pt(here.x + (dy / length) * half, here.y - (dx / length) * half))
  }
  return polyline(left.concat(right), true)
}

/** A closed ring of points written with relative moves, which are shorter than absolute ones: the outline of a brush band.
 * Every point is rounded first and each move is the difference of two rounded points, so the pen never drifts. */
function relRing(points: Point[]): string {
  let d = ''
  let px = 0
  let py = 0
  points.forEach((point, index) => {
    const x = round(point.x)
    const y = round(point.y)
    if (index === 0) d += `M${x} ${y}`
    else {
      const dx = round(x - px)
      const dy = round(y - py)
      d += `l${dx}${dy < 0 ? '' : ' '}${dy}`
    }
    px = x
    py = y
  })
  return d + 'Z'
}

/** A brush band along a run of points, as wide at each as `widths` says: what a pressed and lifted brush leaves. */
function ribbon(points: Point[], widths: number[]): string {
  const left: Point[] = []
  const right: Point[] = []
  const last = points.length - 1
  points.forEach((here, index) => {
    const before = points[Math.max(0, index - 1)] ?? here
    const after = points[Math.min(last, index + 1)] ?? here
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const half = (widths[index] ?? 0) / 2
    left.push(pt(here.x - (dy / length) * half, here.y + (dx / length) * half))
    right.unshift(pt(here.x + (dy / length) * half, here.y - (dx / length) * half))
  })
  return relRing(left.concat(right))
}

/** A wash: a shape filled with thinned ink. */
function washed(d: string, stock: Stock, strength: number, extra = ''): string {
  return `<path d="${d}" fill="${stock.ink}" fill-opacity="${share(strength * stock.wash)}"${extra}/>`
}

/** A shape filled with ink at pen strength: columns, ridges, the finial. */
function inked(d: string, stock: Stock, strength: number): string {
  return `<path d="${d}" fill="${stock.ink}" fill-opacity="${share(strength * stock.line)}"/>`
}

/** A pen line. */
function drawn(d: string, stock: Stock, width: number, strength: number, extra = ''): string {
  return `<path d="${d}" stroke="${stock.ink}" stroke-width="${width}" stroke-opacity="${share(strength * stock.line)}"${extra}/>`
}

/** The colour a wash of `over` at strength `alpha` makes on `under`: one flat fill then does for a small shape what a piece of sky and a wash would. */
function mixed(under: string, over: string, alpha: number): string {
  const a = channels(under)
  const b = channels(over)
  return '#' + a.map((value, at) => Math.round(value + ((b[at] ?? 0) - value) * alpha).toString(16).padStart(2, '0')).join('')
}

/** A shape filled with one flat colour (the sky's own colour there): it hides what is behind a small thing. */
function blank(d: string, colour: string): string {
  return `<path d="${d}" fill="${colour}"/>`
}

/** A shape in a paint of its own (a colour or a gradient), at a cover; nothing when the shape is empty. */
function fillWith(d: string, paint: string, cover: number, extra = ''): string {
  if (!d) return ''
  return `<path d="${d}" fill="${paint}"${cover < 1 ? ` fill-opacity="${share(cover)}"` : ''}${extra}/>`
}

/** A line in a paint of its own. */
function strokeWith(d: string, paint: string, width: number, cover: number, extra = ''): string {
  if (!d) return ''
  return `<path d="${d}" stroke="${paint}" stroke-width="${width}"${cover < 1 ? ` stroke-opacity="${share(cover)}"` : ''}${extra}/>`
}

// ---------------------------------------------------------------------------------------------------------------------
// Lake stones (太湖石), drawn as the 1613 woodcuts of the 素园石谱 and the Ming painters draw them. An outline of many
// small scallops with notches between them, heavier on the side turned from the light and at the foot, thinner and here
// and there broken along the lit top. A few holes of very different sizes: each a closed loop with a second, partial
// line inside it for the thickness of its rim; the blind ones dark inside, the through ones open to whatever lies
// behind. Long grooves down the stone, short curved strokes on the shaded side of a swelling, a cluster or two of small
// rings (弹子窝). Pale grey washes, darkest in the hollows and under an overhang, and most of the stone left bare.
// The stone has no colour: by day paper white and grey ink; by night pale ink and real shadow.

/** One knot of an outline: x, y, and how far the edge from it to the next knot bulges out (positive) or is scooped in (negative). */
type Knot = [number, number, number]

interface LakeHole {
  /** Centre and half sizes in the stone's own units, and a turn in degrees. */
  x: number
  y: number
  rx: number
  ry: number
  tilt: number
  /** It goes right through: the sky, or whatever is behind the stone, shows inside it. */
  through: boolean
  form: 'oval' | 'tear' | 'kidney'
  /** The way the hole runs back into the stone, as a compass angle on the sheet (0 right, 90 down): its far opening lies
   * that way inside the near one, so the hole's wall shows on the other side, under its upper lip. */
  toward: number
}

interface LakeStone {
  knots: Knot[]
  holes: LakeHole[]
  /** The inner lines that part one lobe of the stone from the next, as a painter draws them: each starts at a notch of
   * the outline, sweeps in and ends open. The side of each turned from the light takes a band of shade. */
  contours?: number[][]
  /** Long grooves down the stone, each a run of points (x, y, x, y, ...). */
  grooves?: number[][]
  /** Short curved strokes (皴) on the shaded side of a swelling: three points each. */
  hatches?: number[][]
  /** Washes of shade just inside the outline on the side turned from the light: from one knot to another (clockwise),
   * and their width; each swells from nothing to its width and back, following the outline. */
  rims?: number[][]
  /** Clusters of small rings (弹子窝): x, y and the cluster's size. */
  rings?: number[][]
  /** Shadow under an overhang: a ring of points, washed with shade. */
  shadows?: number[][]
  /** The front edge of a flat top (a slab's lip), as a run of points. */
  lip?: number[]
  /** The hollow under that lip, at the water: a ring of points, filled with the darkness that fades into the water. */
  under?: number[]
  /** A cave mouth: a ring of points, dark inside; only its arch is drawn. */
  cave?: number[]
  /** Moss dots: x, y pairs. */
  moss?: number[]
  /** Outline edges, by the index of the knot they leave, drawn only in part: the lost edges on the lit side. */
  lost?: number[]
  /** Outline edges not drawn at all: where the stone sits on or behind another, so the pile reads as one mass. */
  seams?: number[]
  /** How white its lit side is, relative to the wall's whitewash. */
  tone: number
}

/** The light comes from the upper right, where the sun hangs. */
const LIGHT = pt(0.6, -0.8)

function lerp(a: Point, b: Point, t: number): Point {
  return pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
}

/** How far the rim of a hole of the given form reaches at an angle round it, before the hole is turned. A tear points up,
 * a kidney is pressed in along its top. */
function holeReach(form: LakeHole['form'], angle: number, seed: number, rough = 1): number {
  const wobble = rough * (0.05 * Math.sin(3 * angle + seed) + 0.04 * Math.sin(5 * angle + seed * 1.7))
  if (form === 'tear') return 0.84 + 0.62 * Math.pow(Math.max(0, -Math.sin(angle)), 4) + wobble
  if (form === 'kidney') return 1.04 - 0.4 * Math.pow(Math.max(0, -Math.sin(angle)), 2) + wobble
  return 1 + 0.08 * Math.sin(2 * angle + seed) + wobble
}

/** The rim of a hole, `k` of its size, its centre moved `shift` units toward where it runs back. */
function holeRing(hole: LakeHole, place: (x: number, y: number) => Point, k: number, shift: number, seed: number, from = 0, to = Math.PI * 2, steps = 12): Point[] {
  const tilt = (hole.tilt * Math.PI) / 180
  const toward = (hole.toward * Math.PI) / 180
  const cx = hole.x + Math.cos(toward) * shift
  const cy = hole.y + Math.sin(toward) * shift
  const points: Point[] = []
  const closed = to - from >= Math.PI * 2 - 0.001
  for (let index = 0; index < (closed ? steps : steps + 1); index += 1) {
    const angle = from + ((to - from) * index) / steps
    // A big hole's rim is worn more unevenly than a small one's.
    const reach = holeReach(hole.form, angle, seed, Math.min(hole.rx, hole.ry) > 8 ? 2.2 : 1) * k
    const x = Math.cos(angle) * hole.rx * reach
    const y = Math.sin(angle) * hole.ry * reach
    points.push(place(cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)))
  }
  return points
}

/** A small ring as a path: two half circles. */
function ringAt(x: number, y: number, r: number): string {
  return `M${round(x - r)} ${round(y)}a${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0a${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0`
}

/** A band of shade along an inner contour, on its side turned from the light: widest near the notch it starts from,
 * gone at its open end. */
function contourBand(points: Point[], width: number): string {
  const a = points[0]
  const b = points[points.length - 1]
  if (!a || !b || points.length < 3) return ''
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  let nx = -dy / length
  let ny = dx / length
  if (nx * LIGHT.x + ny * LIGHT.y > 0) {
    nx = -nx
    ny = -ny
  }
  const last = points.length - 1
  const offset = points.map((point, index) => {
    const reach = width * (index === last ? 0 : index === 0 ? 0.75 : 1 - (0.45 * (index - 1)) / Math.max(1, last - 1))
    return pt(point.x + nx * reach, point.y + ny * reach)
  })
  return smoothPath(points) + 'L' + smoothPath(offset.reverse()).slice(1) + 'Z'
}

/** One lake stone. `place` takes the stone's own units to the sheet (a plain scale and shift, so its proportions hold);
 * `scale` is that scale, for line widths, bands and the size below which a hole is only a pit. `pen` is the paint of its
 * lines (the ink, or a gradient that lets them fade into the water) and `underPaint` the fill of the hollow under its lip
 * and of a cave mouth. */
function lakeStone(
  stock: Stock,
  id: string,
  stone: LakeStone,
  place: (x: number, y: number) => Point,
  scale: number,
  pen: string,
  underPaint: string,
  weight = 1,
  glow?: { from: Point; colour: string; cover: number },
): Built {
  const salt = id.charCodeAt(0) * 7 + id.charCodeAt(id.length - 1)
  // Each long convex edge is broken into two to four smaller scallops of unequal size, with a small notch where they meet:
  // the lobed, cloud-like edge of a water-worn stone (the 素园石谱 draws it so), never one long even arc. Bays and seams stay
  // whole. `parent` keeps the knot each new edge came from, so seams, lost edges and rim washes still find their edges.
  const given = stone.knots.map(knot => place(knot[0], knot[1]))
  let givenArea = 0
  given.forEach((a, index) => {
    const b = given[(index + 1) % given.length]
    if (b) givenArea += a.x * b.y - b.x * a.y
  })
  const givenTurn = givenArea > 0 ? 1 : -1
  const knots: Knot[] = []
  const parent: number[] = []
  const firstOf: number[] = []
  given.forEach((a, index) => {
    const b = given[(index + 1) % given.length]
    const bulge = stone.knots[index]?.[2] ?? 0
    firstOf.push(knots.length)
    if (!b) return
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const pieces = bulge < -0.04 || (stone.seams ?? []).includes(index) ? 1 : Math.max(1, Math.min(5, Math.round(length / (7 + 3 * scale))))
    if (pieces === 1) {
      knots.push([a.x, a.y, bulge])
      parent.push(index)
      return
    }
    const c = pt((a.x + b.x) / 2 + ((dy * givenTurn) / length) * length * bulge, (a.y + b.y) / 2 + ((-dx * givenTurn) / length) * length * bulge)
    let t = 0
    for (let piece = 0; piece < pieces; piece += 1) {
      const u = 1 - t
      // Each scallop is pushed a little in or out of the parent curve, and now and then one is a shallow bite instead of a
      // swelling: the edge goes hollow then bulging, never one even run of beads.
      const jog = piece === 0 ? 0 : (hashUnit(index * 11 + piece, salt + 6) - 0.5) * (1.4 + 0.9 * scale)
      const bite = piece > 0 && hashUnit(index * 13 + piece, salt + 9) < 0.2
      knots.push([
        u * u * a.x + 2 * u * t * c.x + t * t * b.x + ((dy * givenTurn) / length) * jog,
        u * u * a.y + 2 * u * t * c.y + t * t * b.y + ((-dx * givenTurn) / length) * jog,
        bite ? -0.07 : 0.12 + 0.3 * hashUnit(index * 7 + piece, salt + 5),
      ])
      parent.push(index)
      t = Math.min(0.94, t + (1 + 0.55 * (hashUnit(index * 5 + piece, salt + 3) - 0.5)) / pieces)
    }
  })
  const points = knots.map(knot => pt(knot[0], knot[1]))
  const count = points.length
  let area = 0
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  points.forEach((a, index) => {
    const b = points[(index + 1) % count]
    if (!b) return
    area += a.x * b.y - b.x * a.y
    minX = Math.min(minX, a.x)
    maxX = Math.max(maxX, a.x)
    minY = Math.min(minY, a.y)
    maxY = Math.max(maxY, a.y)
  })
  const turn = area > 0 ? 1 : -1
  const first = points[0]
  let outline = first ? `M${at(first)}` : ''
  let hollows = ''
  const lost = (stone.lost ?? []).flatMap(edge => parent.flatMap((from, index) => (from === edge ? [index] : [])))
  const seams = (stone.seams ?? []).flatMap(edge => parent.flatMap((from, index) => (from === edge ? [index] : [])))
  const controls: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const normal = pt((dy * turn) / length, (-dx * turn) / length)
    const bulge = knots[index]?.[2] ?? 0
    const control = pt((a.x + b.x) / 2 + normal.x * length * bulge, (a.y + b.y) / 2 + normal.y * length * bulge)
    controls.push(control)
    outline += `Q${at(control)} ${at(b)}`
    if (bulge < -0.1) {
      // A bay in the outline: a crescent of shade just inside it, deepest at its middle.
      const deep = pt(control.x - normal.x * length * 0.24, control.y - normal.y * length * 0.24)
      hollows += `M${at(a)}Q${at(control)} ${at(b)}Q${at(deep)} ${at(a)}Z`
    }
  }
  outline += 'Z'

  // The painter's line round the stone (勾), one brush band per run of it: heavy where the edge turns from the light and along
  // the foot, thin where it faces the light, swelling where it turns into a notch (顿), and broken along the lit top, where
  // the light eats the edge. Seams (where a stone sits on or behind another) are left open.
  const height = maxY - minY || 1
  const lightDir = glow
    ? (() => {
        const dx = glow.from.x - (minX + maxX) / 2
        const dy = glow.from.y - (minY + maxY) / 2
        const length = Math.hypot(dx, dy) || 1
        return pt(dx / length, dy / length)
      })()
    : LIGHT
  const notch = points.map((here, index) => {
    const cin = controls[(index + count - 1) % count]
    const cout = controls[index]
    if (!cin || !cout) return false
    const ix = here.x - cin.x
    const iy = here.y - cin.y
    const ox = cout.x - here.x
    const oy = cout.y - here.y
    const size = (Math.hypot(ix, iy) || 1) * (Math.hypot(ox, oy) || 1)
    return ((ix * oy - iy * ox) * turn) / size < -0.22
  })
  // On a dark sheet the line is paler than the stone: it is the light catching the edge, so it is heavy on the lit side.
  const rimLit = !!stock.paint && luma(stock.paint.stoneLine) > luma(stock.paint.stone)
  const quad = (a: Point, c: Point, b: Point, t: number): { at: Point; normal: Point } => {
    const u = 1 - t
    const tx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)
    const ty = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y)
    const size = Math.hypot(tx, ty) || 1
    return { at: pt(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y), normal: pt((ty * turn) / size, (-tx * turn) / size) }
  }
  // Which part of each edge is drawn: all of it, a piece of it (a lit edge, broken), or none (a seam).
  const spans: Array<[number, number] | null> = []
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    const c = controls[index]
    if (!a || !b || !c || seams.includes(index)) {
      spans.push(null)
      continue
    }
    const mid = quad(a, c, b, 0.5).normal
    const facing = mid.x * lightDir.x + mid.y * lightDir.y
    const pick = hashUnit(index, salt + 13)
    if (lost.includes(index)) spans.push([0, 0.3])
    else if ((rimLit ? -facing : facing) > 0.4) spans.push(pick < 0.4 ? [0, 0.48 + 0.2 * hashUnit(index, salt + 14)] : pick < 0.75 ? [0.28 + 0.14 * hashUnit(index, salt + 15), 1] : [0, 0.84])
    else spans.push([0, 1])
  }
  let begin = 0
  for (let index = 0; index < count; index += 1) {
    const before = spans[(index + count - 1) % count]
    const here = spans[index]
    if (!before || before[1] < 1 || (here && here[0] > 0)) {
      begin = index
      break
    }
  }
  let brush = ''
  let runPoints: Point[] = []
  let runWidths: number[] = []
  let sample = 0
  const flush = (): void => {
    const total = runPoints.length
    if (total >= 2) {
      // The brush goes down and lifts off: the band thins to a point at both ends of the run.
      const along: number[] = [0]
      for (let index = 1; index < total; index += 1) {
        const a = runPoints[index - 1]
        const b = runPoints[index]
        along.push((along[index - 1] ?? 0) + (a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0))
      }
      const whole = along[total - 1] ?? 0
      const reach = 2.2 + 2.2 * scale
      brush += ribbon(runPoints, runWidths.map((width, index) => width * Math.max(0.12, Math.min(1, (along[index] ?? 0) / reach, (whole - (along[index] ?? 0)) / reach))))
    }
    runPoints = []
    runWidths = []
  }
  for (let step = 0; step < count; step += 1) {
    const index = (begin + step) % count
    const span = spans[index]
    const a = points[index]
    const b = points[(index + 1) % count]
    const c = controls[index]
    if (!span || !a || !b || !c) {
      flush()
      continue
    }
    const [t0, t1] = span
    if (t0 > 0) flush()
    const length = Math.hypot(b.x - a.x, b.y - a.y) * (t1 - t0)
    const steps = Math.max(2, Math.min(6, Math.round(length / (3.2 + 2.4 * scale))))
    for (let part = runPoints.length && t0 === 0 ? 1 : 0; part <= steps; part += 1) {
      const t = t0 + ((t1 - t0) * part) / steps
      const { at: here, normal } = quad(a, c, b, t)
      const facing = normal.x * lightDir.x + normal.y * lightDir.y
      const dark = Math.max(0, Math.min(1, ((rimLit ? facing + 0.1 : 0.3 - facing)) / 1.1))
      const low = Math.max(0, Math.min(1, (here.y - (maxY - 0.2 * height)) / (0.2 * height)))
      const accent = 1 + 0.36 * (notch[index] ? Math.max(0, 1 - 3 * t) : 0) + 0.36 * (notch[(index + 1) % count] ? Math.max(0, 1 - 3 * (1 - t)) : 0)
      const wobble = 0.8 + 0.4 * noise(sample * 0.8, salt + 31)
      sample += 1
      runPoints.push(here)
      runWidths.push((0.38 + 1.6 * Math.pow(dark, 1.3) + (normal.y > -0.4 && !rimLit ? 0.6 * low : 0)) * accent * wobble * weight)
    }
    if (t1 < 1) flush()
  }
  flush()

  // The holes. A pit is a small loop, lightly washed. A hole has its near rim and its far opening (`k` of its size, moved
  // toward where it runs back); between them its wall, darkest under the upper lip; a line along the far opening on the
  // wall's side. A blind hole's floor is a lighter grey than that wall, so it never reads as a dark pupil in a pale iris.
  let cuts = ''
  let walls = ''
  let floors = ''
  let pits = ''
  let rims = ''
  let inner = ''
  stone.holes.forEach((hole, index) => {
    const seed = index * 1.9 + 0.7
    const near = smoothRing(holeRing(hole, place, 1, 0, seed))
    if (Math.min(hole.rx, hole.ry) * scale < 2.6) {
      pits += near
      return
    }
    // A hole that goes through has a wide far opening pushed against its near rim on the side it runs back to, so its wall is
    // a crescent on one side only (a passage, not a ring round a pupil), and only that side's lip is drawn.
    const k = hole.through ? 0.76 : 0.6
    const shift = (1 - k) * Math.min(hole.rx, hole.ry) * (hole.through ? 1.05 : 0.9)
    const far = smoothRing(holeRing(hole, place, k, shift, seed))
    const wallSide = ((hole.toward + 180 - hole.tilt) * Math.PI) / 180
    rims += hole.through ? smoothPath(holeRing(hole, place, 1, 0, seed, wallSide - 1.3, wallSide + 1.3, 8)) : near
    walls += near + far
    if (hole.through) cuts += far
    else floors += far
    const centre = ((hole.toward + 180 - hole.tilt) * Math.PI) / 180
    inner += smoothPath(holeRing(hole, place, k, shift, seed, centre - 1.35, centre + 1.35, 6))
  })

  const run = (values: number[]): Point[] => pairs(values).map(point => place(point.x, point.y))
  // The washes inside the outline on its shaded side: the outline's own arcs, then back along a line set in from them.
  let rimWash = ''
  for (const rim of stone.rims ?? []) {
    const from = firstOf[rim[0] ?? 0] ?? 0
    const to = firstOf[rim[1] ?? 0] ?? 0
    const width = (rim[2] ?? 4) * scale
    const edges: number[] = []
    for (let index = from; index !== to && edges.length < count; index = (index + 1) % count) edges.push(index)
    const start = points[from]
    if (!start || !edges.length) continue
    let d = `M${at(start)}`
    const inside: Point[] = []
    edges.forEach((edge, order) => {
      const a = points[edge]
      const b = points[(edge + 1) % count]
      const c = controls[edge]
      if (!a || !b || !c) return
      d += `Q${at(c)} ${at(b)}`
      for (let step = 0; step < 4; step += 1) {
        const t = step / 4
        const u = 1 - t
        const on = pt(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y)
        const tx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)
        const ty = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y)
        const size = Math.hypot(tx, ty) || 1
        const reach = width * Math.pow(Math.sin((Math.PI * (order + t)) / edges.length), 0.6)
        inside.push(pt(on.x - ((ty * turn) / size) * reach, on.y + ((tx * turn) / size) * reach))
      }
    })
    const end = points[to]
    if (end) inside.push(end)
    rimWash += d + 'L' + inside.reverse().map(at).join('L') + 'Z'
  }
  let bands = ''
  for (const contour of stone.contours ?? []) {
    const line = run(contour)
    const path = spline(line, 3)
    const last = Math.max(1, path.length - 1)
    brush += ribbon(path, path.map((_, index) => (0.25 + 1.05 * Math.pow(1 - index / last, 0.9)) * weight * (0.85 + 0.3 * hashUnit(index, salt + 41))))
    bands += contourBand(line, 5 * scale + 0.6)
  }
  let texture = ''
  for (const groove of stone.grooves ?? []) texture += smoothPath(run(groove))
  for (const hatch of stone.hatches ?? []) {
    const [a, c, b] = run(hatch)
    if (a && c && b) texture += `M${at(a)}Q${at(c)} ${at(b)}`
  }
  // Each cluster is turned its own way and some lose a ring, so no two read as the same stamp.
  let rings = ''
  ;(stone.rings ?? []).forEach((ring, order) => {
    const centre = place(ring[0] ?? 0, ring[1] ?? 0)
    const size = (ring[2] ?? 1) * scale
    const angle = hashUnit(order, salt + 7) * Math.PI * 2
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const offsets: Array<[number, number, number]> = [[0, 0, 1.25], [2.9, -1.5, 0.95], [1.4, 2.6, 1.05], [-2.5, 1.7, 0.8]]
    offsets.forEach(([ox, oy, r], k) => {
      if (k === 3 && hashUnit(order, salt + 8) < 0.5) return
      rings += ringAt(centre.x + (ox * c - oy * s) * size, centre.y + (ox * s + oy * c) * size, r * size)
    })
  })
  let shadows = ''
  for (const shadow of stone.shadows ?? []) shadows += smoothRing(run(shadow))
  // Moss dots (苔点) go on in small clusters: one dab and one or two lesser dots beside it, never one even dash.
  let moss = ''
  let mossSmall = ''
  run(stone.moss ?? []).forEach((dot, index) => {
    moss += `M${at(dot)}h${round((0.5 + 0.9 * hashUnit(index, salt)) * scale + 0.2)}`
    mossSmall += `M${round(dot.x + (2.6 + 1.4 * hashUnit(index, salt + 1)) * scale)} ${round(dot.y + (0.6 - 1.6 * hashUnit(index, salt + 2)) * scale)}h0.1`
    if (hashUnit(index, salt + 3) > 0.35) mossSmall += `M${round(dot.x - (2.2 + 1.2 * hashUnit(index, salt + 4)) * scale)} ${round(dot.y + (0.3 + hashUnit(index, salt + 5)) * scale)}h0.1`
  })

  const p = stock.paint
  // Where the light comes from across the stone: the sun at the upper right, or (by night, for the rockery) the lit pavilion.
  const centreX = (minX + maxX) / 2
  const centreY = (minY + maxY) / 2
  // By day the light falls across the stone from the right a little above its middle, so the head is not singled out.
  let lx1 = maxX
  let ly1 = minY + (maxY - minY) * 0.36
  let lx2 = minX
  let ly2 = minY + (maxY - minY) * 0.6
  if (glow) {
    const dx = glow.from.x - centreX
    const dy = glow.from.y - centreY
    const length = Math.hypot(dx, dy) || 1
    const reach = Math.max(maxX - minX, maxY - minY) * 0.55
    lx1 = centreX + (dx / length) * reach
    ly1 = centreY + (dy / length) * reach
    lx2 = centreX - (dx / length) * reach
    ly2 = centreY - (dy / length) * reach
  }
  const litColour = glow ? glow.colour : p ? p.stoneLit : stock.wall
  const litCover = glow ? glow.cover : p ? p.stoneLitAlpha * stone.tone : stock.wallAlpha * stone.tone
  const defs =
    `<path id="${id}" fill-rule="evenodd" d="${outline}${cuts}"/>` +
    // Paper white where the stone turns to the light, fading out across it; the rest of it is the bare sheet.
    `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${round(lx1)}" y1="${round(ly1)}" x2="${round(lx2)}" y2="${round(ly2)}">` +
    `<stop offset="0" stop-color="${litColour}" stop-opacity="${share(litCover)}"/><stop offset="${glow ? 0.17 : p ? 0.34 : 0.42}" stop-color="${litColour}" stop-opacity="0"/>` +
    (p ? `<stop offset="1" stop-color="${p.stoneWash}" stop-opacity="${share(0.3 * p.stoneWashAlpha)}"/>` : '') +
    '</linearGradient>'
  // Forms are washed in the cool shade, hollows in the dark of a hollow (by day both cool grey, never a colour).
  const shade = (d: string, strength: number, extra = ''): string =>
    d ? `<path d="${d}" fill="${p ? p.stoneWash : stock.shade}" fill-opacity="${share(strength * (p ? p.stoneWashAlpha : stock.shadeAlpha))}"${extra}/>` : ''
  const deep = (d: string, strength: number, extra = ''): string =>
    d ? `<path d="${d}" fill="${p ? p.hollow : stock.shade}" fill-opacity="${share(strength * (p ? p.hollowAlpha : stock.shadeAlpha))}"${extra}/>` : ''
  const line = (d: string, width: number, strength: number): string =>
    d ? `<path d="${d}" stroke="${pen}" stroke-width="${round(width * weight * 100) / 100}" stroke-opacity="${share(strength * stock.line)}"/>` : ''
  const lip = stone.lip ? smoothPath(run(stone.lip)) : ''
  const under = stone.under ? smoothRing(run(stone.under)) : ''
  const cavePoints = stone.cave ? run(stone.cave) : []
  const cave = cavePoints.length ? smoothPath(cavePoints) + 'Z' : ''
  const arch = cavePoints.length > 4 ? smoothPath(cavePoints.slice(1, -1)) : ''
  const markup =
    (under ? `<path d="${under}" fill="${underPaint}"/>` : '') +
    // The body: by day an opaque pale cool grey (lake stone has no colour); on the old ink sheets a piece of sky a little greyed.
    (p
      ? `<use href="#${id}" fill="${p.stone}"/>`
      : skyPaintedShape(id, stock.sky) + `<use href="#${id}" fill="${stock.ink}" fill-opacity="${share(0.11 * stock.wash)}"/>`) +
    `<use href="#${id}" fill="url(#${id}g)"/>` +
    shade(rimWash, p ? 0.17 : 0.13) +
    shade(bands + hollows + shadows, p ? 0.15 : 0.12) +
    deep(walls, p ? 0.27 : 0.4, ' fill-rule="evenodd"') +
    deep(floors, 0.18) +
    deep(pits, 0.26) +
    (cave ? `<path d="${cave}" fill="url(#rc)"/>` : '') +
    line(texture, 0.65, rimLit ? 0.4 : 0.52) +
    line(rings, 0.5, 0.42) +
    // By night a hole through the stone shows the dark air: its lip is only touched, so it stays a void in the stone and does
    // not become a pale ring round a dark pupil.
    line(inner, 0.6, rimLit ? 0.3 : 0.5) +
    line(rims, 0.65, rimLit ? 0.32 : 0.6) +
    line(pits, 0.6, 0.42) +
    line(lip, 1.3, 0.68) +
    line(arch, 1.3, 0.72) +
    (brush ? `<path d="${brush}" fill="${pen}" fill-opacity="${share((rimLit ? 0.66 : 0.84) * stock.line)}"/>` : '') +
    (moss ? `<path d="${moss}" stroke="${pen}" stroke-width="${round(2.1 * weight * 10) / 10}" stroke-opacity="${share(0.72 * stock.line)}"/>` : '') +
    (mossSmall ? `<path d="${mossSmall}" stroke="${pen}" stroke-width="${round(1.3 * weight * 10) / 10}" stroke-opacity="${share(0.66 * stock.line)}"/>` : '')
  return { defs, markup }
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
}


// The rockery under the pavilion (池山), piled from lake stones in rough level courses rather than set in a row: one main
// mass, high, at the right, stacked from two stones (the upper one big above and small below, its crown broken by a notch
// and curling over on the right, a hole through it low on its shaded side); a lower tip in front of the pavilion and a lower
// one still at its corner, at uneven heights and spacing; flat stones at the water whose lips hang over a dark hollow; a
// low, wide cave mouth at the waterline under the main mass. Every outline is unequal lobes with notches between them. Where
// one stone sits on or behind another the line between them is left out. All in sheet units.
const ROCKERY_BACK: LakeStone[] = [
  // The main mass, its lower course, down to the water: a broad stone whose top the upper stone sits on, notched at its ends,
  // with a low, uneven cave the water has eaten in under it. No hole above the cave.
  {
    knots: [
      [1514, 856, 0.08], [1512, 842, 0.24], [1518, 831, -0.1], [1514, 820, 0.22], [1521, 810, 0.16], [1533, 805, 0.1],
      [1548, 808, 0.08], [1562, 804, 0.06], [1578, 807, 0.06], [1592, 803, 0.16], [1605, 808, 0.2], [1609, 820, 0.18], [1604, 830, -0.14],
      [1610, 842, 0.1], [1610, 856, 0],
    ],
    holes: [
      { x: 1590, y: 820, rx: 1.6, ry: 2, tilt: 0, through: false, form: 'oval', toward: 90 },
      { x: 1530, y: 841, rx: 1.4, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    // Low and wide, its roof uneven: a mouth the water has eaten in under the stone.
    cave: [1534, 857, 1538, 850, 1546, 846, 1553, 847, 1560, 844, 1569, 846, 1577, 850, 1582, 857],
    contours: [[1518, 831, 1527, 834, 1531, 842], [1604, 830, 1597, 834, 1594, 842]],
    grooves: [[1528, 814, 1526, 828], [1594, 812, 1596, 826]],
    hatches: [[1521, 840, 1519, 846, 1521, 852]],
    rings: [[1600, 846, 0.6]],
    rims: [[0, 4, 4]],
    moss: [1531, 806.5],
    seams: [5, 6, 7, 8, 14],
    tone: 0.32,
  },
  // Its upper stone, the high point: big above and small below, its crown broken by notches into unequal swellings, its left
  // side bitten by a cleft, its right side notched. No round hole: only a dark crack and a few pits.
  {
    knots: [
      [1538, 806, 0.14], [1534, 794, 0.22], [1541, 783, -0.12], [1533, 772, 0.24], [1538, 760, 0.18], [1535, 750, 0.2], [1545, 742, 0.12],
      [1553, 746, -0.16], [1560, 736, 0.22], [1572, 737, 0.14], [1578, 731, 0.2], [1590, 736, 0.12], [1597, 733, 0.22], [1607, 744, 0.2],
      [1610, 756, 0.12], [1603, 765, -0.18], [1609, 778, 0.22], [1601, 792, 0.18], [1594, 805, 0.06], [1550, 809, -0.06],
    ],
    holes: [
      { x: 1588, y: 752, rx: 1.4, ry: 1.8, tilt: 0, through: false, form: 'oval', toward: 90 },
      { x: 1556, y: 778, rx: 1.6, ry: 1.3, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1541, 783, 1550, 786, 1555, 793], [1553, 746, 1556, 755, 1555, 764], [1603, 765, 1596, 770, 1593, 778]],
    grooves: [[1568, 752, 1566, 768, 1568, 784], [1584, 760, 1586, 776, 1584, 790]],
    hatches: [[1537, 766, 1535, 772, 1537, 778], [1538, 794, 1536, 799, 1538, 804], [1600, 782, 1598, 788, 1599, 794]],
    rims: [[0, 3, 4], [15, 17, 3]],
    rings: [[1592, 768, 0.7]],
    // The dark joint where it sits on the lower stone.
    shadows: [[1546, 805, 1566, 809, 1586, 804, 1590, 808, 1568, 813, 1544, 809]],
    moss: [1560, 736.5, 1597, 733.5],
    seams: [18, 19],
    tone: 0.5,
  },
]

const ROCKERY_FRONT: LakeStone[] = [
  // Under the pavilion's corner, beside the steps: the lowest stone, low and wider than it is tall, its top rising to the right
  // in two swellings with a notch between; clefts open from its notches, and no hole.
  {
    knots: [
      [1427, 846, 0.06], [1425, 838, 0.22], [1431, 832, 0.14], [1440, 830, -0.12], [1446, 824, 0.2], [1458, 821, 0.12], [1468, 822, 0.18],
      [1477, 828, 0.16], [1475, 835, -0.12], [1480, 841, 0.12], [1480, 846, 0],
    ],
    holes: [{ x: 1436, y: 838, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 }],
    contours: [[1440, 830, 1444, 836, 1443, 842], [1475, 835, 1468, 838, 1465, 843]],
    hatches: [[1429, 837, 1428, 841, 1430, 845]],
    rings: [[1462, 829, 0.55]],
    rims: [[0, 3, 3]],
    moss: [1446, 824.5],
    seams: [10],
    tone: 0.42,
  },
  // In front of the pavilion, under its right-hand column: the second stone, wider than tall, its top tilted and broken by a
  // notch, bays eaten into both sides; clefts from its notches and two pits, no hole.
  {
    knots: [
      [1476, 846, 0.06], [1474, 834, 0.2], [1481, 824, -0.12], [1479, 814, 0.22], [1490, 806, 0.12], [1500, 808, -0.14], [1507, 799, 0.2],
      [1518, 801, 0.18], [1525, 812, 0.16], [1520, 824, -0.16], [1525, 836, 0.14], [1525, 846, 0],
    ],
    holes: [
      { x: 1488, y: 830, rx: 1.5, ry: 1.9, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1500, 808, 1499, 816, 1502, 824], [1520, 824, 1513, 828, 1510, 836], [1481, 824, 1487, 827, 1490, 834]],
    grooves: [[1492, 822, 1491, 836]],
    rings: [[1512, 812, 0.55]],
    rims: [[0, 3, 3]],
    moss: [1500, 808.5],
    seams: [11],
    tone: 0.45,
  },
  // The flat stone the bridge and the steps come down onto: thin, its back edge lost under the steps, its front an
  // uneven lip over a dark hollow, a few short grooves down its face.
  {
    knots: [[1371, 847, 0.14], [1374, 839, -0.12], [1380, 834, 0.2], [1392, 831, 0.04], [1404, 830, -0.08], [1416, 831, 0.12], [1426, 833, 0.16], [1431, 839, -0.16], [1428, 845, 0.12], [1414, 849, -0.08], [1396, 848, 0.06], [1380, 850, 0.06]],
    holes: [],
    lip: [1377, 839, 1392, 837.5, 1406, 839, 1420, 838, 1430, 840.5],
    grooves: [[1390, 841, 1389, 846], [1416, 842, 1417, 847]],
    under: [1376, 848, 1396, 847, 1414, 848, 1428, 844, 1432, 850, 1412, 856, 1384, 856],
    seams: [3, 4],
    tone: 0.4,
  },
  // The long flat stone along the water in front of the two tips: thicker at its right end, its back edge not drawn so
  // the tips go down into it, its front an uneven lip over a dark hollow with a few short grooves down the face.
  {
    knots: [
      [1441, 851, 0.12], [1446, 844, 0.08], [1460, 841, -0.06], [1474, 840, 0.06], [1490, 840.5, -0.04], [1504, 839, 0.06], [1516, 838.5, -0.06], [1530, 840, 0.12],
      [1538, 845, -0.16], [1535, 850, 0.12], [1520, 853, -0.1], [1500, 852, 0.06], [1478, 854, -0.06], [1456, 853, 0.08],
    ],
    holes: [{ x: 1470, y: 849, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 }],
    lip: [1444, 845, 1458, 843.5, 1472, 844.5, 1486, 842.5, 1500, 844, 1516, 843, 1535, 844],
    grooves: [[1462, 846.5, 1461, 851], [1494, 846, 1495, 851.5], [1521, 845.5, 1520, 850.5]],
    under: [1446, 853.5, 1478, 855, 1500, 853, 1528, 852.5, 1538, 856, 1500, 860, 1452, 859],
    moss: [1466, 841.5],
    seams: [2, 3, 4, 5],
    tone: 0.4,
  },
]

/** Where the pavilion's light comes from, by night: the rockery takes it on the side that faces the pavilion. */
const PAVILION_LIGHT = pt(1462, 727)

function rockery(stock: Stock, stones: LakeStone[], prefix: string): Built {
  const lamp = stock.paint?.lamp
  const glow = lamp ? { from: PAVILION_LIGHT, colour: lamp.spill, cover: 0.55 } : undefined
  const built = stones.map((stone, index) => lakeStone(stock, `${prefix}${index}`, stone, (x, y) => pt(x, y), 1, 'url(#rs)', 'url(#ru)', 0.85, glow))
  return { defs: built.map(part => part.defs).join(''), markup: built.map(part => part.markup).join('') }
}

/** A tuft of garden grass in a cleft of the stones: a fan of thin bending blades. */
function tuft(stock: Stock, x: number, y: number, size: number, seed: number): string {
  let d = ''
  for (let blade = 0; blade < 7; blade += 1) {
    const angle = ((-158 + blade * 23 + (hashUnit(blade, seed) - 0.5) * 12) * Math.PI) / 180
    const reach = size * (0.7 + 0.5 * hashUnit(blade, seed + 1))
    const tipX = x + Math.cos(angle) * reach * 1.25
    const tipY = y + Math.sin(angle) * reach * 0.75 + reach * 0.12
    d += `M${round(x + (blade - 3) * 0.7)} ${round(y)}Q${round(x + Math.cos(angle) * reach * 0.5)} ${round(y + Math.sin(angle) * reach * 1.05)} ${round(tipX)} ${round(tipY)}`
  }
  return stock.paint ? strokeWith(d, stock.paint.lamp ? stock.paint.leafLine : stock.paint.willowNear, 0.8, 0.8) : drawn(d, stock, 0.8, 0.62)
}

// ---------------------------------------------------------------------------------------------------------------------
// Lotus.

/** One lotus leaf. Held above the water it is a shallow funnel seen from a little above: its ruffled rim, and the hub (the
 * lowest point of the bowl) sunk toward the near rim, so the veins run long to the far rim and short to the near one; the
 * stalk leaves the hub and bows on its way down to the water. Floating, it lies flat with its hub at the middle. Some
 * have a lip of the rim curled over to show the pale underside. */
function lotusLeaf(stock: Stock, cx: number, cy: number, rx: number, ry: number, tilt: number, seed: number, tone: number, water: number, curl: number, bow = 0): string {
  const raised = water > cy
  const ruffle = raised ? 0.05 : 0.03
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const turn = (x: number, y: number): Point => pt(cx + x * cosT - y * sinT, cy + x * sinT + y * cosT)
  const rimAt = (angle: number, reach: number): Point => {
    const wave = 1 + 0.085 * Math.sin(3 * angle + seed) + 0.06 * Math.sin(5 * angle + seed * 1.7) + ruffle * Math.sin(8 * angle + seed * 0.6)
    return turn(Math.cos(angle) * rx * wave * reach, Math.sin(angle) * ry * wave * reach)
  }
  const rim: Point[] = []
  for (let index = 0; index < 18; index += 1) rim.push(rimAt((index / 18) * Math.PI * 2, 1))
  const ring = smoothRing(rim)
  const hub = turn(rx * 0.04, ry * (raised ? 0.5 : 0.1))
  let veins = ''
  for (let index = 0; index < 13; index += 1) {
    const angle = ((index + 0.3 * hashUnit(index, seed)) / 13) * Math.PI * 2
    veins += `M${at(hub)}L${at(rimAt(angle, 0.82 + 0.1 * hashUnit(index, seed + 1)))}`
  }
  const p = stock.paint
  let stalk = ''
  // The stalk leaves the underside at the hub and bows a little on its way down to the water.
  const stalkPath = `M${at(hub)}C${round(hub.x - bow * 0.3)} ${round(hub.y + (water - hub.y) * 0.4)} ${round(hub.x + bow * 0.75)} ${round(hub.y + (water - hub.y) * 0.65)} ${round(hub.x + bow)} ${round(water)}`
  if (raised) stalk = p ? strokeWith(stalkPath, p.leafLine, 1.1, 0.75) : drawn(stalkPath, stock, 1.1, 0.62)
  let lip = ''
  if (curl !== 0) {
    // A stretch of the near rim, folded back toward the hub.
    const from = curl > 0 ? 0.42 : 1.9
    const outer: Point[] = []
    const inside: Point[] = []
    for (let index = 0; index <= 6; index += 1) {
      const part = index / 6
      const angle = from + part * 0.95
      outer.push(rimAt(angle, 1))
      inside.push(rimAt(angle, 1 - 0.3 * Math.sin(Math.PI * part)))
    }
    const fold = smoothPath(outer) + 'L' + smoothPath(inside.reverse()).slice(1) + 'Z'
    // The turned lip shows the leaf's paler, bluer underside.
    lip = p
      ? `<path d="${fold}" fill="${mixed(p.leafFloat, p.vein, 0.35)}" stroke="${p.leafLine}" stroke-width="0.8" stroke-opacity="${share(p.leafLineAlpha * 0.9)}"/>`
      : `<path d="${fold}" fill="${mixed(skyAt(stock.sky, cx, cy), stock.ink, tone * 0.3 * stock.wash)}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${share(0.66 * stock.line)}"/>`
  }
  if (p) {
    // Raised leaves in the deeper green, floating ones paler; the veins pale, from a dark hub.
    const body = `<path d="${ring}" fill="${raised ? p.leaf : p.leafFloat}" stroke="${p.leafLine}" stroke-width="0.95" stroke-opacity="${share(p.leafLineAlpha)}"/>`
    return stalk + body + strokeWith(veins, p.vein, 0.6, p.veinAlpha) + strokeWith(`M${at(hub)}h0.1`, p.leafLine, 2.2, 0.6) + lip
  }
  const body = `<path d="${ring}" fill="${mixed(skyAt(stock.sky, cx, cy), stock.ink, tone * stock.wash)}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${share(0.72 * stock.line)}"/>`
  return stalk + body + drawn(veins + `M${at(hub)}h0.1`, stock, 0.6, 0.36) + drawn(`M${at(hub)}h0.1`, stock, 2.2, 0.5) + lip
}

/** A young leaf still rolled: a spindle on its stalk. */
function lotusScroll(stock: Stock, x: number, y: number, length: number, angle: number, water: number): string {
  const dx = Math.cos(angle) * length
  const dy = Math.sin(angle) * length
  const nx = -Math.sin(angle) * length * 0.2
  const ny = Math.cos(angle) * length * 0.2
  const a = pt(x - dx / 2, y - dy / 2)
  const b = pt(x + dx / 2, y + dy / 2)
  const body = `M${at(a)}Q${round(x + nx)} ${round(y + ny)} ${at(b)}Q${round(x - nx)} ${round(y - ny)} ${at(a)}Z`
  const seam = `M${at(a)}Q${round(x + nx * 0.3)} ${round(y + ny * 0.3)} ${at(b)}`
  const p = stock.paint
  if (p)
    return (
      strokeWith(`M${round(x)} ${round(y)}Q${round(x + 2)} ${round((y + water) / 2)} ${round(x + 5)} ${round(water)}`, p.leafLine, 1, 0.72) +
      `<path d="${body}" fill="${mixed(p.leafFloat, p.vein, 0.15)}" stroke="${p.leafLine}" stroke-width="0.9" stroke-opacity="${share(p.leafLineAlpha)}"/>` +
      strokeWith(seam, p.leafLine, 0.6, 0.5)
    )
  return (
    drawn(`M${round(x)} ${round(y)}Q${round(x + 2)} ${round((y + water) / 2)} ${round(x + 5)} ${round(water)}`, stock, 1, 0.6) +
    blank(body, skyAt(stock.sky, x, y)) +
    washed(body, stock, 0.2) +
    drawn(seam, stock, 0.6, 0.45) +
    drawn(body, stock, 0.9, 0.72)
  )
}

/** A lotus bud on its stalk: a closed teardrop with one petal's edge, a blush at its tip. */
function lotusBud(stock: Stock, x: number, y: number, size: number, footX: number, footY: number): string {
  const body = `M${round(x)} ${round(y)}C${round(x + 6.4 * size)} ${round(y + 6 * size)} ${round(x + 6.8 * size)} ${round(y + 14 * size)} ${round(x)} ${round(y + 19 * size)}C${round(x - 6.8 * size)} ${round(y + 14 * size)} ${round(x - 6.4 * size)} ${round(y + 6 * size)} ${round(x)} ${round(y)}Z`
  const petal = `M${round(x + 0.4 * size)} ${round(y + 1.5 * size)}Q${round(x + 3.2 * size)} ${round(y + 10 * size)} ${round(x + 0.8 * size)} ${round(y + 18.4 * size)}M${round(x - 0.6 * size)} ${round(y + 3 * size)}Q${round(x - 3.6 * size)} ${round(y + 11 * size)} ${round(x - 1.6 * size)} ${round(y + 18.2 * size)}`
  const stalk = `M${round(x)} ${round(y + 19 * size)}Q${round(x + (footX - x) * 0.1)} ${round((y + footY) / 2)} ${round(footX)} ${round(footY)}`
  const p = stock.paint
  if (p)
    // White, flushed pink-violet toward its tip (the gradient `bud` runs down it), its petal edges in a soft plum line.
    return (
      strokeWith(stalk, p.leafLine, 1.1, 0.8) +
      `<path d="${body}" fill="url(#bud)"/>` +
      strokeWith(petal, p.petalLine, 0.7, p.petalLineAlpha * 0.7) +
      strokeWith(body, p.petalLine, 1, p.petalLineAlpha)
    )
  return (
    drawn(stalk, stock, 1.1, 0.66) +
    blank(body, skyAt(stock.sky, x, y + 9)) +
    `<path d="${body}" fill="${stock.bloom}" fill-opacity="0.42"/>` +
    drawn(petal, stock, 0.7, 0.5) +
    drawn(body, stock, 1, 0.8)
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// The pavilion, built as a small model and drawn in elevation from a little above (the raised eye of a ruled-line painting).

function pavilion(stock: Stock, cx: number, cy: number, size: number): Built {
  const SIDES = 6
  const step = (Math.PI * 2) / SIDES
  const half = step / 2
  const yaw = (-8 * Math.PI) / 180
  const pitch = (9 * Math.PI) / 180
  const cosP = Math.cos(pitch)
  const sinP = Math.sin(pitch)
  // All lengths in the model's own units; `size` scales them to the sheet. Heights are measured from the eave line.
  const EAVE = 100 // the eave corners' distance from the axis
  const FLARE = 0.07 // how far the corners push out beyond the straight eave
  const RISE = 86 // apex above the eave line
  const LIFT = 33 // corner above the eave line
  const LIFT_POWER = 4
  // The eave runs nearly level along the middle of a face and only rises in its outer third, sweeping up into the corner.
  const SAG_POWER = 4.6
  const HOLLOW = 1.55 // the roof's concave fall
  const TIP = 1.09 // the corner rib runs on past the roof into its upturned point
  const COLUMN = 62
  const PLINTH = 74
  const LINTEL = -4
  const FLOOR = -104
  const GROUND = -132
  const SEAT = FLOOR + 15
  const RAIL = SEAT + 13.5
  const LEAN = 7.5
  const ENTRY = 2 // the face that is left open, toward the bridge
  const apothem = EAVE * Math.cos(half)
  const sideHalf = EAVE * Math.sin(half)
  const columnApothem = COLUMN * Math.cos(half)
  const columnSideHalf = COLUMN * Math.sin(half)
  const plinthApothem = PLINTH * Math.cos(half)
  const tanHalf = Math.tan(half)

  const proj = (x: number, y: number, z: number): Point => pt(cx + size * x, cy - size * (y * cosP - z * sinP))
  const cornerAngle = (k: number): number => yaw + k * step
  const normalAngle = (k: number): number => cornerAngle(k) + half
  const polar = (angle: number, radius: number, y: number): Point => proj(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
  /** A point on face k: `a` along the face (toward corner k + 1), `b` out from the axis, at height y. */
  const onFace = (k: number, a: number, b: number, y: number): Point => {
    const n = normalAngle(k)
    return proj(Math.cos(n) * b - Math.sin(n) * a, y, Math.sin(n) * b + Math.cos(n) * a)
  }
  const isFront = (k: number): boolean => Math.sin(normalAngle(k)) > 0
  const hasBench = (k: number): boolean => ((k % SIDES) + SIDES) % SIDES !== ENTRY
  /** How much a face is turned from the light, 0..1: the light comes from the right, where the disc hangs. */
  const shade = (k: number): number => (1 - Math.cos(normalAngle(k) - (35 * Math.PI) / 180)) / 2

  /** The roof's surface over face k. `drop` lowers the point: the eave's own thickness. */
  const roofAt = (k: number, a: number, b: number, drop = 0): Point => {
    const v = b / apothem
    const reach = b * tanHalf
    const u = reach > 0.001 ? Math.max(-1, Math.min(1, a / reach)) : 0
    const side = Math.abs(u)
    const flare = 1 + FLARE * Math.pow(side, 3) * Math.pow(v, 3)
    const y = RISE * Math.pow(Math.max(0, 1 - v), HOLLOW) + LIFT * Math.pow(side, SAG_POWER) * Math.pow(v, LIFT_POWER) - drop
    const n = normalAngle(k)
    return proj((Math.cos(n) * b - Math.sin(n) * a) * flare, y, (Math.sin(n) * b + Math.cos(n) * a) * flare)
  }
  /** The corner rib at corner k: down from the apex, hollow, then sweeping up into the flying corner. */
  const hipAt = (k: number, v: number): Point =>
    polar(cornerAngle(k), EAVE * v * (1 + FLARE * Math.pow(v, 3)), RISE * Math.pow(Math.max(0, 1 - v), HOLLOW) + LIFT * Math.pow(v, LIFT_POWER))

  const eaveOf = (k: number, drop = 0): Point[] => {
    const points: Point[] = []
    for (let index = 0; index <= 14; index += 1) points.push(roofAt(k, (-1 + index / 7) * sideHalf, apothem, drop))
    return points
  }
  const faceOf = (k: number): string => {
    const points: Point[] = []
    for (let index = 0; index <= 9; index += 1) points.push(hipAt(k, index / 9))
    points.push(...eaveOf(k).slice(1, 14))
    for (let index = 9; index >= 0; index -= 1) points.push(hipAt(k + 1, index / 9))
    return polyline(points, true)
  }
  /** The tile rows of face k: they run down the fall of the roof, and the corner ribs cut them off. `shift` moves every row
   * along the face by that share of the spacing: the dark channel beside each pale crown. */
  const tileRows = (k: number, shift = 0): string => {
    const seen = Math.max(0.2, Math.abs(Math.sin(normalAngle(k))))
    const spacing = Math.max(5.6, 3.1 / seen / size)
    const count = Math.floor((sideHalf * 2) / spacing)
    let d = ''
    for (let row = 0; row < count; row += 1) {
      const a = (row + 0.5 + shift - count / 2) * spacing
      const from = Math.abs(a) / tanHalf + 6
      const to = apothem * 0.955
      if (to - from < 9) continue
      const points: Point[] = []
      for (let part = 0; part <= 4; part += 1) points.push(roofAt(k, a, from + ((to - from) * part) / 4))
      d += smoothPath(points)
    }
    return d
  }
  const hipRidge = (k: number): string => {
    const points: Point[] = []
    for (let index = 0; index <= 18; index += 1) points.push(hipAt(k, 0.05 + (TIP - 0.05) * Math.pow(index / 18, 0.8)))
    return taper(points, along => {
      const v = 0.05 + (TIP - 0.05) * Math.pow(along, 0.8)
      // Even along the roof; past the eave it thins into the upswept horn, but keeps a blade's width to its tip.
      return size * (v < 0.86 ? 3 - 0.5 * v : 1.15 + (1.42 * (TIP - v)) / (TIP - 0.86))
    })
  }

  const faces = [0, 1, 2, 3, 4, 5]
  const frontFaces = faces.filter(k => isFront(k))
  const backFaces = faces.filter(k => !isFront(k))
  let defs = ''
  let out = ''
  const p = stock.paint
  const lamp = p?.lamp
  // The middle of the light, by night: on the axis, a little under the lintel.
  const lampAt = proj(0, -32, 0)

  if (p && lamp) {
    // The glow inside the pavilion, whole in its middle and gone a little beyond the columns: what the eye takes for the light
    // itself, seen through the open sides. Then the same light as it falls on things next to it (`ps`), for the floor, the sill
    // walls and the undersides of the eaves.
    defs +=
      `<radialGradient id="pg" gradientUnits="userSpaceOnUse" cx="${round(lampAt.x)}" cy="${round(lampAt.y)}" r="${round(78 * size)}" gradientTransform="translate(0 ${round(lampAt.y * 0.24)}) scale(1 0.76)">` +
      lamp.stops.map(([offset, colour, cover]) => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${cover}"/>`).join('') +
      '</radialGradient>' +
      `<radialGradient id="ps" gradientUnits="userSpaceOnUse" cx="${round(lampAt.x)}" cy="${round(lampAt.y)}" r="${round(118 * size)}">` +
      lamp.spillStops.map(([offset, cover]) => `<stop offset="${offset}" stop-color="${lamp.spill}" stop-opacity="${cover}"/>`).join('') +
      '</radialGradient>'
    // Laid only over the room itself, between the outer columns from the lintel to the floor (as the model fills the shape of
    // its opening), so none of it lies on the air beside the pavilion; the columns stand on its edges.
    const room = [3, 4, 5, 0].map(k => polar(cornerAngle(k), COLUMN, LINTEL)).concat([0, 1, 2, 3].map(k => polar(cornerAngle(k), COLUMN, FLOOR)))
    out += fillWith(polyline(room, true), 'url(#pg)', 1, ' class="flick"')
  }

  // The floor, and the far benches seen through the pavilion.
  const floor = polyline(faces.map(k => polar(cornerAngle(k), PLINTH, FLOOR)), true)
  out += p ? fillWith(floor, mixed(p.plinth, p.cool, 0.16), 1) + (lamp ? fillWith(floor, 'url(#ps)', 1) : '') : washed(floor, stock, 0.09)
  const railEnd = (k: number, end: number): Point => onFace(k, end * (columnSideHalf + (hasBench(k + end) ? LEAN * tanHalf : 0)), columnApothem + LEAN, RAIL)
  let far = ''
  for (const k of backFaces) {
    if (!hasBench(k)) continue
    far += polyline([onFace(k, -columnSideHalf, columnApothem, RAIL), onFace(k, columnSideHalf, columnApothem, RAIL)]) + polyline([onFace(k, -columnSideHalf, columnApothem, SEAT), onFace(k, columnSideHalf, columnApothem, SEAT)])
  }
  out += p ? strokeWith(far, lamp ? p.rail : p.wood, 0.9, lamp ? 0.62 : 0.5) : drawn(far, stock, 0.9, 0.3)

  // The columns of one depth (the far ones seen inside, or the near ones), their shafts as one path and their bases as another: they never overlap.
  const columns = (far: boolean): string => {
    let shafts = ''
    let bases = ''
    for (const k of faces) {
      const angle = cornerAngle(k)
      if ((Math.sin(angle) < -0.3) !== far) continue
      const foot = polar(angle, COLUMN, FLOOR)
      const head = polar(angle, COLUMN, LINTEL)
      const halfWidth = size * (far ? 1.8 : 2.4)
      shafts += `M${round(foot.x - halfWidth)} ${round(foot.y)}L${round(head.x - halfWidth)} ${round(head.y)}L${round(head.x + halfWidth)} ${round(head.y)}L${round(foot.x + halfWidth)} ${round(foot.y)}Z`
      bases += `M${round(foot.x - halfWidth - 1.6)} ${round(foot.y + 1)}h${round(halfWidth * 2 + 3.2)}v${round(-3.2 * size)}h${round(-halfWidth * 2 - 3.2)}Z`
    }
    if (!p) return inked(shafts, stock, far ? 0.42 : 0.84) + inked(bases, stock, far ? 0.36 : 0.7)
    // Far columns are seen from inside: by night their faces toward us are the ones the light falls on.
    return fillWith(shafts, far ? p.woodFar : p.wood, far ? p.woodFarAlpha : 0.96) + fillWith(bases, far ? p.woodFar : mixed(p.plinth, p.cool, 0.4), far ? p.woodFarAlpha * 0.8 : 1)
  }
  out += columns(true)

  // The low whitewashed sill wall under the bench, on the two faces that look over the water.
  const benchFaces = frontFaces.filter(k => hasBench(k))
  let panels = ''
  for (const k of benchFaces) {
    panels += polyline([onFace(k, -columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, SEAT), onFace(k, -columnSideHalf, columnApothem, SEAT)], true)
  }
  out += p
    ? fillWith(panels, p.plaster, 1) + (lamp ? fillWith(panels, 'url(#ps)', 1) : '') + strokeWith(panels, lamp ? stock.ink : p.wood, 0.8, lamp ? 0.4 : 0.55)
    : skyPainted(panels, stock.sky) + `<path d="${panels}" fill="${stock.wall}" fill-opacity="${stock.wallAlpha}"/>` + drawn(panels, stock, 0.8, 0.5)
  out += columns(false)

  // The stone plinth: three faces toward us, the darker the more they turn from the light. Its foot goes down among the rocks.
  let plinthLines = ''
  let masonry = ''
  for (const k of frontFaces) {
    const a = polar(cornerAngle(k), PLINTH, FLOOR)
    const b = polar(cornerAngle(k + 1), PLINTH, FLOOR)
    const c = polar(cornerAngle(k + 1), PLINTH, GROUND)
    const d = polar(cornerAngle(k), PLINTH, GROUND)
    // The face turned to the sun is as white as the plaster; the others take the cool shade as they turn away.
    out += p ? fillWith(polyline([a, b, c, d], true), shade(k) > 0.3 ? mixed(p.plinth, p.cool, Math.min(1, p.coolAlpha * 1.2 * shade(k))) : p.plinth, 1) : washed(polyline([a, b, c, d], true), stock, 0.1 + 0.16 * shade(k))
    plinthLines += polyline([d, a, b, c]) + polyline([polar(cornerAngle(k), PLINTH, FLOOR - 4.5), polar(cornerAngle(k + 1), PLINTH, FLOOR - 4.5)])
    const course = FLOOR - 15
    const side = PLINTH * Math.sin(half)
    masonry += polyline([onFace(k, -side, plinthApothem, course), onFace(k, side, plinthApothem, course)])
    for (const at of [0.22 + 0.12 * hashUnit(k, 91), 0.62 + 0.12 * hashUnit(k, 93)]) masonry += polyline([onFace(k, side * (2 * at - 1), plinthApothem, FLOOR - 4.5), onFace(k, side * (2 * at - 1), plinthApothem, course)])
    const low = side * (0.7 * hashUnit(k, 95) - 0.35)
    masonry += polyline([onFace(k, low, plinthApothem, course), onFace(k, low, plinthApothem, GROUND)])
  }
  out += p ? strokeWith(plinthLines, stock.ink, 0.9, 0.62 * stock.line) + strokeWith(masonry, p.lamp ? stock.ink : p.cool, 0.6, p.lamp ? 0.22 : 0.42) : drawn(plinthLines, stock, 0.9, 0.68) + drawn(masonry, stock, 0.6, 0.34)
  // Three stone steps down from the open face to the slab the bridge lands on, as wide as the opening: the risers washed,
  // each nosing drawn as a firm line, and the stepped cheek on the near side.
  {
    const q = plinthApothem
    const half = 21
    const levels = [FLOOR, FLOOR - 9.3, FLOOR - 18.6, GROUND]
    let risers = ''
    let nosings = ''
    const profile: Point[] = []
    for (let index = 1; index <= 2; index += 1) {
      const b = q + 10 * index
      const from = levels[index] ?? 0
      const to = levels[index + 1] ?? 0
      risers += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to), onFace(ENTRY, -half, b, to)], true)
      nosings += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from)]) + polyline([onFace(ENTRY, half, b - 10, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to)])
      profile.push(onFace(ENTRY, -half, b - 10, from), onFace(ENTRY, -half, b, from))
    }
    profile.push(onFace(ENTRY, -half, q + 20, GROUND), onFace(ENTRY, -half, q, GROUND))
    nosings += polyline([onFace(ENTRY, -half, q, levels[1] ?? 0), onFace(ENTRY, half, q, levels[1] ?? 0)])
    const cheek = polyline(profile, true)
    const centre = onFace(ENTRY, 0, q + 14, levels[2] ?? 0)
    out += p
      ? fillWith(risers, mixed(p.plinth, p.cool, p.coolAlpha * 0.5), 1) + fillWith(cheek, mixed(p.plinth, p.cool, p.coolAlpha * 0.9), 1) + strokeWith(cheek, stock.ink, 0.7, 0.45 * stock.line) + strokeWith(nosings, stock.ink, 1.1, 0.58 * stock.line)
      : blank(risers + cheek, skyAt(stock.sky, centre.x, centre.y)) + washed(risers, stock, 0.08) + washed(cheek, stock, 0.26) + drawn(cheek, stock, 0.7, 0.5) + drawn(nosings, stock, 1.1, 0.62)
  }

  // The bench: its seat, the goose-neck slats of the back leaning out over the water, the rail along their heads.
  let slats = ''
  let rails = ''
  let seats = ''
  for (const k of benchFaces) {
    const inner = columnSideHalf - 3.4
    for (let index = 0; index <= 11; index += 1) {
      const a = -inner + (inner * 2 * index) / 11
      slats += `M${at(onFace(k, a, columnApothem + 1.5, SEAT))}Q${at(onFace(k, a, columnApothem + 10, SEAT + 5))} ${at(onFace(k, a, columnApothem + LEAN, RAIL))}`
    }
    rails += polyline([railEnd(k, -1), railEnd(k, 1)])
    for (const end of [-1, 1]) {
      if (hasBench(k + end)) continue
      rails += `M${at(onFace(k, end * columnSideHalf, columnApothem + 1.5, SEAT))}Q${at(onFace(k, end * columnSideHalf, columnApothem + 10, SEAT + 5))} ${at(railEnd(k, end))}`
    }
    seats += polyline([onFace(k, -columnSideHalf, columnApothem + 1.5, SEAT), onFace(k, columnSideHalf, columnApothem + 1.5, SEAT)])
  }
  // By night the slats stand dark against the light inside and their rail catches it.
  out += p
    ? strokeWith(seats, lamp ? p.rail : p.wood, round(2.2 * size), lamp ? 0.6 : 0.9) + strokeWith(slats, p.wood, 0.8, 0.86) + strokeWith(rails, p.rail, 1.5, lamp ? 0.82 : 0.95)
    : drawn(seats, stock, round(2.2 * size), 0.74) + drawn(slats, stock, 0.8, 0.68) + drawn(rails, stock, 1.5, 0.88)

  // The lintel from column to column, and the fretwork that hangs under it.
  let fret = ''
  let beams = ''
  for (const k of frontFaces) {
    const span = columnSideHalf * 2 - 5.2
    const a0 = -span / 2
    const top = LINTEL - 5
    const depth = 11
    const drop = 6.5
    const foot = 8
    const on = (a: number, y: number): Point => onFace(k, a, columnApothem, y)
    beams += polyline([on(-columnSideHalf, top), on(columnSideHalf, top), on(columnSideHalf, LINTEL + 4), on(-columnSideHalf, LINTEL + 4)], true)
    fret += polyline([on(a0, top), on(a0 + span, top)])
    fret += polyline([on(a0, top - depth - drop), on(a0 + foot, top - depth - drop), on(a0 + foot, top - depth), on(a0 + span - foot, top - depth), on(a0 + span - foot, top - depth - drop), on(a0 + span, top - depth - drop)])
    const cells = 8
    const cell = span / cells
    for (let index = 1; index < cells; index += 1) {
      const a = a0 + index * cell
      const hangs = index % 2 === 1
      const y0 = hangs ? top : top - depth
      const y1 = hangs ? top - depth * 0.62 : top - depth * 0.38
      fret += polyline([on(a, y0), on(a, y1), on(a + cell * 0.5 * (hangs ? 1 : -1), y1)])
    }
  }
  out += p ? fillWith(beams, p.wood, 0.92) + strokeWith(fret, p.wood, 0.8, 0.9) : washed(beams, stock, 0.36) + drawn(fret, stock, 0.75, 0.72)

  // Under the roof: shade by day; by night the light, brightest up under the roof.
  {
    const left = polar(cornerAngle(3), COLUMN, 0).x
    const right = polar(cornerAngle(0), COLUMN, 0).x
    const top = cy - 2 * size
    const bottom = cy + 40 * size
    const tone = p ? (lamp ? lamp.spill : p.cool) : stock.ink
    const strength = p ? (lamp ? 0.62 : p.coolAlpha) : 0.3 * stock.wash
    defs +=
      `<linearGradient id="pu" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
      `<stop offset="0" stop-color="${tone}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${tone}" stop-opacity="${share(strength * 0.4)}"/>` +
      `<stop offset="1" stop-color="${tone}" stop-opacity="0"/></linearGradient>`
    out += `<path d="M${round(left)} ${round(top)}H${round(right)}V${round(bottom)}H${round(left)}Z" fill="url(#pu)"/>`
  }
  // The underside of the eaves, where a lifted corner lets the eye in under the roof: dark wood in shade by day, lit from
  // below by night.
  let soffits = ''
  for (const k of frontFaces) soffits += polyline(eaveOf(k, 2).concat([polar(cornerAngle(k + 1), COLUMN, LINTEL + 2), polar(cornerAngle(k), COLUMN, LINTEL + 2)]), true)
  out += p ? fillWith(soffits, p.soffit, p.soffitAlpha) + (lamp ? fillWith(soffits, 'url(#ps)', 1) : '') : washed(soffits, stock, 0.5)

  // The roof. The far faces first: only their flying corners show above the near ones.
  const backRoof = backFaces.map(k => faceOf(k)).join('')
  out += p
    ? fillWith(backRoof, p.tile, 0.96) + strokeWith(backFaces.map(k => polyline(eaveOf(k))).join(''), lamp ? lamp.spill : p.tile, 0.8, lamp ? 0.4 : 0.9)
    : washed(backRoof, stock, 0.26) + drawn(backFaces.map(k => polyline(eaveOf(k))).join(''), stock, 0.8, 0.5)
  // By night the hips are as dark as the model's coping, and only a fine warm line along each crest catches the light.
  let crests = ''
  // The hips of one pass (behind the near faces, or over them), as one shape.
  const ridges = (front: boolean, strength: number): string => {
    let d = ''
    for (const k of faces) {
      if ((isFront(k) || isFront(k - 1)) !== front) continue
      d += hipRidge(k)
      if (lamp) {
        const line: Point[] = []
        for (let index = 0; index <= 12; index += 1) line.push(hipAt(k, 0.06 + (TIP - 0.1) * Math.pow(index / 12, 0.8)))
        crests += smoothPath(line)
      }
    }
    return p ? fillWith(d, p.tile, 1) : inked(d, stock, strength)
  }
  out += ridges(false, 0.74)
  if (p) {
    // Opaque tile: each face a little lighter the more it turns to the sky; the pale crown of every row of cover tiles and the
    // dark channel beside it; the lowest course; the fascia; the drip tiles under the eave (by night their ends catch the light);
    // the eave's edge. The faces are laid first and then each kind of line once for all three, so the roof is a handful of paths.
    let grooves = ''
    let crowns = ''
    let courses = ''
    let fascia = ''
    let drips = ''
    let eaves = ''
    for (const k of frontFaces) {
      const course: Point[] = []
      for (let index = 0; index <= 12; index += 1) course.push(roofAt(k, (-1 + index / 6) * sideHalf * 0.93, apothem * 0.93))
      out += fillWith(faceOf(k), mixed(p.tile, p.lime, p.tileLight * Math.pow(1 - shade(k), 2)), 1)
      grooves += tileRows(k, 0.42)
      crowns += tileRows(k)
      courses += smoothPath(course)
      fascia += polyline(eaveOf(k).concat(eaveOf(k, 3.6).reverse()), true)
      drips += polyline(eaveOf(k, 2))
      eaves += polyline(eaveOf(k))
    }
    out +=
      strokeWith(grooves, p.groove, 0.8, p.grooveAlpha) +
      strokeWith(crowns, p.lime, 0.7, p.rib) +
      strokeWith(courses, p.lime, 0.7, p.rib * 0.8) +
      fillWith(fascia, p.tile, 1) +
      strokeWith(drips, p.tile, round(2.6 * size), 0.85, ' stroke-linecap="butt" stroke-dasharray="1.5 1.9"') +
      strokeWith(eaves, lamp ? lamp.spill : p.tile, 0.9, lamp ? 0.55 : 1)
  } else {
    defs += frontFaces.map(k => `<path id="f${k}" d="${faceOf(k)}"/>`).join('') + `<g id="rf">${frontFaces.map(k => `<use href="#f${k}"/>`).join('')}</g>`
    {
      const top = proj(0, RISE, 0).y
      defs +=
        `<linearGradient id="rg" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(cy + 12 * size)}">` +
        `<stop offset="0.15" stop-color="${stock.ink}" stop-opacity="0"/><stop offset="1" stop-color="${stock.ink}" stop-opacity="${share(0.2 * stock.wash)}"/></linearGradient>`
    }
    out += skyPaintedShape('rf', stock.sky) + '<use href="#rf" fill="url(#rg)"/>'
    for (const k of frontFaces) {
      const course: Point[] = []
      for (let index = 0; index <= 12; index += 1) course.push(roofAt(k, (-1 + index / 6) * sideHalf * 0.93, apothem * 0.93))
      out +=
        `<use href="#f${k}" fill="${stock.ink}" fill-opacity="${share((0.15 + 0.22 * shade(k)) * stock.wash)}"/>` +
        drawn(tileRows(k), stock, 0.6, 0.46) +
        drawn(smoothPath(course), stock, 0.7, 0.4) +
        washed(polyline(eaveOf(k).concat(eaveOf(k, 3.6).reverse()), true), stock, 0.4) +
        // The drip tiles: a row of small ends under the eave's edge.
        drawn(polyline(eaveOf(k, 2)), stock, round(2.6 * size), 0.62, ' stroke-linecap="butt" stroke-dasharray="1.5 1.9"') +
        drawn(polyline(eaveOf(k)), stock, 0.9, 0.72)
    }
  }
  out += ridges(true, 0.86)
  out += strokeWith(crests, stock.ink, 0.6, 0.5)

  // The finial: a collar and a gourd with a point.
  {
    const apex = proj(0, RISE, 0)
    const profile: Array<[number, number]> = [[7.5, -4], [6.4, 2], [4.2, 5], [3.5, 7.2], [6.2, 11], [6.8, 15], [5.2, 19.5], [2.6, 21.6], [4.1, 24.6], [4.2, 27.6], [2.4, 30.6], [0.9, 33], [0.5, 40], [0, 44]]
    const right = profile.map(([r, h]) => pt(apex.x + r * size, apex.y - h * size))
    const left = profile.slice(0, -1).reverse().map(([r, h]) => pt(apex.x - r * size, apex.y - h * size))
    out += p
      ? fillWith(polyline(right.concat(left), true), p.tile, 1, lamp ? ` stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="0.45"` : '')
      : inked(polyline(right.concat(left), true), stock, 0.88)
  }
  return { defs, markup: out }
}

// ---------------------------------------------------------------------------------------------------------------------
// The zigzag bridge: flat stone slabs on low piers, a low rail on either side, turning at every pier.
// Its plan lies on the water; the eye is higher here than for the pavilion, as a painter lifts the ground to show a path.

function bridge(stock: Stock, level: number): Built {
  const KY = 0.45
  const HALF = 11
  const POST = 5.5
  const THICK = 4.2
  // In plan: x along the sheet, z toward the eye. It turns at every pier, about forty degrees each way, and it keeps
  // to the far side of the water (negative z) so that nothing of it comes down beside the prompt box. On this sheet it is two
  // spans longer than on the Pavilion sheet: it comes out of the mist just short of the reading column.
  const centre: Array<[number, number]> = [[1164, -14], [1198, -46], [1232, -13], [1266, -47], [1300, -13], [1334, -46], [1368, -12], [1400, 3]]
  const last = centre.length - 1
  const unit = (from: [number, number], to: [number, number]): [number, number] => {
    const dx = to[0] - from[0]
    const dz = to[1] - from[1]
    const length = Math.hypot(dx, dz) || 1
    return [dx / length, dz / length]
  }
  const near: Array<[number, number]> = []
  const far: Array<[number, number]> = []
  centre.forEach((here, index) => {
    const before = centre[Math.max(0, index - 1)] ?? here
    const after = centre[Math.min(last, index + 1)] ?? here
    const dIn = index > 0 ? unit(before, here) : unit(here, after)
    const dOut = index < last ? unit(here, after) : dIn
    const nIn: [number, number] = [-dIn[1], dIn[0]]
    const nOut: [number, number] = [-dOut[1], dOut[0]]
    const dot = nIn[0] * nOut[0] + nIn[1] * nOut[1]
    const mitre: [number, number] = [(nIn[0] + nOut[0]) / (1 + dot), (nIn[1] + nOut[1]) / (1 + dot)]
    near.push([here[0] + mitre[0] * HALF, here[1] + mitre[1] * HALF])
    far.push([here[0] - mitre[0] * HALF, here[1] - mitre[1] * HALF])
  })
  const flat = (plan: [number, number], height = 0): Point => pt(plan[0], level + KY * plan[1] - height)
  const between = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const railOf = (edge: Array<[number, number]>): string => {
    let d = polyline(edge.map(plan => flat(plan, POST)))
    edge.forEach((plan, index) => {
      d += polyline([flat(plan), flat(plan, POST + 1.6)])
      const next = edge[index + 1]
      if (next) d += polyline([flat(between(plan, next)), flat(between(plan, next), POST)])
    })
    return d
  }
  const paint = 'url(#bf)'
  const deck = polyline(near.map(plan => flat(plan)).concat(far.map(plan => flat(plan)).reverse()), true)
  const edge = polyline(near.map(plan => flat(plan)).concat(near.map(plan => flat(plan, -THICK)).reverse()), true)
  let joints = ''
  let piers = ''
  let wet = ''
  centre.forEach((_, index) => {
    const a = near[index]
    const b = far[index]
    const nextA = near[index + 1]
    const nextB = far[index + 1]
    if (!a || !b) return
    if (nextA && nextB) joints += polyline([flat(between(b, nextB)), flat(between(a, nextA))])
    joints += polyline([flat(b), flat(a)])
    if (index === 0 || index === last) return
    const foot = flat(a, -THICK)
    piers += `M${round(foot.x - 2.2)} ${round(foot.y)}v7h4.4v-7Z`
    wet += `M${round(foot.x - 7)} ${round(foot.y + 7.8)}h14`
  })
  // A photographic sheet lays the deck in its own pale stone, out of the mist as the lines are.
  const p = stock.paint
  const defs =
    `<linearGradient id="bf" gradientUnits="userSpaceOnUse" x1="1160" y1="0" x2="1204" y2="0">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="0"/><stop offset="1" stop-color="${stock.ink}"/></linearGradient>` +
    (p
      ? `<linearGradient id="bw" gradientUnits="userSpaceOnUse" x1="1160" y1="0" x2="1212" y2="0">` +
        `<stop offset="0" stop-color="${p.deck}" stop-opacity="0"/><stop offset="1" stop-color="${p.deck}"/></linearGradient>`
      : '')
  const markup =
    `<path d="${railOf(far)}" stroke="${paint}" stroke-width="0.85" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    (p ? `<path d="${deck}" fill="url(#bw)"/>` : `<path d="${deck}" fill="${paint}" fill-opacity="${share(0.09 * stock.wash)}"/>`) +
    `<path d="${joints}" stroke="${paint}" stroke-width="0.7" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    `<path d="${deck}" stroke="${paint}" stroke-width="0.9" stroke-opacity="${share(0.7 * stock.line)}"/>` +
    `<path d="${edge}" fill="${paint}" fill-opacity="${share(0.5 * stock.wash)}"/>` +
    `<path d="${piers}" fill="${paint}" fill-opacity="${share(0.5 * stock.wash)}"/>` +
    `<path d="${wet}" stroke="${paint}" stroke-width="0.8" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    `<path d="${railOf(near)}" stroke="${paint}" stroke-width="1" stroke-opacity="${share(0.66 * stock.line)}"/>`
  return { defs, markup }
}

// ---------------------------------------------------------------------------------------------------------------------
// The willow: two boughs come in at the top right, and their strands hang, each one swaying from where it leaves the bough.

function willow(stock: Stock): { boughs: string; farStrands: string; nearStrands: string } {
  const boughA = spline([pt(1634, 84), pt(1580, 78), pt(1528, 86), pt(1476, 94), pt(1428, 116), pt(1390, 136), pt(1364, 162)], 8)
  const boughB = spline([pt(1636, 22), pt(1590, 40), pt(1548, 44), pt(1512, 62), pt(1484, 78)], 8)
  const p = stock.paint
  const boughA2 = taper(boughA, along => 5.4 - 4.4 * Math.pow(along, 0.8))
  const boughB2 = taper(boughB, along => 3.6 - 2.8 * along)
  const boughs = p
    ? fillWith(boughA2, p.bough, p.boughAlpha) + fillWith(boughB2, p.bough, p.boughAlpha * 0.82)
    : inked(boughA2, stock, 0.8) + inked(boughB2, stock, 0.66)
  const pick = (bough: Point[], along: number): Point => bough[Math.round(along * (bough.length - 1))] ?? pt(0, 0)
  interface Strand {
    start: Point
    length: number
    near: boolean
  }
  const strands: Strand[] = []
  const onA: Array<[number, number]> = [[0.12, 176], [0.26, 304], [0.38, 232], [0.5, 336], [0.6, 208], [0.72, 286], [0.85, 196], [1, 158]]
  onA.forEach(([along, length], index) => strands.push({ start: pick(boughA, along), length, near: index % 2 === 1 }))
  const onB: Array<[number, number]> = [[0.3, 150], [0.6, 236], [0.82, 188], [1, 262]]
  onB.forEach(([along, length], index) => strands.push({ start: pick(boughB, along), length, near: index % 2 === 0 }))
  let farStrands = ''
  let nearStrands = ''
  strands.forEach((strand, index) => {
    const seed = 300 + index * 7
    const lean = -0.02 - 0.07 * hashUnit(seed, 1)
    const wave = 3 + 5 * hashUnit(seed, 3)
    const phase = hashUnit(seed, 5) * 6.28
    const reachOut = 8 + 12 * hashUnit(seed, 17)
    // A strand leaves the bough along it, toward the tip, and only then gives in and hangs.
    const along = (s: number): Point =>
      pt(
        strand.start.x - reachOut * (1 - Math.pow(1 - s, 6)) + strand.length * lean * Math.pow(s, 1.4) + wave * Math.sin(s * 3.6 + phase) * s,
        strand.start.y + strand.length * Math.pow(s, 1.16),
      )
    const stem: Point[] = []
    for (let part = 0; part <= 10; part += 1) stem.push(along(Math.pow(part / 10, 1.3)))
    // Leaves: slender, pointed at both ends, hanging close along the strand (never more than about fifteen degrees out
    // from it), at uneven steps and on either side as they come. Each is a small filled lens drawn from its stalk end.
    let leaves = ''
    let s = 20 / strand.length
    let count = 0
    let pen = pt(0, 0)
    while (s < 0.985) {
      const here = along(s)
      const next = along(Math.min(1, s + 0.02))
      const heading = Math.atan2(next.y - here.y, next.x - here.x)
      const side = hashUnit(count, seed + 19) > 0.5 ? 1 : -1
      const angle = heading + side * (0.12 + 0.15 * hashUnit(count, seed + 7))
      const reach = (7.5 + 5 * hashUnit(count, seed + 9)) * (1 - 0.3 * s)
      const dx = round(Math.cos(angle) * reach)
      const dy = round(Math.sin(angle) * reach)
      // A slender four-sided leaf, widest two fifths of the way out (about a fifth of its length across): at this
      // size it reads as a lens, and straight edges cost the renderer less than curves on strands that move.
      const half = reach * (p ? 0.15 : 0.1)
      const nx = -Math.sin(angle) * half
      const ny = Math.cos(angle) * half
      const wx = round(0.4 * dx + nx)
      const wy = round(0.4 * dy + ny)
      const vx = round(0.4 * dx - nx)
      const vy = round(0.4 * dy - ny)
      leaves += count === 0 ? `M${at(here)}` : `m${round(here.x - pen.x)} ${round(here.y - pen.y)}`
      leaves += `l${wx} ${wy}l${round(dx - wx)} ${round(dy - wy)}l${round(vx - dx)} ${round(vy - dy)}z`
      // After z the pen is back at the leaf's stalk end; keep it where the rounded numbers have really put it.
      pen = count === 0 ? pt(round(here.x), round(here.y)) : pt(pen.x + round(here.x - pen.x), pen.y + round(here.y - pen.y))
      s += (5.5 + 9 * hashUnit(count, seed + 11)) / strand.length
      count += 1
    }
    const strength = strand.near ? 0.7 : 0.4
    const swing = round(0.7 + 0.8 * hashUnit(seed, 13))
    // One breeze crosses the tree from the right, so the strands answer one after another.
    const delay = round(((1636 - strand.start.x) / 290) * 5 + hashUnit(seed, 15) * 1.6)
    const green = p ? (strand.near ? p.willowNear : p.willowFar) : stock.ink
    const cover = p ? (strand.near ? 1 : 0.8) * p.willowAlpha : strength * stock.line
    const markup =
      `<g class="sway" style="transform-origin:${round(strand.start.x)}px ${round(strand.start.y)}px;--a:${swing}deg;animation-delay:-${delay}s">` +
      (p ? strokeWith(smoothPath(stem), p.bough, 0.7, cover * 0.8) : drawn(smoothPath(stem), stock, 0.7, strength)) +
      `<path d="${leaves}" fill="${green}" fill-opacity="${share(cover)}"/>` +
      '</g>'
    if (strand.near) nearStrands += markup
    else farStrands += markup
  })
  return { boughs, farStrands, nearStrands }
}

/** A small seal: a vermilion square with a sign left bare: a flying eave over a wave, and the moon. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M4.6 14.4q3 -0.2 3.8 -3.6q3.6 1.6 7.2 0q0.8 3.4 3.8 3.6M5.2 19.4q3.4 -3 6.8 0t6.8 0" stroke="${bare}" stroke-width="1.6"/>` +
    `<circle cx="17.2" cy="6" r="2" fill="${bare}"/></g>`
  )
}

// ---------------------------------------------------------------------------------------------------------------------
// The left band: Moon Gate's wall, gate, peak, bamboo and banana, in a namespace of their own (their paints and helpers differ
// from the Pavilion's). The things beyond the gate and the banana keep Moon Gate's own units, where the gate stood at x 1446 with
// its sill on the ground at 832 and the banana's main stem at x 334; each is carried onto this sheet by one fixed transform. The
// wall, the gate's rim and the bamboo (which sways about points given in px) are drawn in this sheet's units.

namespace G {
const WIDTH = 1600
const HEIGHT = 1000
/** The ground in Moon Gate's units: the sill of the gate, the foot of the peak's bed and of the banana. */
const GROUND = 832
/** The ground the wall stands on, in this sheet's units. */
const FLOOR = 862
/** The gate on this sheet: its centre, and its size as a share of Moon Gate's (where it was 114 in radius). */
const GX = 262
const K = 0.79
/** The transform that carries the things beyond the gate from Moon Gate's units onto the sheet. */
const BEYOND = `matrix(${K} 0 0 ${K} ${Math.round((GX - 1446 * K) * 100) / 100} ${Math.round((FLOOR - GROUND * K) * 100) / 100})`
/** The banana: its size, and where its main stem stands on the sheet. */
const KB = 0.72
const BX = 392
const PLANT = `matrix(${KB} 0 0 ${KB} ${Math.round((BX - 334 * KB) * 100) / 100} ${Math.round((FLOOR + 0.6 - GROUND * KB) * 100) / 100})`

/** One soft glow of colour in the sky: whole at its centre, gone at its radius. */
interface Glow {
  x: number
  y: number
  r: number
  colour: string
  alpha: number
}

/** The ground the mountains stand against: a vertical run of colours with glows laid over it. It takes the place of
 * flat paper, and its colours follow the wallpaper of the person's Token Counter app (orange, wine, violet), mirrored
 * so that the orange corner lies behind the disc on the right. */
interface Sky {
  /** Offsets 0..1 down the sheet, with their colours. */
  base: Array<[number, string]>
  glows: Glow[]
}

/** A wash: a colour and how much of it is laid on. */
interface Paint {
  colour: string
  alpha: number
}

export interface Stock {
  sky: Sky
  /** A dark sheet: pale ink on a dark ground, so the light on the rock is laid the other way round. */
  dark: boolean
  ink: string
  disc: string
  seal: string
  /** How much ink a wash takes, relative to the day sheet. */
  wash: number
  /** The same for pen lines. */
  line: number
  /** Strength of the glow round the disc; 0 leaves it out. */
  halo: number
  /** The lime plaster of the wall, laid over the sky. */
  plaster: Paint
  /** The coping: the tiled slope, the channels between its rows of cover tiles, the tile ends along the eave, the ridge.
   * The slope's colour is also the sheet's shadow colour (under the eave, under a wall's foot, in the hollows of the rock): ink by day, near black by night. */
  tile: Paint
  row: Paint
  eave: Paint
  ridge: Paint
  /** The light caught by the tiles set on edge along the ridge. */
  glint: Paint
  /** How dark the old rain streaks under the eaves are, in the slope's colour. */
  stain: number
  /** How strongly the edges of the cover rows are drawn on the tiled slope. Faint at night, where pale lines on the dark tiles would read as a railing. */
  rib: number
  /** The polished grey brick round the gate. */
  brick: Paint
  // The fields below belong to the photograph stocks (晴日写真 by day, 灯影夜游 by night); left out, a stock is painted as before.
  /** The shade on plaster (under the eave, the rain streaks, the plinth, the wash under a wall's foot): a cool blue-grey by day. Unset, the tile colour. */
  shade?: string
  /** How much deeper the shade under the eave is laid than on the ink stocks. */
  eaveShade?: number
  /** The plinth's cover of the shade colour. Unset, 0.85 of `stain`. */
  plinth?: number
  /** On a coping laid solid: the light on the cover rows of the slope (the channels between them stay dark), in the glint's colour. */
  coverLight?: number
  /** The disc's own cover, and the glow round it: its colour and radius. */
  discAlpha?: number
  haloColour?: string
  haloR?: number
  /** How far the colour of a bank of mist is taken from the sky towards the plaster: mist is a little lighter than the air it hangs in. */
  mistLift?: number
  /** How far the companion stone's ground is taken from the sky towards the plaster. Unset, half the plaster's alpha. */
  stoneLift?: number
  /** How much of its cover a bank of mist keeps (1 by default). By night a bank takes the ground's own colour, so on the lit plaster it
   * would only be a dark smear: there it is 0. */
  wallMist?: number
  /** The white haze over the far ground beyond the gate, as a cover of the plaster colour. Unset, the plaster's own alpha. */
  haze?: number
  /** The bamboo's own paint: the leaves and the culms. `bambooRamp` instead runs one paint down the sheet (by night: the crowns over
   * the coping catch the lamplight against the sky, the culms seen in the lit gate stand dark against it). `bambooInk` takes the place of `line`. */
  bamboo?: { leaf: string; cane: string }
  bambooRamp?: { from: number; to: number; stops: ReadonlyArray<readonly [number, string]> }
  bambooInk?: number
  /** The line down a wall's free end. Unset, the ink; by night it is dark, as Lattice Windows has it, so the lit plaster is not outlined in pale ink. */
  edgeInk?: string
  /** The mondo grass. Unset, the ink. */
  tuft?: string
  /** The banana's own paints: the blade (front leaves), the paler back leaves, the second wash on a leaf's narrow half, the midrib and veins,
   * the outline and how strong it is, the pseudostem, its blotches and dry shreds, the rolled heart, and the dead leaf and its line. */
  banana?: {
    blade: string
    back: string
    shade: string
    shadeAlpha: number
    rib: string
    ribAlpha: number
    line: string
    lineAlpha: number
    stem: string
    blotch: string
    shred: string
    heart: string
    dead: string
    deadLine: string
    /** By night, the blades run down the sheet from `from` to `to` (as the bamboo's paint does): lit mauve where they rise into the sky over
     * the coping, dark wine where they stand in front of the plaster. One run for the front leaves and one, darker, for the back ones. */
    ramp?: { from: number; to: number; front: readonly [string, string]; back: readonly [string, string] }
  }
  /** The lit courtyard beyond the gate (夜游): the light that fills the opening, from its middle low behind the rock (0) to its rim (1);
   * the warm light it throws on the plaster and brick round the gate and on the ground in front; and how the things beyond the gate are
   * painted against it: their ground (in silhouette) and their line (caught by the light behind them). */
  lamp?: {
    stops: ReadonlyArray<readonly [number, string]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    soffit: number
    pool: number
    ground: string
    line: string
    /** The wash on a backlit stone, from its upper left (dimly lit by the garden) to its lower right. */
    washStops: ReadonlyArray<readonly [number, number]>
  }
}


interface Point {
  x: number
  y: number
}

interface Built {
  defs: string
  markup: string
}

/** A repeatable number in 0..1 from two integers, so every build draws the same sheet. */
function hashUnit(index: number, salt: number): number {
  let value = (Math.imul(index, 374761393) + Math.imul(salt, 668265263)) | 0
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

/** Smooth noise in 0..1 along a line: hashed values at whole numbers, eased between. */
function noise(at: number, salt: number): number {
  const cell = Math.floor(at)
  const part = at - cell
  const ease = part * part * (3 - 2 * part)
  return hashUnit(cell, salt) * (1 - ease) + hashUnit(cell + 1, salt) * ease
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function channels(hex: string): number[] {
  return [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))
}

/** How a glow falls off: its share of full strength at each share of its radius. The gradient's stops and `skyAt` both read it. */
const FALLOFF: Array<[number, number]> = [[0, 1], [0.35, 0.72], [0.7, 0.24], [1, 0]]

function falloffAt(share: number): number {
  for (let index = 1; index < FALLOFF.length; index += 1) {
    const from = FALLOFF[index - 1]
    const to = FALLOFF[index]
    if (from && to && share <= to[0]) return from[1] + ((to[1] - from[1]) * (share - from[0])) / (to[0] - from[0])
  }
  return 0
}

/** The sky's own gradients: one down the sheet, one per glow, all in the sheet's units so that any shape painted with them matches the sky behind it. */
function skyDefs(sky: Sky): string {
  const base =
    `<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HEIGHT}">` +
    sky.base.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</linearGradient>'
  const glows = sky.glows
    .map(
      (glow, index) =>
        `<radialGradient id="glow${index}" gradientUnits="userSpaceOnUse" cx="${glow.x}" cy="${glow.y}" r="${glow.r}">` +
        FALLOFF.map(([offset, share]) => `<stop offset="${offset}" stop-color="${glow.colour}" stop-opacity="${round(glow.alpha * share * 100) / 100}"/>`).join('') +
        '</radialGradient>',
    )
    .join('')
  return base + glows
}

/** A path painted with the sky, layer by layer: an opaque piece of sky in the path's shape. A ridge stands on one, so it hides what is behind it and still fades into the same sky. */
function skyPainted(d: string, sky: Sky): string {
  return `<path d="${d}" style="fill:url(#sky)"/>` + sky.glows.map((_, index) => `<path d="${d}" style="fill:url(#glow${index})"/>`).join('')
}

/** The same, for a shape written once in the defs under `id`: each layer of sky is a <use> of it, so the long path is not written out again per layer. */
function skyPaintedUse(id: string, sky: Sky): string {
  return `<use href="#${id}" style="fill:url(#sky)"/>` + sky.glows.map((_, index) => `<use href="#${id}" style="fill:url(#glow${index})"/>`).join('')
}

/** The sky's colour at a point, worked out as the gradients paint it. */
function skyAt(sky: Sky, x: number, y: number): string {
  const share = Math.min(1, Math.max(0, y / HEIGHT))
  let colour = channels(sky.base[0]?.[1] ?? '#000000')
  for (let index = 1; index < sky.base.length; index += 1) {
    const from = sky.base[index - 1]
    const to = sky.base[index]
    if (!from || !to) continue
    if (share >= from[0] && share <= to[0]) {
      const part = (share - from[0]) / (to[0] - from[0])
      const a = channels(from[1])
      const b = channels(to[1])
      colour = a.map((value, at) => value + ((b[at] ?? 0) - value) * part)
    }
  }
  for (const glow of sky.glows) {
    const distance = Math.hypot(x - glow.x, y - glow.y) / glow.r
    if (distance >= 1) continue
    const alpha = glow.alpha * falloffAt(distance)
    const over = channels(glow.colour)
    colour = colour.map((value, at) => value + ((over[at] ?? 0) - value) * alpha)
  }
  return '#' + colour.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')
}

/** Numbers written as tightly as a path allows: one decimal, no leading zero, no space before a minus sign. */
function pack(values: number[]): string {
  let out = ''
  for (const value of values) {
    let text = String(round(value))
    if (text.startsWith('0.')) text = text.slice(1)
    else if (text.startsWith('-0.')) text = '-' + text.slice(2)
    out += (out && !text.startsWith('-') ? ' ' : '') + text
  }
  return out
}

function at(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

function midway(first: Point, second: Point): string {
  return `${round((first.x + second.x) / 2)} ${round((first.y + second.y) / 2)}`
}

/** A smooth open path through the midpoints of the points. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  const second = points[1]
  const third = points[2]
  const last = points[points.length - 1]
  if (!first || !second || !last) return ''
  if (points.length < 4 || !third) return 'M' + points.map(at).join('L')
  let path = `M${at(first)}Q${at(second)} ${midway(second, third)}`
  for (let index = 2; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (here && next) path += `T${midway(here, next)}`
  }
  return `${path}T${at(last)}`
}

/** The same for a closed ring. A point given twice in a row makes a corner there. */
function smoothRing(points: Point[]): string {
  const count = points.length
  const closing = points[count - 1]
  let path = ''
  for (let index = 0; index < count; index += 1) {
    const here = points[index]
    const next = points[(index + 1) % count]
    if (!here || !next || !closing) continue
    if (index === 0) path = `M${midway(closing, here)}Q${at(here)} ${midway(here, next)}`
    else path += `T${midway(here, next)}`
  }
  return `${path}Z`
}

function alpha(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100
}

// ---------------------------------------------------------------------------------------------------------------
// The walls

/** A stretch of wall seen square on, as a photograph of a Suzhou garden has it (and as Lattice Windows paints it): its free end stands clean on
 * the sheet, the coping oversailing it and its ridge turning up in a short hook (起翘); only the wall's lower corner at that end goes into the
 * mist, along a slant from `mist[0]` on the end down to `mist[1]` on the foot (bare on the side away from the wall, whole on the other). */
interface Wall {
  name: string
  from: number
  to: number
  /** The level of the eave: the lower edge of the tiles. */
  eave: number
  scale: number
  /** Which end stands free on the sheet. */
  free: 'left' | 'right'
  mist: [Point, Point]
}

/** The gate wall: a tall narrow stretch running in from under the sidebar and ending clean at x 420, short of the reading column. */
const WALL: Wall = { name: 'r', from: -6, to: 420, eave: 534, scale: 0.86, free: 'right', mist: [{ x: 420, y: 808 }, { x: 374, y: FLOOR }] }

/** The gate: a full circle whose foot is cut by the sill. `drop` is how far its centre stands above the ground. In Moon Gate's units
 * (for what lies beyond it), and the same gate on this sheet. */
const GATE = { x: 1446, drop: 96, r: 114, trim: 12 }
const SG = { x: GX, drop: 96 * K, r: 114 * K, trim: 12 * K }
/** Where the peak's foot stands beyond the gate, in Moon Gate's units: a little right of the gate's middle (on Moon Gate it stood left of it),
 * so that the whole peak shows clear of the sidebar and its curling head leans toward the banana's side. Its bed moves with it. */
const PEAK_AT = 1437
const BED_SHIFT = PEAK_AT - 1392

/** A point beyond the gate, from Moon Gate's units to the sheet's. */
function beyondAt(x: number, y: number): Point {
  return { x: GX + (x - GATE.x) * K, y: FLOOR + (y - GROUND) * K }
}

/** How the lower corner goes into the mist across the slant: slowly at first, slowly at last, so that no edge shows. */
const DISSOLVE: Array<[number, number]> = [[0, 0], [0.3, 0.12], [0.66, 0.76], [1, 1]]

/** Paints that fade out across the slant of a wall's lower corner, one per colour: every wash and line of the wall is laid with them, so the
 * corner goes into the mist all together while the rest of the wall, and its free end above the slant, stay whole. `width` is how wide the
 * fade lies across the slant (narrower by night, as in Lattice Windows). */
function fadeMaker(wall: Wall, width: number): { paint: (colour: string) => string; defs: () => string } {
  const colours: string[] = []
  const defs: string[] = []
  // Across the slant, from the bare side to the whole side: for a wall free on the left the bare side is below and to the left of the line.
  const [top, foot] = wall.mist
  const along = Math.hypot(foot.x - top.x, foot.y - top.y) || 1
  const side = wall.free === 'left' ? 1 : -1
  const nx = (side * (foot.y - top.y)) / along
  const ny = (-side * (foot.x - top.x)) / along
  const across = `x1="${round(top.x - (nx * width) / 2)}" y1="${round(top.y - (ny * width) / 2)}" x2="${round(top.x + (nx * width) / 2)}" y2="${round(top.y + (ny * width) / 2)}"`
  return {
    paint(colour) {
      let index = colours.indexOf(colour)
      if (index < 0) {
        index = colours.length
        colours.push(colour)
        defs.push(
          `<linearGradient id="${wall.name}${index}" gradientUnits="userSpaceOnUse" ${across}>` +
            DISSOLVE.map(([offset, share]) => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${share}"/>`).join('') +
            '</linearGradient>',
        )
      }
      return `url(#${wall.name}${index})`
    },
    defs: () => defs.join(''),
  }
}

/** The coping's parts, in the sheet's units on the near wall: the ridge, the tiled slope under it, and the spacing of the rows of cover tiles.
 * The gate (about 2.3 m across) sets the scale at about 100 units to the metre: a coping some 35 cm high, its cover rows 19 cm apart. */
const COPING = { ridge: 11, slope: 21, pitch: 19 }

/** The top of a wall's ridge. */
function copingTop(wall: Wall): number {
  return wall.eave - (COPING.ridge + COPING.slope) * wall.scale
}

/** The coping, top to bottom, as a Suzhou wall has it: a ridge of small tiles stood on edge and leaning all one way, under a fine capping line;
 * the tiled slope seen square on, the rows of cover tiles running down it as ribs with the dark channels of the pan tiles between them,
 * every cover tile lapping the one below; along the eave, under each channel, the pointed lip of a drip tile (滴水), and between them the small
 * rounded lip that closes each cover row (花边). Below, the shadow the eave throws and the two fine lines of a brick cornice.
 * Channels, rib edges and laps are dashes on straight lines, so the slope is a handful of paths; the lips are one path. */
function coping(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const s = wall.scale
  const pitch = COPING.pitch * s
  const eaveY = wall.eave
  const foot = eaveY - COPING.slope * s
  const top = copingTop(wall)
  const channel = 0.42 * pitch
  // The coping oversails the wall's free end a little; the plaster's own bands (the eave's shadow, the cornice) stop at the end.
  const over = Math.round(COPING.slope * s * 0.22)
  const left = wall.free === 'left' ? wall.from - over : wall.from
  const right = wall.free === 'right' ? wall.to + over : wall.to
  const across = (y: number, from: number): string => `M${round(from)} ${round(y)}L${round(right)} ${round(y)}`
  const band = (upper: number, lower: number): string => `M${round(left)} ${round(upper)}L${round(right)} ${round(upper)}L${round(right)} ${round(lower)}L${round(left)} ${round(lower)}Z`
  const onPlaster = (upper: number, lower: number): string => `M${wall.from} ${round(upper)}L${wall.to} ${round(upper)}L${wall.to} ${round(lower)}L${wall.from} ${round(lower)}Z`
  const plasterAcross = (y: number): string => `M${wall.from} ${round(y)}L${wall.to} ${round(y)}`
  const ink = paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  // The ridge's free end turns up in a short hook over the end of the tiles (起翘), the way Suzhou wall ridges end.
  const ridgeFoot = foot - 1.4 * s
  const ridgeHigh = ridgeFoot - top
  const tipLength = 27 * s
  const tipUp = 9 * s
  const tipOut = 3.2 * s
  const end = wall.free === 'left' ? left : right
  const toward = wall.free === 'left' ? 1 : -1
  const tip = { x: end - toward * tipOut, y: top - tipUp }
  const ridgeShape =
    wall.free === 'left'
      ? `M${round(tip.x)} ${round(tip.y)}Q${round(end + tipLength * 0.22)} ${round(top)} ${round(end + tipLength)} ${round(top)}H${round(right)}V${round(ridgeFoot)}H${round(end + 2)}Q${round(end + tipOut * 0.4)} ${round(ridgeFoot - ridgeHigh * 0.5)} ${round(tip.x)} ${round(tip.y)}Z`
      : `M${round(left)} ${round(top)}H${round(end - tipLength)}Q${round(end - tipLength * 0.22)} ${round(top)} ${round(tip.x)} ${round(tip.y)}Q${round(end - tipOut * 0.4)} ${round(ridgeFoot - ridgeHigh * 0.5)} ${round(end - 2)} ${round(ridgeFoot)}H${round(left)}Z`
  // The capping line along the ridge, one stroke from the hook's tip along the whole ridge.
  const hookLine =
    `M${round(tip.x)} ${round(tip.y)}Q${round(end + toward * tipLength * 0.22)} ${round(top + 0.5 * s)} ${round(end + toward * tipLength)} ${round(top + 0.5 * s)}` +
    `H${round(wall.free === 'left' ? right : left)}`
  // The shadow the coping throws on the plaster: a few thin bands, each fainter than the one above.
  let shadow = ''
  const deeper = stock.eaveShade ?? 1
  ;[0.09, 0.065, 0.04, 0.02].forEach((share, index) => {
    shadow += `<path d="${onPlaster(eaveY + index * 7 * s, eaveY + (index + 1) * 7 * s)}" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${alpha(share * deeper)}"/>`
  })
  // On a solid slope the cover rows catch a little light and the channels between them stay dark.
  const covers = stock.coverLight
    ? `<path d="${across((foot + eaveY) / 2, left + channel)}" stroke="${paint(stock.glint.colour)}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${alpha(stock.coverLight)}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel)} ${round(channel)}"/>`
    : ''
  const ribInk = stock.coverLight ? paint(stock.glint.colour) : ink
  // The ridge's tiles on edge: one dashed line as tall as a tile, sheared about its own middle so that every dash leans to the right.
  const tickY = round(top + 6.4 * s)
  // The lips along the eave: a pointed drip tile under each channel, a small round lip under each cover row; none past a free end.
  let lips = ''
  const lipsTo = wall.free === 'right' ? right - pitch * 0.5 : wall.to + pitch
  for (let x = left + channel / 2; x < lipsTo; x += pitch) {
    const half = 0.3 * pitch
    const hang = 0.5 * pitch
    lips += `M${pack([x - half, eaveY - 0.6 * s])}q${pack([0.62 * half, 0.36 * hang, half, hang, 0.38 * half, -0.64 * hang, half, -hang])}z`
    const cover = x + pitch / 2
    const lip = 0.21 * pitch
    lips += `M${pack([cover - lip, eaveY - 0.6 * s])}q${pack([0, 1.3 * lip, lip, 1.3 * lip, lip, 0, lip, -1.3 * lip])}z`
  }
  return (
    shadow +
    // the slope, and its channels darker
    `<path d="${band(foot, eaveY)}" fill="${paint(stock.tile.colour)}" fill-opacity="${stock.tile.alpha}"/>` +
    (stock.row.alpha > 0
      ? `<path d="${across((foot + eaveY) / 2, left)}" stroke="${paint(stock.row.colour)}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${stock.row.alpha}" stroke-linecap="butt" stroke-dasharray="${round(channel)} ${round(pitch - channel)}"/>`
      : covers) +
    // the edges of the cover rows, and the laps of their tiles
    `<path d="${across((foot + eaveY) / 2, left - 0.4)}" stroke="${ribInk}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${line(stock.rib)}" stroke-linecap="butt" stroke-dasharray="0.8 ${round(channel - 0.8)} 0.8 ${round(pitch - channel - 0.8)}"/>` +
    [7.5, 14.5]
      .map(
        lap =>
          `<path d="${across(foot + lap * s, left + channel + 1.2)}" stroke="${paint(stock.glint.colour)}" stroke-width="0.9" stroke-opacity="${alpha(stock.glint.alpha * (stock.coverLight ? 0.4 : 0.6))}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel - 2.4)} ${round(channel + 2.4)}"/>`,
      )
      .join('') +
    // the end of the slope over the free end
    `<path d="M${round(end)} ${round(foot)}V${round(eaveY)}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.8)}"/>` +
    // the ridge: its body with the hook at its free end, its tiles on edge, the capping line running up the hook, the course it stands on
    `<path d="${ridgeShape}" fill="${paint(stock.ridge.colour)}" fill-opacity="${stock.ridge.alpha}"/>` +
    `<path d="M${round(left + (wall.free === 'left' ? 4 : 1))} ${tickY}H${round(right - (wall.free === 'right' ? 4 : 0))}" transform="matrix(1 0 .46 1 ${round(-0.46 * tickY)} 0)" stroke="${paint(stock.glint.colour)}" stroke-width="${round(5.6 * s)}" stroke-opacity="${stock.glint.alpha}" stroke-linecap="butt" stroke-dasharray=".9 ${round(4.4 * s - 0.9)}"/>` +
    `<path d="${hookLine}" stroke="${ink}" stroke-width="${round(3.4 * s)}" stroke-opacity="${line(0.82)}" stroke-linecap="round"/>` +
    `<path d="${across(foot - 0.6 * s, left)}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.6)}"/>` +
    // the lips along the eave
    `<path d="${lips}" fill="${paint(stock.eave.colour)}" fill-opacity="${stock.eave.alpha}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.55)}"/>` +
    // the cornice under the eave, on the plaster only
    `<path d="${plasterAcross(eaveY + 13 * s)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.42)}"/>` +
    `<path d="${plasterAcross(eaveY + 17 * s)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.26)}"/>`
  )
}

/** Old rain streaks on the plaster: where water ran off the eave for years it left soft grey runs, darkest just under the eave and dying away down the wall.
 * Each is [x, breadth, length]: a soft smudge, fading to nothing at its sides and its foot, two or three of them laid over one another where the run was heavy. */
function stains(wall: Wall, runs: Array<[number, number, number]>, stock: Stock): Built {
  const id = `st${wall.name}`
  const top = wall.eave + 2
  let markup = ''
  runs.forEach(([x, breadth, length], index) => {
    // A smudge is the upper half of a soft ellipse: its box reaches as far again below the run's foot.
    markup += `<rect x="${round(x - breadth / 2)}" y="${round(top)}" width="${round(breadth)}" height="${round(length * 2)}" fill="url(#${id})"/>`
    if (length > 50) {
      const shift = (hashUnit(index, 83) - 0.5) * breadth * 0.7
      markup += `<rect x="${round(x + shift - breadth * 0.22)}" y="${round(top)}" width="${round(breadth * 0.44)}" height="${round(length * 2.5)}" fill="url(#${id})"/>`
    }
  })
  const defs =
    `<radialGradient id="${id}" cx="0.5" cy="0" r="0.5">` +
    `<stop offset="0" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="${alpha(stock.stain)}"/><stop offset="0.45" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="${alpha(stock.stain * 0.55)}"/>` +
    `<stop offset="1" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="0"/></radialGradient>`
  return { defs, markup }
}

/** A tuft of mondo grass (沿阶草): five blades out of one root, mostly upright, the clump leaning a little to one side. */
function tuft(x: number, y: number, size: number, salt: number): string {
  let d = ''
  const blades = 5
  const skew = (hashUnit(0, salt + 2) - 0.5) * 0.6
  for (let blade = 0; blade < blades; blade += 1) {
    const lean = ((blade / (blades - 1)) * 2 - 1) * 0.8 + skew
    const height = size * (0.66 + 0.34 * (1 - Math.abs(lean))) * (0.72 + 0.5 * hashUnit(blade, salt))
    const reach = lean * size * (0.42 + 0.3 * hashUnit(blade, salt + 1))
    d += `M${round(x + lean * 1.2)} ${round(y)}q${round(reach * 0.25)} ${round(-height)} ${round(reach)} ${round(-height * 0.84)}`
  }
  return d
}

/** A thin wash on the ground under a wall's foot, fading downward in two bands. */
function groundWash(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const band = (upper: number, lower: number, share: number): string =>
    `<path d="M${wall.from} ${upper}L${wall.to} ${upper}L${wall.to} ${lower}L${wall.from} ${lower}Z" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${share}"/>`
  return band(FLOOR, FLOOR + 6, 0.07) + band(FLOOR + 6, FLOOR + 15, 0.032)
}

/** The plinth (勒脚) along a wall's foot: a band of grey rendering, a little darker than the plaster, under a fine line where the plaster stops.
 * `gap` is the stretch the gate cuts out of it, and `hole` the gate's opening as a subpath, so the band stops at the gate. */
function plinth(wall: Wall, paint: (colour: string) => string, stock: Stock, gap?: [number, number], hole = ''): string {
  const top = FLOOR - 30 * wall.scale
  const ink = paint(stock.ink)
  const edge = gap
    ? `M${wall.from} ${round(top)}L${round(gap[0])} ${round(top)}M${round(gap[1])} ${round(top)}L${wall.to} ${round(top)}`
    : `M${wall.from} ${round(top)}L${wall.to} ${round(top)}`
  return (
    `<path fill-rule="evenodd" d="M${wall.from} ${round(top)}L${wall.to} ${round(top)}L${wall.to} ${FLOOR}L${wall.from} ${FLOOR}Z${hole}" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${alpha(stock.plinth ?? stock.stain * 0.85)}"/>` +
    `<path d="${edge}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${alpha(0.3 * stock.line)}"/>`
  )
}

/** The gate wall with the gate in it, in the sheet's units. It is painted over the bamboo and the peak, so they show only through the
 * gate and over the coping. Its free end is on the right, short of the reading column; only the lower corner there goes into the mist. */
function gateWall(stock: Stock): Built {
  const wall = WALL
  const fade = fadeMaker(wall, stock.dark ? 40 : 52)
  const ink = fade.paint(stock.ink)
  const rim = SG.r + SG.trim
  const inner = Math.sqrt(SG.r * SG.r - SG.drop * SG.drop)
  const arc = (radius: number): string => {
    const half = Math.sqrt(radius * radius - SG.drop * SG.drop)
    return `M${round(SG.x - half)} ${FLOOR}A${round(radius)} ${round(radius)} 0 1 1 ${round(SG.x + half)} ${FLOOR}`
  }
  // The opening runs the other way round, so it is a hole under either fill rule.
  const hole = `M${round(SG.x + inner)} ${FLOOR}A${round(SG.r)} ${round(SG.r)} 0 1 0 ${round(SG.x - inner)} ${FLOOR}Z`
  const frame = (from: number, to: number, y: number): string => `M${from} ${round(y)}L${to} ${round(y)}L${to} ${FLOOR}L${from} ${FLOOR}Z${hole}`
  const line = (share: number): number => alpha(share * stock.line)
  const streaks = stains(wall, [[44, 20, 78], [168, 14, 46], [300, 24, 96], [398, 12, 40]], stock)
  // The plinth stops at the gate's trim: only the slice of the trim's circle that falls within the plinth's height is cut out of it.
  const plinthTop = FLOOR - 30 * wall.scale
  const plinthReach = Math.sqrt(rim * rim - (plinthTop - (FLOOR - SG.drop)) ** 2)
  const footReach = Math.sqrt(rim * rim - SG.drop * SG.drop)
  const plinthCut =
    `M${round(SG.x - plinthReach)} ${round(plinthTop)}A${round(rim)} ${round(rim)} 0 0 0 ${round(SG.x - footReach)} ${FLOOR}` +
    `L${round(SG.x + footReach)} ${FLOOR}A${round(rim)} ${round(rim)} 0 0 0 ${round(SG.x + plinthReach)} ${round(plinthTop)}Z`

  let markup =
    // the plaster, opaque; nothing stands behind the corner that goes into the mist, so it needs no piece of sky under it
    `<path fill-rule="evenodd" d="${frame(wall.from, wall.to, wall.eave - 3)}" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/>` +
    streaks.markup +
    plinth(wall, fade.paint, stock, [SG.x - plinthReach, SG.x + plinthReach], plinthCut) +
    // the line down the wall's free end, which goes into the mist with the lower corner
    `<path d="M${wall.to - 0.5} ${wall.eave}V${FLOOR}" stroke="${fade.paint(stock.edgeInk ?? stock.ink)}" stroke-width="1" stroke-opacity="${line(0.8)}"/>` +
    coping(wall, fade.paint, stock)

  // The trim of polished brick: a band round the opening, a fine moulding line inside it, its joints as short radial ticks.
  const band = `${arc(rim)}L${round(SG.x + inner)} ${FLOOR}A${round(SG.r)} ${round(SG.r)} 0 1 0 ${round(SG.x - inner)} ${FLOOR}Z`
  const jointRadius = SG.r + SG.trim / 2 + 1.3
  // The underside of the wall's thickness at the top of the opening: seen from below, a crescent of shadow inside the rim, thickest at the crown.
  const centreY = FLOOR - SG.drop
  const soffit = 4.2
  const meet = Math.sqrt(SG.r * SG.r - (soffit / 2) * (soffit / 2))
  const farEdge = `A${round(SG.r)} ${round(SG.r)} 0 0 0 ${round(SG.x - meet)} ${round(centreY + soffit / 2)}`
  // By night the light beyond the gate warms the brick and the plaster round it (laid over the brick, under the trim's lines), and lights
  // the underside of the arch, which faces down toward the lamps; by day that underside is in shade.
  const lamp = stock.lamp
  const soffitPaint = lamp ? `fill="${lamp.stops[1]?.[1] ?? stock.ink}" fill-opacity="${lamp.soffit}"` : `fill="${stock.shade ?? stock.tile.colour}" fill-opacity="0.3"`
  markup +=
    `<path d="${band}" fill="${stock.brick.colour}" fill-opacity="${stock.brick.alpha}"/>` +
    (lamp ? `<path fill-rule="evenodd" d="${frame(SG.x - 160, Math.min(wall.to, SG.x + 160), FLOOR - 250)}" fill="url(#spill)"/>` : '') +
    `<path d="M${round(SG.x - meet)} ${round(centreY + soffit / 2)}A${round(SG.r)} ${round(SG.r)} 0 1 1 ${round(SG.x + meet)} ${round(centreY + soffit / 2)}${farEdge}Z" ${soffitPaint}/>` +
    `<path d="M${round(SG.x + meet)} ${round(centreY + soffit / 2)}${farEdge}" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${line(0.32)}"/>` +
    `<path d="${arc(jointRadius)}" stroke="${stock.ink}" stroke-width="${round(SG.trim - 3.6)}" stroke-opacity="${line(0.34)}" stroke-linecap="butt" stroke-dasharray="0.7 ${round((jointRadius * Math.PI * 2) / 36 - 0.7)}" stroke-dashoffset="-5"/>` +
    `<path d="${arc(SG.r + 2.8)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${arc(rim)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.72)}"/>` +
    `<path d="${arc(SG.r)}" stroke="${stock.ink}" stroke-width="1.4" stroke-opacity="${line(0.92)}"/>`

  // The ground the wall stands on (a thin wash under its foot), grass, a few dry strokes of the ground in front.
  markup +=
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${FLOOR}L${wall.to} ${FLOOR}" stroke="${ink}" stroke-width="1.2" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${tuft(SG.x - 92, FLOOR, 10, 5)}${tuft(SG.x - 85, FLOOR, 6, 6)}${tuft(96, FLOOR, 8, 9)}" stroke="${stock.tuft ?? ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
    `<path d="M30 ${FLOOR + 11}L92 ${FLOOR + 11}M210 ${FLOOR + 15}L262 ${FLOOR + 15}M330 ${FLOOR + 10}L386 ${FLOOR + 10}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.24)}"/>`

  return { defs: fade.defs() + streaks.defs, markup }
}

/** The round opening as one closed shape, cut by the sill: what the lamp beyond the gate fills. */
function gateOpening(): string {
  const inner = Math.sqrt(GATE.r * GATE.r - GATE.drop * GATE.drop)
  return `M${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
}

/** The light in the gate (whole in the opening, brightest low behind the rock), its spill on the plaster and brick round the gate, and the
 * pool of it on the ground in front. */
function lampDefs(stock: Stock): string {
  const lamp = stock.lamp
  if (!lamp) return ''
  // The lamp and the rim light it lays on the stones beyond the gate are in Moon Gate's units (they are used inside its group), the light
  // low behind the peak; the spill on the wall is in the sheet's.
  return (
    `<radialGradient id="lamp" gradientUnits="userSpaceOnUse" cx="${PEAK_AT + 22}" cy="806" r="196">` +
    lamp.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="spill" gradientUnits="userSpaceOnUse" cx="${SG.x}" cy="${round(FLOOR - SG.drop - 3)}" r="${round(190 * K)}">` +
    lamp.spillStops.map(([offset, part]) => `<stop offset="${offset}" stop-color="${lamp.spill}" stop-opacity="${alpha(part)}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="pool"><stop offset="0" stop-color="${lamp.spill}" stop-opacity="${alpha(lamp.pool)}"/><stop offset="0.5" stop-color="${lamp.spill}" stop-opacity="${alpha(lamp.pool * 0.42)}"/>` +
    `<stop offset="1" stop-color="${lamp.spill}" stop-opacity="0"/></radialGradient>` +
    // The rim light on what stands against the lamp: whole low behind the rock, gone by three quarters of the lamp's reach.
    `<radialGradient id="rim" gradientUnits="userSpaceOnUse" cx="${PEAK_AT + 22}" cy="806" r="196"><stop offset="0" stop-color="${lamp.line}"/><stop offset="0.4" stop-color="${lamp.line}" stop-opacity="0.85"/>` +
    `<stop offset="0.62" stop-color="${lamp.line}" stop-opacity="0.35"/><stop offset="0.76" stop-color="${lamp.line}" stop-opacity="0"/></radialGradient>`
  )
}


// ---------------------------------------------------------------------------------------------------------------
// The bamboo

/** One bamboo leaf from its stalk end: a long slim blade, broadest a third of the way along, drawn out to a fine tip that droops a little. */
function leaf(x: number, y: number, angle: number, length: number, half: number): string {
  const alongX = Math.cos(angle)
  const alongY = Math.sin(angle)
  const outX = -alongY * half
  const outY = alongX * half
  const droop = length * 0.1
  const tipX = alongX * length
  const tipY = alongY * length + droop
  const nearX = alongX * length * 0.2
  const nearY = alongY * length * 0.2
  const farX = alongX * length * 0.62
  const farY = alongY * length * 0.62 + droop * 0.35
  return (
    `M${pack([x, y])}c${pack([nearX + outX * 1.5, nearY + outY * 1.5, farX + outX * 1.15, farY + outY * 1.15, tipX, tipY])}` +
    `c${pack([farX - outX * 1.15 - tipX, farY - outY * 1.15 - tipY, nearX - outX * 1.5 - tipX, nearY - outY * 1.5 - tipY, -tipX, -tipY])}z`
  )
}

/** A group of leaves hanging from one point, `toward` in degrees (0 is right, 90 is down). The middle leaf is the longest: three of them make the 个 of the bamboo painters. */
function spray(from: Point, toward: number, count: number, length: number, salt: number): string {
  let d = ''
  for (let index = 0; index < count; index += 1) {
    const off = index - (count - 1) / 2
    const angle = ((toward + off * 21 + (hashUnit(index, salt) - 0.5) * 11) * Math.PI) / 180
    const reach = length * (1 - 0.2 * Math.abs(off)) * (0.86 + 0.28 * hashUnit(index, salt + 1))
    // A slim blade, some eight or nine times as long as it is broad.
    d += leaf(from.x, from.y, angle, reach, 0.85 + reach * 0.02)
  }
  return d
}

/** One culm. `lean` is how far its tip stands to the side of its root and `bend` a slow bow on the way up.
 * A tall culm's crown turns about a point at the level `pivot`, hidden behind the wall; with 0 the whole culm turns about its root.
 * Every node above the level `crown` carries a twig, and so do the nodes listed in `low`, each with its side. */
interface Culm {
  x: number
  y: number
  height: number
  lean: number
  bend: number
  girth: number
  joint: number
  reach: number
  blade: number
  tone: number
  salt: number
  pivot: number
  crown: number
  low: Array<[number, number]>
  /** The share of the crown's nodes left bare, so that sky shows between its sprays. */
  sparse: number
}

// In the sheet's units. Pale culms first: they stand further back. One stands left of the peak and two right of it, seen low through the
// gate, and one behind the peak; above the coping their crowns lean a little apart, the tallest and darkest one near the middle, so the
// crowns make no level hedge along the coping, and none of them reaches toward the reading column. Each crown turns about a point hidden
// behind the wall (y 640).
const CULMS: Culm[] = [
  { x: 206, y: 855, height: 492, lean: -36, bend: 10, girth: 1.45, joint: 1, reach: 28, blade: 23.4, tone: 0.55, salt: 11, pivot: 640, crown: 528, low: [[5, -1]], sparse: 0.36 },
  { x: 262, y: 856, height: 432, lean: 18, bend: 4, girth: 1.6, joint: 1, reach: 28, blade: 23.4, tone: 0.62, salt: 23, pivot: 640, crown: 528, low: [], sparse: 0.36 },
  { x: 322, y: 857, height: 452, lean: 22, bend: 9, girth: 1.65, joint: 1, reach: 29, blade: 24.2, tone: 0.84, salt: 53, pivot: 640, crown: 528, low: [[6, 1]], sparse: 0.3 },
  { x: 222, y: 856, height: 560, lean: -8, bend: -7, girth: 2, joint: 1, reach: 30, blade: 25.2, tone: 0.94, salt: 41, pivot: 640, crown: 520, low: [], sparse: 0.38 },
]

/** A point on the culm's axis. The tip bows over: it leans faster and climbs slower as it goes. */
function culmPoint(culm: Culm, share: number): Point {
  return {
    x: culm.x + culm.lean * Math.pow(share, 2.4) + culm.bend * Math.sin(Math.PI * share),
    y: culm.y - culm.height * (share - 0.05 * Math.pow(share, 4)),
  }
}

/** The unit normal of the culm's axis, pointing to its right. */
function culmNormal(culm: Culm, share: number): Point {
  const below = culmPoint(culm, Math.max(0, share - 0.01))
  const above = culmPoint(culm, Math.min(1, share + 0.01))
  const length = Math.hypot(above.x - below.x, above.y - below.y) || 1
  return { x: -(above.y - below.y) / length, y: (above.x - below.x) / length }
}

/** Where the culm's nodes sit, as shares of its height: short internodes at the root, long ones in the middle, shorter again toward the tip. */
function culmNodes(culm: Culm): number[] {
  const nodes = [0]
  let share = 0
  for (let index = 0; index < 60; index += 1) {
    const length = (12 + 20 * Math.min(1, index / 2.5)) * (1 - 0.5 * share * share) * (0.92 + 0.16 * hashUnit(index, culm.salt)) * culm.joint
    share += length / culm.height
    if (share > 0.975) break
    nodes.push(share)
  }
  nodes.push(1)
  return nodes
}

/** One internode: a slim waisted shape between two nodes, a hair's gap left at each. */
function internode(culm: Culm, from: number, to: number): string {
  const gap = 0.8 / culm.height
  const edge = (share: number, swell: number): [Point, Point] => {
    const point = culmPoint(culm, share)
    const normal = culmNormal(culm, share)
    const half = (culm.girth * (1 - 0.72 * share) + 0.4) * swell
    return [{ x: point.x - normal.x * half, y: point.y - normal.y * half }, { x: point.x + normal.x * half, y: point.y + normal.y * half }]
  }
  const [fromLeft, fromRight] = edge(from + gap, 1.2)
  const [waistLeft, waistRight] = edge((from + to) / 2, 0.72)
  const [toLeft, toRight] = edge(to - gap, 1.2)
  const from0 = { x: round(fromLeft.x), y: round(fromLeft.y) }
  const to0 = { x: round(toRight.x), y: round(toRight.y) }
  return (
    `M${pack([from0.x, from0.y])}q${pack([waistLeft.x - from0.x, waistLeft.y - from0.y, toLeft.x - from0.x, toLeft.y - from0.y])}` +
    `L${pack([to0.x, to0.y])}q${pack([waistRight.x - to0.x, waistRight.y - to0.y, fromRight.x - to0.x, fromRight.y - to0.y])}z`
  )
}

/** A twig from a node: it rises outward and bows over, a sliver that tapers to nothing, with a group of three leaves at its end and, on some, a pair on the way.
 * `high` is how far up the crown it grows (0..1): low groups hang down, high ones reach out level, as fresh leaves near the top of a culm do.
 * Twig and leaves are one filled path, so they sway as one. */
function twig(node: Point, side: number, length: number, blade: number, salt: number, high: number): string {
  const lift = ((40 + 16 * hashUnit(1, salt)) * Math.PI) / 180
  const end = { x: node.x + side * length * Math.cos(lift), y: node.y - length * Math.sin(lift) * 0.76 }
  const bend = { x: node.x + side * length * 0.36, y: node.y - length * 0.7 }
  const part = 0.58
  const rest = 1 - part
  const halfway = { x: rest * rest * node.x + 2 * rest * part * bend.x + part * part * end.x, y: rest * rest * node.y + 2 * rest * part * bend.y + part * part * end.y }
  let d = `M${at(node)}Q${at(bend)} ${at(end)}Q${round(bend.x + side * 0.9)} ${round(bend.y + 1)} ${round(node.x)} ${round(node.y + 1.3)}Z`
  const outward = (low: number, top: number): number => {
    const toward = low + (top - low) * high + (hashUnit(6, salt) - 0.5) * 16
    return side > 0 ? toward : 180 - toward
  }
  d += spray(end, outward(64, 10), hashUnit(2, salt) > 0.68 ? 4 : 3, blade, salt + 3)
  if (hashUnit(5, salt) > 0.4) d += spray(halfway, outward(86, 46), hashUnit(4, salt) > 0.7 ? 3 : 2, blade * 0.84, salt + 9)
  return d
}

/** The bamboo's paints on a stock: its own greens, or one ramp down the sheet, or the ink. */
function bambooPaint(stock: Stock): { leaf: string; cane: string; ink: number } {
  if (stock.bambooRamp) return { leaf: 'url(#bam)', cane: 'url(#bam)', ink: stock.bambooInk ?? stock.line }
  return { leaf: stock.bamboo?.leaf ?? stock.ink, cane: stock.bamboo?.cane ?? stock.ink, ink: stock.bambooInk ?? stock.line }
}

/** The clump: each culm as a column of internodes, its twigs as paths that sway about their nodes, and the crown of a tall culm as a group that sways about a point behind the wall. */
function bamboo(stock: Stock): string {
  let markup = ''
  CULMS.forEach((culm, order) => {
    const nodes = culmNodes(culm)
    let lower = ''
    let upper = ''
    let lowerTwigs = ''
    let upperTwigs = ''
    const isUpper = (share: number): boolean => culm.pivot === 0 || culmPoint(culm, share).y < culm.pivot
    for (let index = 1; index < nodes.length; index += 1) {
      const from = nodes[index - 1] ?? 0
      const to = nodes[index] ?? 1
      if (isUpper((from + to) / 2)) upper += internode(culm, from, to)
      else lower += internode(culm, from, to)
    }
    const swaying = (d: string, origin: Point, salt: number, lively: number): string => {
      const turn = round((1.6 + 1.8 * hashUnit(1, salt)) * lively)
      const seconds = round(4.6 + 4.2 * hashUnit(2, salt))
      return `<path class="sw" style="--a:${turn}deg;transform-origin:${round(origin.x)}px ${round(origin.y)}px;animation-duration:${seconds}s;animation-delay:-${round(hashUnit(3, salt) * 9)}s" d="${d}"/>`
    }
    const tip = culmPoint(culm, 1)
    const crownTop = culmPoint(culm, 0).y - culm.height * 0.95
    for (let index = 1; index < nodes.length - 1; index += 1) {
      const share = nodes[index] ?? 0
      const node = culmPoint(culm, share)
      const listed = culm.low.find(entry => entry[0] === index)
      if (node.y > culm.crown && !listed) continue
      if (!listed && hashUnit(index, culm.salt + 77) < culm.sparse) continue
      const side = listed ? listed[1] : (index + culm.salt) % 2 === 0 ? 1 : -1
      // How far up the crown this node sits: twigs and leaves grow smaller toward the tip.
      const high = listed ? 0.3 : Math.min(1, Math.max(0, (culm.crown - node.y) / (culm.crown - crownTop)))
      const length = culm.reach * (1 - 0.45 * high) * (0.86 + 0.28 * hashUnit(index, culm.salt + 5))
      const piece = swaying(twig(node, side, length, culm.blade * (1 - 0.18 * high), culm.salt * 31 + index, listed ? 0 : high), node, culm.salt * 17 + index, 1)
      if (isUpper(share)) upperTwigs += piece
      else lowerTwigs += piece
    }
    // The tip: a last small group that carries on the way the culm leans.
    upperTwigs += swaying(spray(tip, culm.lean < 0 ? 158 : 22, 3, culm.blade * 0.78, culm.salt * 13) + leaf(tip.x, tip.y, ((culm.lean < 0 ? -112 : -68) * Math.PI) / 180, culm.blade * 0.5, 1.6), tip, culm.salt * 19, 1.2)

    const paint = bambooPaint(stock)
    const tone = culm.tone * paint.ink
    const leaves = `fill="${paint.leaf}" fill-opacity="${alpha(tone * 0.92)}"`
    const stem = (d: string): string => (d ? `<path d="${d}" fill="${paint.cane}" fill-opacity="${alpha(tone * 0.7)}"/>` : '')
    const origin = culm.pivot === 0 ? { x: culm.x, y: culm.y } : { x: culmPoint(culm, (culm.y - culm.pivot) / culm.height).x, y: culm.pivot }
    const seconds = round(9 + 6 * hashUnit(order, 97))
    const turn = culm.pivot === 0 ? 0.9 : 0.5
    markup +=
      stem(lower) +
      (lowerTwigs ? `<g ${leaves}>${lowerTwigs}</g>` : '') +
      `<g class="cr" style="--a:${turn}deg;transform-origin:${round(origin.x)}px ${round(origin.y)}px;animation-duration:${seconds}s;animation-delay:-${round(hashUnit(order, 99) * 12)}s">${stem(upper)}<g ${leaves}>${upperTwigs}</g></g>`
  })
  return markup
}

// ---------------------------------------------------------------------------------------------------------------
// The Taihu rock

/** A knot of an outline, in a stone's own units (x to the right, y upward from its foot as a negative number). A third number makes a corner of it. */
type Knot = [number, number] | [number, number, number]

/** One piece of a smooth outline: a quadratic from `a` to `b` pulled toward `c`. `knot` is the outline knot it bends round. */
interface Bend {
  a: Point
  c: Point
  b: Point
  knot: number
}

function mid(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

/** The pieces of the same smooth ring that `smoothRing` draws through these points: each runs from the midpoint before a point, round it, to the midpoint after. */
function bendsOf(points: Point[], knots: number[]): Bend[] {
  const count = points.length
  return points.map((here, index) => {
    const before = points[(index + count - 1) % count] ?? here
    const after = points[(index + 1) % count] ?? here
    return { a: mid(before, here), c: here, b: mid(here, after), knot: knots[index] ?? 0 }
  })
}

function bendAt(bend: Bend, t: number): Point {
  const u = 1 - t
  return { x: u * u * bend.a.x + 2 * u * t * bend.c.x + t * t * bend.b.x, y: u * u * bend.a.y + 2 * u * t * bend.c.y + t * t * bend.b.y }
}

/** The way a piece runs at t, as a unit vector. */
function bendHeading(bend: Bend, t: number): Point {
  const x = 2 * (1 - t) * (bend.c.x - bend.a.x) + 2 * t * (bend.b.x - bend.c.x)
  const y = 2 * (1 - t) * (bend.c.y - bend.a.y) + 2 * t * (bend.b.y - bend.c.y)
  const length = Math.hypot(x, y)
  if (length > 1e-6) return { x: x / length, y: y / length }
  const chord = Math.hypot(bend.b.x - bend.a.x, bend.b.y - bend.a.y) || 1
  return { x: (bend.b.x - bend.a.x) / chord, y: (bend.b.y - bend.a.y) / chord }
}

/** The stretch of a piece between t0 and t1, itself a quadratic. */
function bendPiece(bend: Bend, t0: number, t1: number): Bend {
  const blend = (p: number, q: number, r: number): number => (1 - t0) * (1 - t1) * p + ((1 - t0) * t1 + t0 * (1 - t1)) * q + t0 * t1 * r
  return { a: bendAt(bend, t0), c: { x: blend(bend.a.x, bend.c.x, bend.b.x), y: blend(bend.a.y, bend.c.y, bend.b.y) }, b: bendAt(bend, t1), knot: bend.knot }
}

/** Pieces written as one path, a new run starting wherever a piece does not begin where the last one ended. */
function bendsPath(bends: Bend[]): string {
  let d = ''
  let last: Point | null = null
  let control: Point | null = null
  for (const bend of bends) {
    const joined = !!last && Math.abs(last.x - bend.a.x) < 0.05 && Math.abs(last.y - bend.a.y) < 0.05
    if (!joined) d += `M${at(bend.a)}`
    // Where the piece runs on smoothly from the last one, its control point is the last one's mirrored, and T says so in half the space.
    const mirrored = joined && control && Math.abs(2 * bend.a.x - control.x - bend.c.x) < 0.08 && Math.abs(2 * bend.a.y - control.y - bend.c.y) < 0.08
    d += mirrored ? `T${at(bend.b)}` : `Q${at(bend.c)} ${at(bend.b)}`
    last = bend.b
    control = bend.c
  }
  return d
}

/** A closed polygon through points, then back along a second row of points, written in relative steps to keep it short. */
function band(outer: Point[], inner: Point[]): string {
  if (outer.length < 2) return ''
  const points = outer.concat(inner.slice().reverse()).map(point => ({ x: round(point.x), y: round(point.y) }))
  const first = points[0]
  if (!first) return ''
  const steps: number[] = []
  for (let index = 1; index < points.length; index += 1) {
    const here = points[index]
    const before = points[index - 1]
    if (here && before) steps.push(here.x - before.x, here.y - before.y)
  }
  return `M${pack([first.x, first.y])}l${pack(steps)}z`
}

/** A hole's mouth, in a stone's units: an irregular ring round (x, y) of half sizes rx and ry, turned by `degrees`.
 * A 'tear' draws one end out to a point (turn it so the point hangs where water ran out), a 'kidney' is dented on one side,
 * and every other mouth has one broken corner. */
function mouth(x: number, y: number, rx: number, ry: number, degrees: number, kind: 'oval' | 'tear' | 'kidney', salt: number): Knot[] {
  const turn = (degrees * Math.PI) / 180
  const count = 9
  const corner = Math.floor(hashUnit(0, salt) * count)
  const knots: Knot[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + (hashUnit(index, salt + 1) - 0.5) * 0.3
    let reach = 1 + (hashUnit(index, salt + 2) - 0.5) * 0.24
    if (kind === 'tear' && index === 0) reach = 1.7
    if (kind === 'kidney' && index === 2) reach *= 0.5
    if (kind === 'kidney' && (index === 1 || index === 3)) reach *= 0.85
    const ex = Math.cos(angle) * rx * reach
    const ey = Math.sin(angle) * ry * reach
    const px = x + ex * Math.cos(turn) - ey * Math.sin(turn)
    const py = y + ex * Math.sin(turn) + ey * Math.cos(turn)
    const sharp = kind === 'tear' ? index === 0 : kind === 'oval' ? index === corner : index === 2
    knots.push(sharp ? [px, py, 1] : [px, py])
  }
  return knots
}

/** A hole in a stone. Through it the sky and the bamboo show (透), or it is a blind pocket, dark (漏). `hug` adds a short groove round its lower lip.
 * `share` is how much of a through-hole's mouth is open sky (0.7 if not given): a big hole takes a larger share, so the inner wall seen in it stays a sliver. */
interface Hole {
  knots: Knot[]
  through: boolean
  hug: boolean
  share?: number
}

/** A stone, in its own units. */
interface StoneSpec {
  name: string
  outline: Knot[]
  holes: Hole[]
  /** Small pits: x, y, half width, half height, turn in degrees. */
  pits: Array<[number, number, number, number, number]>
  /** Long grooves the water cut down the stone, each an open line through its knots. */
  grooves: Knot[][]
  /** Where one lobe of the stone overlaps the next (皱): a firmer line running in from a notch of the outline, with shade under its lower side. */
  folds: Knot[][]
  /** The little rings of the 弹子窝 pitting: x, y, radius. */
  rings: Array<[number, number, number]>
  /** Knots of the outline where the line breaks off on the lit side. */
  breaks: number[]
  /** Dots of moss (苔点) in the creases. */
  moss: Array<[number, number]>
  /** How far in from a shaded edge the wash of shade runs, in the stone's units. */
  shade: number
  /** How heavy the shaded contour swells, in the sheet's units. */
  weight: number
  /** A small stone, drawn with one band of shade and no clipping. */
  lean?: boolean
}

/** The stone standing with its foot at (x, y). Its body is first laid in the ground it stands against (`ground`, or the sky itself when that is
 * null), so it hides what is behind it and its through-holes show it. Then, as an ink painter lays a rock: the outline (勾), thin and broken on the
 * lit top and left, swelling on the shaded right and under every overhang; texture strokes (皴) that follow the form: grooves down the column,
 * short ripples on the shaded side of each bulge, rings of pitting; a wash (染) lighter than the strokes, deepening toward the shade and darkest
 * in the undercuts and the blind pockets; and last the moss dots (点). The light falls from the upper left. */
function stone(spec: StoneSpec, x: number, y: number, scale: number, stock: Stock, ground: string | null, backlit = false): Built {
  // A stone standing against the lit courtyard (by night) keeps its line only round its outline, in the colour of the light behind it, so
  // that it stands in silhouette with a lit rim; its holes show the light, with no ring round them that could make an eye of one.
  const lamp = backlit ? stock.lamp : undefined
  // By night its contour is the light behind it: brightest low, where the lamps are, and gone along the crown against the dim top of the arch,
  // so the stone is not ringed by an even pale line (that makes a cut-out of it, and a cartoon creature of every lobe).
  const pen = lamp ? 'url(#rim)' : stock.ink
  // On the lantern night no stone gets a closed pale ring round a hole or a pit: on a dark stone that is an eye.
  const ringless = !!stock.lamp
  const place = (knot: Knot | [number, number]): Point => ({ x: x + knot[0] * scale, y: y + knot[1] * scale })
  const expand = (knots: Knot[]): { points: Point[]; ids: number[] } => {
    const points: Point[] = []
    const ids: number[] = []
    knots.forEach((knot, index) => {
      points.push(place(knot))
      ids.push(index)
      if (knot[2]) {
        points.push(place(knot))
        ids.push(index)
      }
    })
    return { points, ids }
  }
  const ring = (knots: Knot[]): string => smoothRing(expand(knots).points)
  const bendsFor = (knots: Knot[]): Bend[] => {
    const { points, ids } = expand(knots)
    return bendsOf(points, ids)
  }
  const centre = (knots: Knot[]): { x: number; y: number; rx: number; ry: number } => {
    let cx = 0
    let cy = 0
    for (const knot of knots) {
      cx += knot[0] / knots.length
      cy += knot[1] / knots.length
    }
    let rx = 0
    let ry = 0
    for (const knot of knots) {
      rx = Math.max(rx, Math.abs(knot[0] - cx))
      ry = Math.max(ry, Math.abs(knot[1] - cy))
    }
    return { x: cx, y: cy, rx, ry }
  }
  /** The mouth drawn in and set toward one side: for a through-hole the opening seen through it (set toward the lower right, so the inner wall
   * shows as a crescent along the upper left), for a pocket its dark depth (set toward the upper left, so the lit lip shows on the lower right). */
  const shifted = (knots: Knot[], share: number, toward: number): Knot[] => {
    const c = centre(knots)
    return knots.map((knot): Knot => [
      c.x + (knot[0] - c.x) * share + toward * (1 - share) * 0.5 * c.rx,
      c.y + (knot[1] - c.y) * share + toward * (1 - share) * 0.62 * c.ry,
      knot[2] ?? 0,
    ])
  }
  /** The part of a ring on one side of its centre: `side` +1 keeps the lower right, -1 the upper left. */
  const partial = (knots: Knot[], side: number, grow = 1): string => {
    const c = centre(knots)
    const grown = knots.map((knot): Knot => [c.x + (knot[0] - c.x) * grow, c.y + (knot[1] - c.y) * grow, knot[2] ?? 0])
    const cx = x + c.x * scale
    const cy = y + c.y * scale
    return bendsPath(bendsFor(grown).filter(bend => side * (bend.c.x - cx + (bend.c.y - cy) * 1.2) > 0.6 * scale))
  }

  const outlineBends = bendsFor(spec.outline)
  const outline = ring(spec.outline)
  const throughs = spec.holes.filter(hole => hole.through)
  const blinds = spec.holes.filter(hole => !hole.through)
  const throats = throughs.map(hole => shifted(hole.knots, hole.share ?? 0.7, 1))
  const pockets = blinds.map(hole => shifted(hole.knots, 0.58, -1))
  const shape = outline + throats.map(ring).join('')

  // The outline's faces: the ones that look right or down are in shade.
  const footY = y - 4 * scale
  const outward = (bend: Bend, t: number): Point => {
    const heading = bendHeading(bend, t)
    return { x: heading.y, y: -heading.x }
  }
  const shaded = outlineBends.map(bend => {
    const out = outward(bend, 0.5)
    return (out.x > 0.3 || out.y > 0.42) && bendAt(bend, 0.5).y < footY
  })
  // Runs of shaded pieces, each sampled every quarter piece, with the outward normal at every sample.
  const runs: Array<Array<{ p: Point; out: Point }>> = []
  const count = outlineBends.length
  const startAt = shaded.findIndex(value => !value)
  let current: Array<{ p: Point; out: Point }> = []
  for (let step = 0; step <= count; step += 1) {
    const index = (startAt + step) % count
    const bend = outlineBends[index]
    if (step < count && bend && shaded[index]) {
      for (const t of [0, 0.5]) current.push({ p: bendAt(bend, t), out: outward(bend, t) })
    } else if (current.length) {
      const previous = outlineBends[(index + count - 1) % count]
      if (previous) current.push({ p: bendAt(previous, 1), out: outward(previous, 1) })
      if (current.length > 3) runs.push(current)
      current = []
    }
  }
  const inset = (sample: { p: Point; out: Point }, depth: number): Point => ({ x: sample.p.x - sample.out.x * depth, y: sample.p.y - sample.out.y * depth })
  const taper = (index: number, length: number): number => Math.pow(Math.sin((Math.PI * (index + 0.5)) / length), 0.6)
  const openings = spec.holes.map(hole => centre(hole.knots))
  const clear = (point: Point, margin: number): boolean =>
    openings.every(c => {
      const dx = (point.x - (x + c.x * scale)) / ((c.rx + margin) * scale)
      const dy = (point.y - (y + c.y * scale)) / ((c.ry + margin) * scale)
      return dx * dx + dy * dy > 1
    })

  // The wash of shade along every shaded face, three thin layers, each running in less far, so it deepens toward the edge; deeper under an overhang.
  const shadeBand = (share: number, salt: number): string =>
    runs
      .map((run, order) =>
        band(
          run.map(sample => sample.p),
          run.map((sample, index) => {
            const under = sample.out.y > 0.6 ? 1.7 : 1
            return inset(sample, spec.shade * scale * share * under * (0.65 + 0.7 * noise(index / 2, salt + order)) * taper(index, run.length))
          }),
        ),
      )
      .join('')
  // The swelling of the shaded contour: a thin band laid inside the line, thick in the middle of each run and gone at its ends, unevenly, like a brush pressed and lifted.
  const swell = runs
    .map((run, order) =>
      band(
        run.map(sample => sample.p),
        run.map((sample, index) => inset(sample, spec.weight * taper(index, run.length) * (0.55 + 0.9 * noise(index / 1.6, 401 + order)))),
      ),
    )
    .join('')
  // Ripples (皴) on the shaded side of the bulges: short strokes that follow the edge a little way in, one or two together.
  let ripples = ''
  runs.forEach((run, order) => {
    for (let index = 1; index + 2 < run.length; index += 3) {
      if (hashUnit(index, 503 + order) < 0.3) continue
      const depth = (3 + 3 * hashUnit(index, 509 + order)) * scale
      const stroke = [0, 1, 2].map(step => run[index + step]).filter((sample): sample is { p: Point; out: Point } => !!sample)
      const points = stroke.map(sample => inset(sample, depth))
      if (points.length < 3 || !points.every(point => clear(point, 2.5))) continue
      const [first, middle, last] = points
      if (first && middle && last) ripples += `M${at(first)}Q${at(middle)} ${at(last)}`
      if (hashUnit(index, 521 + order) < 0.55) {
        const deeper = stroke.slice(0, 2).map(sample => inset(sample, depth + 2.4 * scale))
        const [from, to] = deeper
        if (from && to && clear(to, 2.5)) ripples += `M${at(from)}L${at(to)}`
      }
    }
  })
  // The outline itself, broken for a moment at the given knots on the lit side.
  const pieces: Bend[] = []
  const broken = new Set<number>()
  for (const bend of outlineBends) {
    if (spec.breaks.includes(bend.knot) && !broken.has(bend.knot)) {
      broken.add(bend.knot)
      pieces.push(bendPiece(bend, 0, 0.3), bendPiece(bend, 0.72, 1))
    } else pieces.push(bend)
  }
  const line = bendsPath(pieces)

  const grooves = spec.grooves.map(groove => smoothPath(groove.map(place))).join('')
  const folds = spec.folds.map(fold => smoothPath(fold.map(place))).join('')
  // Under each fold, a crescent of shade on its lower right, widest in the middle of the fold.
  const foldShade = spec.folds
    .map(fold => {
      const points = fold.map(place)
      const offsets = points.map((point, index) => {
        const before = points[Math.max(0, index - 1)] ?? point
        const after = points[Math.min(points.length - 1, index + 1)] ?? point
        const dx = after.x - before.x
        const dy = after.y - before.y
        const size = Math.hypot(dx, dy) || 1
        let nx = -dy / size
        let ny = dx / size
        if (nx + ny < 0) {
          nx = -nx
          ny = -ny
        }
        const width = 3.2 * scale * Math.pow(Math.sin((Math.PI * index) / Math.max(1, points.length - 1)), 0.8)
        return { x: point.x + nx * width, y: point.y + ny * width }
      })
      return smoothPath(points) + smoothPath(offsets.slice().reverse()).replace('M', 'L') + 'Z'
    })
    .join('')
  const hugs = spec.holes
    .filter(hole => hole.hug)
    .map(hole => partial(hole.knots, 1, 1.45))
    .join('')
  const rims = throats.map(throat => partial(throat, -1)).join('') + pockets.map(pocket => partial(pocket, 1)).join('')
  const pits = spec.pits.map(([px, py, rx, ry, degrees], index) => ring(mouth(px, py, rx, ry, degrees, 'oval', 600 + index))).join('')
  let rings = ''
  for (const [rx, ry, radius] of spec.rings) {
    const p = place([rx, ry])
    const r = round(radius * scale)
    rings += `M${round(p.x - r)} ${round(p.y)}a${r} ${r} 0 1 0 ${round(2 * r)} 0a${r} ${r} 0 1 0 ${round(-2 * r)} 0`
  }
  let moss = ''
  spec.moss.forEach((dab, index) => {
    const p = place(dab)
    moss += `M${at(p)}l${round(0.5 + 0.8 * hashUnit(index, 7))} ${round(-1 - 1.2 * hashUnit(index, 9))}`
  })

  const wash = (share: number): number => alpha(share * stock.wash)
  const ink = (share: number): number => alpha(share * stock.line)
  const dark = stock.tile.colour
  const id = spec.name
  // Each of the three layers of shade: by day a pale grey, so the three together stay lighter than the strokes (染淡于皴).
  const shadeAlpha = stock.dark ? 0.15 : 0.085
  // The wash runs across the stone from its lit upper left to its shaded lower right. By day the ink is dark, so the wash deepens toward the shade;
  // at night the ink is pale moonlight, so it is laid on the lit side instead.
  let top = 0
  let bottom = -1e9
  let left = 1e9
  let right = -1e9
  for (const knot of spec.outline) {
    top = Math.min(top, knot[1])
    bottom = Math.max(bottom, knot[1])
    left = Math.min(left, knot[0])
    right = Math.max(right, knot[0])
  }
  const from = place([left, top])
  const to = place([right, bottom])
  const stops = lamp ? lamp.washStops : stock.dark ? [[0, 0.24], [0.45, 0.1], [1, 0.02]] : [[0, 0], [0.4, 0.05], [1, 0.2]]
  const defs =
    `<linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="${round(from.x)}" y1="${round(from.y)}" x2="${round(to.x)}" y2="${round(to.y)}">` +
    // On a solid ground the wash is mixed into it, stop by stop, so the body is laid in one fill; over the sky it is a separate translucent layer.
    stops.map(([offset, share]) => (ground ? `<stop offset="${offset}" stop-color="${mixed(ground, stock.ink, wash(share ?? 0))}"/>` : `<stop offset="${offset}" stop-color="${stock.ink}" stop-opacity="${wash(share ?? 0)}"/>`)).join('') +
    '</linearGradient>' +
    `<path id="${id}" fill-rule="evenodd" clip-rule="evenodd" d="${shape}"/>` +
    (spec.lean === true || spec.outline.length < 16 ? '' : `<clipPath id="${id}c"><use href="#${id}"/></clipPath>`)
  // A small stone needs no clipping: its one band of shade is too thin to spill past a notch.
  const small = spec.lean === true || spec.outline.length < 16
  const body = ground ? `<use href="#${id}" fill="url(#${id}w)"/>` : skyPaintedUse(id, stock.sky) + `<use href="#${id}" fill="url(#${id}w)"/>`
  const crescents = throughs.map(hole => ring(hole.knots)).join('') + throats.map(ring).join('')
  const shades = small
    ? `<path d="${shadeBand(0.8, 311)}" fill="${dark}" fill-opacity="${alpha(shadeAlpha * 1.6)}"/>`
    : `<g clip-path="url(#${id}c)" fill="${dark}"><path d="${shadeBand(1, 311)}" fill-opacity="${shadeAlpha}"/><path d="${shadeBand(0.45, 317)}" fill-opacity="${alpha(shadeAlpha * 1.4)}"/>${foldShade ? `<path d="${foldShade}" fill-opacity="${alpha(shadeAlpha * 1.6)}"/>` : ''}</g>`
  const blindFill = blinds.map(hole => ring(hole.knots)).join('') + pits
  const markup =
    `<g fill-rule="evenodd">${body}` +
    shades +
    (crescents ? `<path d="${crescents}" fill="${dark}" fill-opacity="${stock.dark ? 0.55 : 0.4}"/>` : '') +
    (blindFill ? `<path d="${blindFill}" fill="${dark}" fill-opacity="${stock.dark ? 0.45 : 0.3}"/>` : '') +
    (pockets.length ? `<path d="${pockets.map(ring).join('')}" fill="${dark}" fill-opacity="${stock.dark ? 0.6 : 0.5}"/>` : '') +
    '</g>' +
    // The furrows and folds a little firmer than the ripples and rings, so the column reads as cut by water and not as a smooth post.
    (grooves + folds ? `<path d="${grooves}${folds}" stroke="${stock.ink}" stroke-width="0.75" stroke-opacity="${ink(lamp ? 0.42 : 0.62)}"/>` : '') +
    (ripples + hugs + rings + rims ? `<path d="${ripples}${hugs}${rings}${rims}" stroke="${stock.ink}" stroke-width="0.65" stroke-opacity="${ink(lamp ? 0.3 : 0.5)}"/>` : '') +
    `<path d="${line}${ringless ? '' : spec.holes.map(hole => ring(hole.knots)).join('') + pits}" stroke="${pen}" stroke-width="0.88" stroke-opacity="${ink(0.84)}"/>` +
    (swell ? `<path d="${swell}" fill="${pen}" fill-opacity="${ink(0.8)}"/>` : '') +
    (moss && !lamp ? `<path d="${moss}" stroke="${stock.ink}" stroke-width="1.7" stroke-opacity="${ink(0.85)}"/>` : '')
  return { defs, markup }
}

// The peak in the gate, after 留园's 晚翠峰 and 冠云峰: a stone heavy at the head (上大下小), as 園冶 asks of a single standing stone. From a flared
// foot a lower body rises in lobes of unequal length broken by notches at different heights on its two sides, furrowed down its length by the
// water (long grooves, and folds with their shade); a short arm juts out on the left a little above the middle and ends square, with a hollow at
// its root; above a pinched neck the stone swells into a great head: one big lobe on its left, a square corner, a crown bowed up and highest in its
// middle, a small crack, and a lower squarish block leaning out to the right. There the head curls over like a wave, tucks its lip under, and
// comes down onto the body again as a bridge of stone, so that the biggest opening (透) is a wide bitten gap at the stone's edge under the curl,
// with the bamboo (or, by night, the lamplight) showing through it: too big and too near the edge to be read as an eye. No other opening is in the
// head, and no pit (a lone dark dot on a head is an eye). A slot runs down through the lower body (漏), and blind pockets and pits of every size
// lie on the neck and body so that no two openings sit level. Its sharp turns are the arm, the corner of the head and the foot.
const PEAK: StoneSpec = {
  name: 'pk',
  outline: [
    // the flared foot, a lower lobe, a near-straight run up to the arm
    [-37, 0, 1], [-45, -6], [-45, -15], [-38, -22, 1], [-44, -32], [-46, -46], [-34, -62, 1], [-31, -76], [-30, -88], [-26, -94, 1],
    // the short arm, ending square
    [-37, -99], [-47, -104, 1], [-45, -114], [-31, -120, 1],
    // the neck, hollow, to the waist
    [-24, -133], [-18, -146, 1],
    // the left of the head: one big lobe swelling out from the waist, a notch, a small lobe up to a square corner
    [-30, -151], [-42, -160], [-47, -176], [-47, -194], [-43, -207], [-37, -214, 1], [-43, -224], [-40, -236, 1],
    // the top: a crown bowed up from the square corner, highest in its middle, a small crack, and a lower squarish block leaning out over the curl
    [-30, -244], [-14, -250], [4, -254], [22, -255], [38, -252], [50, -247, 1], [58, -249], [70, -246, 1], [79, -240],
    // the curl's face, its lip tucked under, and the curl coming down again onto the body as a bridge of stone round the great opening
    [82, -230, 1], [89, -220], [90, -208], [84, -199, 1], [90, -188], [87, -175], [79, -165, 1], [76, -156], [69, -147], [63, -141, 1],
    // the right side down: lobes of every length between notches set at other heights than the left's
    [59, -128], [53, -116], [45, -104, 1], [50, -92], [50, -80], [44, -72, 1], [49, -62], [47, -50], [41, -42, 1], [45, -30], [47, -14], [43, 0, 1],
  ],
  holes: [
    // the great opening under the curl, where the curl has come down onto the body again: a wide bitten hole at the stone's edge, through which
    // the bamboo (or, by night, the light) shows (透); too big and too near the edge to be read as an eye
    { knots: [[45, -190], [53, -199], [65, -197], [73, -187], [74, -174], [68, -161], [63, -149, 1], [57, -155], [54, -165], [51, -178]], through: true, hug: false, share: 0.86 },
    // a pocket in the root of the arm
    { knots: mouth(-36, -110, 4.6, 3.2, -14, 'kidney', 15), through: false, hug: false },
    // a slot right down through the lower body (漏)
    { knots: mouth(4, -86, 3.6, 10, 4, 'oval', 9), through: true, hug: false },
    // a kidney-shaped pocket low on the body
    { knots: mouth(-10, -40, 6, 4, -8, 'kidney', 7), through: false, hug: true },
  ],
  // Pits only on the neck and the body: on the head a lone dark dot is read as an eye.
  pits: [[14, -66, 1.8, 2.4, 10], [-22, -22, 2.4, 1.7, 30], [10, -10, 1.8, 1.4, 0], [-22, -127, 1.6, 2.2, 0], [38, -120, 2, 1.5, 20]],
  // The water's furrows: long, a little wavy, broken, most of them on the shaded half of the column.
  grooves: [
    [[33, -92], [35, -78], [33, -64]],
    [[10, -50], [8, -34], [10, -17]],
    [[-16, -86], [-18, -73], [-16, -60]],
    [[33, -46], [35, -31], [33, -16]],
    [[-26, -40], [-28, -26], [-26, -12]],
    [[16, -236], [14, -220], [16, -206]],
    [[-6, -186], [-8, -170], [-6, -156]],
    [[26, -150], [28, -136]],
    [[-30, -204], [-32, -190]],
    [[56, -238], [60, -224], [58, -212]],
  ],
  // From every notch a fold runs in, with its shade under it; two long ones run down the column as furrows.
  folds: [
    [[-38, -22], [-31, -21], [-25, -18]],
    [[-34, -62], [-27, -60], [-21, -56]],
    [[-26, -94], [-19, -92], [-13, -89]],
    [[-31, -120], [-24, -117], [-18, -113]],
    [[-18, -146], [-11, -144], [-5, -140]],
    [[-37, -214], [-30, -212], [-24, -208]],
    [[82, -230], [75, -227], [67, -226]],
    [[84, -199], [78, -200]],
    [[79, -165], [75, -166]],
    [[63, -141], [57, -140]],
    [[45, -104], [39, -102], [34, -98]],
    [[44, -72], [38, -70], [33, -66]],
    [[41, -42], [35, -40], [30, -36]],
    [[24, -112], [21, -94], [23, -76], [21, -58]],
    [[-4, -78], [-6, -60], [-4, -44], [-6, -28]],
  ],
  rings: [[4, -34, 1.5], [7, -31, 1.1], [3, -29, 1], [-16, -135, 1.4], [-13, -132, 1], [-17, -131, 0.9], [-32, -214, 1.2], [-29, -211, 0.9], [-33, -210, 0.8]],
  breaks: [7, 18, 25, 28],
  moss: [[-31, -120], [-28, -119], [63, -141], [-18, -146], [-34, -62], [-37, -214]],
  shade: 11,
  weight: 1.4,
}

// A low stone at the peak's foot; a smaller one and a pebble are drawn plainly in `peakBed`.
const FOOT_STONES: Array<{ spec: StoneSpec; x: number; y: number }> = [
  {
    spec: {
      name: 'q0',
      outline: [[-13, 0, 1], [-14, -4], [-12, -9], [-7, -13], [-2, -12, 1], [3, -16], [8, -15], [12, -11], [13, -6], [12, 0, 1]],
      holes: [],
      pits: [[5, -9, 1.6, 1.2, 10]],
      grooves: [],
      folds: [[[-2, -12], [1, -8], [2, -4]]],
      rings: [],
      breaks: [3],
      moss: [[-8, -2], [9, -1]],
      shade: 4,
      weight: 0.9,
      lean: true,
    },
    x: 1433,
    y: 828,
  },
]

// The stone beside the banana (蕉石): a squat companion nearly as tall as it is wide, wider at its top than its foot, notched under on both sides,
// its top in two lobes of unequal height, the higher one leaning toward the stems. Its one through-hole is a low hollow at its foot, not a
// socket in its face; a small pocket sits higher on the other side, so the openings never line up into a face. It stands just behind the
// clump, so the oldest leaf hangs down in front of it.
const BANANA_STONE: StoneSpec = {
  name: 'cs',
  outline: [
    [-26, 0, 1], [-29, -5], [-27, -11, 1], [-31, -17], [-33, -26], [-29, -32, 1], [-27, -39], [-20, -45], [-13, -44, 1], [-6, -50],
    [3, -54], [10, -51, 1], [16, -57], [24, -59], [30, -53], [33, -44], [30, -36, 1], [25, -31], [25, -21], [22, -13, 1],
    [25, -6], [24, 0, 1],
  ],
  holes: [
    // a low hollow right through under the left lobe, where the stone stands on the ground: a little cave at its foot, not an eye in its face
    { knots: mouth(-13, -10, 5.2, 2.6, -8, 'kidney', 51), through: true, hug: false, share: 0.72 },
    // a pocket where the notch under the right lobe runs in
    { knots: mouth(21, -33, 3.2, 1.8, 10, 'kidney', 53), through: false, hug: false },
  ],
  pits: [],
  grooves: [[[-4, -36], [-6, -25], [-4, -14]], [[-17, -38], [-19, -28]]],
  folds: [[[-27, -11], [-22, -14]], [[-29, -32], [-23, -31]], [[10, -51], [12, -45], [13, -39]], [[30, -36], [23, -37], [17, -35]]],
  rings: [[21, -45, 1.1], [23.5, -43, 0.8], [20, -42, 0.7]],
  breaks: [7],
  moss: [[-21, -2], [-15, -1], [18, -2], [28, -35]],
  shade: 7,
  weight: 1.1,
  lean: true,
}

/** What lies behind a thing beyond the gate, low down: the sky with the haze over the far ground laid on it. */
function beyondGround(stock: Stock, x: number, y: number): string {
  // By night the things beyond the gate stand against the lamp: their ground is the dark of a silhouette.
  if (stock.lamp) return stock.lamp.ground
  const distance = Math.hypot((x - GATE.x) / 112, (y - (GROUND - 26)) / 30)
  const share = distance >= 1 ? 0 : distance < 0.6 ? 0.8 - (0.44 * distance) / 0.6 : 0.36 * (1 - (distance - 0.6) / 0.4)
  // The sky is sampled where the point really lies on this sheet.
  const there = beyondAt(x, y)
  return mixed(skyAt(stock.sky, there.x, there.y), stock.plaster.colour, (stock.haze ?? stock.plaster.alpha) * share)
}

/** The low planted bed the peak rises from: a gentle mound over its foot, the two low stones and a pebble half sunk in it, tufts of mondo grass, moss dots. */
function peakBed(stock: Stock): Built {
  const line = (share: number): number => alpha(share * stock.line)
  const d = 'M1372 828Q1380 821 1390 819.5Q1402 818 1414 818.6Q1430 819.2 1446 822Q1458 824.5 1470 828Z'
  const stones = FOOT_STONES.map(entry => stone(entry.spec, entry.x, entry.y, 1, stock, beyondGround(stock, entry.x, entry.y - 6), true))
  // By night the bed stands against the lamp: its lines are the light caught along its edges, the grass glows, the moss is not seen.
  const pen = stock.lamp ? stock.lamp.line : stock.ink
  const grass = stock.lamp ? stock.lamp.line : stock.tuft ?? stock.ink
  // A smaller stone left of the foot and a pebble right of it, each a single wash and line.
  const pebbles = smoothRing([[-8, 0], [-8, 0], [-9, -4], [-6, -8], [-1, -9], [-1, -9], [3, -10], [7, -7], [8, -3], [8, 0], [8, 0]].map(([px, py]) => ({ x: 1388 + (px ?? 0), y: 828 + (py ?? 0) }))) +
    smoothRing([[-4, 0], [-4, 0], [-4.5, -2], [-1, -4], [3, -3.5], [4.5, 0], [4.5, 0]].map(([px, py]) => ({ x: 1454 + (px ?? 0), y: 828 + (py ?? 0) })))
  const markup =
    `<path d="${d}" fill="${beyondGround(stock, 1412, 824)}"/>` +
    `<path d="${d}" fill="${stock.ink}" fill-opacity="${alpha(0.05 * stock.wash)}"/>` +
    `<path d="M1374 827.4Q1380 821 1390 819.5Q1402 818 1408 818.2M1417 818.7Q1430 819.2 1446 822Q1458 824.5 1468 827.6" stroke="${pen}" stroke-width="0.8" stroke-opacity="${line(0.55)}"/>` +
    stones.map(entry => entry.markup).join('') +
    `<path d="${pebbles}" fill="${mixed(beyondGround(stock, 1420, 824), stock.ink, alpha(0.1 * stock.wash))}" stroke="${pen}" stroke-width="0.85" stroke-opacity="${line(0.8)}"/>` +
    `<path d="M1393.4 826.4Q1395.6 823.6 1395.8 820.8M1457.6 827.4Q1458.8 826 1458.4 824.8" stroke="${pen}" stroke-width="1.2" stroke-opacity="${line(0.55)}"/>` +
    `<path d="${tuft(1392, 820.5, 9, 31)}${tuft(1397, 820, 6, 32)}${tuft(1421, 820.5, 8, 35)}${tuft(1462, 827, 7, 36)}${tuft(1512, GROUND - 5, 7, 39)}" stroke="${grass}" stroke-width="0.85" stroke-opacity="${line(0.72)}"/>` +
    (stock.lamp ? '' : `<path d="M1384 820l.7-1.6M1401.5 818.4l.9-1.4M1413 818.8l.6-1.7M1441 821.6l.8-1.2M1379 823.4l.6-1.4" stroke="${stock.ink}" stroke-width="1.7" stroke-opacity="${line(0.85)}"/>`)
  return { defs: stones.map(entry => entry.defs).join(''), markup }
}

// ---------------------------------------------------------------------------------------------------------------
// The banana plant

/** A pseudostem (假茎): not wood but leaf sheaths rolled tight, a stout green column a little swollen at the foot. */
interface Pseudostem {
  foot: Point
  top: Point
  /** Half its breadth at the foot and at the top. */
  base: number
  crown: number
  tone: number
  salt: number
}

// A clump of three from one root, standing in front of the wall's free end: the main stem; an older one behind it to the left, lower and paler; and a
// young sucker further left (on Moon Gate it stood to the right, where this sheet has the reading column). The stems are short and stout, and the leaves hang low enough round them that the clump reads as one vase of leaves from the ground up.
const STEMS: Pseudostem[] = [
  { foot: { x: 307, y: 833 }, top: { x: 304, y: 788 }, base: 5.6, crown: 3.9, tone: 0.62, salt: 3 },
  { foot: { x: 334, y: 833 }, top: { x: 331, y: 759 }, base: 7.6, crown: 5.2, tone: 1, salt: 7 },
  { foot: { x: 294, y: 833 }, top: { x: 293, y: 813 }, base: 3.4, crown: 2.6, tone: 0.82, salt: 11 },
]

/** One banana leaf: its midrib a curve from the stalk's root on the stem (`from`) to the tip (`to`); half its breadth; how much of each half shows
 * (`plus` is the half to the right of the way the leaf runs): a leaf seen at a slant shows one half narrow. `stalk` is the share of its length that is
 * petiole. Tears are [side, place along the blade 0..1, depth as a share of the half]. */
interface BananaLeaf {
  from: Point
  c1: Point
  c2: Point
  to: Point
  half: number
  plus: number
  minus: number
  stalk: number
  tears: Array<[number, number, number]>
  veins: number
  tone: number
  /** The paler underside is turned up. */
  pale?: boolean
  salt: number
}

const LEAVES: BananaLeaf[] = [
  // the older stem behind: a leaf arching out to the left and a younger one standing up
  { from: { x: 303, y: 790 }, c1: { x: 295, y: 758 }, c2: { x: 270, y: 730 }, to: { x: 242, y: 744 }, half: 13, plus: 0.5, minus: 1, stalk: 0.1, tears: [], veins: 5, tone: 0.6, salt: 21 },
  { from: { x: 305, y: 788 }, c1: { x: 306, y: 764 }, c2: { x: 305, y: 738 }, to: { x: 297, y: 714 }, half: 10, plus: 0.5, minus: 1, stalk: 0.1, tears: [], veins: 4, tone: 0.58, salt: 23 },
  // the main stem: its oldest leaf, low on the left, hanging, torn twice along its veins
  { from: { x: 327, y: 769 }, c1: { x: 306, y: 758 }, c2: { x: 284, y: 768 }, to: { x: 276, y: 812 }, half: 14, plus: 0.5, minus: 1, stalk: 0.1, tears: [[-1, 0.42, 0.75], [-1, 0.68, 0.55]], veins: 5, tone: 0.9, salt: 31 },
  // a big leaf arching over to the left, across the edge of the gate (一叶芭蕉，半掩窗扉)
  { from: { x: 327.6, y: 765 }, c1: { x: 316, y: 722 }, c2: { x: 274, y: 678 }, to: { x: 238, y: 708 }, half: 18, plus: 0.6, minus: 1, stalk: 0.09, tears: [], veins: 6, tone: 1, salt: 33 },
]

// Leaves drawn after the rolled heart: the young one standing nearly upright, one arching right and hanging short of the wall's end (it may not
// reach the reading column), and one coming toward us, its underside up.
const FRONT_LEAVES: BananaLeaf[] = [
  { from: { x: 331, y: 760 }, c1: { x: 332, y: 728 }, c2: { x: 339, y: 690 }, to: { x: 348, y: 658 }, half: 13, plus: 1, minus: 0.72, stalk: 0.08, tears: [], veins: 4, tone: 0.95, salt: 35 },
  { from: { x: 334.6, y: 766 }, c1: { x: 348, y: 724 }, c2: { x: 364, y: 702 }, to: { x: 374, y: 744 }, half: 15, plus: 1, minus: 0.55, stalk: 0.09, tears: [], veins: 6, tone: 0.98, salt: 37 },
  { from: { x: 336, y: 771 }, c1: { x: 350, y: 764 }, c2: { x: 366, y: 768 }, to: { x: 374, y: 796 }, half: 13, plus: 1, minus: 0.7, stalk: 0.12, tears: [[1, 0.55, 0.6]], veins: 4, tone: 0.9, pale: true, salt: 39 },
]

// The sucker's two small leaves.
const SUCKER_LEAVES: BananaLeaf[] = [
  { from: { x: 293, y: 814 }, c1: { x: 292, y: 802 }, c2: { x: 287, y: 791 }, to: { x: 279, y: 782 }, half: 5.5, plus: 0.6, minus: 1, stalk: 0.12, tears: [], veins: 3, tone: 0.8, salt: 41 },
  { from: { x: 294, y: 815 }, c1: { x: 298, y: 806 }, c2: { x: 304, y: 800 }, to: { x: 312, y: 798 }, half: 5, plus: 1, minus: 0.6, stalk: 0.12, tears: [], veins: 3, tone: 0.76, salt: 43 },
]

/** A colour laid over another, as a wash would be. */
function mixed(under: string, over: string, share: number): string {
  const a = channels(under)
  const b = channels(over)
  return '#' + a.map((value, index) => Math.round(value + ((b[index] ?? 0) - value) * share).toString(16).padStart(2, '0')).join('')
}

/** The pale ground of the plant's leaves and stems: the sky there with a breath of the wall's plaster in it, so that they hide what is behind them and stand a little lighter than the sky. */
function bananaGround(stock: Stock, x: number, y: number): string {
  return mixed(skyAt(stock.sky, x, y), stock.plaster.colour, stock.plaster.alpha * 0.7)
}

function cubicAt(leaf: BananaLeaf, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return { x: a * leaf.from.x + b * leaf.c1.x + c * leaf.c2.x + d * leaf.to.x, y: a * leaf.from.y + b * leaf.c1.y + c * leaf.c2.y + d * leaf.to.y }
}

/** A banana leaf (芭蕉叶): a short stout stalk running straight on into the midrib; one broad oblong blade about three times as long as it is wide, its sides
 * nearly parallel, its base rounded and a little lopsided, its tip blunt and round, never a point; a few fine veins leaving the midrib at a slant toward
 * the tip and stopping short of the edge (葉如斜界紙); on an old leaf a slit or two torn in from the edge along the veins, never across the midrib, the
 * strip beyond it dropped a little out of line. It is first painted in a solid pale ground, so it hides what is behind it. */
function bananaLeaf(leaf: BananaLeaf, id: string, stock: Stock): Built {
  const table: Array<{ length: number; point: Point }> = []
  let length = 0
  let last = cubicAt(leaf, 0)
  for (let step = 0; step <= 48; step += 1) {
    const point = cubicAt(leaf, step / 48)
    length += Math.hypot(point.x - last.x, point.y - last.y)
    table.push({ length, point })
    last = point
  }
  const total = length
  const frame = (share: number): { p: Point; n: Point } => {
    const target = Math.min(1, Math.max(0, share)) * total
    let index = 1
    while (index < table.length - 1 && (table[index]?.length ?? 0) < target) index += 1
    const low = table[index - 1] ?? table[0]
    const high = table[index] ?? low
    if (!low || !high) return { p: leaf.from, n: { x: 1, y: 0 } }
    const part = (target - low.length) / (high.length - low.length || 1)
    const dx = high.point.x - low.point.x
    const dy = high.point.y - low.point.y
    const size = Math.hypot(dx, dy) || 1
    return { p: { x: low.point.x + dx * part, y: low.point.y + dy * part }, n: { x: -dy / size, y: dx / size } }
  }
  const bladeLength = total * (1 - leaf.stalk)
  const shareOf = (along: number): number => leaf.stalk + along * (1 - leaf.stalk)
  const show = (side: number): number => (side > 0 ? leaf.plus : leaf.minus)
  const stalkHalf = 1.15
  /** Half the blade's breadth at a place along it, on one side: the base rounded and lopsided (one side starts a little higher on the stalk), the sides nearly parallel, the tip blunt. */
  const breadth = (along: number, side: number): number => {
    const start = side > 0 ? 0 : 0.035
    const end = side > 0 ? 1 : 0.975
    if (along <= start || along >= end) return 0
    const baseLength = 0.13
    const body = leaf.half * (1 - 0.08 * Math.min(1, Math.max(0, (along - start - baseLength) / 0.62)))
    if (along < start + baseLength) {
      const q = (start + baseLength - along) / baseLength
      return Math.max(stalkHalf, body * Math.sqrt(Math.max(0, 1 - q * q)))
    }
    const tipFrom = 0.76
    if (along > tipFrom) {
      const q = (along - tipFrom) / (end - tipFrom)
      return body * Math.sqrt(Math.max(0, 1 - q * q))
    }
    return body
  }
  const tan = Math.tan((64 * Math.PI) / 180)
  const tearsOn = (side: number): Array<[number, number, number]> => leaf.tears.filter(tear => tear[0] === side)
  /** How far a strip freed by a tear has dropped out of line at a place along the blade. */
  const drop = (along: number, side: number): number => {
    let shift = 0
    for (const [, place] of tearsOn(side)) if (along > place && along < place + 0.12) shift = Math.max(shift, 1.5 * (1 - (along - place) / 0.12))
    return shift
  }
  const edge = (along: number, side: number, share = 1): Point => {
    const { p, n } = frame(shareOf(along))
    const width = breadth(along, side) * show(side) * share + (share === 1 ? drop(along, side) : 0)
    return { x: p.x + n.x * width * side, y: p.y + n.y * width * side }
  }
  const stalkEdge = (share: number, side: number): Point => {
    const { p, n } = frame(share)
    return { x: p.x + n.x * stalkHalf * side, y: p.y + n.y * stalkHalf * side }
  }
  const places: number[] = [0.02, 0.07, 0.13]
  for (let step = 1; step <= 12; step += 1) places.push(0.13 + (0.83 * step) / 12)
  places.push(0.985)
  /** One edge of the leaf from the stalk's root to the tip, with its tears cut in. */
  const side = (which: number): Point[] => {
    const points: Point[] = [stalkEdge(0.02, which), stalkEdge(leaf.stalk * 0.6, which)]
    const tears = tearsOn(which).slice()
    for (const along of places) {
      const tear = tears[0]
      if (tear && along > tear[1]) {
        tears.shift()
        const [, place, depth] = tear
        const width = breadth(place, which) * show(which)
        const back = (depth * width) / (bladeLength * tan)
        const lip = edge(place - 0.02, which)
        const deep = edge(place - back, which, 1 - depth)
        const far = edge(place + 0.024, which)
        points.push(lip, lip, deep, deep, far, far)
      }
      if (breadth(along, which) > 0) points.push(edge(along, which))
    }
    return points
  }
  const root = frame(0).p
  const tip = frame(1).p
  const plus = side(1)
  const minus = side(-1)
  const outline = smoothRing([root, root, ...plus, tip, ...minus.slice().reverse()])
  // The narrower half takes a second wash, all but a hair along the midrib, which stays pale.
  const narrow = leaf.plus < leaf.minus ? 1 : -1
  const spine: Point[] = []
  const rim: Point[] = []
  for (let step = 0; step <= 10; step += 1) {
    const along = 0.05 + (0.92 * step) / 10
    const { p, n } = frame(shareOf(along))
    spine.push({ x: p.x + n.x * 0.9 * narrow, y: p.y + n.y * 0.9 * narrow })
    rim.push(edge(along, narrow, 0.98))
  }
  const shade = band(spine, rim)
  // The veins: a few on each half that shows, unevenly spaced.
  const night = stock.dark ? 0.75 : 1
  let veins = ''
  for (const which of [1, -1]) {
    if (show(which) < 0.4) continue
    const count = Math.max(2, Math.round(leaf.veins * (show(which) > 0.9 ? 1 : 0.6)))
    for (let index = 0; index < count; index += 1) {
      const along = 0.12 + (0.7 * (index + 0.5 + (hashUnit(index, leaf.salt + (which > 0 ? 0 : 9)) - 0.5) * 0.8)) / count
      if (tearsOn(which).some(tear => Math.abs(tear[1] - along) < 0.06)) continue
      const width = breadth(along, which) * show(which)
      if (width < 3) continue
      const slant = Math.tan(((62 + 12 * hashUnit(index, leaf.salt + 3)) * Math.PI) / 180)
      const reach = 0.82 + 0.06 * hashUnit(index, leaf.salt + 5)
      const { p, n } = frame(shareOf(along))
      const start = { x: p.x + n.x * which * 1.1, y: p.y + n.y * which * 1.1 }
      const end = edge(along + (reach * width) / (bladeLength * slant), which, reach)
      const forward = frame(shareOf(along + 0.01)).p
      const fx = forward.x - p.x
      const fy = forward.y - p.y
      const fs = Math.hypot(fx, fy) || 1
      const span = Math.hypot(end.x - start.x, end.y - start.y)
      const bend = { x: (start.x + end.x) / 2 - (fx / fs) * span * 0.14, y: (start.y + end.y) / 2 - (fy / fs) * span * 0.14 }
      // A vein is a hair-thin sliver of the midrib's ink rather than a stroke, so the veins and the midrib are one shape.
      const hair = 0.3 * night
      const hx = (-(end.y - start.y) / (span || 1)) * hair
      const hy = ((end.x - start.x) / (span || 1)) * hair
      veins += `M${at(start)}Q${at(bend)} ${at(end)}L${round(end.x + hx)} ${round(end.y + hy)}Q${round(bend.x + hx)} ${round(bend.y + hy)} ${round(start.x + hx)} ${round(start.y + hy)}Z`
    }
  }
  // The midrib, on from the stalk: the strongest line of the leaf, tapering to the tip.
  const ribLeft: Point[] = []
  const ribRight: Point[] = []
  for (let step = 0; step <= 9; step += 1) {
    const share = step / 9
    const { p, n } = frame(share)
    const half = share <= leaf.stalk ? 1.05 : 1.05 - (0.78 * (share - leaf.stalk)) / (1 - leaf.stalk)
    ribLeft.push({ x: p.x - n.x * half, y: p.y - n.y * half })
    ribRight.push({ x: p.x + n.x * half, y: p.y + n.y * half })
  }
  const middle = frame(0.55).p
  const tone = leaf.tone
  const own = stock.banana
  if (own) {
    // Its own colours: the blade from the paler back leaves (tone 0.55 and under) to the front ones (tone 1), an underside turned up a
    // little paler still; the narrow half in a deeper green; the midrib and veins pale; the outline (by night, the warm edge of the light).
    const front = Math.min(1, Math.max(0, (tone - 0.55) / 0.45))
    let blade = mixed(own.back, own.blade, front)
    if (leaf.pale) blade = mixed(blade, own.rib, 0.22)
    if (own.ramp) blade = tone >= 0.8 ? 'url(#bnf)' : 'url(#bnb)'
    return {
      defs: '',
      markup:
        `<path d="${outline}" fill="${blade}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
        (leaf.half >= 12 ? `<path d="${shade}" fill="${own.shade}" fill-opacity="${alpha(own.shadeAlpha * (leaf.pale ? 0.6 : 1))}"/>` : '') +
        `<path d="${band(ribLeft, ribRight)}${veins}" fill="${own.rib}" fill-opacity="${alpha(own.ribAlpha * (0.7 + 0.3 * tone))}"/>`,
    }
  }
  const fill = leaf.pale ? 0.045 : 0.11
  // The opaque ground and the wash over it are one colour, laid once.
  const markup =
    `<path d="${outline}" fill="${mixed(bananaGround(stock, middle.x, middle.y), stock.ink, alpha(fill * tone * stock.wash))}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${alpha(0.74 * tone * stock.line)}"/>` +
    (leaf.half >= 12 ? `<path d="${shade}" fill="${stock.ink}" fill-opacity="${alpha((leaf.pale ? 0.07 : 0.12) * tone * stock.wash)}"/>` : '') +
    `<path d="${band(ribLeft, ribRight)}${veins}" fill="${stock.ink}" fill-opacity="${alpha(0.72 * tone * stock.line)}"/>`
  return { defs: '', markup }
}

/** A pseudostem: a smooth column, swollen at the foot, tapering a little; two or three faint lines where its sheaths overlap, a few dark blotches, and at
 * its foot the dry shreds of old sheaths peeling away. No rings, no hatching, no fibre: those make a palm's trunk. */
function pseudostem(stem: Pseudostem, stock: Stock): string {
  const height = stem.foot.y - stem.top.y
  const point = (share: number, side: number): Point => {
    const swell = 1 + 0.3 * Math.pow(Math.max(0, 1 - share / 0.2), 2)
    const half = (stem.base + (stem.crown - stem.base) * share) * swell
    return { x: stem.foot.x + (stem.top.x - stem.foot.x) * share + side * half, y: stem.foot.y - height * share }
  }
  const shares = [0, 0.06, 0.16, 0.34, 0.55, 0.78, 1]
  const left = shares.map(share => point(share, -1))
  const right = shares.slice().reverse().map(share => point(share, 1))
  const d = smoothPath(left) + smoothPath(right).replace('M', 'L') + 'Z'
  const line = (lateral: number, from: number, to: number): string => {
    const points = [from, (from + to) / 2, to].map(share => {
      const p = point(share, lateral)
      return { x: p.x + (share === (from + to) / 2 ? 0.4 : 0), y: p.y }
    })
    return smoothPath(points)
  }
  const sheaths = line(-0.42, 0.08, 0.72) + line(0.18, 0.22, 0.97) + line(0.58, 0.05, 0.46)
  let blotches = ''
  for (let index = 0; index < 3; index += 1) {
    const p = point(0.2 + 0.6 * hashUnit(index, stem.salt), (hashUnit(index, stem.salt + 1) - 0.5) * 1.1)
    blotches += `M${at(p)}l${round(0.4 + 0.6 * hashUnit(index, stem.salt + 2))} ${round(1.2 + 1.4 * hashUnit(index, stem.salt + 3))}`
  }
  // Dry shreds at the foot, curling outward from both sides.
  let shreds = ''
  for (const [lateral, rise, reach] of [[-1, 5, 6], [-1, 11, 4.5], [1, 7, 5.5], [1, 3, 4]] as Array<[number, number, number]>) {
    const p = point(rise / height, lateral)
    shreds += `M${at(p)}q${round(lateral * reach * 0.5)} ${round(-0.6)} ${round(lateral * reach)} ${round(reach * 0.55)}`
  }
  const ground = bananaGround(stock, stem.foot.x, stem.foot.y - height / 2)
  const tone = stem.tone
  const own = stock.banana
  if (own) {
    const body = mixed(own.back, own.stem, Math.min(1, Math.max(0, (tone - 0.55) / 0.45)))
    return (
      `<path d="${d}" fill="${body}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
      `<path d="${sheaths}" stroke="${own.line}" stroke-width="0.55" stroke-opacity="${alpha(own.lineAlpha * 0.5)}"/>` +
      `<path d="${shreds}" stroke="${own.shred}" stroke-width="0.8" stroke-opacity="0.85"/>` +
      (stem.tone === 1 ? `<path d="${blotches}" stroke="${own.blotch}" stroke-width="1.3" stroke-opacity="0.5"/>` : '')
    )
  }
  return (
    `<path d="${d}" fill="${mixed(ground, stock.ink, alpha(0.12 * tone * stock.wash))}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${alpha(0.74 * tone * stock.line)}"/>` +
    `<path d="${sheaths}${shreds}" stroke="${stock.ink}" stroke-width="0.55" stroke-opacity="${alpha(0.42 * tone * stock.line)}"/>` +
    (stem.tone === 1 ? `<path d="${blotches}" stroke="${stock.ink}" stroke-width="1.3" stroke-opacity="${alpha(0.3 * tone * stock.line)}"/>` : '')
  )
}

/** The new leaf still rolled (蕉心), standing up out of the main stem: a pale slender spindle, pointed, the edge of its outer layer winding once round it. */
function furledLeaf(stock: Stock): string {
  const d = 'M327.6 762Q326 744 326.8 730Q327.4 722 329.2 715Q331.2 722 332.2 730Q333.8 746 334.6 762Z'
  const own = stock.banana
  if (own)
    return (
      `<path d="${d}" fill="${own.heart}" stroke="${own.line}" stroke-width="0.9" stroke-opacity="${alpha(own.lineAlpha)}"/>` +
      `<path d="M327.2 752Q330.4 744 333.2 734Q331.6 730 329.4 724" stroke="${own.line}" stroke-width="0.6" stroke-opacity="${alpha(own.lineAlpha * 0.6)}"/>`
    )
  return (
    `<path d="${d}" fill="${mixed(bananaGround(stock, 330, 738), stock.ink, alpha(0.05 * stock.wash))}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${alpha(0.74 * stock.line)}"/>` +
    `<path d="M327.2 752Q330.4 744 333.2 734Q331.6 730 329.4 724" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${alpha(0.5 * stock.line)}"/>`
  )
}

/** A dead leaf hanging folded down against the main stem (一葉舒則一葉焦): a narrow strip, darker and dry, frayed at its end. */
function deadLeaf(stock: Stock): string {
  const d = 'M328.4 773Q322 781 320.8 795Q319.8 809 321.6 823L320 828L322.8 826.4L323.6 831L325 825.6Q324.8 809 326 796Q327.2 783 331 776Z'
  const own = stock.banana
  if (own)
    return (
      `<path d="${d}" fill="${own.dead}" stroke="${own.deadLine}" stroke-width="0.8" stroke-opacity="0.7"/>` +
      `<path d="M329.2 775Q323.8 787 323.2 803Q323 815 323.4 823" stroke="${own.deadLine}" stroke-width="0.5" stroke-opacity="0.5"/>`
    )
  return (
    `<path d="${d}" fill="${mixed(bananaGround(stock, 323, 800), stock.ink, alpha(0.24 * stock.wash))}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${alpha(0.66 * stock.line)}"/>` +
    `<path d="M329.2 775Q323.8 787 323.2 803Q323 815 323.4 823" stroke="${stock.ink}" stroke-width="0.5" stroke-opacity="${alpha(0.45 * stock.line)}"/>`
  )
}

/** The clump in front of the wall's free end, back to front: the older stem and its leaves, the main stem, its leaves behind the rolled heart, the
 * heart, the leaves in front of it, the dead leaf, the sucker, and tufts of mondo grass (书带草) hiding where they all leave the ground. Moon Gate's
 * companion stone is left out here: the peak in the gate is the stone beside it (蕉石). */
function bananaPlant(stock: Stock): Built {
  let defs = ''
  let index = 0
  const leaves = (list: BananaLeaf[]): string =>
    list
      .map(leaf => {
        const built = bananaLeaf(leaf, `b${index}`, stock)
        index += 1
        defs += built.defs
        return built.markup
      })
      .join('')
  const [older, main] = STEMS
  const ramp = stock.banana?.ramp
  if (ramp)
    defs += ([['bnf', ramp.front], ['bnb', ramp.back]] as Array<[string, readonly [string, string]]>)
      .map(([id, [high, low]]) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${ramp.from}" x2="0" y2="${ramp.to}"><stop offset="0" stop-color="${high}"/><stop offset="1" stop-color="${low}"/></linearGradient>`)
      .join('')
  const line = (share: number): number => alpha(share * stock.line)
  const markup =
    (older ? pseudostem(older, stock) : '') +
    leaves(LEAVES.slice(0, 2)) +
    (main ? pseudostem(main, stock) : '') +
    leaves(LEAVES.slice(2)) +
    leaves(FRONT_LEAVES.slice(0, 1)) +
    furledLeaf(stock) +
    leaves(FRONT_LEAVES.slice(1)) +
    deadLeaf(stock) +
    `<path d="${tuft(318, GROUND + 1, 12, 61)}${tuft(327, GROUND + 1, 9, 62)}${tuft(349, GROUND + 1, 11, 63)}${tuft(366, GROUND + 1, 8, 64)}${tuft(300, GROUND + 1, 9, 67)}" stroke="${stock.tuft ?? stock.ink}" stroke-width="0.85" stroke-opacity="${line(0.7)}"/>`
  return { defs, markup }
}

// ---------------------------------------------------------------------------------------------------------------
// The small things

/** A lens of bare sky: a thin bar of cloud across the disc, or a bank of mist a wall sinks into. It takes the sky's colour where it lies and does not move. */
function mistMaker(sky: Sky, tone = '#ffffff', lift = 0): { bank: (cx: number, cy: number, rx: number, ry: number, peak: number, share?: number) => string; defs: () => string } {
  const gradients: string[] = []
  return {
    // `share` takes only part of the lift: a bank whose edge reaches into the reading column stays nearly the colour of the air there.
    bank(cx, cy, rx, ry, peak, share = 1) {
      const id = `n${gradients.length}`
      const colour = lift > 0 ? mixed(skyAt(sky, cx, cy), tone, lift * share) : skyAt(sky, cx, cy)
      if (peak <= 0) return ''
      gradients.push(
        `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${alpha(0.88 * peak)}"/><stop offset="0.45" stop-color="${colour}" stop-opacity="${alpha(0.7 * peak)}"/>` +
          `<stop offset="0.8" stop-color="${colour}" stop-opacity="${alpha(0.24 * peak)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
      )
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
    },
    defs: () => gradients.join(''),
  }
}

/** A small plain seal: a vermilion square with a ring standing on a line left bare, the gate itself. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<circle cx="12" cy="11" r="5.6" stroke="${bare}" stroke-width="1.7"/>` +
    `<path d="M4.6 19.4L19.4 19.4" stroke="${bare}" stroke-width="1.7"/></g>`
  )
}

/** A leaf that has left the bamboo. It is drawn where it rests when nothing moves; the animation carries it down from the crowns past that place. */
function fallingLeaf(name: string, x: number, y: number, degrees: number, seconds: number, delay: number, stock: Stock): string {
  const angle = (degrees * Math.PI) / 180
  const length = 17
  return (
    `<path class="${name}" style="transform-origin:${round(x + (Math.cos(angle) * length) / 2)}px ${round(y + (Math.sin(angle) * length) / 2)}px;animation-duration:${seconds}s;animation-delay:-${delay}s" ` +
    `d="${leaf(x, y, angle, length, 2)}" fill="${bambooPaint(stock).leaf}" fill-opacity="${alpha(0.8 * bambooPaint(stock).ink)}"/>`
  )
}


/** The left band, back to front: the light or the haze in the gate and the far edge of its sill; the bamboo; the peak on its planted bed;
 * the wall with the gate; by night the pool of light on the ground in front of the gate; mist at the wall's free end; the banana. */
export function leftBand(stock: Stock): Built {
  const wall = gateWall(stock)
  const peak = stone(PEAK, PEAK_AT, GROUND - 6, 0.68, stock, beyondGround(stock, PEAK_AT + 20, 740), true)
  const bed = peakBed(stock)
  const plant = bananaPlant(stock)
  const mist = mistMaker(stock.sky, stock.plaster.colour, stock.mistLift ?? 0)
  const onWall = stock.wallMist ?? 1
  const line = (share: number): number => alpha(share * stock.line)
  const lamp = stock.lamp
  const beyond =
    `<g transform="${BEYOND}">` +
    (lamp ? `<path class="flick" style="animation-duration:6.4s;animation-delay:-2s" d="${gateOpening()}" fill="url(#lamp)"/>` : `<ellipse cx="${GATE.x}" cy="${GROUND - 26}" rx="112" ry="30" fill="url(#haze)"/>`) +
    `<path d="M${GATE.x - 116} ${GROUND - 5}L${GATE.x + 116} ${GROUND - 5}" stroke="${lamp ? lamp.line : stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    '</g>'
  const markup =
    beyond +
    bamboo(stock) +
    `<g transform="${BEYOND}">${peak.markup}<g transform="translate(${BED_SHIFT} 0)">${bed.markup}</g></g>` +
    wall.markup +
    (lamp ? `<ellipse cx="${SG.x}" cy="${FLOOR + 5}" rx="${round(150 * K)}" ry="12" fill="url(#pool)"/>` : '') +
    mist.bank(426, 826, 76, 22, 0.9 * onWall, 0.2) +
    mist.bank(432, 712, 50, 10, 0.7 * onWall, 0.2) +
    `<g transform="${PLANT}">${plant.markup}</g>`
  const defs =
    mist.defs() +
    (lamp
      ? ''
      : `<radialGradient id="haze"><stop offset="0" stop-color="${stock.plaster.colour}" stop-opacity="${alpha((stock.haze ?? stock.plaster.alpha) * 0.8)}"/><stop offset="0.6" stop-color="${stock.plaster.colour}" stop-opacity="${alpha((stock.haze ?? stock.plaster.alpha) * 0.36)}"/><stop offset="1" stop-color="${stock.plaster.colour}" stop-opacity="0"/></radialGradient>`) +
    lampDefs(stock) +
    (stock.bambooRamp
      ? `<linearGradient id="bam" gradientUnits="userSpaceOnUse" x1="0" y1="${stock.bambooRamp.from}" x2="0" y2="${stock.bambooRamp.to}">` +
        stock.bambooRamp.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
        '</linearGradient>'
      : '') +
    wall.defs +
    peak.defs +
    bed.defs +
    plant.defs
  return { defs, markup }
}
}

// ---------------------------------------------------------------------------------------------------------------------
// The sheet: the moon over both, the gate wall on the left, the pavilion on the water on the right.

/** The moon (by day the sun): high and just right of the reading column, larger than on the other sheets. */
const MOON = { x: 1316, y: 148, r: 34 }

/** The pavilion side is drawn in the Pavilion sheet's own units and carried onto this one in a fixed group: 0.8 of its size, the
 * pavilion's centre moved from (1462, 687) to (1452, 712), so it stands further off than the gate and a little higher. */
const PS = 0.8
const PX = 1452 - 1462 * PS
const PY = 712 - 687 * PS

function onSheet(x: number, y: number): Point {
  return pt(PX + x * PS, PY + y * PS)
}

/** One stock of the whole sheet: the shared sky, the moon, and the paints of each side. */
interface Fused {
  sky: Sky
  disc: string
  discAlpha: number
  /** The tight glow round the disc: its strength, colour and radius. */
  halo: number
  haloColour: string
  haloR: number
  /** The band of cloud across the moon's lower part: its cover from its middle (0) to its rim (1), and how far its colour is taken
   * from the sky toward `cloudTone` (by day a little lighter than the air; by night the ground's own colour, so it dims the disc). */
  cloudStops: ReadonlyArray<readonly [number, number]>
  cloudTone: string
  cloudLift: number
  /** The moon's light broken on the water under it: the strokes' colour and cover, and a soft glow on the water (0: none). */
  glint: string
  glintAlpha: number
  glintGlow: number
  pav: Stock
  gate: G.Stock
}

/** By day: Lattice Windows' chosen clear day (晴日写真), its warm haze gathered round this sheet's sun and kept out of the column. */
const DAY_SKY: Sky = {
  base: [[0, '#cfdae6'], [0.5, '#d3dce7'], [1, '#d8dee8']],
  glows: [
    { x: 1352, y: 140, r: 200, colour: '#ffefd4', alpha: 0.62 },
    { x: -120, y: 40, r: 720, colour: '#c1d0e1', alpha: 0.15 },
    { x: 1480, y: 1060, r: 600, colour: '#e4dfe2', alpha: 0.45 },
  ],
}

/** By night: the chosen moon glow (Lattice Windows' nightMoonGlow), a warm black ground and one small pale yellow glow round the moon. */
const NIGHT_SKY: Sky = {
  base: [[0, '#1b1915'], [1, '#141210']],
  glows: [{ x: 1340, y: 138, r: 168, colour: '#eadf9f', alpha: 0.3 }],
}

const FUSED: { day: Fused; night: Fused } = {
  day: {
    sky: DAY_SKY,
    disc: '#eb976a', discAlpha: 0.94, halo: 0.3, haloColour: '#f5c39a', haloR: 100,
    cloudStops: [[0, 0.7], [0.45, 0.6], [0.8, 0.2], [1, 0]], cloudTone: '#fefefe', cloudLift: 0.55,
    glint: '#ffffff', glintAlpha: 0.8, glintGlow: 0,
    pav: {
      sky: DAY_SKY,
      ink: '#262b33', disc: '#eb976a', seal: '#b8432e', wall: '#ffffff', wallAlpha: 0.5, bloom: '#ddb3d0', shade: '#262b33', shadeAlpha: 1, wash: 1, line: 1.1,
      halo: 0.3, haloColour: '#f5c39a', haloR: 96, discAlpha: 0.94,
      paint: {
        plaster: '#fefefe', plinth: '#fdfdfd', cool: '#3c4a5c', coolAlpha: 0.3,
        tile: '#262b33', tileLight: 0.02, lime: '#ffffff', rib: 0.2, groove: '#14171d', grooveAlpha: 0.55,
        soffit: '#3a3a40', soffitAlpha: 0.78,
        wood: '#4a3b38', woodFar: '#4a3b38', woodFarAlpha: 0.6, rail: '#4a3b38',
        stone: '#dfe3e8', stoneLit: '#ffffff', stoneLitAlpha: 0.8, stoneWash: '#3c4a5c', stoneWashAlpha: 1, hollow: '#232a35', hollowAlpha: 1, stoneLine: '#262b33',
        deck: '#f5f6f8',
        bough: '#544a48', boughAlpha: 0.9, willowNear: '#4f7358', willowFar: '#7c9a84', willowAlpha: 1,
        leaf: '#5f8068', leafFloat: '#7c9a84', leafLine: '#33493c', leafLineAlpha: 0.8, vein: '#e9efe9', veinAlpha: 0.42,
        petal: '#ffffff', flush: '#ddb3d0', petalLine: '#4a3d50', petalLineAlpha: 0.78,
        water: '#b4c6dc', waterAlpha: 0.42, ripple: '#55667c',
      },
    },
    gate: {
      sky: DAY_SKY,
      dark: false, ink: '#262b33', disc: '#eb976a', seal: '#b8432e', wash: 1, line: 1.1, halo: 0.3,
      plaster: { colour: '#fefefe', alpha: 1 },
      tile: { colour: '#262b33', alpha: 1 },
      row: { colour: '#262b33', alpha: 0 },
      eave: { colour: '#262b33', alpha: 1 },
      ridge: { colour: '#262b33', alpha: 1 },
      glint: { colour: '#fefefe', alpha: 0.2 },
      stain: 0.045,
      rib: 0.15,
      brick: { colour: '#3c4a5c', alpha: 0.3 },
      shade: '#3c4a5c', eaveShade: 2.6, plinth: 0.07, coverLight: 0.02,
      mistLift: 0.55, haze: 0.6, stoneLift: 0.12,
      bamboo: { leaf: '#4f7358', cane: '#3f5a48' },
      tuft: '#4a6650',
      banana: {
        blade: '#86a083', back: '#a9b9a3', shade: '#5d7a5e', shadeAlpha: 0.3, rib: '#dfe5d2', ribAlpha: 0.85,
        line: '#3b4a3e', lineAlpha: 0.72, stem: '#94a888', blotch: '#6e6a5c', shred: '#9b8466', heart: '#b9c9aa', dead: '#a8946e', deadLine: '#5e4e3a',
      },
    },
  },
  night: {
    sky: NIGHT_SKY,
    disc: '#f8f1cf', discAlpha: 1, halo: 0.3, haloColour: '#efe2a8', haloR: 104,
    cloudStops: [[0, 0.55], [0.35, 0.45], [1, 0]], cloudTone: '#eadf9f', cloudLift: 0,
    glint: '#efe2a8', glintAlpha: 0.85, glintGlow: 0.14,
    pav: {
      sky: NIGHT_SKY,
      ink: '#ece7d8', disc: '#f8f1cf', seal: '#a64a3c', wall: '#d8d4c8', wallAlpha: 1, bloom: '#e2cbb8', shade: '#0e0c0a', shadeAlpha: 0.9, wash: 0.5, line: 0.8,
      halo: 0.3, haloColour: '#efe2a8', haloR: 104, discAlpha: 1,
      paint: {
        plaster: '#d8d4c8', plinth: '#b4b0a5', cool: '#0e0c0a', coolAlpha: 0.5,
        tile: '#0c0a09', tileLight: 0, lime: '#ece7d8', rib: 0.1, groove: '#050403', grooveAlpha: 0.5,
        soffit: '#0c0a09', soffitAlpha: 0.9,
        wood: '#1d1813', woodFar: '#c8925e', woodFarAlpha: 0.55, rail: '#f6d7a0',
        stone: '#46443e', stoneLit: '#d8d4c8', stoneLitAlpha: 0.22, stoneWash: '#0e0c0a', stoneWashAlpha: 0.7, hollow: '#080706', hollowAlpha: 0.9, stoneLine: '#ece7d8',
        deck: '#6e6a60',
        bough: '#b3ad94', boughAlpha: 0.7, willowNear: '#b3ad94', willowFar: '#85806c', willowAlpha: 0.8,
        leaf: '#34352d', leafFloat: '#2d2e28', leafLine: '#c9c3b0', leafLineAlpha: 0.6, vein: '#c9c3b0', veinAlpha: 0.22,
        petal: '#f3ecdc', flush: '#e2cbb8', petalLine: '#221c16', petalLineAlpha: 0.6,
        water: '#141210', waterAlpha: 0, ripple: '#c9c3b0',
        lamp: {
          stops: [[0, '#fae2b0', 1], [0.3, '#f2c27a', 0.86], [0.62, '#de9c58', 0.38], [1, '#c4844e', 0]],
          spill: '#eea87e',
          spillStops: [[0, 0.85], [0.42, 0.6], [0.7, 0.24], [1, 0]],
          reflect: '#f2c27a',
        },
      },
    },
    gate: {
      sky: NIGHT_SKY,
      dark: true, ink: '#ece7d8', disc: '#f8f1cf', seal: '#a64a3c', wash: 0.8, line: 0.8, halo: 0.3,
      plaster: { colour: '#d8d4c8', alpha: 1 },
      tile: { colour: '#0c0a09', alpha: 1 },
      row: { colour: '#0c0a09', alpha: 0 },
      eave: { colour: '#0c0a09', alpha: 1 },
      ridge: { colour: '#0c0a09', alpha: 1 },
      glint: { colour: '#ece7d8', alpha: 0.24 },
      stain: 0.1,
      rib: 0.34,
      brick: { colour: '#0e0c0a', alpha: 0.5 },
      eaveShade: 2.4, plinth: 0.16, coverLight: 0.03, edgeInk: '#0c0a09',
      haze: 0, stoneLift: 0.22, wallMist: 0,
      bambooRamp: { from: 330, to: 560, stops: [[0, '#85806c'], [0.6, '#b3ad94'], [1, '#1d1813']] }, bambooInk: 1.1,
      banana: {
        blade: '#3a3830', back: '#302e28', shade: '#141210', shadeAlpha: 0.4, rib: '#8c8776', ribAlpha: 0.7,
        line: '#e2b07c', lineAlpha: 0.45, stem: '#3a372e', blotch: '#141210', shred: '#6a5e4a', heart: '#4f4c42', dead: '#5a5040', deadLine: '#c99a68',
      },
      lamp: {
        stops: [[0, '#fae2b0'], [0.35, '#f2c27a'], [0.75, '#de9c58'], [1, '#c4844e']],
        spill: '#eea87e',
        spillStops: [[0, 0.85], [0.6, 0.6], [0.8, 0.22], [1, 0]],
        soffit: 0.45,
        pool: 0.42,
        ground: '#1f1b16',
        line: '#f0bc86',
        washStops: [[0, 0.34], [0.45, 0.14], [1, 0.02]],
      },
    },
  },
}

/** The whole sheet on one stock. */
function fusedSheet(f: Fused): string {
  const sky = f.sky
  const stock = f.pav
  const p = stock.paint
  const lamp = p?.lamp
  const ink = stock.ink
  const gradients: string[] = []
  /** A lens of bare sky, in the Pavilion sheet's units (it lies in that group): it lets a thing sink into the water or the mist. It does
   * not move. On the water of the day sheet it takes the water's own tint, so it does not lay a band of air across the pond. */
  const mist = (cx: number, cy: number, rx: number, ry: number, strength: number, onWater = false): string => {
    const id = `m${gradients.length}`
    const there = onSheet(cx, cy)
    const air = skyAt(sky, there.x, there.y)
    const colour = onWater && p && p.waterAlpha > 0 ? mixed(air, p.water, p.waterAlpha * 0.8) : air
    gradients.push(
      `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${colour}" stop-opacity="${share(strength * 0.72)}"/>` +
        `<stop offset="0.82" stop-color="${colour}" stop-opacity="${share(strength * 0.22)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
    )
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
  }
  /** A band of cloud across the moon, in the sheet's units, drifting slowly sideways and back. */
  const cloud = (cx: number, cy: number, rx: number, ry: number, reach: number, seconds: number, delay: number): string => {
    const id = `m${gradients.length}`
    const air = skyAt(sky, cx, cy)
    const colour = f.cloudLift > 0 ? mixed(air, f.cloudTone, f.cloudLift) : air
    gradients.push(`<radialGradient id="${id}">` + f.cloudStops.map(([offset, part]) => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${share(part)}"/>`).join('') + '</radialGradient>')
    return `<ellipse class="drift" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" style="--reach:${reach}px;animation-duration:${seconds}s;animation-delay:-${delay}s"/>`
  }
  /** The water's tint (a breath bluer than the air), as a soft lens; none by night. */
  const waterTint = (cx: number, cy: number, rx: number, ry: number): string =>
    p && p.waterAlpha > 0 ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#wt)"/>` : ''
  /** A ripple, in the sheet's units: three rings from one point, each widening and fading in turn. At rest they stand as three still rings. */
  const ripple = (cx: number, cy: number, rx: number, seconds: number, delay: number): string => {
    let rings = ''
    for (let ring = 0; ring < 3; ring += 1) {
      const at0 = (ring + 0.6) / 3
      rings +=
        `<ellipse class="ring" cx="${cx}" cy="${cy}" rx="${rx}" ry="${round(rx * 0.26)}" ` +
        `style="transform-origin:${cx}px ${cy}px;transform:scale(${round(at0 * 10) / 10});opacity:${share(0.62 * (1 - at0 * 0.8))};animation-duration:${seconds}s;animation-delay:-${round(delay + (seconds * ring) / 3)}s"/>`
    }
    return rings
  }
  /** One level stroke on the water, faintly waved. */
  const stroke = (x1: number, x2: number, y: number): string => {
    const quarter = round((x2 - x1) / 4)
    return `M${x1} ${y}q${quarter} -1.3 ${quarter * 2} 0t${quarter * 2} 0`
  }
  // By night the strokes under the middle of the pavilion carry its light, the more the nearer the middle; the rest are the pale ink of the water.
  const lit = (x1: number, x2: number): string => {
    if (!lamp) return ''
    const off = Math.abs((x1 + x2) / 2 - 1462)
    return off < 56 ? ` stroke="${lamp.reflect}"` : ''
  }
  const litStrength = (x1: number, x2: number, strength: number): number => {
    if (!lamp) return strength
    const off = Math.abs((x1 + x2) / 2 - 1462)
    return off < 56 ? Math.min(1, strength * (2.1 - off / 56)) : strength * 0.6
  }
  const shimmer = (x1: number, x2: number, y: number, strength: number, index: number, width = 1.2): string =>
    `<path class="shim" d="${stroke(x1, x2, y)}"${lit(x1, x2)} stroke-width="${width}" stroke-opacity="${share(litStrength(x1, x2, strength) * stock.line)}" style="animation-duration:${round(6 + hashUnit(index, 41) * 5)}s;animation-delay:-${round(hashUnit(index, 43) * 8)}s"/>`
  const still = (x1: number, x2: number, y: number, strength: number, width = 1.2): string =>
    `<path d="${stroke(x1, x2, y)}"${lit(x1, x2)} stroke-width="${width}" stroke-opacity="${share(litStrength(x1, x2, strength) * 0.8 * stock.line)}"/>`

  const WATER = 856
  const span = bridge(stock, 824)
  const house = pavilion(stock, 1462, 687, 1)
  const back = rockery(stock, ROCKERY_BACK, 'kb')
  const front = rockery(stock, ROCKERY_FRONT, 'kf')
  const left = G.leftBand(f.gate)
  const waterInk = p ? p.ripple : ink

  // The moon, its glow, and the cloud drifting across its lower part.
  const disc =
    (f.halo > 0 ? `<circle cx="${MOON.x}" cy="${MOON.y}" r="${f.haloR}" fill="url(#halo)"/>` : '') +
    `<circle cx="${MOON.x}" cy="${MOON.y}" r="${MOON.r}" fill="${f.disc}" fill-opacity="${f.discAlpha}"/>` +
    cloud(MOON.x - 4, MOON.y + 15, 90, 6.4, 14, 120, 20) +
    cloud(MOON.x + 30, MOON.y + 30, 54, 3.6, -12, 96, 50)

  // Under the pavilion, the light it throws on the water (by night), and the broken strokes of its reflection.
  const glowOnWater = lamp ? `<ellipse cx="1462" cy="${WATER + 30}" rx="44" ry="34" fill="url(#pr)"/>` : ''
  const reflections =
    glowOnWater +
    `<g stroke="${waterInk}">` +
    still(1412, 1454, WATER + 10, 0.44, 1.4) +
    shimmer(1468, 1552, WATER + 11, 0.48, 2, 1.4) +
    still(1424, 1472, WATER + 21, 0.38, 1.3) +
    shimmer(1486, 1516, WATER + 20, 0.4, 3, 1.3) +
    shimmer(1528, 1580, WATER + 22, 0.3, 4, 1.2) +
    shimmer(1442, 1520, WATER + 31, 0.32, 5, 1.1) +
    shimmer(1452, 1488, WATER + 42, 0.28, 6, 1) +
    shimmer(1500, 1542, WATER + 45, 0.24, 7, 1) +
    shimmer(1460, 1512, WATER + 56, 0.2, 8, 0.9) +
    '</g>'

  // The pavilion side, in the Pavilion sheet's units.
  const waterSide =
    `<g transform="matrix(${PS} 0 0 ${PS} ${round(PX)} ${round(PY)})">` +
    span.markup + mist(1172, 812, 30, 20, 0.75) + waterTint(1440, 890, 190, 40) +
    back.markup + house.markup + front.markup + tuft(stock, 1476, 827, 10, 67) +
    mist(1490, WATER + 8, 130, 10, 0.8, true) +
    reflections +
    '</g>'

  // The moon's light on the water under it, held still beside the prompt box.
  const glints: Array<[number, number, number]> = [[856, 22, 0.8], [864, 14, 0.66], [872, 19, 0.6], [882, 10, 0.5], [893, 14, 0.42], [906, 8, 0.34], [920, 9, 0.26]]
  const moonWater =
    (f.glintGlow > 0 ? `<ellipse cx="${MOON.x}" cy="884" rx="46" ry="34" fill="url(#mg)"/>` : '') +
    `<g stroke="${f.glint}">` +
    glints
      .map(([y, half, strength], index) => {
        const x = MOON.x + (hashUnit(index, 71) - 0.5) * 9
        return `<path d="${stroke(round(x - half), round(x + half), y)}" stroke-width="${index < 3 ? 1.4 : 1.1}" stroke-opacity="${share(strength * f.glintAlpha)}"/>`
      })
      .join('') +
    '</g>'

  // Lotus in the water in front of the pavilion, lower right: two raised leaves, a bud, a floating leaf.
  const BUD = 832
  const lotus =
    lotusLeaf(stock, 1546, 874, 25, 11, -0.3, 3, 0.18, 924, -1, -6) +
    lotusLeaf(stock, 1590, 862, 21, 9.5, 0.36, 5, 0.18, 920, 1, 12) +
    lotusBud(stock, 1570, BUD, 0.85, 1566, 918) +
    lotusLeaf(stock, 1518, 930, 22, 7.6, -0.05, 7, 0.21, 0, 1)

  const rings = `<g stroke="${waterInk}" stroke-width="1.1" stroke-opacity="${share(0.6 * stock.line)}">` + ripple(1500, 884, 21, 13, 0) + '</g>'

  const style = `
.ring{animation:ring 13s linear infinite}
.shim{animation:shim 8s ease-in-out infinite alternate}
.sw{animation:sw 6s ease-in-out infinite alternate}
.cr{animation:sw 11s ease-in-out infinite alternate}
.drift{animation:drift 150s ease-in-out infinite alternate}
.flick{animation:flick 5.2s ease-in-out infinite}
@keyframes ring{0%{transform:scale(.08);opacity:0}14%{opacity:.7}100%{transform:scale(1);opacity:0}}
@keyframes shim{from{transform:translateX(-3px);opacity:.5}to{transform:translateX(4px);opacity:1}}
@keyframes sw{from{transform:rotate(calc(var(--a) * -1))}to{transform:rotate(var(--a))}}
@keyframes drift{from{transform:translateX(calc(var(--reach) * -1))}to{transform:translateX(var(--reach))}}
@keyframes flick{0%{opacity:1}30%{opacity:.84}52%{opacity:.96}74%{opacity:.88}100%{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  // Built in drawing order, so that every lens of mist has made its gradient before the defs are written.
  const drawing = `${disc}
${left.markup}
${waterSide}
${moonWater}${lotus}${rings}
${seal(214, 904, stock)}`

  const defs =
    skyDefs(sky) +
    gradients.join('') +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${f.haloColour}" stop-opacity="${f.halo}"/><stop offset="1" stop-color="${f.haloColour}" stop-opacity="0"/></radialGradient>` +
    // The rockery's lines fade into the water; the hollows under its lips are darkest at the stone and gone in the water (Pavilion units).
    `<linearGradient id="rs" gradientUnits="userSpaceOnUse" x1="0" y1="840" x2="0" y2="860"><stop offset="0" stop-color="${lamp ? mixed(ink, lamp.spill, 0.45) : ink}"/><stop offset="1" stop-color="${lamp ? mixed(ink, lamp.spill, 0.45) : ink}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="rc" gradientUnits="userSpaceOnUse" x1="0" y1="847" x2="0" y2="859"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.72 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="${share(0.12 * stock.shadeAlpha)}"/></linearGradient>` +
    `<linearGradient id="ru" gradientUnits="userSpaceOnUse" x1="0" y1="842" x2="0" y2="860"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>` +
    (p
      ? // The lotus bud: flushed at its tip, white below.
        `<linearGradient id="bud" gradientUnits="userSpaceOnUse" x1="0" y1="${BUD}" x2="0" y2="${round(BUD + 19 * 0.85)}"><stop offset="0" stop-color="${p.flush}"/><stop offset="0.5" stop-color="${mixed(p.petal, p.flush, 0.3)}"/><stop offset="1" stop-color="${p.petal}"/></linearGradient>` +
        (p.waterAlpha > 0
          ? `<radialGradient id="wt"><stop offset="0" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha)}"/><stop offset="0.6" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha * 0.7)}"/><stop offset="1" stop-color="${p.water}" stop-opacity="0"/></radialGradient>`
          : '') +
        (lamp
          ? `<radialGradient id="pr"><stop offset="0" stop-color="${lamp.reflect}" stop-opacity="0.34"/><stop offset="0.5" stop-color="${lamp.reflect}" stop-opacity="0.16"/><stop offset="1" stop-color="${lamp.reflect}" stop-opacity="0"/></radialGradient>`
          : '')
      : '') +
    (f.glintGlow > 0
      ? `<radialGradient id="mg"><stop offset="0" stop-color="${f.glint}" stop-opacity="${share(f.glintGlow)}"/><stop offset="0.55" stop-color="${f.glint}" stop-opacity="${share(f.glintGlow * 0.45)}"/><stop offset="1" stop-color="${f.glint}" stop-opacity="0"/></radialGradient>`
      : '') +
    back.defs +
    front.defs +
    span.defs +
    house.defs +
    left.defs

  const ground = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${ground}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Garden under the Moon on a clear day (晴日写真), for a light window. */
export function daySvg(): string {
  return fusedSheet(FUSED.day)
}

/** Garden under the Moon by moonlight (月色), for a dark window: warm black air, the pavilion and the courtyard beyond the gate lit amber. */
export function nightSvg(): string {
  return fusedSheet(FUSED.night)
}
