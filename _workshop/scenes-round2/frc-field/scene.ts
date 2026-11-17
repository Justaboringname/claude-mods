// Strategy Sheet: a coach's drafting sheet for a robotics match, drawn with two pens.
// Right band: one end of a generic field seen from above, at 70 units to the metre. The alliance wall is hatched as a cut solid,
// divided into its three driver stations, with a metre rule along its back; a goal stands at its middle inside a taped zone,
// a post stands on the centre line, and a hatched loading station fills the lower corner.
// An autonomous run is planned across the carpet as a spline: waypoint rings, the spline's tangent handles, two staged game pieces.
// A small swerve-drive robot, 8810, drives the run again and again and leaves a red line behind it. It is slower through
// the bends, the way a real drivetrain is; its chassis turns to face each waypoint's heading while its four wheels keep
// pointing down the path, which is what a swerve drive does. It picks the pieces up as it passes, and shoots one into the goal
// from the middle waypoint. A dashed ghost stands where the run ends. Above the field a heading dial repeats the chassis's angle.
// Left band: the same robot seen from the side. A family of ballistic arcs from its shooter into one goal, one per launch
// angle; a ball flies each arc in turn, quick off the wheel and slow over the top.
// Two pens keep hatching: an ink one works down the alliance wall, a red one across the loading station.
// The reading column between the bands is left as bare paper. Two stocks: warm paper for a light window, umber for a dark one.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000
/** For looking at the work, never shipped switched on: the picture at rest, and closer looks, each [scale, shift x, shift y]. */
const DEBUG_REST = false
const DEBUG_VIEWS: number[][] = []

interface Stock {
  paper: string
  wash: string
  ink: string
  red: string
}

/** Day: a blue pen and a red pen on warm paper, the two alliance colours. */
const DAY: Stock = { paper: '#f3eee3', wash: '#ead7bf', ink: '#22305a', red: '#c6442c' }
/** Night: pale warm ink on umber. Blue is the weakest channel of every colour on it. */
const NIGHT: Stock = { paper: '#221b14', wash: '#33271a', ink: '#d8c6a4', red: '#e98058' }

interface Point {
  x: number
  y: number
}

/** A waypoint of the run. `dir` is the way the path travels through it, `facing` the way the robot points (a swerve drive can differ);
 * both in degrees, clockwise on screen from east. `reach` and `leave` are the lengths of the spline's handles into and out of it. */
interface Anchor {
  x: number
  y: number
  dir: number
  reach: number
  leave: number
  facing: number
  piece: boolean
}

/** The run, sampled: its path string, points along it, the share of its length and of its time at which each point is reached, and which samples are the waypoints. */
interface Run {
  d: string
  length: number
  points: Point[]
  along: number[]
  time: number[]
  anchorIndex: number[]
}

/** The robot at one moment of the run: where it is, where its chassis faces, where its wheels point relative to the chassis, and how much of the path lies behind it. */
interface Pose {
  x: number
  y: number
  heading: number
  wheel: number
  along: number
}

interface Markup {
  defs: string
  css: string
  body: string
}

/** One pen's hatching job: its strokes are drawn strictly one after another on a shared cycle; `absent` percent of them are always missing, just ahead of the pen. */
interface PenJob {
  name: string
  colour: string
  width: number
  opacity: number
  seconds: number
  start: number
  absent: number
  pen: number
}

// ---- the field (top view) ----
const METRE = 70
const WALL = 1546
/** The alliance wall has depth: the drivers stand behind it at three stations. */
const BAND = 11
const TOP = 350
const FLOOR = 910
const MIDDLE = (TOP + FLOOR) / 2
/** The loading station cuts this much off the lower corner along each wall. */
const STATION = 92
const GOAL: Point = { x: WALL - 14, y: MIDDLE }
/** The taped zone in front of the goal: a half circle struck from the wall. */
const ZONE: Point = { x: WALL, y: MIDDLE }
const ZONE_RADIUS = 1.5 * METRE
const ROBOT_HALF = 31
/** A post on the field's centre line; the run is a slalom round it. */
const PILLAR: Point = { x: 1322, y: MIDDLE }
const PILLAR_RADIUS = 10

const AUTO: Anchor[] = [
  { x: 1390, y: TOP + 76, dir: 165, reach: 0, leave: 64, facing: 180, piece: false },
  { x: 1300, y: MIDDLE - 108, dir: 88, reach: 46, leave: 38, facing: 118, piece: true },
  { x: 1406, y: MIDDLE, dir: 90, reach: 40, leave: 40, facing: 0, piece: false },
  { x: 1304, y: MIDDLE + 108, dir: 84, reach: 38, leave: 40, facing: 110, piece: true },
  { x: 1466, y: FLOOR - 84, dir: 50, reach: 72, leave: 0, facing: 45, piece: false },
]

/** One clock for everything that follows the run: the robot, its line, the waypoint dots, the game pieces and the dial's needle. Percent of the cycle. */
const RUN_SECONDS = 96
const DRIVE_FROM = 3
const DRIVE_TO = 40
const HOLD_UNTIL = 82
const GONE_AT = 86
const BACK_FROM = 88
const BACK_AT = 92
/** At the first frame the robot is at the shooting waypoint, square to the goal, and the ball is about to leave it. */
const RUN_CLOCK = `${RUN_SECONDS}s linear -19.5s infinite`

// ---- the shot (side view) ----
const GROUND = 842
/** The ground is drawn with depth, like the alliance wall. */
const SOIL = 9
const EARTH_FROM = 210
const EARTH_TO = 402
/** The ball leaves the top of the shooter's wheel. */
const LAUNCH: Point = { x: 246, y: GROUND - 36 }
/** Two metres down the range and 2.2 m up. */
const TARGET: Point = { x: LAUNCH.x + 2 * METRE, y: GROUND - 2.2 * METRE }
/** How high above the launch point each arc tops out. The steps grow, so the arcs open like a fan and never crowd. */
const APEXES = [124, 142, 170, 212, 268, 340]

