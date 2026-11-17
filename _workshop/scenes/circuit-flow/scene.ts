// Circuit Flow: a corner of a printed circuit board, drawn with a technical pen.
// Lower right, a square chip (U1) with a pin-1 dot; its pins fan out in parallel bundles that only ever turn by 45 degrees:
// a six-line bus up the right edge to a pin header (J1), seven lines round the pin-1 corner that end in a rank of vias like organ pipes,
// five lines off the lower right corner beside a hatched copper pour with a mounting hole, three through a resistor array, two to a crystal.
// A fainter second layer passes under the bus. A small ten-pin chip (U2) repeats the idea in the left band.
// Every bundle is one centre line pushed sideways with mitred corners, so the clearance between neighbours is the same on straights
// and round bends, and nothing on a layer ever crosses.
// Motion: short pulses of current run along the traces, each on its own period; a via lights for a moment when one arrives.
// Two stocks: graphite on warm paper with terracotta current, copper on warm black with amber current. Pure string building.

const WIDTH = 1600
const HEIGHT = 1000
/** A pulse's tail, in pixels. Every trace is measured in tails, so one set of keyframes moves every pulse at a speed set by its period. */
const TAIL = 56
/** How far a pulse's keyframes carry it, in tails: longer than the longest trace, so the pulse always leaves the far end. */
const TRAVEL = 11

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
  pulse: '#c4552d', head: '#d2491b', tailOpacity: 0.5, haloOpacity: 0.24, underPulseOpacity: 0.5,
}
/** The same board in copper on warm black: no blue anywhere. */
const NIGHT: Stock = {
  paper: '#1e1812', trace: '#bd854f', traceOpacity: 0.7, sheenOpacity: 0.05, under: '#6e4d33', underOpacity: 0.75, pad: '#684a2d', body: '#282019',
  accent: '#dc8c4c', hatchOpacity: 0.3, pourOpacity: 0.3, silk: '#93826b', silkOpacity: 0.62,
  pulse: '#ffab4a', head: '#ffdca6', tailOpacity: 0.42, haloOpacity: 0.3, underPulseOpacity: 0.45,
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

/** How a pulse runs: 'quick' spends 38% of its period on the trace, 'rare' 20%, so a long period does not have to mean a slow pulse. */
type Pace = 'quick' | 'rare'
const PACE_SHARE: Record<Pace, number> = { quick: 38, rare: 20 }

/** The parts of one pulse, each a dash that ends at the pulse's front: name and length in tails. The spot is a round dot on the front itself. */
const PULSE_PARTS: [string, number][] = [['tail', 1], ['mid', 0.46], ['head', 0.16], ['spot', 0]]

interface Pulse {
  points: Point[]
  seconds: number
  pace: Pace
  /** Where in its period the pulse is at the first frame, 0..1. */
  phase: number
  /** Where its front sits, in tails from the start, when motion is off; a negative number parks it out of sight. */
  restAt: number
  under: boolean
  /** A via or pad at the far end that lights when the pulse arrives; radius 0 means none. */
  glowRadius: number
}

/** What differs from pulse to pulse on a bundle: runs backwards (toward the chip), period, pace, phase, resting place. */
type Plan = [boolean, number, Pace, number, number]

interface Board {
  top: Point[][]
  under: Point[][]
  vias: Point[]
  pads: string
  pours: string
  bodies: string
  silk: string
  labels: string
  pulses: Pulse[]
}

function round(value: number): number {
  return Math.round(value * 10) / 10
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

/** A bundle's pulses, one per trace: each runs out from the chip or, reversed, in toward it. A pulse that ends on a via or pad lights it. */
function runPulses(board: Board, traces: Point[][], plans: Plan[], glowRadius: number): void {
  traces.forEach((points, index) => {
    const plan = plans[index]
    if (!plan) return
    const [inward, seconds, pace, phase, restAt] = plan
    board.pulses.push({ points: inward ? reversed(points) : points, seconds, pace, phase, restAt, under: false, glowRadius: inward ? 0 : glowRadius })
  })
}

/** The main chip, lower right: a square package, nine pins a side, pin 1 at the upper left corner. */
function mainChip(board: Board): void {
  const centreX = 1420
  const centreY = 706
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
  board.labels += label(right + 16, bottom + 24, 'U1')

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
    board.pads +=
      (index === 0
        ? `<rect class="ring" x="${padX - HEADER_RADIUS}" y="${headerY - HEADER_RADIUS}" width="${HEADER_RADIUS * 2}" height="${HEADER_RADIUS * 2}" rx="1"/>`
        : `<circle class="ring" cx="${padX}" cy="${headerY}" r="${HEADER_RADIUS}"/>`) + `<circle class="hole" cx="${padX}" cy="${headerY}" r="2"/>`
    return trace.slice(0, 3).concat([{ x: busX, y: jogFrom }, { x: busX - jog, y: jogFrom - jog }, { x: busX - jog, y: headerY }])
  })
  board.top.push(...bus)
  // Three neighbours go up in formation, a word on the bus; the others keep their own time, two of them coming down.
  runPulses(board, bus, [
    [true, 23, 'quick', 0.52, -1],
    [false, 31, 'quick', 0.05, -1],
    [false, 26, 'quick', 0.9, 5.9],
    [false, 26, 'quick', 0.867, 5.2],
    [false, 26, 'quick', 0.834, 4.5],
    [true, 37, 'rare', 0.11, -1],
  ], HEADER_RADIUS)
  board.silk += `M1464 ${headerY - 13}H1568V${headerY + 13}H1464Z`
  board.labels += label(1464, headerY - 19, 'J1')

  // Round the pin-1 corner: four lines from the top side and three from the left side leave north-west as one bundle with a two-line gap,
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
    [false, 21, 'quick', 0.31, -1],
    [false, 36, 'rare', 0.42, 3.8],
    [true, 29, 'quick', 0.74, -1],
    [false, 24, 'quick', 0.62, -1],
  ], VIA_RADIUS)
  runPulses(board, side, [
    [false, 20, 'quick', 0.08, -1],
    [true, 27, 'quick', 0.55, -1],
    [false, 33, 'rare', 0.93, -1],
  ], VIA_RADIUS)

  // Off the lower right corner: five lines from the bottom side, south, south-east, south again.
  const corner = bundle(route(centreX + 20, bottom + 6, [['S', 36], ['SE', 90], ['S', 114]]), 5, 10)
  board.top.push(...corner)
  runPulses(board, corner, [
    [true, 25, 'quick', 0.22, -1],
    [false, 31, 'quick', 0.68, -1],
    [true, 38, 'rare', 0.09, 3],
    [true, 19, 'quick', 0.47, -1],
    [false, 28, 'quick', 0.83, -1],
  ], 0)

  // Beside them, in the very corner of the board, a copper pour: hatched, its edge keeping its distance from the bundle, a mounting hole cut into it.
  const pour: Point[] = [
    { x: 1612, y: 800 }, { x: 1506, y: 800 }, { x: 1498, y: 808 }, { x: 1498, y: 815.9 }, { x: 1564, y: 881.9 }, { x: 1564, y: 1012 }, { x: 1612, y: 1012 },
  ]
  board.pours +=
    `<path class="pour" d="${hatch(pour, 7)}"/><path class="edge" d="${pathOf(pour)}Z"/>` +
    `<circle class="hole" cx="1583" cy="842" r="17"/><circle class="ring" cx="1583" cy="842" r="12.5"/><circle class="bore" cx="1583" cy="842" r="7"/>`
  for (const y of [906, 944, 982]) board.vias.push({ x: 1588, y })

  // The three lower pins of the right side leave east through a resistor array and off the sheet.
  const resistorPlans: [number, Pace, number, number][] = [
    [23, 'quick', 0.36, -1],
    [30, 'quick', 0.71, 1.7],
    [37, 'rare', 0.18, -1],
  ]
  resistorPlans.forEach(([seconds, pace, phase, restAt], row) => {
    const y = centreY + 20 + row * 10
    board.top.push([{ x: right + 6, y }, { x: 1542, y }], [{ x: 1558, y }, { x: 1612, y }])
    board.pads += rectangle(1544, y, 7, 6, 1) + rectangle(1556, y, 7, 6, 1)
    board.pulses.push({ points: [{ x: right + 6, y }, { x: 1612, y }], seconds, pace, phase, restAt, under: false, glowRadius: 0 })
  })
  board.silk += `M1538 ${centreY + 13}H1562M1538 ${centreY + 47}H1562`
  board.labels += label(1538, centreY + 59, 'RN1')

  // A crystal across two top pins, the lines parting at the last moment.
  board.top.push(route(centreX + 10, top - 6, [['N', 50], ['NW', 6], ['N', 9]]), route(centreX + 20, top - 6, [['N', 50], ['NE', 6], ['N', 9]]))
  board.pads += rectangle(centreX + 4, top - 73, 9, 9, 1.5) + rectangle(centreX + 26, top - 73, 9, 9, 1.5)
  board.silk += `M${centreX - 1} ${top - 83}H${centreX + 31}a10 10 0 0 1 0 20H${centreX - 1}a10 10 0 0 1 0 -20Z`
  board.labels += label(centreX - 10, top - 89, 'Y1')

  // Two top pins drop to the second layer at once; that pair runs north-east under the bus and off the sheet.
  const dropNear: Point = { x: centreX + 30, y: top - 44 }
  const dropFar: Point = { x: centreX + 40, y: top - 34 }
  board.top.push([{ x: dropNear.x, y: top - 6 }, dropNear], [{ x: dropFar.x, y: top - 6 }, dropFar])
  board.vias.push(dropNear, dropFar)
  const underNear = [dropNear, { x: 1612, y: dropNear.y - (1612 - dropNear.x) }]
  const underFar = [dropFar, { x: 1612, y: dropFar.y - (1612 - dropFar.x) }]
  board.under.push(underNear, underFar)
  board.pulses.push(
    { points: underFar, seconds: 28, pace: 'quick', phase: 0.58, restAt: -1, under: true, glowRadius: 0 },
    { points: reversed(underNear), seconds: 35, pace: 'rare', phase: 0.03, restAt: -1, under: true, glowRadius: VIA_RADIUS },
  )

  // Three left pins escape to vias a short way out, staggered.
  const escapes: [number, number][] = [[0, 1326], [20, 1312], [40, 1326]]
  for (const [down, viaX] of escapes) {
    board.top.push([{ x: left - 6, y: centreY + down }, { x: viaX, y: centreY + down }])
    board.vias.push({ x: viaX, y: centreY + down })
  }
}

