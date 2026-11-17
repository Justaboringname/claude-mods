// Circuit Flow: a corner of a printed circuit board, drawn with a technical pen.
// Lower right, a square chip (U1) with a pin-1 dot. Its pins leave in parallel bundles that only ever turn by 45 degrees:
// a six-line bus up the right edge to a pin header (J1); seven lines round the pin-1 corner that end in a rank of vias like organ pipes;
// a differential pair that folds into a length-matching serpentine, drops through two vias and passes under the bus on the second layer;
// three lines through a resistor array into three small LEDs and a ground rail that joins the hatched copper pour in the corner;
// five lines off the lower edge; two to a crystal. In the left band a small ten-pin chip (U2) feeds a planar coil wound inward to a via,
// with a fiducial mark and the board's legend below it.
// Every bundle is one centre line pushed sideways with mitred corners, so the clearance between neighbours is the same on straights
// and round bends, and nothing on a layer ever crosses.
// Motion: short pulses of current run along the traces, each on its own period; a via or a pin lights for a moment when one arrives, an LED a little longer.
// Four relays tie pulses together: one comes in to a chip and, a moment later, another leaves it.
// The picture at rest is the first frame of the motion: every pulse's resting place is worked out from its own phase.
// Two stocks: graphite on warm paper with terracotta current, copper on warm black with amber current. Pure string building.

const WIDTH = 1600
const HEIGHT = 1000
/** A pulse's tail, in pixels. Every trace is measured in tails, so one set of keyframes moves every pulse at a speed set by its period. */
const TAIL = 56
/** How far a pulse's keyframes carry it, in tails: longer than the longest trace and a tail, so the whole pulse always leaves the far end. */
const TRAVEL = 15

interface Stock {
  paper: string
  trace: string
  traceOpacity: number
  /** A wide, faint copy of the top layer under the lines: the copper's own shine on the dark stock, nothing on paper. */
  sheenOpacity: number
  under: string
  underOpacity: number
  pad: string
  body: string
  accent: string
  hatchOpacity: number
  pourOpacity: number
  silk: string
  silkOpacity: number
  pulse: string
  head: string
  tailOpacity: number
  haloOpacity: number
  underPulseOpacity: number
}

const DAY: Stock = {
  paper: '#f3eee3', trace: '#3f3b36', traceOpacity: 0.66, sheenOpacity: 0, under: '#b39a7c', underOpacity: 0.62, pad: '#dbc19f', body: '#ede4d3',
  accent: '#c4552d', hatchOpacity: 0.34, pourOpacity: 0.26, silk: '#857b6c', silkOpacity: 0.66,
  pulse: '#c4552d', head: '#d2491b', tailOpacity: 0.52, haloOpacity: 0.22, underPulseOpacity: 0.5,
}
/** The same board in copper on warm black: no blue anywhere. */
const NIGHT: Stock = {
  paper: '#1e1812', trace: '#bd854f', traceOpacity: 0.7, sheenOpacity: 0.05, under: '#6e4d33', underOpacity: 0.75, pad: '#684a2d', body: '#282019',
  accent: '#dc8c4c', hatchOpacity: 0.3, pourOpacity: 0.3, silk: '#93826b', silkOpacity: 0.62,
  pulse: '#ffab4a', head: '#ffdca6', tailOpacity: 0.45, haloOpacity: 0.3, underPulseOpacity: 0.45,
}

interface Point {
  x: number
  y: number
}

type Compass = 'E' | 'NE' | 'N' | 'NW' | 'W' | 'SW' | 'S' | 'SE'
type Move = [Compass, number]

const HEADINGS: Record<Compass, Point> = {
  E: { x: 1, y: 0 }, NE: { x: 1, y: -1 }, N: { x: 0, y: -1 }, NW: { x: -1, y: -1 },
  W: { x: -1, y: 0 }, SW: { x: -1, y: 1 }, S: { x: 0, y: 1 }, SE: { x: 1, y: 1 },
}

/** How a pulse runs: 'quick' spends 50% of its period on the road, 'rare' 27.5%, so a long period does not have to mean a slow pulse. */
type Pace = 'quick' | 'rare'
const PACE_SHARE: Record<Pace, number> = { quick: 50, rare: 27.5 }

/** The parts of one pulse, each a dash that ends at the pulse's front: name and length in tails. The spot is a round dot on the front itself. */
const PULSE_PARTS: [string, number][] = [['tail', 1], ['mid', 0.46], ['head', 0.16], ['spot', 0]]