// ---- the heading dial (upper right) ----
const DIAL: Point = { x: WALL - METRE, y: TOP - 2 * METRE }
const DIAL_RADIUS = 35

function n(value: number): number {
  return Math.round(value * 10) / 10
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function polar(centre: Point, radius: number, degrees: number): Point {
  return { x: centre.x + radius * Math.cos(radians(degrees)), y: centre.y + radius * Math.sin(radians(degrees)) }
}

function at(point: Point): string {
  return `${n(point.x)} ${n(point.y)}`
}

/** An arc about `centre`, clockwise on screen from `from` to `to` degrees. */
function arc(centre: Point, radius: number, from: number, to: number): string {
  return `M${at(polar(centre, radius, from))}A${radius} ${radius} 0 ${to - from > 180 ? 1 : 0} 1 ${at(polar(centre, radius, to))}`
}

/** Three shrinking dashes that carry a line on past its end: the drawing goes on, the sheet does not. */
function trailOff(x: number, y: number, dx: number, dy: number): string {
  let path = ''
  let reach = 0
  for (const dash of [9, 5, 2]) {
    reach += 6
    path += `M${n(x + dx * reach)} ${n(y + dy * reach)}l${n(dx * dash)} ${n(dy * dash)}`
    reach += dash
  }
  return path
}

function cubicAt(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  }
}

/** The run as a spline through its anchors, with a time for every sample: full speed on the straights, slower where the path bends, eased off the line and into the stop. */
function planRun(anchors: Anchor[]): Run {
  const perSegment = 48
  const first = anchors[0] ?? { x: 0, y: 0 }
  const points: Point[] = [{ x: first.x, y: first.y }]
  const anchorIndex = [0]
  let d = `M${first.x} ${first.y}`
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const from = anchors[index]
    const to = anchors[index + 1]
    if (!from || !to) continue
    const out = polar(from, from.leave, from.dir)
    const back = polar(to, -to.reach, to.dir)
    d += `C${at(out)} ${at(back)} ${to.x} ${to.y}`
    for (let step = 1; step <= perSegment; step += 1) points.push(cubicAt(from, out, back, to, step / perSegment))
    anchorIndex.push(points.length - 1)
  }
  const last = points.length - 1
  const along: number[] = [0]
  for (let index = 1; index <= last; index += 1) {
    const here = points[index] ?? first
    const before = points[index - 1] ?? first
    along.push((along[index - 1] ?? 0) + Math.hypot(here.x - before.x, here.y - before.y))
  }
  const total = along[last] ?? 1
  // Speed from the bend: a turn of 120 units' radius or wider is taken flat out.
  const raw: number[] = []
  for (let index = 0; index <= last; index += 1) {
    const middle = Math.min(Math.max(index, 3), last - 3)
    const a = points[middle - 3] ?? first
    const b = points[middle] ?? first
    const c = points[middle + 3] ?? first
    let turn = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x)
    while (turn > Math.PI) turn -= Math.PI * 2
    while (turn < -Math.PI) turn += Math.PI * 2
    const span = ((along[middle + 3] ?? 0) - (along[middle - 3] ?? 0)) / 2
    const radius = span / Math.max(Math.abs(turn), 0.0001)
    const cornering = Math.min(1, Math.max(0.42, Math.sqrt(radius / 120)))
    const here = along[index] ?? 0
    const ramp = Math.min(1, 0.3 + here / 70, 0.3 + (total - here) / 70)
    raw.push(cornering * ramp)
  }
  const speed = raw.map((_, index) => {
    let sum = 0
    let count = 0
    for (let near = index - 6; near <= index + 6; near += 1) {
      const value = raw[near]
      if (value === undefined) continue
      sum += value
      count += 1
    }
    return sum / count
  })
  const time: number[] = [0]
  for (let index = 1; index <= last; index += 1) {
    const pace = ((speed[index] ?? 1) + (speed[index - 1] ?? 1)) / 2
    time.push((time[index - 1] ?? 0) + ((along[index] ?? 0) - (along[index - 1] ?? 0)) / pace)
  }
  const whole = time[last] ?? 1
  return { d, length: total, points, along: along.map(value => value / total), time: time.map(value => value / whole), anchorIndex }
}

/** Where the run is at a share (0..1) of its time: the sample index, fractional. */
function sampleAtTime(run: Run, share: number): number {
  const last = run.time.length - 1
  for (let index = 1; index <= last; index += 1) {
    const before = run.time[index - 1] ?? 0
    const after = run.time[index] ?? 1
    if (share <= after) return index - 1 + (after > before ? (share - before) / (after - before) : 0)
  }
  return last
}

function blend(values: number[], sample: number): number {
  const whole = Math.min(values.length - 2, Math.floor(sample))
  const before = values[whole] ?? 0
  const after = values[whole + 1] ?? before
  return before + (after - before) * (sample - whole)
}

/** The share of the run's time at which waypoint `index` is reached. */
function anchorTime(run: Run, index: number): number {
  return run.time[run.anchorIndex[index] ?? 0] ?? 0
}

/** The percent of the cycle at a share (0..1) of the drive. */
function cycleAt(share: number): number {
  return Math.round((DRIVE_FROM + (DRIVE_TO - DRIVE_FROM) * share) * 100) / 100
}

