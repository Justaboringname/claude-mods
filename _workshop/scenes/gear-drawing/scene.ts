// Gear Drawing: an engineer's sheet of a small spur gear train, seen in elevation.
// Right band: a 16-tooth pinion drives a 24-tooth gear above it and a 40-tooth wheel below it. The flanks are true involutes
// (20 degree pressure angle), the pitch circles are tangent, and each gear turns at a speed inversely proportional to its
// tooth count, so the teeth really mesh: the pinion's leading flanks stay in contact, the trailing ones keep their backlash.
// Over the gears lie the fixed lines of the drawing: chain centre lines, pitch circles in thin red dashes, a few dimensions.
// Left band: the construction of the flank itself. A taut string unwinds off a base circle and its pen draws the involute,
// which is washed away and drawn again. Lettering is a single-stroke plotter alphabet, so no font is needed.
// Two stocks: warm paper for a light window, warm charcoal for a dark one. Pure string building, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000
const TAU = Math.PI * 2
/** Pixels of pitch diameter per tooth. The sheet is drawn at 3.6 px to the millimetre, so this is module 2.5. */
const MODULE = 9
const PRESSURE_ANGLE = (20 * Math.PI) / 180
/** Play between the idle flanks at the pitch circle, in pixels: enough that two pen lines do not run together. */
const BACKLASH = 1.8
/** Straight pieces per involute flank. */
const FLANK_STEPS = 5

interface Stock {
  paper: string
  /** A faint tint inside the gear blanks, so they read as solid against the paper. */
  body: string
  bodyOpacity: number
  ink: string
  red: string
  /** Opacity of an object line; the finer lines are scaled from it. */
  line: number
  /** Opacity of the dashed pitch circles. */
  pitch: number
}

const DAY: Stock = { paper: '#f3eee3', body: '#e6dcc8', bodyOpacity: 0.5, ink: '#2b2824', red: '#c4472c', line: 0.82, pitch: 0.85 }
/** The same sheet in pale ink on warm charcoal: no blue anywhere. */
const NIGHT: Stock = { paper: '#231c15', body: '#31271c', bodyOpacity: 0.6, ink: '#dccdb2', red: '#e58a5b', line: 0.7, pitch: 0.7 }

interface Point {
  x: number
  y: number
}