/** The small chip in the left band: ten pins, four lines up to vias, five down the edge of the sidebar, one bypass capacitor, one test point. */
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
  board.labels += label(left, top - 7, 'U2')

  // The top right pin feeds a capacitor, which drops through a via to the second layer; that line runs north-east under the pipes to a test point.
  const capX = 344
  const capVia: Point = { x: capX, y: 678 }
  const testPoint: Point = { x: 412, y: 610 }
  board.top.push(route(right + 6, centreY - 20, [['E', 9], ['NE', 6], ['N', 11]]), [{ x: capX, y: 696 }, capVia])
  board.pads += rectangle(capX, 712, 9, 7, 1) + rectangle(capX, 698, 9, 7, 1)
  board.silk += `M${capX - 8} 719V691M${capX + 8} 719V691`
  board.labels += label(capX + 13, 709, 'C1')
  board.vias.push(capVia)
  board.under.push([capVia, testPoint])
  board.pads += `<circle class="ring" cx="${testPoint.x}" cy="${testPoint.y}" r="4.6"/><circle class="dot" cx="${testPoint.x}" cy="${testPoint.y}" r="1.5"/>`
  board.labels += label(389, 598, 'TP1')
  board.pulses.push({ points: [capVia, testPoint], seconds: 40, pace: 'rare', phase: 0.64, restAt: -1, under: true, glowRadius: 4.6 })

  // Four lines turn north and stop at vias, tallest on the side away from the text.
  const pipeEnds = [642, 616, 590, 562]
  const pipes = bundle(route(right + 6, centreY + 5, [['E', 28], ['NE', 28], ['N', 10]]), 4, 10).map((trace, index) => endingAt(trace, pipeEnds[index] ?? 642))
  for (const points of pipes) {
    const end = points[points.length - 1]
    board.top.push(points)
    if (end) board.vias.push(end)
  }
  runPulses(board, pipes, [
    [false, 22, 'quick', 0.14, -1],
    [true, 30, 'quick', 0.66, -1],
    [false, 26, 'quick', 0.4, 2.6],
    [false, 34, 'rare', 0.81, -1],
  ], VIA_RADIUS)

  // Five lines leave west, turn south-west and run down beside the sidebar and off the sheet.
  const edge = bundle(route(left - 6, centreY, [['W', 22], ['SW', 30], ['S', 240]]), 5, 10)
  board.top.push(...edge)
  runPulses(board, edge, [
    [true, 27, 'quick', 0.3, -1],
    [false, 33, 'rare', 0.77, -1],
    [true, 21, 'quick', 0.95, 2.2],
    [false, 29, 'quick', 0.5, -1],
    [true, 36, 'rare', 0.2, -1],
  ], 0)
}