/** The drive, cut into equal steps of time. The chassis eases from each waypoint's facing to the next; the wheels point down the path. */
function drive(run: Run, count: number): Pose[] {
  const poses: Pose[] = []
  const last = run.points.length - 1
  let travel = AUTO[0]?.dir ?? 0
  for (let stop = 0; stop <= count; stop += 1) {
    const share = stop / count
    const sample = sampleAtTime(run, share)
    const whole = Math.min(last - 1, Math.floor(sample))
    const before = run.points[whole] ?? { x: 0, y: 0 }
    const after = run.points[whole + 1] ?? before
    const part = sample - whole
    const behind = run.points[Math.max(0, Math.round(sample) - 1)] ?? before
    const ahead = run.points[Math.min(last, Math.round(sample) + 1)] ?? after
    let direction = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
    while (direction < travel - 180) direction += 360
    while (direction > travel + 180) direction -= 360
    travel = direction
    let leg = 0
    for (let index = 0; index < AUTO.length - 1; index += 1) if (share >= anchorTime(run, index)) leg = index
    const from = anchorTime(run, leg)
    const to = anchorTime(run, leg + 1)
    const turned = Math.min(1, Math.max(0, (share - from) / Math.max(to - from, 0.0001)))
    const eased = turned * turned * (3 - 2 * turned)
    const facingFrom = AUTO[leg]?.facing ?? 0
    const facingTo = AUTO[leg + 1]?.facing ?? facingFrom
    const heading = facingFrom + (facingTo - facingFrom) * eased
    poses.push({
      x: before.x + (after.x - before.x) * part,
      y: before.y + (after.y - before.y) * part,
      heading,
      wheel: direction - heading,
      along: blend(run.along, sample),
    })
  }
  return poses
}

/** A swerve-drive robot seen from above, drawn about its own centre and facing east: bumpers, frame, four steered wheel modules, an intake across the front. */
function robotFromAbove(stock: Stock): string {
  const half = ROBOT_HALF
  const frame = half - 6.5
  let modules = ''
  for (const [x, y] of [[16, 16], [16, -16], [-16, 16], [-16, -16]] as const) {
    modules +=
      `<g transform="translate(${x} ${y})"><rect x="-6" y="-6" width="12" height="12" rx="2.6" stroke-width=".8" stroke-opacity=".5"/>` +
      `<g class="whl"><rect x="-5.2" y="-2" width="10.4" height="4" rx="1.4" fill="${stock.ink}" fill-opacity=".86" stroke="none"/></g></g>`
  }
  return (
    `<g class="rot" stroke="${stock.ink}">` +
    `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="6.5" fill="${stock.paper}" stroke="none"/>` +
    `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="6.5" fill="${stock.red}" fill-opacity=".2" stroke-width="1.3" stroke-opacity=".9"/>` +
    `<rect x="${-frame}" y="${-frame}" width="${frame * 2}" height="${frame * 2}" rx="1.6" fill="${stock.paper}" stroke-width=".9" stroke-opacity=".6"/>` +
    modules +
    `<path d="M20.6 -7.5V7.5" stroke-width="2.2" stroke-opacity=".5"/>` +
    `<path d="M25.7 -3.5L30 0L25.7 3.5Z" fill="${stock.ink}" fill-opacity=".85" stroke="none"/>` +
    `</g>`
  )
}

/** Where the robot will stand at the end of the run: a dashed outline and its front mark, nothing more. */
function ghost(centre: Point, facing: number, stock: Stock): string {
  const half = ROBOT_HALF
  return (
    `<g transform="translate(${centre.x} ${centre.y}) rotate(${facing})" stroke="${stock.ink}" stroke-opacity=".5">` +
    `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="6.5" stroke-width="1" stroke-dasharray="5 4.4" stroke-linecap="butt"/>` +
    `<path d="M${half - 13} -5L${half - 6} 0L${half - 13} 5" stroke-width="1"/>` +
    `</g>`
  )
}

/** Tape corners on the carpet where the robot is set down before the match. */
function startMarks(centre: Point): string {
  const half = ROBOT_HALF + 6
  let path = ''
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      path += `M${centre.x + sx * half} ${centre.y + sy * (half - 10)}V${centre.y + sy * half}H${centre.x + sx * (half - 10)}`
    }
  }
  return path
}

/** A small cross at every whole metre of the field, like the grid of a squared sheet. Left out where something stands, and fainter toward the reading column. */
function gridCrosses(stock: Stock): string {
  let crosses = ''
  for (let column = 1; column <= 3; column += 1) {
    let path = ''
    for (let row = 1; row <= 7; row += 1) {
      const x = WALL - column * METRE
      const y = FLOOR - row * METRE
      // Row 4 lies on the centre line.
      if (row === 4) continue
      if (x + y > WALL + FLOOR - STATION - 14) continue
      if (Math.abs(Math.hypot(x - ZONE.x, y - ZONE.y) - ZONE_RADIUS) < 12) continue
      if (Math.hypot(x - PILLAR.x, y - PILLAR.y) < 26) continue
      if (AUTO.some((anchor, index) => Math.hypot(anchor.x - x, anchor.y - y) < (index === 0 || index === AUTO.length - 1 ? 60 : 24))) continue
      path += `M${x - 3.5} ${y}h7M${x} ${y - 3.5}v7`
    }
    crosses += `<path d="${path}" stroke-opacity="${n(0.52 - column * 0.1)}"/>`
  }
  return `<g stroke="${stock.ink}" stroke-width=".8">${crosses}</g>`
}