interface Pulse {
  points: Point[]
  seconds: number
  pace: Pace
  /** Where in its period the pulse is at the first frame, 0..1. */
  phase: number
  under: boolean
  /** A via or pad at the far end that lights when the pulse arrives; radius 0 means none. */
  glowRadius: number
  /** An LED at the far end that the pulse lights; null means none. */
  lamp: Point | null
  /** The far end is a chip's pin: its pad lights instead of a round one. */
  pin: boolean
}

/** What differs from pulse to pulse on a bundle: runs backwards (toward the chip), period, pace, and a cue.
 * A cue of zero or more is where the pulse's front stands at the first frame, in pixels along its trace;
 * a negative cue is how many seconds after the first frame it sets out. */
type Plan = [boolean, number, Pace, number]

interface Board {
  top: Point[][]
  power: Point[][]
  under: Point[][]
  vias: Point[]
  pads: string
  rings: string
  pours: string
  bodies: string
  silk: string
  labels: string
  pulses: Pulse[]
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function wrap(value: number): number {
  return ((value % 1) + 1) % 1
}

/** A trace from a start point: each move goes `reach` along a compass heading (for a diagonal, that far on each axis). */
function route(x: number, y: number, moves: Move[]): Point[] {
  const points: Point[] = [{ x, y }]
  let hereX = x
  let hereY = y
  for (const [heading, reach] of moves) {
    const step = HEADINGS[heading]
    hereX += step.x * reach
    hereY += step.y * reach
    points.push({ x: hereX, y: hereY })
  }
  return points
}

/** The unit normal to the left of the direction of travel (y grows downward, so left of east is north). */
function leftNormal(from: Point, to: Point): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  return { x: dy / length, y: -dx / length }
}

/** The trace pushed `distance` to its left, with mitred corners: the gap to the original is `distance` on every segment and round every bend. */
function offsetRoute(points: Point[], distance: number): Point[] {
  return points.map((point, index) => {
    const before = points[index - 1]
    const after = points[index + 1]
    const normalIn = before ? leftNormal(before, point) : after ? leftNormal(point, after) : null
    const normalOut = after ? leftNormal(point, after) : normalIn
    if (!normalIn || !normalOut) return point
    const scale = distance / (1 + normalIn.x * normalOut.x + normalIn.y * normalOut.y)
    return { x: point.x + (normalIn.x + normalOut.x) * scale, y: point.y + (normalIn.y + normalOut.y) * scale }
  })
}

/** `count` parallel traces about a centre line, `pitch` apart, listed from the right of travel to the left. */
function bundle(centre: Point[], count: number, pitch: number): Point[][] {
  const traces: Point[][] = []
  for (let index = 0; index < count; index += 1) traces.push(offsetRoute(centre, (index - (count - 1) / 2) * pitch))
  return traces
}

/** The same trace with its last point moved along the last (vertical) segment to height `y`. */
function endingAt(points: Point[], y: number): Point[] {
  const last = points[points.length - 1]
  if (!last) return points
  return points.slice(0, -1).concat([{ x: last.x, y }])
}

function reversed(points: Point[]): Point[] {
  return points.slice().reverse()
}

function lengthOf(points: Point[]): number {
  let length = 0
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1]
    const to = points[index]
    if (from && to) length += Math.hypot(to.x - from.x, to.y - from.y)
  }
  return length
}