function layout(): Board {
  const board: Board = { top: [], under: [], vias: [], pads: '', pours: '', bodies: '', silk: '', labels: '', pulses: [] }
  mainChip(board)
  smallChip(board)
  return board
}

/** The moving part: for each pulse a measured copy of its trace, and the dashes that share one run along it. */
function pulseMarkup(pulses: Pulse[]): { shapes: string; runs: string; glows: string } {
  let shapes = ''
  let runs = ''
  let glows = ''
  pulses.forEach((item, index) => {
    const id = `p${index}`
    const tails = lengthOf(item.points) / TAIL
    shapes += `<path id="${id}" pathLength="${tails.toFixed(3)}" d="${pathOf(item.points)}"/>`
    // With motion off a few pulses are left on the picture, caught mid-trace; the rest are parked before their start.
    const parts = PULSE_PARTS.map(([name, lead]) => {
      const rest = item.restAt < 0 ? '' : ` style="stroke-dashoffset:${Math.round((lead - item.restAt) * 100) / 100}"`
      return `<use href="#${id}" class="${name}"${rest}/>`
    }).join('')
    runs += `<g class="${item.pace}${item.under ? ' low' : ''}" style="--d:${item.seconds}s;--l:${round(-item.phase * item.seconds)}s">${parts}</g>`
    const end = item.points[item.points.length - 1]
    if (item.glowRadius > 0 && end) {
      // The front reaches the far end this long after the pulse's period begins; the glow's own period begins then.
      const arrival = ((tails + 0.1) / TRAVEL) * (PACE_SHARE[item.pace] / 100) * item.seconds
      const into = (((item.phase * item.seconds - arrival) % item.seconds) + item.seconds) % item.seconds
      glows += `<circle class="glow" cx="${round(end.x)}" cy="${round(end.y)}" r="${item.glowRadius}" style="--d:${item.seconds}s;--l:${round(-into)}s"/>`
    }
  })
  return { shapes, runs, glows }
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
  const viaOpacity = Math.min(1, stock.traceOpacity + 0.14)

  const style = `
path,use{fill:none;stroke-linejoin:round}
text{font-size:8.5px;letter-spacing:.7px;fill:${stock.silk};fill-opacity:${stock.silkOpacity}}
.top{stroke:${stock.trace};stroke-opacity:${stock.traceOpacity};stroke-width:1.2;stroke-linecap:round}
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
.silk{stroke:${stock.silk};stroke-opacity:${stock.silkOpacity};stroke-width:.9}
.tail,.mid,.head,.spot{stroke:${stock.pulse};stroke-dashoffset:9}
.tail{stroke-width:1.4;stroke-opacity:${stock.tailOpacity};stroke-dasharray:1 40}
.mid{stroke-width:1.7;stroke-opacity:.75;stroke-dasharray:.46 40}
.head{stroke:${stock.head};stroke-width:2.1;stroke-dasharray:.16 40}
.spot{stroke-width:6;stroke-opacity:${stock.haloOpacity};stroke-linecap:round;stroke-dasharray:.0001 40}
.low{opacity:${stock.underPulseOpacity}}
.glow{fill:${stock.pulse};fill-opacity:.35;stroke:${stock.head};stroke-width:1.7;opacity:0;animation:glow var(--d) linear var(--l) infinite}
${paceKeyframes('quick')}${paceKeyframes('rare')}
@keyframes glow{0%{opacity:0}1.5%{opacity:1}11%,100%{opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" font-family="monospace" color="#888"><style>${style}</style><defs>${moving.shapes}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
<path id="under" class="under" d="${board.under.map(pathOf).join('')}"/>
${stock.sheenOpacity > 0 ? `<path class="sheen" d="${top}"/>` : ''}
${board.pours}
<g class="pads">${board.pads}</g>
${board.bodies}
<path id="top" class="top" d="${top}"/>
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