/** The end of the field that does not move: the walls, the alliance wall's three stations with a metre rule along their backs, the goal, its centre line and taped zone, the station's ground. */
function field(stock: Stock): string {
  const cornerY = FLOOR - STATION
  const cornerX = WALL - STATION
  const back = WALL + BAND
  const wall = `M1362 ${TOP}H${WALL}V${FLOOR}H1424`
  const ends = trailOff(1362, TOP, -1, 0) + trailOff(1424, FLOOR, -1, 0)
  const third = (FLOOR - TOP) / 3
  const band = `M${WALL} ${TOP}H${back}V${FLOOR}H${WALL}M${WALL} ${n(TOP + third)}h${BAND}M${WALL} ${n(TOP + third * 2)}h${BAND}`
  let ticks = ''
  let numerals = ''
  for (let quarter = 0; quarter <= 32; quarter += 1) {
    const y = n(FLOOR - (quarter * METRE) / 4)
    ticks += `M${back} ${y}h${quarter % 4 === 0 ? 8 : quarter % 2 === 0 ? 5 : 2.8}`
    if (quarter % 8 === 0) numerals += `<text x="${back + 13}" y="${y + 3.2}">${quarter / 4}</text>`
  }
  const goal = `M${WALL} ${GOAL.y - 44}L${WALL - 28} ${GOAL.y - 24}V${GOAL.y + 24}L${WALL} ${GOAL.y + 44}`
  const centreLine = `M${WALL - 36} ${MIDDLE}H${PILLAR.x + PILLAR_RADIUS}`
  const zone = arc(ZONE, ZONE_RADIUS - 1.6, 90, 270) + arc(ZONE, ZONE_RADIUS + 1.6, 90, 270)
  const label = polar(ZONE, ZONE_RADIUS + 9, 228)
  return (
    `<path d="M${WALL} ${cornerY}V${FLOOR}H${cornerX}Z" fill="${stock.wash}" fill-opacity=".62"/>` +
    gridCrosses(stock) +
    `<g stroke="${stock.ink}">` +
    `<path d="${centreLine}" stroke-width=".9" stroke-opacity=".36" stroke-dasharray="22 4 3 4" stroke-linecap="butt"/>` +
    `<path d="${zone}" stroke-width=".8" stroke-opacity=".4"/>` +
    `<path d="${band}" stroke-width="1" stroke-opacity=".7"/>` +
    `<path d="${wall}" stroke-width="1.5" stroke-opacity=".9"/>` +
    `<path d="${ends}" stroke-width="1.5" stroke-opacity=".6"/>` +
    `<path d="${ticks}" stroke-width="1" stroke-opacity=".6"/>` +
    `<path d="${goal}" fill="${stock.paper}" stroke-width="1.5" stroke-opacity=".9"/>` +
    `</g>` +
    pillar(stock) +
    `<circle cx="${GOAL.x}" cy="${GOAL.y}" r="7.5" stroke="${stock.red}" stroke-width="1.3"/>` +
    `<circle cx="${GOAL.x}" cy="${GOAL.y}" r="1.7" fill="${stock.ink}" fill-opacity=".85"/>` +
    `<g fill="${stock.ink}" fill-opacity=".55" font-size="9">${numerals}` +
    `<text x="${n(label.x)}" y="${n(label.y)}" text-anchor="end">1.5 m</text>` +
    `</g>`
  )
}

/** A post seen from above: cut solid, so hatched. */
function pillar(stock: Stock): string {
  let hatch = ''
  for (let offset = -6; offset <= 6; offset += 4) {
    const half = Math.sqrt(PILLAR_RADIUS * PILLAR_RADIUS - offset * offset) * Math.SQRT1_2
    const x = PILLAR.x + offset * Math.SQRT1_2
    const y = PILLAR.y + offset * Math.SQRT1_2
    hatch += `M${n(x - half)} ${n(y + half)}L${n(x + half)} ${n(y - half)}`
  }
  return (
    `<g stroke="${stock.ink}"><circle cx="${PILLAR.x}" cy="${PILLAR.y}" r="${PILLAR_RADIUS}" fill="${stock.paper}" stroke-width="1.3" stroke-opacity=".9"/>` +
    `<path d="${hatch}" stroke-width=".8" stroke-opacity=".5"/></g>`
  )
}

/** A hatching job for one pen: every stroke is drawn in its turn, rests, and is washed away again just before the pen comes back to it, so the hatching is never finished. */
function penJob(paths: string[], job: PenJob): Markup {
  const step = job.seconds / paths.length
  const drawn = Math.round(10000 / paths.length) / 100
  const rest = Math.round((100 - job.absent - drawn) * 100) / 100
  let defs = ''
  let strokes = ''
  let heads = ''
  paths.forEach((path, line) => {
    // Stroke k starts one step after stroke k - 1, so it is one step less far into its cycle.
    const phase = (((job.start - line * step) % job.seconds) + job.seconds) % job.seconds
    const timing = `style="animation-delay:${n(-phase)}s"`
    defs += `<path id="${job.name}${line}" pathLength="1" d="${path}"/>`
    strokes += `<use href="#${job.name}${line}" class="ink" ${timing}/>`
    heads += `<use href="#${job.name}${line}" class="pen" ${timing}/>`
  })
  const css = `
.${job.name} .ink{animation:${job.name}-ink ${job.seconds}s linear infinite}.${job.name} .pen{stroke-width:${job.pen};animation:${job.name}-pen ${job.seconds}s linear infinite}
@keyframes ${job.name}-ink{0%{stroke-dashoffset:1.01;opacity:1}${drawn}%{stroke-dashoffset:0;opacity:1}${n(drawn * 2.5)}%{stroke-dashoffset:0;opacity:.8}${rest}%{stroke-dashoffset:0;opacity:.8}${Math.round((rest + drawn) * 100) / 100}%{stroke-dashoffset:-1.01}100%{stroke-dashoffset:-1.01;opacity:.8}}
@keyframes ${job.name}-pen{0%{stroke-dashoffset:0;opacity:1}${drawn}%{stroke-dashoffset:-1;opacity:1}${Math.round((drawn + 0.01) * 100) / 100}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}}`
  const body = `<g class="${job.name}" stroke="${job.colour}" stroke-width="${job.width}" stroke-opacity="${job.opacity}">${strokes}${heads}</g>`
  return { defs, css, body }
}