interface Gear {
  teeth: number
  x: number
  y: number
  /** Angle of the centre of tooth 0. Angles are radians, clockwise on screen from the +x axis, the way CSS rotate() turns. */
  phase: number
  clockwise: boolean
  seconds: number
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function fine(value: number): number {
  return Math.round(value * 100) / 100
}

function at(centreX: number, centreY: number, radius: number, angle: number): Point {
  return { x: centreX + radius * Math.cos(angle), y: centreY + radius * Math.sin(angle) }
}

function xy(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

/** A point `distance` along the way from one point toward another. */
function toward(from: Point, to: Point, distance: number): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  return { x: from.x + ((to.x - from.x) * distance) / length, y: from.y + ((to.y - from.y) * distance) / length }
}

function pitchRadius(teeth: number): number {
  return (MODULE * teeth) / 2
}

function tipRadius(teeth: number): number {
  return pitchRadius(teeth) + MODULE
}

function involuteOf(angle: number): number {
  return Math.tan(angle) - angle
}

/**
 * A gear in mesh with `driver`, its centre (dx, dy) away. With a driver tooth on the line of centres the driven gear shows a gap there;
 * from that pose it is turned by half the backlash, so that the driver's leading flanks touch and the trailing ones stand clear.
 */
function meshed(driver: Gear, teeth: number, dx: number, dy: number): Gear {
  const bearing = Math.atan2(dy, dx)
  const takeUp = ((driver.clockwise ? 1 : -1) * BACKLASH) / 2 / pitchRadius(teeth)
  const phase = bearing + Math.PI + Math.PI / teeth - (driver.phase - bearing) * (driver.teeth / teeth) + takeUp
  return { teeth, x: driver.x + dx, y: driver.y + dy, phase, clockwise: !driver.clockwise, seconds: (driver.seconds * teeth) / driver.teeth }
}

// Centre distances 50 and 70 mm, each laid out as a 3-4-5 triangle, so the coordinate dimensions come out whole: 40 up, 56 down.
const PINION: Gear = { teeth: 16, x: 1356, y: 497, phase: 0.1, clockwise: true, seconds: 48 }
const WHEEL: Gear = meshed(PINION, 40, 151.2, 201.6)
const SPUR: Gear = meshed(PINION, 24, 108, -144)

/** The toothed outline: root arc, fillet, a radial foot below the base circle, involute flank, tip arc, and down again. */
function gearOutline(gear: Gear): string {
  const pitch = pitchRadius(gear.teeth)
  const base = pitch * Math.cos(PRESSURE_ANGLE)
  const tip = tipRadius(gear.teeth)
  const root = pitch - 1.25 * MODULE
  const fillet = 0.3 * MODULE
  const halfTooth = Math.PI / (2 * gear.teeth) - BACKLASH / (4 * pitch)
  /** Half the tooth's angular thickness at a radius. */
  const halfAt = (radius: number): number =>
    radius <= base ? halfTooth + involuteOf(PRESSURE_ANGLE) : halfTooth + involuteOf(PRESSURE_ANGLE) - involuteOf(Math.acos(base / radius))

  const foot = root + fillet
  const radii: number[] = []
  if (foot < base) radii.push(foot)
  const rollFrom = Math.sqrt(Math.max(0, (Math.max(foot, base) / base) ** 2 - 1))
  const rollTo = Math.sqrt((tip / base) ** 2 - 1)
  for (let step = 0; step <= FLANK_STEPS; step += 1) {
    const roll = rollFrom + ((rollTo - rollFrom) * step) / FLANK_STEPS
    radii.push(base * Math.sqrt(1 + roll * roll))
  }
  const footHalf = halfAt(foot)
  const footTurn = fillet / root
  const toothTurn = TAU / gear.teeth

  let path = ''
  for (let tooth = 0; tooth < gear.teeth; tooth += 1) {
    const centre = gear.phase + tooth * toothTurn
    if (tooth === 0) path = `M${xy(at(gear.x, gear.y, root, centre - footHalf - footTurn))}`
    path += `Q${xy(at(gear.x, gear.y, root, centre - footHalf))} `
    path += radii.map(radius => xy(at(gear.x, gear.y, radius, centre - halfAt(radius)))).join('L')
    path += `A${fine(tip)} ${fine(tip)} 0 0 1 `
    path += radii
      .slice()
      .reverse()
      .map(radius => xy(at(gear.x, gear.y, radius, centre + halfAt(radius))))
      .join('L')
    path += `Q${xy(at(gear.x, gear.y, root, centre + footHalf))} ${xy(at(gear.x, gear.y, root, centre + footHalf + footTurn))}`
    path += `A${fine(root)} ${fine(root)} 0 0 1 ${xy(at(gear.x, gear.y, root, centre + toothTurn - footHalf - footTurn))}`
  }
  return `${path}Z`
}

/** A full circle as a path, starting at `from`. */
function circle(centreX: number, centreY: number, radius: number, from = 0): string {
  const start = xy(at(centreX, centreY, radius, from))
  const half = xy(at(centreX, centreY, radius, from + Math.PI))
  return `M${start}A${radius} ${radius} 0 1 1 ${half}A${radius} ${radius} 0 1 1 ${start}Z`
}

/** A bore with a keyway cut outward at `angle`. */
function keyedBore(centreX: number, centreY: number, radius: number, halfKey: number, depth: number, angle: number): string {
  const open = Math.asin(halfKey / radius)
  const across = { x: -Math.sin(angle) * halfKey, y: Math.cos(angle) * halfKey }
  const top = at(centreX, centreY, radius + depth, angle)
  return (
    `M${xy(at(centreX, centreY, radius, angle + open))}A${radius} ${radius} 0 1 1 ${xy(at(centreX, centreY, radius, angle - open))}` +
    `L${xy({ x: top.x - across.x, y: top.y - across.y })}L${xy({ x: top.x + across.x, y: top.y + across.y })}Z`
  )
}

/** The key itself: half in the shaft, half in the hub. */
function key(centreX: number, centreY: number, radius: number, halfKey: number, depth: number, angle: number): string {
  const across = { x: -Math.sin(angle) * halfKey, y: Math.cos(angle) * halfKey }
  const low = at(centreX, centreY, radius - depth, angle)
  const high = at(centreX, centreY, radius + depth, angle)
  return `M${xy({ x: low.x - across.x, y: low.y - across.y })}L${xy({ x: high.x - across.x, y: high.y - across.y })}L${xy({ x: high.x + across.x, y: high.y + across.y })}L${xy({ x: low.x + across.x, y: low.y + across.y })}Z`
}

function polygon(centreX: number, centreY: number, radius: number, sides: number, from: number): Point[] {
  const points: Point[] = []
  for (let side = 0; side < sides; side += 1) points.push(at(centreX, centreY, radius, from + (side * TAU) / sides))
  return points
}

function closed(points: Point[]): string {
  return `M${points.map(xy).join('L')}Z`
}

/** Section hatching across a convex outline: parallel strokes at `angle`, `spacing` apart. */
function hatch(points: Point[], angle: number, spacing: number): string {
  const normalX = -Math.sin(angle)
  const normalY = Math.cos(angle)
  const reach = points.map(point => point.x * normalX + point.y * normalY)
  const low = Math.min(...reach)
  const high = Math.max(...reach)
  const count = Math.floor((high - low) / spacing)
  const first = low + (high - low - count * spacing) / 2 + spacing / 2
  let path = ''
  for (let line = 0; line < count; line += 1) {
    const offset = first + line * spacing
    const ends: Point[] = []
    for (let index = 0; index < points.length; index += 1) {
      const here = points[index]
      const next = points[(index + 1) % points.length]
      if (!here || !next) continue
      const before = here.x * normalX + here.y * normalY - offset
      const after = next.x * normalX + next.y * normalY - offset
      if (before * after < 0) {
        const share = before / (before - after)
        ends.push({ x: here.x + (next.x - here.x) * share, y: here.y + (next.y - here.y) * share })
      }
    }
    const from = ends[0]
    const to = ends[1]
    if (from && to && Math.hypot(to.x - from.x, to.y - from.y) > 4) path += `M${xy(from)}L${xy(to)}`
  }
  return path
}

/** A lightening pocket between two spokes whose axes lie at `from` and `to`: an annular sector with parallel-sided spokes and eased corners. */
function pocket(centreX: number, centreY: number, inner: number, outer: number, halfSpoke: number, corner: number, from: number, to: number): string {
  const outerFrom = from + Math.asin(halfSpoke / outer)
  const outerTo = to - Math.asin(halfSpoke / outer)
  const innerFrom = from + Math.asin(halfSpoke / inner)
  const innerTo = to - Math.asin(halfSpoke / inner)
  const a = at(centreX, centreY, outer, outerFrom)
  const b = at(centreX, centreY, outer, outerTo)
  const c = at(centreX, centreY, inner, innerTo)
  const d = at(centreX, centreY, inner, innerFrom)
  const start = xy(at(centreX, centreY, outer, outerFrom + corner / outer))
  return (
    `M${start}A${outer} ${outer} 0 0 1 ${xy(at(centreX, centreY, outer, outerTo - corner / outer))}` +
    `Q${xy(b)} ${xy(toward(b, c, corner))}L${xy(toward(c, b, corner))}` +
    `Q${xy(c)} ${xy(at(centreX, centreY, inner, innerTo - corner / inner))}A${inner} ${inner} 0 0 0 ${xy(at(centreX, centreY, inner, innerFrom + corner / inner))}` +
    `Q${xy(d)} ${xy(toward(d, a, corner))}L${xy(toward(a, d, corner))}Q${xy(a)} ${start}Z`
  )
}

/** One gear: everything in here turns with it. The holes are cut out of the tinted blank; the shaft in the bore is hatched as a section. */
function turning(gear: Gear, holes: string, details: string): string {
  return (
    `<g class="${gear.clockwise ? 'cw' : 'ccw'}" style="transform-origin:${fine(gear.x)}px ${fine(gear.y)}px;animation-duration:${fine(gear.seconds)}s">` +
    `<path class="o" d="${gearOutline(gear)}${holes}"/>${details}</g>`
  )
}

function wheel(): string {
  const { x, y } = WHEEL
  const spokes = 5
  const firstSpoke = (-54 * Math.PI) / 180
  let holes = ''
  for (let spoke = 0; spoke < spokes; spoke += 1) {
    const from = firstSpoke + (spoke * TAU) / spokes
    holes += pocket(x, y, 80, 147, 11, 9, from, from + TAU / spokes)
    const bolt = at(x, y, 47, from)
    holes += circle(round(bolt.x), round(bolt.y), 4.4)
  }
  const keyAngle = -Math.PI / 2
  holes += keyedBore(x, y, 30, 5.5, 4.5, keyAngle)
  const details =
    `<path class="d" d="${circle(x, y, 63)}"/>` +
    `<path class="h" d="${hatch(polygon(x, y, 30, 40, 0), Math.PI / 4, 5.4)}"/>` +
    `<path class="k" d="${key(x, y, 30, 5.5, 4.5, keyAngle)}"/>`
  return turning(WHEEL, holes, details)
}

function pinion(): string {
  const { x, y } = PINION
  const keyAngle = (205 * Math.PI) / 180
  const holes = keyedBore(x, y, 20, 4.2, 3.6, keyAngle)
  const details =
    `<path class="d" d="${circle(x, y, 35)}"/>` +
    `<path class="h" d="${hatch(polygon(x, y, 20, 32, 0), Math.PI / 4, 5.4)}"/>` +
    `<path class="k" d="${key(x, y, 20, 4.2, 3.6, keyAngle)}"/>`
  return turning(PINION, holes, details)
}

function spur(): string {
  const { x, y } = SPUR
  let holes = ''
  for (let hole = 0; hole < 6; hole += 1) {
    const centre = at(x, y, 64, ((30 + hole * 60) * Math.PI) / 180)
    holes += circle(round(centre.x), round(centre.y), 13.5)
  }
  // A half-inch hex shaft, the kind a robot gearbox runs on.
  const hex = polygon(x, y, 26.4, 6, 0)
  holes += closed(hex)
  const details = `<path class="d" d="${circle(x, y, 41)}"/><path class="h" d="${hatch(hex, Math.PI / 4, 5.4)}"/>`
  return turning(SPUR, holes, details)
}

const CHAIN_BREAK = 8

/** A chain line (long dash, dot) from a centre outward: it starts in the middle of a long dash, so two of them cross on solid ink, and ends on a whole one. */
function chainRay(from: Point, to: Point): string {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const breaks = Math.max(1, Math.round(length / 26))
  const dash = (length - CHAIN_BREAK * breaks) / (breaks + 0.5)
  return `<path d="M${xy(from)}L${xy(to)}" stroke-dasharray="${fine(dash)} 3 2 3" stroke-dashoffset="${fine(dash / 2)}"/>`
}

/** A chain line between two centres: half a long dash at each end. */
function chainSpan(from: Point, to: Point): string {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const breaks = Math.max(1, Math.round(length / 26))
  const dash = length / breaks - CHAIN_BREAK
  return `<path d="M${xy(from)}L${xy(to)}" stroke-dasharray="${fine(dash)} 3 2 3" stroke-dashoffset="${fine(dash / 2)}"/>`
}

function chainCircle(centreX: number, centreY: number, radius: number, from: number): string {
  const length = TAU * radius
  const breaks = Math.round(length / 26)
  const dash = length / breaks - CHAIN_BREAK
  return `<path d="${circle(centreX, centreY, radius, from)}" stroke-dasharray="${fine(dash)} 3 2 3" stroke-dashoffset="${fine(dash / 2)}"/>`
}

/** A circle in thin dashes that close on themselves, with a dash centred where the path starts. */
function dashedCircle(centreX: number, centreY: number, radius: number, from: number, dashes: number): string {
  const period = (TAU * radius) / dashes
  const dash = period * 0.6
  return `<path d="${circle(centreX, centreY, radius, from)}" stroke-dasharray="${fine(dash)} ${fine(period - dash)}" stroke-dashoffset="${fine(dash / 2)}"/>`
}

/** A slender filled arrowhead with its point at (x, y), flying along `angle`. */
function arrow(x: number, y: number, angle: number): string {
  const back = at(x, y, -9.5, angle)
  const sideX = -Math.sin(angle) * 1.7
  const sideY = Math.cos(angle) * 1.7
  return `M${round(x)} ${round(y)}L${round(back.x + sideX)} ${round(back.y + sideY)}L${round(back.x - sideX)} ${round(back.y - sideY)}Z`
}

/** A single-stroke alphabet on a 4 by 6 grid, baseline at 6: [advance width, strokes]. Strokes are point lists split by "|". */
const GLYPHS: Record<string, [number, string]> = {
  '0': [4, '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0'],
  '1': [2.2, '0.2,1.4 1.6,0 1.6,6'],
  '2': [4, '0,1.1 1,0 3,0 4,1 4,2.2 0,6 4,6'],
  '3': [4, '0,0.9 1,0 3,0 4,1 4,2 3,2.9 1.5,2.9|3,2.9 4,3.9 4,5 3,6 1,6 0,5.1'],
  '4': [4, '3.1,6 3.1,0 0,4.1 4,4.1'],
  '5': [4, '3.8,0 0.5,0 0.2,2.6 2.9,2.6 4,3.6 4,5 3,6 1,6 0,5.1'],
  '6': [4, '3.7,0.4 2.9,0 1.5,0 0,1.6 0,5 1,6 3,6 4,5 4,3.7 3,2.7 1,2.7 0,3.6'],
  '7': [4, '0,0 4,0 1.5,6'],
  '8': [4, '1,0 3,0 4,1 4,1.9 3,2.9 1,2.9 0,1.9 0,1 1,0|1,2.9 0,3.9 0,5 1,6 3,6 4,5 4,3.9 3,2.9'],
  '9': [4, '0.3,5.6 1.1,6 2.5,6 4,4.4 4,1 3,0 1,0 0,1 0,2.3 1,3.3 3,3.3 4,2.4'],
  'Ø': [4.4, '1.2,0 3.2,0 4.2,1 4.2,5 3.2,6 1.2,6 0.2,5 0.2,1 1.2,0|0,6.8 4.4,-0.8'],
  '.': [0.8, '0.4,5.6 0.4,6'],
  '°': [2.2, '0.6,0 1.6,0 2.2,0.6 2.2,1.5 1.6,2.1 0.6,2.1 0,1.5 0,0.6 0.6,0'],
  '-': [4, '0.5,3.2 3.5,3.2'],
  ':': [0.8, '0.4,2 0.4,2.4|0.4,5.6 0.4,6'],
  ' ': [2.4, ''],
  z: [3.2, '0.1,2.2 3.1,2.2 0.1,6 3.1,6'],
  m: [4.6, '0,6 0,2.2|0,3.1 0.9,2.2 1.5,2.2 2.3,3 2.3,6|2.3,3.1 3.2,2.2 3.8,2.2 4.6,3 4.6,6'],
  a: [4.2, '4.1,2.2 3.4,4.6 2.4,6 1,6 0,5 0,3.2 1,2.2 2.2,2.2 3.2,3.6 3.6,5.2 4.2,6'],
  A: [4, '0,6 2,0 4,6|0.75,3.9 3.25,3.9'],
  C: [4, '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5'],
  D: [4, '0,6 0,0 2.8,0 4,1.2 4,4.8 2.8,6 0,6'],
  E: [3.6, '3.6,0 0,0 0,6 3.6,6|0,3 2.8,3'],
  G: [4, '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.2 2.3,3.2'],
  I: [0, '0,0 0,6'],
  L: [3.4, '0,0 0,6 3.4,6'],
  N: [4, '0,6 0,0 4,6 4,0'],
  O: [4, '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0'],
  R: [4, '0,6 0,0 3,0 4,1 4,2.4 3,3.4 0,3.4|2,3.4 4,6'],
  S: [4, '4,1 3,0 1,0 0,1 0,2 1,3 3,3 4,4 4,5 3,6 1,6 0,5'],
  T: [4, '0,0 4,0|2,0 2,6'],
  U: [4, '0,0 0,5 1,6 3,6 4,5 4,0'],
  V: [4, '0,0 2,6 4,0'],
}

/**
 * A line of lettering as path data. (x, y) is the baseline point the text is aligned to: align -1 starts there, 0 centres, 1 ends.
 * `size` is the cap height. `turn` rotates the line about that point; -PI/2 reads up the sheet, the way vertical dimensions are lettered.
 */
function lettering(text: string, x: number, y: number, size: number, align: number, turn = 0, spacing = 1.5): string {
  const unit = size / 6
  let width = -spacing
  for (const character of text) width += (GLYPHS[character]?.[0] ?? 4) + spacing
  let cursor = align === 0 ? -width / 2 : align === 1 ? -width : 0
  const cos = Math.cos(turn)
  const sin = Math.sin(turn)
  let path = ''
  for (const character of text) {
    const glyph = GLYPHS[character]
    if (!glyph) continue
    for (const stroke of glyph[1].split('|')) {
      if (stroke === '') continue
      const points = stroke.split(' ').map(pair => {
        const [gridX, gridY] = pair.split(',').map(Number)
        const alongX = (cursor + (gridX ?? 0)) * unit
        const alongY = ((gridY ?? 0) - 6) * unit
        return `${round(x + alongX * cos - alongY * sin)} ${round(y + alongX * sin + alongY * cos)}`
      })
      path += `M${points.join('L')}`
    }
    cursor += glyph[0] + spacing
  }
  return path
}

/** The fixed lines over the gears: centre lines, the lines of centres, pitch circles, pitch points. Nothing in here turns. */
function centreLines(): string {
  const overshoot = 14
  const dimensionEdge = 1252
  let chain = ''
  for (const gear of [WHEEL, PINION, SPUR]) {
    const reach = tipRadius(gear.teeth) + overshoot
    const centre = { x: gear.x, y: gear.y }
    // The horizontal centre lines run on to the left, where they carry the dimensions.
    chain += chainRay(centre, { x: dimensionEdge, y: gear.y })
    chain += chainRay(centre, { x: gear.x + reach, y: gear.y })
    chain += chainRay(centre, { x: gear.x, y: gear.y - reach })
    chain += chainRay(centre, { x: gear.x, y: gear.y + reach })
  }
  chain += chainSpan(PINION, WHEEL) + chainSpan(PINION, SPUR)
  // Pitch circles of the bolt holes and of the lightening holes.
  chain += chainCircle(WHEEL.x, WHEEL.y, 47, 0.3) + chainCircle(SPUR.x, SPUR.y, 64, 0)

  const towardWheel = Math.atan2(WHEEL.y - PINION.y, WHEEL.x - PINION.x)
  const towardSpur = Math.atan2(SPUR.y - PINION.y, SPUR.x - PINION.x)
  // 44 dashes on the pinion put a dash on both of its pitch points.
  const pitch =
    dashedCircle(PINION.x, PINION.y, pitchRadius(PINION.teeth), towardWheel, 44) +
    dashedCircle(WHEEL.x, WHEEL.y, pitchRadius(WHEEL.teeth), towardWheel + Math.PI, 110) +
    dashedCircle(SPUR.x, SPUR.y, pitchRadius(SPUR.teeth), towardSpur + Math.PI, 66)
  const wheelPoint = at(PINION.x, PINION.y, pitchRadius(PINION.teeth), towardWheel)
  const spurPoint = at(PINION.x, PINION.y, pitchRadius(PINION.teeth), towardSpur)
  const points = `<circle class="k" cx="${round(wheelPoint.x)}" cy="${round(wheelPoint.y)}" r="2.3"/><circle class="k" cx="${round(spurPoint.x)}" cy="${round(spurPoint.y)}" r="2.3"/>`
  return `<g class="c">${chain}</g><g class="p">${pitch}</g>${points}`
}

/** The dimensions: the two centre heights chained down the left, and the tip diameter of the top gear on a leader. */
function dimensions(): string {
  const lineX = 1262
  const up = -Math.PI / 2
  const down = Math.PI / 2
  let lines = `M${lineX} ${round(SPUR.y)}V${round(WHEEL.y)}`
  let heads = arrow(lineX, SPUR.y, up) + arrow(lineX, PINION.y, down) + arrow(lineX, PINION.y, up) + arrow(lineX, WHEEL.y, down)
  let text = lettering('40', lineX - 4.5, (SPUR.y + PINION.y) / 2, 8, 0, up) + lettering('56', lineX - 4.5, (PINION.y + WHEEL.y) / 2, 8, 0, up)

  const bearing = (-128 * Math.PI) / 180
  const touch = at(SPUR.x, SPUR.y, tipRadius(SPUR.teeth), bearing)
  const elbow = at(SPUR.x, SPUR.y, tipRadius(SPUR.teeth) + 30, bearing)
  lines += `M${xy(touch)}L${xy(elbow)}H${round(elbow.x - 30)}`
  heads += arrow(touch.x, touch.y, bearing + Math.PI)
  text += lettering('Ø65', elbow.x - 29, elbow.y - 4.5, 8, -1)
  return `<path class="n" d="${lines}"/><path class="a" d="${heads}"/><path class="t" d="${text}"/>`
}

/** The gear data, as a gear drawing carries it in its top right corner: teeth, module, pressure angle. */
function dataTable(): string {
  const left = 1466
  const top = 132
  const row = 15
  const label = 24
  const cell = 30
  const right = left + label + cell * 3
  const bottom = top + row * 3
  let lines = `M${left} ${top}H${right}V${bottom}H${left}ZM${left} ${top + row}H${right}M${left} ${top + row * 2}H${right}M${left + label} ${top}V${bottom}`
  lines += `M${left + label + cell} ${top}V${top + row}M${left + label + cell * 2} ${top}V${top + row}`
  const baseline = (index: number): number => top + row * index + 11.2
  let text = lettering('z', left + label / 2, baseline(0), 7.2, 0) + lettering('m', left + label / 2, baseline(1), 7.2, 0) + lettering('a', left + label / 2, baseline(2), 7.2, 0)
  text += [PINION, SPUR, WHEEL].map((gear, index) => lettering(String(gear.teeth), left + label + cell * (index + 0.5), baseline(0), 7.2, 0)).join('')
  text += lettering('2.5', left + label + cell * 1.5, baseline(1), 7.2, 0) + lettering('20°', left + label + cell * 1.5, baseline(2), 7.2, 0)
  text += lettering('GEAR DATA', left, top - 7, 6, -1, 0, 2.6)
  return `<path class="n" d="${lines}"/><path class="t" d="${text}"/>`
}

// The involute construction, lower left: base circle, and the string that unwinds from it through `INVOLUTE_TURN` radians.
const BASE_X = 322
const BASE_Y = 842
const BASE_RADIUS = 62
const INVOLUTE_TURN = 3
const INVOLUTE_STATIONS = 6
const DRAW_SECONDS = 84
/** Shares of the cycle: the pen draws until DRAWN, the curve stays until KEPT, is gone by WASHED. */
const DRAWN = 40
const KEPT = 84
const WASHED = 91

/** Where the string leaves the circle after unwinding by `unwound` radians. The last one lies at 3 o'clock, so the taut string ends standing upright. */
function tangentPoint(unwound: number): Point {
  return at(BASE_X, BASE_Y, BASE_RADIUS, unwound - INVOLUTE_TURN)
}

/** The end of the string: as far from the tangent point as the arc it has left. */
function involutePoint(unwound: number): Point {
  const angle = unwound - INVOLUTE_TURN
  const tangent = tangentPoint(unwound)
  return { x: tangent.x + BASE_RADIUS * unwound * Math.sin(angle), y: tangent.y - BASE_RADIUS * unwound * Math.cos(angle) }
}

function involuteFigure(): string {
  const centre = { x: BASE_X, y: BASE_Y }
  const reach = BASE_RADIUS + 13
  const chain =
    chainRay(centre, { x: BASE_X - reach, y: BASE_Y }) +
    chainRay(centre, { x: BASE_X + reach, y: BASE_Y }) +
    chainRay(centre, { x: BASE_X, y: BASE_Y - reach }) +
    chainRay(centre, { x: BASE_X, y: BASE_Y + reach })

  // The stations: the string's earlier positions at equal steps of unwinding, as a draughtsman plots them before joining the points.
  let fan = ''
  let ticks = ''
  let dots = ''
  let numbers = ''
  for (let station = 0; station <= INVOLUTE_STATIONS; station += 1) {
    const unwound = (INVOLUTE_TURN * station) / INVOLUTE_STATIONS
    const tangent = tangentPoint(unwound)
    const end = involutePoint(unwound)
    const angle = unwound - INVOLUTE_TURN
    ticks += `M${xy(at(BASE_X, BASE_Y, BASE_RADIUS - 3.5, angle))}L${xy(at(BASE_X, BASE_Y, BASE_RADIUS + 3.5, angle))}`
    if (station === 0) continue
    fan += `M${xy(tangent)}L${xy(end)}`
    dots += `<circle cx="${round(end.x)}" cy="${round(end.y)}" r="1.9"/>`
    // The number sits beyond the end of the string, on the string's own line.
    const beyond = toward(end, tangent, -11.5)
    numbers += lettering(String(station), beyond.x, beyond.y + 3.3, 6.6, 0)
  }

  let curve = ''
  for (let step = 0; step <= 60; step += 1) curve += `${step === 0 ? 'M' : 'L'}${xy(involutePoint((INVOLUTE_TURN * step) / 60))}`

  // The taut string in its last position: radius to the tangent point, a square corner, the string, the pen at its end.
  const tangentX = BASE_X + BASE_RADIUS
  const length = BASE_RADIUS * INVOLUTE_TURN
  const timing = `animation-delay:-${fine(DRAW_SECONDS * 0.22)}s`
  const string =
    `<g class="unwind" style="transform-origin:${BASE_X}px ${BASE_Y}px;${timing}">` +
    `<path class="n" d="M${BASE_X} ${BASE_Y}H${tangentX}M${tangentX - 7} ${BASE_Y}v-7h7"/>` +
    `<path class="s pay" style="transform-origin:${tangentX}px ${BASE_Y}px;${timing}" d="M${tangentX} ${BASE_Y}V${BASE_Y - length}"/>` +
    `<circle class="k ride" style="${timing}" cx="${tangentX}" cy="${BASE_Y - length}" r="3.3"/></g>`

  const caption = lettering('INVOLUTE', BASE_X - BASE_RADIUS - 13, BASE_Y + BASE_RADIUS + 27, 6, -1, 0, 2.6)
  return (
    `<g class="c">${chain}</g><path class="d" d="${circle(BASE_X, BASE_Y, BASE_RADIUS)}"/>` +
    `<path class="n" d="${fan}${ticks}"/>` +
    `<path class="v trace" style="${timing}" pathLength="1" d="${curve}"/>` +
    `<g class="q">${dots}</g>${string}<path class="t" d="${numbers}${caption}"/>`
  )
}

/** Trimming marks in the corners the app leaves bare. */
function cornerMarks(): string {
  const mark = (x: number, y: number, towardX: number, towardY: number): string => `M${x + towardX * 18} ${y}H${x}V${y + towardY * 18}`
  const caption = lettering('ELEVATION', 1562, 931, 6, 1, 0, 2.6) + lettering('1:1', 1562, 915, 6, 1, 0, 2.6)
  return `<path class="n" d="${mark(226, 934, 1, -1)}${mark(1580, 934, -1, -1)}${mark(1580, 112, -1, 1)}"/><path class="t" d="${caption}"/>`
}

function gearSheet(stock: Stock): string {
  const length = BASE_RADIUS * INVOLUTE_TURN
  const style = `
path,circle{fill:none}
.o{fill:${stock.body};fill-opacity:${stock.bodyOpacity};fill-rule:evenodd;stroke:${stock.ink};stroke-width:1.2;stroke-opacity:${stock.line};stroke-linejoin:round}
.d{stroke:${stock.ink};stroke-width:1;stroke-opacity:${fine(stock.line * 0.8)}}
.h{stroke:${stock.ink};stroke-width:.7;stroke-opacity:${fine(stock.line * 0.62)}}
.c{stroke:${stock.ink};stroke-width:.8;stroke-opacity:${fine(stock.line * 0.52)}}
.p{stroke:${stock.red};stroke-width:.9;stroke-opacity:${stock.pitch}}
.n{stroke:${stock.ink};stroke-width:.8;stroke-opacity:${fine(stock.line * 0.6)}}
.s{stroke:${stock.ink};stroke-width:1;stroke-opacity:${stock.line}}
.t{stroke:${stock.ink};stroke-width:.9;stroke-opacity:${fine(stock.line * 0.78)};stroke-linecap:round;stroke-linejoin:round}
.a{fill:${stock.ink};fill-opacity:${fine(stock.line * 0.8)}}
.k{fill:${stock.red}}
.q circle{fill:${stock.paper};stroke:${stock.ink};stroke-width:.9;stroke-opacity:${fine(stock.line * 0.8)}}
.v{stroke:${stock.red};stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 2}
.cw{animation:cw linear infinite}
.ccw{animation:ccw linear infinite}
.unwind{animation:unwind ${DRAW_SECONDS}s linear infinite}
.pay{animation:pay ${DRAW_SECONDS}s linear infinite}
.ride{animation:ride ${DRAW_SECONDS}s linear infinite}
.trace{animation:trace ${DRAW_SECONDS}s linear infinite}
@keyframes cw{to{transform:rotate(360deg)}}
@keyframes ccw{to{transform:rotate(-360deg)}}
@keyframes unwind{0%{transform:rotate(${fine((-INVOLUTE_TURN * 180) / Math.PI)}deg);opacity:0}1.5%{opacity:1}${DRAWN}%{transform:rotate(0deg)}${KEPT}%{opacity:1}${WASHED}%{opacity:0}100%{transform:rotate(0deg);opacity:0}}
@keyframes pay{0%{transform:scaleY(0)}${DRAWN}%,100%{transform:scaleY(1)}}
@keyframes ride{0%{transform:translateY(${length}px)}${DRAWN}%,100%{transform:translateY(0)}}
@keyframes trace{0%{stroke-dashoffset:1.01;opacity:1;animation-timing-function:cubic-bezier(.3333,0,.6667,.3333)}${DRAWN}%{stroke-dashoffset:0;opacity:1;animation-timing-function:linear}${KEPT}%{stroke-dashoffset:0;opacity:1}${WASHED}%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:0;opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
${wheel()}${spur()}${pinion()}
${centreLines()}
${dimensions()}
${dataTable()}
${cornerMarks()}
${involuteFigure()}
</svg>`
}

/** Gear Drawing on warm paper, for a light window. */
export function daySvg(): string {
  return gearSheet(DAY)
}

/** Gear Drawing in pale ink on warm charcoal, for a dark window. */
export function nightSvg(): string {
  return gearSheet(NIGHT)
}