function pathOf(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`).join('')
}

function rectangle(centreX: number, centreY: number, width: number, height: number, corner: number): string {
  return `<rect x="${round(centreX - width / 2)}" y="${round(centreY - height / 2)}" width="${width}" height="${height}" rx="${corner}"/>`
}

function box(left: number, top: number, right: number, bottom: number): Point[] {
  return [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }]
}

/** Hatch strokes leaning like a slash across any outline, `gap` apart: each stroke is cut where it enters and leaves the shape. */
function hatch(corners: Point[], gap: number): string {
  const sums = corners.map(corner => corner.x + corner.y)
  const step = gap * Math.SQRT2
  let path = ''
  for (let sum = Math.min(...sums) + step; sum < Math.max(...sums) - step / 2; sum += step) {
    const crossings: number[] = []
    corners.forEach((from, index) => {
      const to = corners[(index + 1) % corners.length]
      if (!to) return
      const before = from.x + from.y - sum
      const after = to.x + to.y - sum
      if (before < 0 !== after < 0) crossings.push(from.x + ((to.x - from.x) * before) / (before - after))
    })
    crossings.sort((first, second) => first - second)
    for (let index = 0; index + 1 < crossings.length; index += 2) {
      const fromX = crossings[index] ?? 0
      const toX = crossings[index + 1] ?? 0
      if (toX - fromX > 2) path += `M${round(fromX)} ${round(sum - fromX)}L${round(toX)} ${round(sum - toX)}`
    }
  }
  return path
}

function label(x: number, y: number, text: string): string {
  return `<text x="${x}" y="${y}">${text}</text>`
}

const VIA_RADIUS = 3.3
const HEADER_RADIUS = 5.2

/** A cue turned into the pulse's place in its period at the first frame. */
function phaseOf(cue: number, seconds: number, pace: Pace): number {
  if (cue < 0) return wrap(1 + cue / seconds)
  return ((PACE_SHARE[pace] / 100) * (cue / TAIL + 0.1)) / TRAVEL
}

/** The share of its period a pulse needs before its front reaches the far end of its trace. */
function arrivalShare(points: Point[], pace: Pace): number {
  return ((lengthOf(points) / TAIL + 0.1) / TRAVEL) * (PACE_SHARE[pace] / 100)
}

/** A bundle's pulses, one per trace: each runs out from the chip or, reversed, in toward it. A pulse that ends on a via or pad lights it. */
function runPulses(board: Board, traces: Point[][], plans: Plan[], glowRadius: number): Pulse[] {
  const made: Pulse[] = []
  traces.forEach((points, index) => {
    const plan = plans[index]
    if (!plan) return
    const [inward, seconds, pace, cue] = plan
    made.push({
      points: inward ? reversed(points) : points, seconds, pace, phase: phaseOf(cue, seconds, pace), under: false, glowRadius: inward ? 0 : glowRadius, lamp: null, pin: inward,
    })
  })
  board.pulses.push(...made)
  return made
}

/** A relay through a chip: `lead` takes the period of `next` and is timed to reach its pin `seconds` before `next` sets out from another.
 * This replaces the period and cue that `lead` was planned with. */
function relay(lead: Pulse | undefined, next: Pulse | undefined, seconds: number): void {
  if (!lead || !next) return
  lead.seconds = next.seconds
  lead.phase = wrap(next.phase + arrivalShare(lead.points, lead.pace) + seconds / next.seconds)
}

/** The main chip, lower right: a square package, nine pins a side, pin 1 at the upper left corner. */
function mainChip(board: Board): void {
  const centreX = 1420
  const centreY = 700
  const half = 58
  const left = centreX - half
  const right = centreX + half
  const top = centreY - half
  const bottom = centreY + half

  for (let pin = -4; pin <= 4; pin += 1) {
    const along = pin * 10
    board.pads += rectangle(centreX + along, top - 5, 5, 14, 1) + rectangle(centreX + along, bottom + 5, 5, 14, 1)
    board.pads += rectangle(left - 5, centreY + along, 14, 5, 1) + rectangle(right + 5, centreY + along, 14, 5, 1)
  }
  const inset = 7
  board.bodies +=
    `<path class="body" d="M${left + 9} ${top}H${right}V${bottom}H${left}V${top + 9}Z"/>` +
    `<path class="hatch" d="${hatch(box(left + inset, top + inset, right - inset, bottom - inset), 6)}"/>` +
    `<path class="inner" d="M${left + inset + 7} ${top + inset}H${right - inset}V${bottom - inset}H${left + inset}V${top + inset + 7}Z"/>` +
    `<circle class="clear" cx="${left + 19}" cy="${top + 19}" r="7"/><circle class="dot" cx="${left + 19}" cy="${top + 19}" r="2.6"/>`
  // The silkscreen's corner marks outside the pads; the pin-1 corner gets a small flag instead.
  board.silk +=
    `M${right + 4} ${top - 12}H${right + 12}V${top - 4}M${right + 4} ${bottom + 12}H${right + 12}V${bottom + 4}M${left - 4} ${bottom + 12}H${left - 12}V${bottom + 4}` +
    `M${left - 12} ${top - 12}h8l-8 8Z`
  board.labels += label(right + 17, bottom + 24, 'U1')

  // The bus: the six upper pins of the right side turn north and run up the right edge to the header J1,
  // where each line jogs north-west to its own pad, every jog starting 4 higher than the last so the diagonals keep their distance.
  const busCentre = route(right + 6, centreY - 15, [['E', 29], ['NE', 42], ['N', 10]])
  const headerY = 210
  const bus = bundle(busCentre, 6, 10).map((trace, index) => {
    const inward = 5 - index
    const busX = 1530 + inward * 10
    const jogFrom = 330 - inward * 4
    const jog = 54 - inward * 6
    const padX = busX - jog
    board.rings +=
      (index === 0
        ? `<rect class="ring" x="${padX - HEADER_RADIUS}" y="${headerY - HEADER_RADIUS}" width="${HEADER_RADIUS * 2}" height="${HEADER_RADIUS * 2}" rx="1"/>`
        : `<circle class="ring" cx="${padX}" cy="${headerY}" r="${HEADER_RADIUS}"/>`) + `<circle class="hole" cx="${padX}" cy="${headerY}" r="2"/>`
    return trace.slice(0, 3).concat([{ x: busX, y: jogFrom }, { x: busX - jog, y: jogFrom - jog }, { x: busX - jog, y: headerY }])
  })
  board.top.push(...bus)
  // Three neighbours go up in formation, a word on the bus; the others keep their own time, two of them coming down.
  const busPulses = runPulses(board, bus, [
    [true, 29, 'quick', -9],
    [false, 36, 'quick', -1.5],
    [false, 32, 'quick', 395],
    [false, 32, 'quick', 360],
    [false, 32, 'quick', 325],
    [true, 47, 'rare', -21],
  ], HEADER_RADIUS)
  board.silk += `M1464 ${headerY - 13}H1568V${headerY + 13}H1464Z`
  board.labels += label(1464, headerY - 19, 'J1')

  // Round the pin-1 corner: four lines from the top side and three from the left side leave north-west as one bundle with a one-line gap,
  // then run north and stop at vias, each a little higher than its neighbour.
  const upperEnds = [398, 434, 468, 500]
  const upper = bundle(route(centreX - 25, top - 6, [['N', 32], ['NW', 70], ['N', 10]]), 4, 10).map((trace, index) => endingAt(trace, upperEnds[index] ?? 500))
  const sideEnds = [548, 572, 596]
  const side = bundle(route(left - 6, centreY - 30, [['W', 58.2], ['NW', 17.8], ['N', 10]]), 3, 10).map((trace, index) => endingAt(trace, sideEnds[index] ?? 596))
  for (const points of upper.concat(side)) {
    const end = points[points.length - 1]
    board.top.push(points)
    if (end) board.vias.push(end)
  }
  runPulses(board, upper, [
    [false, 26, 'quick', 150],
    [false, 50, 'rare', -2.5],
    [true, 33, 'quick', -12],
    [false, 24, 'quick', -19],
  ], VIA_RADIUS)
  runPulses(board, side, [
    [false, 27, 'quick', -1.2],
    [true, 39, 'quick', -16],
    [false, 53, 'rare', -28],
  ], VIA_RADIUS)

  // A crystal across two top pins, the lines parting at the last moment.
  board.top.push(route(centreX, top - 6, [['N', 46], ['NW', 6], ['N', 9]]), route(centreX + 10, top - 6, [['N', 46], ['NE', 6], ['N', 9]]))
  board.pads += rectangle(centreX - 6, top - 71, 9, 9, 1.5) + rectangle(centreX + 16, top - 71, 9, 9, 1.5)
  board.silk += `M${centreX - 11} ${top - 83}H${centreX + 21}a10 10 0 0 1 0 20H${centreX - 11}a10 10 0 0 1 0 -20Z`
  board.labels += label(centreX - 21, top - 89, 'Y1')

  // A differential pair from the last two top pins: the lines close up to 6 apart, fold six times into a serpentine that makes up
  // their length, and end at two vias. From there the pair goes on along the second layer, east under the bus and off the sheet.
  const folds: Move[] = [['N', 4]]
  for (let run = 0; run < 6; run += 1) {
    const east = run % 2 === 0
    folds.push([east ? 'NE' : 'NW', 6], [east ? 'E' : 'W', 28], [east ? 'NE' : 'NW', 6], ['N', run < 5 ? 6 : 30])
  }
  const pairCentre = route(centreX + 49, 598, folds)
  const pairWest = endingAt([{ x: centreX + 30, y: top - 6 }, { x: centreX + 30, y: top - 20 }, { x: centreX + 46, y: top - 36 }].concat(offsetRoute(pairCentre, 3)), 462)
  const pairEast = endingAt([{ x: centreX + 40, y: top - 6 }, { x: centreX + 40, y: top - 20 }, { x: centreX + 52, y: top - 32 }].concat(offsetRoute(pairCentre, -3)), 474)
  // The two halves of the pair travel side by side; each one's second-layer pulse sets out as the first arrives at its via.
  const pairPulse: Pulse = { points: pairWest, seconds: 30, pace: 'quick', phase: phaseOf(215, 30, 'quick'), under: false, glowRadius: VIA_RADIUS, lamp: null, pin: false }
  for (const points of [pairWest, pairEast]) {
    const end = points[points.length - 1]
    if (!end) continue
    board.top.push(points)
    board.vias.push(end)
    const below = [end, { x: 1612, y: end.y }]
    board.under.push(below)
    board.pulses.push(
      { ...pairPulse, points },
      { ...pairPulse, points: below, phase: wrap(pairPulse.phase - arrivalShare(points, 'quick')), under: true, glowRadius: 0 },
    )
  }

  // The three lower pins of the right side each go through a resistor into a small LED; the LEDs share a ground rail,
  // a heavier trace that runs down into the copper pour.
  const railX = 1578
  const lampPlans: [number, number][] = [[22, 95], [29, -11], [37, -19]]
  const lampPulses: Pulse[] = []
  lampPlans.forEach(([seconds, cue], row) => {
    const y = centreY + 20 + row * 10
    board.top.push([{ x: right + 6, y }, { x: 1506, y }], [{ x: 1522, y }, { x: 1550, y }], [{ x: 1568, y }, { x: railX, y }])
    board.pads += rectangle(1508, y, 7, 6, 1) + rectangle(1520, y, 7, 6, 1) + rectangle(1552, y, 6, 6, 1) + rectangle(1566, y, 6, 6, 1)
    board.bodies += `<rect class="lens" x="1555.5" y="${y - 3}" width="7" height="6"/>`
    lampPulses.push({
      points: [{ x: right + 6, y }, { x: 1552, y }], seconds, pace: 'quick', phase: phaseOf(cue, seconds, 'quick'), under: false, glowRadius: 0, lamp: { x: 1559, y }, pin: false,
    })
  })
  board.pulses.push(...lampPulses)
  // A word coming down the bus is answered by the middle LED.
  relay(busPulses[0], lampPulses[1], 0.3)
  board.power.push([{ x: railX, y: centreY + 20 }, { x: railX, y: 800 }])
  board.silk += `M1502 ${centreY + 47}H1526M1547 ${centreY + 47}H1571`
  board.labels += label(1502, centreY + 58, 'RN1') + label(1547, centreY + 58, 'D1-3')

  // Off the lower edge: five lines from the bottom side, south, south-east, south again.
  const corner = bundle(route(centreX + 20, bottom + 6, [['S', 36], ['SE', 90], ['S', 114]]), 5, 10)
  board.top.push(...corner)
  const cornerPulses = runPulses(board, corner, [
    [true, 35, 'quick', 170],
    [false, 43, 'quick', -1],
    [true, 56, 'rare', -24],
    [true, 30, 'quick', -13],
    [false, 41, 'quick', -18],
  ], 0)
  // What comes in from the lower edge on the fourth line goes out again on the pair.
  relay(cornerPulses[3], pairPulse, 0.3)

  // Beside them, in the very corner of the board, a copper pour: hatched, its edge keeping its distance from the bundle, a mounting hole cut into it.
  const pour: Point[] = [
    { x: 1612, y: 800 }, { x: 1506, y: 800 }, { x: 1498, y: 808 }, { x: 1498, y: 815.9 }, { x: 1564, y: 881.9 }, { x: 1564, y: 1012 }, { x: 1612, y: 1012 },
  ]
  board.pours +=
    `<path class="pour" d="${hatch(pour, 7)}"/><path class="edge" d="${pathOf(pour)}Z"/>` +
    `<circle class="hole" cx="1583" cy="842" r="17"/><circle class="ring" cx="1583" cy="842" r="12.5"/><circle class="bore" cx="1583" cy="842" r="7"/>`
  for (const y of [906, 944, 982]) board.vias.push({ x: 1588, y })

  // Three left pins escape to vias a short way out, staggered.
  const escapes: [number, number][] = [[0, 1326], [20, 1312], [40, 1326]]
  for (const [down, viaX] of escapes) {
    board.top.push([{ x: left - 6, y: centreY + down }, { x: viaX, y: centreY + down }])
    board.vias.push({ x: viaX, y: centreY + down })
  }
}

/** The small chip in the left band: ten pins, four lines up to vias, five down the edge of the sidebar, a planar coil and its test point. */
function smallChip(board: Board): void {
  const centreX = 304
  const centreY = 748
  const left = centreX - 19
  const right = centreX + 19
  const top = centreY - 28
  const bottom = centreY + 28

  for (let pin = -2; pin <= 2; pin += 1) {
    const y = centreY + pin * 10
    board.pads += rectangle(left - 5, y, 14, 5, 1) + rectangle(right + 5, y, 14, 5, 1)
  }
  board.bodies +=
    `<path class="body" d="M${left + 6} ${top}H${right}V${bottom}H${left}V${top + 6}Z"/>` +
    `<path class="hatch" d="${hatch(box(left + 5, top + 5, right - 5, bottom - 5), 6)}"/>` +
    `<circle class="clear" cx="${left + 10}" cy="${top + 10}" r="5"/><circle class="dot" cx="${left + 10}" cy="${top + 10}" r="2"/>`
  board.labels += label(left, bottom + 13, 'U2')

  // A fiducial mark and the board's legend, low in the corner like a drawing's title block.
  board.rings += `<circle class="mark" cx="268" cy="903" r="6.5"/><circle class="ring" cx="268" cy="903" r="2.6"/>`
  board.labels += label(282, 901, 'CF-1600') + label(282, 912, 'REV C  2L')

  // The top right pin feeds a planar coil (L1): four and a quarter turns wound inward, 6 apart, every corner cut at 45 degrees.
  // At its centre the line drops through a via and leaves north-west on the second layer, under the turns, to a test point.
  const coilMoves: Move[] = [['E', 5], ['NE', 6], ['N', 82]]
  const turns: Compass[] = ['NW', 'W', 'SW', 'S', 'SE', 'E', 'NE', 'N']
  let side = 52
  for (let leg = 1; leg <= 15; leg += 1) {
    // Leg 0 was the first run north; each later leg is a cut corner and a straight side, and every second side is one pitch shorter.
    if (leg % 2 === 1 && leg > 1) side -= 6
    const corner = turns[((leg - 1) * 2) % 8]
    const along = turns[((leg - 1) * 2 + 1) % 8]
    if (corner && along) coilMoves.push([corner, 6], [along, side])
  }
  coilMoves.push(['NE', 6], ['N', 2], ['NW', 6], ['W', 2])
  const coil = route(right + 6, centreY - 20, coilMoves)
  const coilCentre = coil[coil.length - 1] ?? { x: 308, y: 666 }
  const testPoint: Point = { x: coilCentre.x - 40, y: coilCentre.y - 40 }
  board.top.push(coil)
  board.vias.push(coilCentre)
  board.under.push([coilCentre, testPoint])
  board.rings += `<circle class="ring" cx="${testPoint.x}" cy="${testPoint.y}" r="4.6"/><circle class="dot" cx="${testPoint.x}" cy="${testPoint.y}" r="1.5"/>`
  board.labels += label(346, 670, 'L1') + label(testPoint.x - 19, testPoint.y - 9, 'TP1')
  // One slow pulse winds in; as it reaches the centre a fainter one sets out underneath for the test point.
  const coilPulse: Pulse = { points: coil, seconds: 38, pace: 'quick', phase: phaseOf(330, 38, 'quick'), under: false, glowRadius: VIA_RADIUS, lamp: null, pin: false }
  board.pulses.push(coilPulse, {
    ...coilPulse, points: [coilCentre, testPoint], phase: wrap(coilPulse.phase - arrivalShare(coil, 'quick')), under: true, glowRadius: 4.6,
  })

  // Four lines turn north and stop at vias, tallest on the side away from the text.
  const pipeEnds = [642, 616, 590, 562]
  const pipes = bundle(route(right + 6, centreY + 5, [['E', 28], ['NE', 28], ['N', 10]]), 4, 10).map((trace, index) => endingAt(trace, pipeEnds[index] ?? 642))
  for (const points of pipes) {
    const end = points[points.length - 1]
    board.top.push(points)
    if (end) board.vias.push(end)
  }
  const pipePulses = runPulses(board, pipes, [
    [false, 25, 'quick', -7],
    [true, 34, 'quick', -15],
    [false, 31, 'quick', -23],
    [false, 48, 'rare', -6],
  ], VIA_RADIUS)

  // Five lines leave west, turn south-west and run down beside the sidebar and off the sheet.
  const edge = bundle(route(left - 6, centreY, [['W', 22], ['SW', 30], ['S', 240]]), 5, 10)
  board.top.push(...edge)
  const edgePulses = runPulses(board, edge, [
    [true, 38, 'quick', -9],
    [false, 52, 'rare', -0.5],
    [true, 28, 'quick', 130],
    [false, 34, 'quick', -20],
    [true, 58, 'rare', -33],
  ], 0)
  // Two relays through the small chip: up the outer edge line and into the coil; down a pipe and out along the edge.
  relay(edgePulses[0], coilPulse, 0.3)
  relay(pipePulses[1], edgePulses[3], 0.3)
}

function layout(): Board {
  const board: Board = { top: [], power: [], under: [], vias: [], pads: '', rings: '', pours: '', bodies: '', silk: '', labels: '', pulses: [] }
  mainChip(board)
  smallChip(board)
  return board
}

/** How bright a via's flash is, 0..1, `into` its period (0..1): the same curve as its keyframes, for the picture at rest. */
function glowAt(into: number): number {
  if (into < 0.015) return into / 0.015
  return into < 0.11 ? 1 - (into - 0.015) / 0.095 : 0
}

/** The same for an LED, which stays lit a while and fades slowly. */
function lampAt(into: number): number {
  if (into < 0.015) return into / 0.015
  if (into < 0.09) return 1
  return into < 0.3 ? 1 - (into - 0.09) / 0.21 : 0
}

/** The moving part: for each pulse a measured copy of its trace, and the dashes that share one run along it. */
function pulseMarkup(pulses: Pulse[]): { shapes: string; runs: string; underRuns: string; glows: string } {
  let shapes = ''
  let runs = ''
  let underRuns = ''
  let glows = ''
  pulses.forEach((item, index) => {
    const id = `p${index}`
    const tails = lengthOf(item.points) / TAIL
    const share = PACE_SHARE[item.pace] / 100
    shapes += `<path id="${id}" pathLength="${tails.toFixed(3)}" d="${pathOf(item.points)}"/>`
    // With motion off the picture is the first frame: a pulse that is on its trace then stays there; the rest are parked before their start.
    const front = item.phase < share ? (TRAVEL * item.phase) / share - 0.1 : -1
    const onTrace = front > 0 && front - 1 < tails
    const parts = PULSE_PARTS.map(([name, lead]) => {
      const rest = onTrace ? ` style="stroke-dashoffset:${Math.round((lead - front) * 100) / 100}"` : ''
      return `<use href="#${id}" class="${name}"${rest}/>`
    }).join('')
    const run = `<g class="${item.pace}${item.under ? ' low' : ''}" style="--d:${item.seconds}s;--l:${round(-item.phase * item.seconds)}s">${parts}</g>`
    // A pulse on the second layer is drawn with that layer, so the top layer's lines pass over it.
    if (item.under) underRuns += run
    else runs += run
    const end = item.points[item.points.length - 1]
    const before = item.points[item.points.length - 2]
    if (!end || !before || (item.glowRadius === 0 && !item.lamp && !item.pin)) return
    // The front reaches the far end this far into the pulse's period; the light's own period begins then.
    const into = wrap(item.phase - arrivalShare(item.points, item.pace))
    const timing = `--d:${item.seconds}s;--l:${round(-into * item.seconds)}s`
    if (item.lamp) {
      const lit = Math.round(lampAt(into) * 100) / 100
      glows +=
        `<g class="lamp" style="${timing}${lit > 0 ? `;opacity:${lit}` : ''}"><circle class="halo" cx="${item.lamp.x}" cy="${item.lamp.y}" r="9"/>` +
        `<rect class="lit" x="${item.lamp.x - 3.5}" y="${item.lamp.y - 3}" width="7" height="6"/></g>`
    } else {
      const lit = Math.round(glowAt(into) * 100) / 100
      const rest = `style="${timing}${lit > 0 ? `;opacity:${lit}` : ''}"`
      // A pin's pad lies along the last stretch of the trace, its middle one pixel further in.
      const flat = Math.abs(end.x - before.x) > Math.abs(end.y - before.y)
      const padX = end.x + Math.sign(end.x - before.x) * (flat ? 1 : 0)
      const padY = end.y + Math.sign(end.y - before.y) * (flat ? 0 : 1)
      glows += item.pin
        ? `<rect class="glow pin" x="${round(padX - (flat ? 7 : 2.5))}" y="${round(padY - (flat ? 2.5 : 7))}" width="${flat ? 14 : 5}" height="${flat ? 5 : 14}" rx="1" ${rest}/>`
        : `<circle class="glow" cx="${round(end.x)}" cy="${round(end.y)}" r="${item.glowRadius}" ${rest}/>`
    }
  })
  return { shapes, runs, underRuns, glows }
}

/** One pace's keyframes: every part's dash starts just before the trace and is carried TRAVEL tails along it, then waits out of sight. */
function paceKeyframes(pace: Pace): string {
  return PULSE_PARTS.map(([name, lead]) => {
    const from = Math.round((lead + 0.1) * 100) / 100
    return (
      `@keyframes ${name}-${pace}{0%{stroke-dashoffset:${from}}${PACE_SHARE[pace]}%,100%{stroke-dashoffset:${Math.round((from - TRAVEL) * 100) / 100}}}` +
      `.${pace} .${name}{animation:${name}-${pace} var(--d) linear var(--l) infinite}`
    )
  }).join('')
}

/** The whole sheet on one stock. */
function circuitSheet(stock: Stock): string {
  const board = layout()
  const moving = pulseMarkup(board.pulses)
  const vias = board.vias.map(via => `<circle cx="${round(via.x)}" cy="${round(via.y)}" r="${VIA_RADIUS}"/>`).join('')
  const top = board.top.map(pathOf).join('')
  const power = board.power.map(pathOf).join('')
  const viaOpacity = Math.min(1, stock.traceOpacity + 0.14)

  const style = `
path,use{fill:none;stroke-linejoin:round}
text{font-family:monospace;font-size:8.5px;letter-spacing:.7px;fill:${stock.silk};fill-opacity:${stock.silkOpacity}}
.top{stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:1.2;stroke-linecap:round}
.power{stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:1.7}
.sheen{stroke:${stock.trace};stroke-opacity:${stock.sheenOpacity};stroke-width:5;stroke-linecap:round}
.under{stroke:${stock.under};stroke-opacity:${stock.underOpacity};stroke-width:1.2;stroke-linecap:round}
.pads{fill:${stock.pad}}
.ring{fill:${stock.pad};stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:1.1}
.hole{fill:${stock.paper}}
.bore{fill:${stock.paper};stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:.9}
.vias{fill:${stock.paper};stroke:${stock.trace};stroke-opacity:${viaOpacity};stroke-width:1.25}
.pour{stroke:${stock.trace};stroke-opacity:${stock.pourOpacity};stroke-width:.9;stroke-linecap:round}
.edge{stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:1.1}
.body{fill:${stock.body};stroke:${stock.accent};stroke-opacity:.8;stroke-width:1.25}
.inner{stroke:${stock.accent};stroke-opacity:.42;stroke-width:.8}
.hatch{stroke:${stock.accent};stroke-opacity:${stock.hatchOpacity};stroke-width:.9;stroke-linecap:round}
.clear{fill:${stock.body}}
.dot{fill:${stock.accent};fill-opacity:.85}
.lens{fill:${stock.accent};fill-opacity:.3}
.silk,.mark{fill:none;stroke:${stock.silk};stroke-opacity:${stock.silkOpacity};stroke-width:.9}
.tail,.mid,.head,.spot{stroke:${stock.pulse};stroke-dashoffset:9}
.tail{stroke-width:1.6;stroke-opacity:${stock.tailOpacity};stroke-dasharray:1 40}
.mid{stroke-width:2;stroke-opacity:.8;stroke-dasharray:.46 40}
.head{stroke:${stock.head};stroke-width:2.6;stroke-dasharray:.16 40}
.spot{stroke-width:7;stroke-opacity:${stock.haloOpacity};stroke-linecap:round;stroke-dasharray:.0001 40}
.low{opacity:${stock.underPulseOpacity}}
.glow{fill:${stock.pulse};fill-opacity:.35;stroke:${stock.head};stroke-width:1.7;opacity:0;animation:glow var(--d) linear var(--l) infinite}
.pin{stroke-width:1}
.lamp{opacity:0;animation:lamp var(--d) linear var(--l) infinite}
.halo{fill:${stock.pulse};fill-opacity:.2}
.lit{fill:${stock.head}}
${paceKeyframes('quick')}${paceKeyframes('rare')}
@keyframes glow{0%{opacity:0}1.5%{opacity:1}11%,100%{opacity:0}}
@keyframes lamp{0%{opacity:0}1.5%,9%{opacity:1}30%,100%{opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${moving.shapes}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
<path class="under" d="${board.under.map(pathOf).join('')}"/>
<g>${moving.underRuns}</g>
${stock.sheenOpacity > 0 ? `<path class="sheen" d="${top}${power}"/>` : ''}
${board.pours}
<g class="pads">${board.pads}</g>
${board.bodies}
<path class="top" d="${top}"/>
<path class="power" d="${power}"/>
${board.rings}
<g class="vias">${vias}</g>
<path class="silk" d="${board.silk}"/>
<g>${board.labels}</g>
<g>${moving.runs}</g>
${moving.glows}
</svg>`
}

/** Circuit Flow on warm paper, for a light window. */
export function daySvg(): string {
  return circuitSheet(DAY)
}

/** Circuit Flow in copper on warm black, for a dark window. */
export function nightSvg(): string {
  return circuitSheet(NIGHT)
}