/** The loading station: hatch strokes square to its face, in the order a pen would take them (out along one, back along the next), and the face itself in a firm red line. */
function station(stock: Stock): Markup {
  const paths: string[] = []
  const face = Math.SQRT2 * STATION
  for (let along = 7; along < face - 4; along += 8.6) {
    const x = WALL - STATION + along * Math.SQRT1_2
    const y = FLOOR - along * Math.SQRT1_2
    const depth = Math.min(along, face - along) * Math.SQRT1_2 - 1.5
    if (depth < 4) continue
    paths.push(paths.length % 2 === 0 ? `M${n(x)} ${n(y)}l${n(depth)} ${n(depth)}` : `M${n(x + depth)} ${n(y + depth)}l${n(-depth)} ${n(-depth)}`)
  }
  const job = penJob(paths, { name: 'h', colour: stock.red, width: 1, opacity: 0.8, seconds: 84, start: 31, absent: 5, pen: 5.5 })
  const faceLine = `<path d="M${WALL - STATION} ${FLOOR}L${WALL} ${FLOOR - STATION}" stroke="${stock.red}" stroke-width="1.5" stroke-opacity=".95"/>`
  return { defs: job.defs, css: job.css, body: job.body + faceLine }
}

/** The alliance wall is cut solid, so it is hatched, the way a drafter marks anything sliced through. An ink pen works down it stroke by stroke. */
function wallHatch(stock: Stock): Markup {
  const paths: string[] = []
  for (let y = TOP + BAND + 2; y < FLOOR; y += 7) {
    paths.push(paths.length % 2 === 0 ? `M${WALL} ${n(y)}l${BAND} ${-BAND}` : `M${WALL + BAND} ${n(y - BAND)}l${-BAND} ${BAND}`)
  }
  return penJob(paths, { name: 'k', colour: stock.ink, width: 0.8, opacity: 0.44, seconds: 176, start: 118, absent: 4, pen: 4.6 })
}

/** The spline's tangent handles, the way a path editor shows them: a hairline through each waypoint with a small knob at each end. */
function handles(stock: Stock): string {
  let lines = ''
  let knobs = ''
  for (const anchor of AUTO) {
    for (const length of [-anchor.reach, anchor.leave]) {
      if (length === 0) continue
      const end = polar(anchor, length, anchor.dir)
      lines += `M${anchor.x} ${anchor.y}L${at(end)}`
      knobs += `<circle cx="${n(end.x)}" cy="${n(end.y)}" r="2.1" fill="${stock.paper}"/>`
    }
  }
  return `<g stroke="${stock.ink}" stroke-width=".8"><path d="${lines}" stroke-opacity=".3"/><g stroke-opacity=".55">${knobs}</g></g>`
}

/** The autonomous run: the plan in hairline ink with its handles and waypoints, the robot that drives it and the red line it leaves. */
function autoRun(stock: Stock, run: Run): Markup {
  const poses = drive(run, 60)
  const lastPose = poses.length - 1
  const start = AUTO[0] ?? { x: 0, y: 0, dir: 0, facing: 0 }
  const lastIndex = AUTO.length - 1
  const end = AUTO[lastIndex] ?? { x: 0, y: 0, dir: 0, facing: 0 }
  const startWheel = n(poses[0]?.wheel ?? 0)

  let move = `0%{transform:translate(${start.x}px,${start.y}px);opacity:1}`
  let turn = `0%{transform:rotate(${start.facing}deg)}`
  let steer = `0%{transform:rotate(${startWheel}deg)}`
  let ink = `0%{stroke-dashoffset:1.01;opacity:1}`
  poses.forEach((pose, stop) => {
    const percent = cycleAt(stop / lastPose)
    move += `${percent}%{transform:translate(${n(pose.x)}px,${n(pose.y)}px)}`
    turn += `${percent}%{transform:rotate(${n(pose.heading)}deg)}`
    steer += `${percent}%{transform:rotate(${n(pose.wheel)}deg)}`
    ink += `${percent}%{stroke-dashoffset:${stop === 0 ? 1.01 : (1 - pose.along).toFixed(4)}}`
  })
  const endWheel = n(poses[lastPose]?.wheel ?? 0)
  // The robot fades at the end of the run and is set down again at the start; it turns back while it cannot be seen.
  move += `${HOLD_UNTIL}%{transform:translate(${end.x}px,${end.y}px);opacity:1}${GONE_AT}%{transform:translate(${end.x}px,${end.y}px);opacity:0}${GONE_AT + 0.1}%{transform:translate(${start.x}px,${start.y}px);opacity:0}${BACK_FROM}%{transform:translate(${start.x}px,${start.y}px);opacity:0}${BACK_AT}%{transform:translate(${start.x}px,${start.y}px);opacity:1}100%{transform:translate(${start.x}px,${start.y}px);opacity:1}`
  turn += `${GONE_AT}%{transform:rotate(${end.facing}deg);animation-timing-function:ease-in-out}${BACK_FROM}%{transform:rotate(${start.facing}deg)}100%{transform:rotate(${start.facing}deg)}`
  steer += `${GONE_AT}%{transform:rotate(${endWheel}deg)}${BACK_FROM}%{transform:rotate(${startWheel}deg)}100%{transform:rotate(${startWheel}deg)}`
  ink += `${HOLD_UNTIL}%{stroke-dashoffset:0;opacity:1}${GONE_AT}%{stroke-dashoffset:0;opacity:0}${GONE_AT + 0.1}%{stroke-dashoffset:1.01;opacity:0}${BACK_AT}%{stroke-dashoffset:1.01;opacity:0}100%{stroke-dashoffset:1.01;opacity:1}`

  let css = `
.bot{transform:translate(${start.x}px,${start.y}px);animation:bot ${RUN_CLOCK}}
.rot{transform:rotate(${start.facing}deg);animation:rot ${RUN_CLOCK}}
.whl{transform:rotate(${startWheel}deg);animation:whl ${RUN_CLOCK}}
.line{stroke-width:1.5;animation:line ${RUN_CLOCK}}
@keyframes bot{${move}}
@keyframes rot{${turn}}
@keyframes whl{${steer}}
@keyframes line{${ink}}`

  let marks = ''
  let dots = ''
  let pieces = ''
  AUTO.forEach((anchor, index) => {
    if (index === 0) return
    const reached = cycleAt(anchorTime(run, index))
    if (anchor.piece) {
      pieces += `<circle cx="${anchor.x}" cy="${anchor.y}" r="9.5" style="animation:piece${index} ${RUN_CLOCK}"/>`
      css += `
@keyframes piece${index}{0%{opacity:1}${n(reached - 0.8)}%{opacity:1}${n(reached - 0.4)}%{opacity:0}${BACK_FROM}%{opacity:0}${BACK_AT}%{opacity:1}100%{opacity:1}}`
    }
    marks += `<circle cx="${anchor.x}" cy="${anchor.y}" r="4.8" fill="${stock.paper}" stroke-width="1.1" stroke-opacity=".85"/>`
    dots += `<circle cx="${anchor.x}" cy="${anchor.y}" r="2.1" style="animation:dot${index} ${RUN_CLOCK}"/>`
    css += `
@keyframes dot${index}{0%{opacity:0}${reached}%{opacity:0}${n(reached + 0.4)}%{opacity:1}${HOLD_UNTIL}%{opacity:1}${GONE_AT}%{opacity:0}100%{opacity:0}}`
  })

  // As the robot passes the shooting waypoint, facing the goal, a ball leaves its front and crosses to the goal.
  const shooter = AUTO[2] ?? start
  const fired = cycleAt(anchorTime(run, 2))
  const clear = n((ROBOT_HALF + 4) / (GOAL.x - shooter.x))
  css += `
.fire{stroke-width:7;animation:fire ${RUN_CLOCK}}
@keyframes fire{0%{stroke-dashoffset:${-clear};opacity:0}${fired}%{stroke-dashoffset:${-clear};opacity:0}${n(fired + 0.1)}%{stroke-dashoffset:${-clear};opacity:1}${n(fired + 1.3)}%{stroke-dashoffset:-1;opacity:1}${n(fired + 1.4)}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}}`

  // A coach's arrowhead on each leg of the plan after the first, whose direction the start box already gives.
  let arrows = ''
  for (let leg = 1; leg < lastIndex; leg += 1) {
    const from = run.anchorIndex[leg] ?? 0
    const to = run.anchorIndex[leg + 1] ?? from
    const index = Math.round(from + (to - from) * 0.5)
    const tip = run.points[index] ?? start
    const before = run.points[index - 1] ?? tip
    const heading = (Math.atan2(tip.y - before.y, tip.x - before.x) * 180) / Math.PI
    const back = polar(tip, -6.5, heading)
    arrows += `M${at(polar(back, 3.3, heading + 90))}L${at(tip)}L${at(polar(back, 3.3, heading - 90))}`
  }

  const defs = `<path id="run" pathLength="1" d="${run.d}"/>`
  const body =
    `<use href="#run" stroke="${stock.ink}" stroke-width=".9" stroke-opacity=".5" stroke-linecap="butt" stroke-dasharray="${(4.5 / run.length).toFixed(5)} ${(3.5 / run.length).toFixed(5)}"/>` +
    handles(stock) +
    `<path d="${arrows}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".7"/>` +
    `<path d="${startMarks(start)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".5"/>` +
    ghost(end, end.facing, stock) +
    `<use href="#run" class="ink line" stroke="${stock.red}"/>` +
    `<g stroke="${stock.red}" stroke-width="1.2" stroke-opacity=".85">${pieces}</g>` +
    `<g stroke="${stock.ink}">${marks}</g>` +
    `<g fill="${stock.red}">${dots}</g>` +
    `<path class="pen fire" pathLength="1" d="M${shooter.x} ${shooter.y}L${GOAL.x} ${GOAL.y}" stroke="${stock.red}"/>` +
    // The number rides with the robot but does not turn with it, so it always reads upright; the chassis keeps its middle clear for it.
    `<g class="bot">${robotFromAbove(stock)}<text x=".3" y="3.4" text-anchor="middle" font-size="9.5" font-weight="600" letter-spacing=".6" fill="${stock.red}">8810</text></g>` +
    `<text x="${WALL - 9}" y="${TOP + 22}" text-anchor="end" font-size="13" letter-spacing="2.2" fill="${stock.red}">8810</text>` +
    `<text x="${WALL - 10}" y="${TOP + 37}" text-anchor="end" font-size="9.5" letter-spacing="1.2" fill="${stock.ink}" fill-opacity=".6">AUTO 1</text>`
  return { defs, css, body }
}

/** The heading dial: a ring graduated every five degrees, and inside it a small chassis with a red pointer that turns with the robot's own. Angles are marked the way the robot's code counts them, anticlockwise from east. */
function dial(stock: Stock): Markup {
  const centre: Point = { x: 0, y: 0 }
  let fine = ''
  let ticks = ''
  for (let degrees = 0; degrees < 360; degrees += 5) {
    if (degrees % 15 !== 0) fine += `M${at(polar(centre, DIAL_RADIUS - 2.6, degrees))}L${at(polar(centre, DIAL_RADIUS, degrees))}`
    else ticks += `M${at(polar(centre, DIAL_RADIUS - (degrees % 90 === 0 ? 9 : degrees % 45 === 0 ? 6.5 : 4.4), degrees))}L${at(polar(centre, DIAL_RADIUS, degrees))}`
  }
  const body =
    `<g transform="translate(${DIAL.x} ${DIAL.y})">` +
    `<g stroke="${stock.ink}">` +
    `<circle r="${DIAL_RADIUS}" stroke-width="1" stroke-opacity=".62"/>` +
    `<path d="${fine}" stroke-width=".8" stroke-opacity=".4"/>` +
    `<path d="${ticks}" stroke-width=".9" stroke-opacity=".6"/>` +
    `</g>` +
    `<g class="rot">` +
    `<rect x="-9.5" y="-9.5" width="19" height="19" rx="3" fill="${stock.red}" fill-opacity=".2" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".85"/>` +
    `<path d="M9.5 0H24.4M19 -3.6L25 0L19 3.6" stroke="${stock.red}" stroke-width="1.4"/>` +
    `</g>` +
    `<g fill="${stock.ink}" fill-opacity=".52" font-size="9">` +
    `<text x="${DIAL_RADIUS + 7}" y="3.2">0</text>` +
    `<text y="${-DIAL_RADIUS - 7}" text-anchor="middle">90</text>` +
    `<text x="${-DIAL_RADIUS - 7}" y="3.2" text-anchor="end">180</text>` +
    `<text y="${DIAL_RADIUS + 14.5}" text-anchor="middle">-90</text>` +
    `</g></g>`
  return { defs: '', css: '', body }
}

/** The shot from the side: ground with a metre rule, the robot and its shooter wheel, a protractor at the launch point, the goal on its post, and the family of arcs with the ball that flies them. */
function shot(stock: Stock): Markup {
  const reach = TARGET.x - LAUNCH.x
  const rise = LAUNCH.y - TARGET.y
  const cycle = 84
  const step = cycle / APEXES.length
  const drawShare = 9.2
  let defs = ''
  let css = ''
  let strokes = ''
  let balls = ''
  const angles: number[] = []
  APEXES.forEach((apex, line) => {
    // The launch slope whose arc tops out `apex` above the launch point and still comes down through the goal.
    const slope = (2 * (apex + Math.sqrt(apex * apex - apex * rise))) / reach
    angles.push(Math.round((Math.atan(slope) * 180) / Math.PI))
    const drop = (reach * slope - rise) / (reach * reach)
    // A parabola is exactly one quadratic curve, and its parameter is time: the ball crosses the ground at a steady rate.
    const control = { x: LAUNCH.x + reach / 2, y: LAUNCH.y - (slope * reach) / 2 }
    defs += `<path id="s${line}" pathLength="1" d="M${at(LAUNCH)}Q${at(control)} ${at(TARGET)}"/>`
    const lengths: number[] = [0]
    let before = LAUNCH
    for (let sample = 1; sample <= 100; sample += 1) {
      const x = (reach * sample) / 100
      const here = { x: LAUNCH.x + x, y: LAUNCH.y - (slope * x - drop * x * x) }
      lengths.push((lengths[sample - 1] ?? 0) + Math.hypot(here.x - before.x, here.y - before.y))
      before = here
    }
    const whole = lengths[100] ?? 1
    let ink = ''
    let ball = ''
    for (let stop = 0; stop <= 10; stop += 1) {
      const along = (lengths[stop * 10] ?? 0) / whole
      const percent = n((stop / 10) * drawShare)
      ink += `${percent}%{stroke-dashoffset:${stop === 0 ? 1.01 : (1 - along).toFixed(4)};opacity:1}`
      ball += `${percent}%{stroke-dashoffset:${(-along).toFixed(4)};opacity:1}`
    }
    ink += `${n(drawShare * 2.4)}%{stroke-dashoffset:0;opacity:.76}83%{stroke-dashoffset:0;opacity:.76}88%{stroke-dashoffset:0;opacity:0}88.1%{stroke-dashoffset:1.01;opacity:0}100%{stroke-dashoffset:1.01;opacity:1}`
    ball += `${n(drawShare + 0.01)}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}`
    css += `
@keyframes s-ink${line}{${ink}}
@keyframes s-ball${line}{${ball}}`
    // Arc 3 is in flight at the first frame; the others follow one step apart.
    const phase = (((2.5 - (line - 3) * step) % cycle) + cycle) % cycle
    const opacity = n(1 - 0.075 * line)
    strokes += `<use href="#s${line}" class="ink" stroke-opacity="${opacity}" style="animation:s-ink${line} ${cycle}s linear infinite;animation-delay:${n(-phase)}s"/>`
    balls += `<use href="#s${line}" class="pen" style="animation:s-ball${line} ${cycle}s linear infinite;animation-delay:${n(-phase)}s"/>`
  })

  let scale = ''
  let numerals = ''
  for (let quarter = 0; quarter <= 8; quarter += 1) {
    const x = n(LAUNCH.x + (quarter * METRE) / 4)
    scale += `M${x} ${GROUND + SOIL}v${quarter % 4 === 0 ? 8 : quarter % 2 === 0 ? 5 : 2.8}`
    if (quarter % 4 === 0) numerals += `<text x="${x}" y="${GROUND + SOIL + 20}" text-anchor="middle">${quarter / 4}</text>`
  }
  for (let quarter = 1; quarter <= 8; quarter += 1) {
    const y = n(GROUND - (quarter * METRE) / 4)
    scale += `M${TARGET.x} ${y}h${quarter % 4 === 0 ? 7 : quarter % 2 === 0 ? 4.5 : 2.6}`
    if (quarter % 4 === 0) numerals += `<text x="${TARGET.x + 11}" y="${y + 3.2}">${quarter / 4}</text>`
  }
  // The ground is cut solid too.
  let soil = ''
  for (let x = EARTH_FROM + 3; x + SOIL <= EARTH_TO; x += 7) soil += `M${x} ${GROUND + SOIL}l${SOIL} ${-SOIL}`
  let protractor = arc(LAUNCH, 38, 270, 360) + `M${LAUNCH.x} ${LAUNCH.y}h46`
  for (let degrees = 10; degrees <= 80; degrees += 10) {
    protractor += `M${at(polar(LAUNCH, degrees % 30 === 0 ? 32 : 35, -degrees))}L${at(polar(LAUNCH, 38, -degrees))}`
  }
  // The robot from the side: wheels under a bumper, two struts, and the shooter wheel under its hood.
  const wheel: Point = { x: LAUNCH.x, y: LAUNCH.y + 7 }
  const left = LAUNCH.x - ROBOT_HALF
  const machine =
    `<circle cx="${left + 11}" cy="${GROUND - 4.2}" r="4.2" stroke-width="1" stroke-opacity=".8"/><circle cx="${left + 51}" cy="${GROUND - 4.2}" r="4.2" stroke-width="1" stroke-opacity=".8"/>` +
    `<rect x="${left}" y="${GROUND - 16}" width="62" height="10.5" rx="3" fill="${stock.paper}" stroke="none"/>` +
    `<rect x="${left}" y="${GROUND - 16}" width="62" height="10.5" rx="3" fill="${stock.red}" fill-opacity=".2" stroke-width="1.3" stroke-opacity=".9"/>` +
    `<path d="M${left + 9} ${GROUND - 16}L${wheel.x - 9} ${wheel.y + 2}M${left + 53} ${GROUND - 16}L${wheel.x + 7} ${wheel.y + 4}" stroke-width=".9" stroke-opacity=".6"/>` +
    `<circle cx="${wheel.x}" cy="${wheel.y}" r="7" fill="${stock.paper}" stroke-width="1.1" stroke-opacity=".85"/>` +
    `<circle cx="${wheel.x}" cy="${wheel.y}" r="1.3" fill="${stock.ink}" fill-opacity=".7" stroke="none"/>` +
    `<path d="${arc(wheel, 11, 150, 258)}" stroke-width="1.1" stroke-opacity=".7"/>`
  const cup = `M${TARGET.x - 13} ${TARGET.y - 9}L${TARGET.x - 7} ${TARGET.y + 3}H${TARGET.x + 7}L${TARGET.x + 13} ${TARGET.y - 9}`
  const labelLow = polar(LAUNCH, 52, -44)
  const body =
    `<g stroke="${stock.ink}">` +
    `<path d="${soil}" stroke-width=".8" stroke-opacity=".44"/>` +
    `<path d="M${EARTH_FROM} ${GROUND + SOIL}H${EARTH_TO}V${GROUND}" stroke-width="1" stroke-opacity=".7"/>` +
    `<path d="M${EARTH_FROM} ${GROUND}H${EARTH_TO}" stroke-width="1.5" stroke-opacity=".9"/>` +
    `<path d="${trailOff(EARTH_FROM, GROUND, -1, 0)}" stroke-width="1.5" stroke-opacity=".55"/>` +
    `<path d="${scale}" stroke-width="1" stroke-opacity=".6"/>` +
    `<path d="M${LAUNCH.x} ${LAUNCH.y}v-50" stroke-width=".9" stroke-opacity=".4"/>` +
    `<path d="${protractor}" stroke-width=".9" stroke-opacity=".5"/>` +
    `<path d="M${TARGET.x} ${TARGET.y + 3}V${GROUND}" stroke-width=".9" stroke-opacity=".5"/>` +
    `</g>` +
    `<g stroke="${stock.ink}" stroke-width="1.15">${strokes}</g>` +
    `<g stroke="${stock.red}" stroke-width="8">${balls}</g>` +
    `<g stroke="${stock.ink}">${machine}</g>` +
    `<text x="${LAUNCH.x + 0.4}" y="${GROUND - 8.2}" text-anchor="middle" font-size="7.2" font-weight="600" letter-spacing=".9" fill="${stock.ink}" fill-opacity=".8">8810</text>` +
    `<path d="${cup}" stroke="${stock.red}" stroke-width="1.5"/>` +
    `<g fill="${stock.ink}" fill-opacity=".55" font-size="9">${numerals}` +
    `<text x="${n(labelLow.x)}" y="${n(labelLow.y)}">${angles[0] ?? 0}°</text>` +
    `<text x="${LAUNCH.x - 6}" y="${LAUNCH.y - 56}" text-anchor="end">${angles[angles.length - 1] ?? 0}°</text>` +
    `</g>`
  return { defs, css, body }
}

/** The whole sheet on one stock. */
function sheet(stock: Stock): string {
  const run = planRun(AUTO)
  const parts = [wallHatch(stock), station(stock), autoRun(stock, run), dial(stock), shot(stock)]
  const style = `
.ink{stroke-dasharray:1 2}
.pen{stroke-dasharray:.0001 3;stroke-opacity:1;opacity:0}${parts.map(part => part.css).join('')}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}${DEBUG_REST ? '*{animation:none!important}' : ''}`
  const drawing = `${field(stock)}
${parts.map(part => part.body).join('\n')}`
  const group = `<g fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="ui-monospace,Menlo,monospace"`
  const views =
    DEBUG_VIEWS.length === 0
      ? `${group}>\n${drawing}\n</g>`
      : DEBUG_VIEWS.map(view => `${group} transform="scale(${view[0] ?? 1}) translate(${view[1] ?? 0} ${view[2] ?? 0})">${drawing}</g>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${parts.map(part => part.defs).join('')}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
${views}
</svg>`
}

/** Strategy Sheet on warm paper, for a light window. */
export function daySvg(): string {
  return sheet(DAY)
}

/** Strategy Sheet on umber, for a dark window. */
export function nightSvg(): string {
  return sheet(NIGHT)
}
