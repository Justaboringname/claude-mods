// Astrolabe: a brass planispheric astrolabe laid on a hand-drawn chart of the northern sky.
// Right: the astrolabe, entering from the edge. Its plate is the true stereographic projection for latitude 40 north
// (tropics, equator, almucantars every ten degrees, azimuth arcs, the unequal hours under the horizon); over it the pierced
// rete, with its eccentric ecliptic ring and star pointers at real right ascensions and declinations, turns once in
// fifteen minutes, and the rule creeps back and forth.
// Left: a strip of the same sky in the same projection, seen from the ground: from the pole up past the Plough to Arcturus.
// A small brass hour ring lies round the pole with the Little Bear inside it, and its arm rests on the Plough's two pointers,
// the way a nocturnal is read. A dotted line follows the Plough's handle to Arcturus. A pen joins the stars, and joins them again.
// Two pens: a dark one for everything engraved and fixed, a red-brown one for the brass that moves.
// Two stocks: warm paper for a light window, umber near-black with brass ink for a dark one. Pure string building.

const WIDTH = 1600
const HEIGHT = 1000
/** The conversation sits right of this on the left side; the chart stops short of it. */
const COLUMN_LEFT = 432

interface Stock {
  paper: string
  plate: string
  metal: string
  ink: string
  accent: string
}

const DAY: Stock = { paper: '#f3eee3', plate: '#f2ebdb', metal: '#ecdfc4', ink: '#4a3826', accent: '#a94b2c' }
/** The same drawing in brass on umber. Blue is the weakest channel of every colour here. */
const NIGHT: Stock = { paper: '#1c1610', plate: '#201910', metal: '#2f2413', ink: '#c8a86c', accent: '#da8850' }

interface Point {
  x: number
  y: number
}

const RAD = Math.PI / 180

/** A fixed pseudo-random number in 0..1 for a whole number, so every build is the same. */
function hash(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

/** Degrees grow clockwise on screen, the same way CSS rotate() turns. */
function at(centre: Point, radius: number, degrees: number): Point {
  return { x: centre.x + radius * Math.cos(degrees * RAD), y: centre.y + radius * Math.sin(degrees * RAD) }
}

function xy(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

/** A closed circle; clockwise unless told otherwise, so a counter-clockwise one cuts a hole in a clockwise one. */
function circle(centre: Point, radius: number, clockwise = true): string {
  const sweep = clockwise ? 1 : 0
  const size = round(radius)
  return `M${round(centre.x + radius)} ${round(centre.y)}A${size} ${size} 0 1 ${sweep} ${round(centre.x - radius)} ${round(centre.y)}A${size} ${size} 0 1 ${sweep} ${round(centre.x + radius)} ${round(centre.y)}Z`
}

/** An open arc, clockwise from one angle to a larger one. */
function arc(centre: Point, radius: number, from: number, to: number): string {
  const size = round(radius)
  return `M${xy(at(centre, radius, from))}A${size} ${size} 0 ${to - from > 180 ? 1 : 0} 1 ${xy(at(centre, radius, to))}`
}

/** The centre of the circle through three points, or null when they lie on a straight line. */
function centreThrough(first: Point, middle: Point, last: Point): Point | null {
  const spread = 2 * (first.x * (middle.y - last.y) + middle.x * (last.y - first.y) + last.x * (first.y - middle.y))
  if (Math.abs(spread) < 0.5) return null
  const a = first.x * first.x + first.y * first.y
  const b = middle.x * middle.x + middle.y * middle.y
  const c = last.x * last.x + last.y * last.y
  return {
    x: (a * (middle.y - last.y) + b * (last.y - first.y) + c * (first.y - middle.y)) / spread,
    y: (a * (last.x - middle.x) + b * (first.x - last.x) + c * (middle.x - first.x)) / spread,
  }
}

/** The arc of a circle from the first point through the middle one to the last. */
function arcThrough(first: Point, middle: Point, last: Point): string {
  const centre = centreThrough(first, middle, last)
  if (!centre || distance(centre, first) > 9000) return `M${xy(first)}L${xy(last)}`
  const size = round(distance(centre, first))
  const turn = (middle.x - first.x) * (last.y - first.y) - (middle.y - first.y) * (last.x - first.x)
  return `M${xy(first)}A${size} ${size} 0 0 ${turn > 0 ? 1 : 0} ${xy(last)}`
}

/** The parts of a circle, between two angles, whose points pass `keep`: clockwise arcs with their ends found by bisection. */
function arcsWhere(centre: Point, radius: number, keep: (point: Point) => boolean, from: number, to: number): string {
  const inside = (degrees: number): boolean => keep(at(centre, radius, degrees))
  const edge = (outside: number, within: number): number => {
    let low = outside
    let high = within
    for (let step = 0; step < 12; step += 1) {
      const middle = (low + high) / 2
      if (inside(middle)) high = middle
      else low = middle
    }
    return high
  }
  const whole = to - from >= 360
  let start = from
  if (whole) {
    let gap = Number.NaN
    for (let degrees = from; degrees < from + 360; degrees += 0.5) {
      if (!inside(degrees)) {
        gap = degrees
        break
      }
    }
    if (Number.isNaN(gap)) return circle(centre, radius)
    start = gap
  }
  const end = whole ? start + 360 : to
  let path = ''
  let opened = Number.NaN
  let previous = start
  for (let degrees = start; degrees <= end + 0.001; degrees += 0.5) {
    const kept = inside(degrees)
    if (kept && Number.isNaN(opened)) opened = degrees === start ? degrees : edge(previous, degrees)
    else if (!kept && !Number.isNaN(opened)) {
      path += arc(centre, radius, opened, edge(degrees, previous))
      opened = Number.NaN
    }
    previous = degrees
  }
  if (!Number.isNaN(opened)) path += arc(centre, radius, opened, end)
  return path
}

/** A closed polygon, turned clockwise if it is not, so that overlapping pieces of one path add up under the nonzero rule. */
function clockwisePolygon(points: Point[]): string {
  let area = 0
  for (let index = 0; index < points.length; index += 1) {
    const here = points[index]
    const next = points[(index + 1) % points.length]
    if (here && next) area += here.x * next.y - next.x * here.y
  }
  const ordered = area >= 0 ? points : points.slice().reverse()
  return `M${ordered.map(xy).join('L')}Z`
}

/** A numeral standing on a circle, its head pointing outward. */
function numeral(label: string, centre: Point, radius: number, degrees: number, size: number): string {
  const foot = at(centre, radius - size * 0.34, degrees)
  return `<text x="${round(foot.x)}" y="${round(foot.y)}" transform="rotate(${round(degrees + 90)} ${round(foot.x)} ${round(foot.y)})">${label}</text>`
}

// ---------------------------------------------------------------------------------------------------------------------
// The astrolabe. Everything is measured from the pin; the meridian's upper end (the throne) leans to the left.

const PIN: Point = { x: 1566, y: 556 }
const LIMB_OUTER = 320
const LIMB_INNER = 287
const SCALE_OUTER = 300
/** Where the limb's numerals stand. */
const NUMERALS_AT = SCALE_OUTER + 10.6
/** The plate's edge is the tropic of Capricorn; the other circles follow from the obliquity of the ecliptic. */
const CAPRICORN = 279
const OBLIQUITY = 23.44
const EQUATOR = CAPRICORN / Math.tan((45 + OBLIQUITY / 2) * RAD)
const CANCER = EQUATOR * Math.tan((45 - OBLIQUITY / 2) * RAD)
const LATITUDE = 40
/** Screen angle of the meridian's upper end. */
const UP = 248
/** Screen angle of the rete's first point of Capricorn when the rete is at rest. */
const CAPRICORN_AT = 168
/** Screen angle of right ascension 0 on the rete at rest; right ascension grows counter-clockwise on an astrolabe's face. */
const RETE_ZERO = CAPRICORN_AT + 270
const ECLIPTIC_OUTER = (CAPRICORN + CANCER) / 2
const ECLIPTIC_INNER = ECLIPTIC_OUTER - 13
const ECLIPTIC_CENTRE = at(PIN, (CAPRICORN - CANCER) / 2, CAPRICORN_AT)
const INNER_STRAP = 108
/** Screen angle of the rule's fiducial edge at rest. */
const RULE_AT = 203

/** Distance from the pin of a circle of declination: stereographic projection from the south pole. */
function declinationRadius(declination: number): number {
  return EQUATOR * Math.tan((45 - declination / 2) * RAD)
}

/** The plate's engraving: `firm` holds the horizon, the tropics and the two axes, `fine` the almucantars and azimuth arcs,
 * `hours` the eleven lines of the unequal hours under the horizon. */
function plateLines(): { fine: string; firm: string; hours: string } {
  const sinLatitude = Math.sin(LATITUDE * RAD)
  const cosLatitude = Math.cos(LATITUDE * RAD)
  const plateEdge = CAPRICORN - 4
  const onPlate = (point: Point): boolean => distance(point, PIN) < plateEdge
  let fine = ''
  let firm = ''
  // Almucantars: circles of equal altitude, nested about the zenith.
  for (let altitude = 0; altitude <= 80; altitude += 10) {
    const share = sinLatitude + Math.sin(altitude * RAD)
    const centre = at(PIN, (EQUATOR * cosLatitude) / share, UP)
    const path = arcsWhere(centre, (EQUATOR * Math.cos(altitude * RAD)) / share, onPlate, 0, 360)
    if (altitude === 0) firm += path
    else fine += path
  }
  // Azimuth arcs: circles through the zenith and the nadir, kept above the horizon and outside the innermost almucantar.
  const horizonOut = (EQUATOR * cosLatitude) / sinLatitude
  const horizonCentre = at(PIN, horizonOut, UP)
  const horizonRadius = EQUATOR / sinLatitude
  const capShare = sinLatitude + Math.sin(80 * RAD)
  const capCentre = at(PIN, (EQUATOR * cosLatitude) / capShare, UP)
  const capRadius = (EQUATOR * Math.cos(80 * RAD)) / capShare
  const zenith = (EQUATOR * cosLatitude) / (1 + sinLatitude)
  const nadir = (-EQUATOR * cosLatitude) / (1 - sinLatitude)
  const middle = (zenith + nadir) / 2
  const half = (zenith - nadir) / 2
  const inSky = (point: Point): boolean => onPlate(point) && distance(point, horizonCentre) < horizonRadius && distance(point, capCentre) > capRadius
  for (let azimuth = 30; azimuth <= 150; azimuth += 30) {
    const aside = azimuth === 90 ? 0 : half / Math.tan(azimuth * RAD)
    const centre = at(at(PIN, middle, UP), aside, UP + 90)
    fine += arcsWhere(centre, Math.hypot(aside, half), inSky, 0, 360)
  }
  // The meridian and the east-west line, and the two circles the sun reaches at the equinox and in midsummer.
  firm += `M${xy(at(PIN, plateEdge, UP))}L${xy(at(PIN, plateEdge, UP + 180))}M${xy(at(PIN, plateEdge, UP + 90))}L${xy(at(PIN, plateEdge, UP - 90))}`
  firm += circle(PIN, EQUATOR) + circle(PIN, CANCER)
  // The unequal hours: the night arc of each of the three circles is cut into twelve, and an arc joins the cuts.
  let hours = ''
  for (let hour = 1; hour <= 11; hour += 1) {
    const cuts = [CANCER, EQUATOR, plateEdge].map(radius => {
      const dayHalf = Math.acos((radius * radius + horizonOut * horizonOut - horizonRadius * horizonRadius) / (2 * radius * horizonOut)) / RAD
      return at(PIN, radius, UP + dayHalf + ((360 - 2 * dayHalf) * hour) / 12)
    })
    const [inner, between, outer] = cuts
    if (inner && between && outer && Math.min(inner.x, outer.x) < WIDTH + 4) hours += arcThrough(inner, between, outer)
  }
  return { fine, firm, hours }
}

/** The limb: a degree scale with a tick at every degree, numbered by tens in four quadrants, 90 at the throne. */
function limb(stock: Stock): string {
  let ticks = ''
  let numerals = ''
  for (let degree = 0; degree < 360; degree += 1) {
    const angle = UP + degree
    const foot = at(PIN, LIMB_INNER, angle)
    if (foot.x > WIDTH + 8 || foot.y < -8 || foot.y > HEIGHT + 8) continue
    const reach = degree % 10 === 0 ? SCALE_OUTER : degree % 5 === 0 ? LIMB_INNER + 8.5 : LIMB_INNER + 5
    ticks += `M${xy(foot)}L${xy(at(PIN, reach, angle))}`
    if (degree % 10 === 0 && at(PIN, NUMERALS_AT, angle).x < WIDTH - 4) numerals += numeral(String(Math.abs(90 - (degree % 180))), PIN, NUMERALS_AT, angle, 9.2)
  }
  const rings = circle(PIN, LIMB_OUTER) + circle(PIN, LIMB_INNER)
  return (
    `<path d="${circle(PIN, LIMB_OUTER)}${circle(PIN, LIMB_INNER, false)}" fill="${stock.metal}"/>` +
    `<path d="${rings}" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity=".88"/>` +
    `<path d="${circle(PIN, SCALE_OUTER)}${circle(PIN, LIMB_OUTER - 3.5)}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".5"/>` +
    `<path d="${ticks}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".72" stroke-linecap="butt"/>` +
    `<g class="num" font-size="9.2" fill="${stock.ink}" fill-opacity=".7">${numerals}</g>`
  )
}

/** The throne and the ring the instrument hangs from, standing on the limb at the meridian's upper end. */
function throne(stock: Stock): string {
  const along = at({ x: 0, y: 0 }, 1, UP)
  const across = at({ x: 0, y: 0 }, 1, UP + 90)
  const place = (aside: number, out: number): Point => ({ x: PIN.x + aside * across.x + out * along.x, y: PIN.y + aside * across.y + out * along.y })
  const headAt = LIMB_OUTER + 30
  const baseOut = Math.sqrt(LIMB_OUTER * LIMB_OUTER - 70 * 70) - 2
  const outline =
    `M${xy(place(-70, baseOut))}Q${xy(place(-30, LIMB_OUTER + 4))} ${xy(place(-16, headAt - 10))}` +
    `A19 19 0 1 1 ${xy(place(16, headAt - 10))}Q${xy(place(30, LIMB_OUTER + 4))} ${xy(place(70, baseOut))}`
  const ringCentre = place(0, headAt + 25)
  return (
    `<path d="${circle(ringCentre, 27)}${circle(ringCentre, 22, false)}" fill="${stock.metal}" stroke="${stock.ink}" stroke-width="1.1" stroke-opacity=".85"/>` +
    `<path d="${outline}" fill="${stock.metal}" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity=".88"/>` +
    `<circle cx="${round(place(0, headAt).x)}" cy="${round(place(0, headAt).y)}" r="5.5" fill="${stock.paper}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".85"/>`
  )
}

/** Stars the rete points at: right ascension in hours, declination in degrees (J2000). */
const RETE_STARS: readonly (readonly [number, number])[] = [
  [0.14, 29.09], // Alpheratz
  [2.12, 23.46], // Hamal
  [3.136, 40.96], // Algol
  [4.599, 16.51], // Aldebaran
  [5.278, 46.0], // Capella
  [5.242, -8.2], // Rigel
  [5.919, 7.41], // Betelgeuse
  [6.752, -16.72], // Sirius
  [7.655, 5.22], // Procyon
  [9.46, -8.66], // Alphard
  [11.818, 14.57], // Denebola
  [13.42, -11.16], // Spica
  [14.261, 19.18], // Arcturus
  [15.578, 26.71], // Alphecca
  [17.582, 12.56], // Rasalhague
  [18.616, 38.78], // Vega
  [19.846, 8.87], // Altair
  [20.69, 45.28], // Deneb
  [21.736, 9.88], // Enif
  [23.079, 15.21], // Markab
]

/** Where a star pointer grows from: the nearest point of the rete's frame, and how far the star is from it. */
function pointerRoot(tip: Point): { root: Point; reach: number } {
  const tipRadius = distance(tip, PIN)
  const bearing = Math.atan2(tip.y - PIN.y, tip.x - PIN.x) / RAD
  const candidates: Point[] = [at(PIN, CAPRICORN - 3, bearing)]
  const fromEcliptic = Math.atan2(tip.y - ECLIPTIC_CENTRE.y, tip.x - ECLIPTIC_CENTRE.x) / RAD
  candidates.push(at(ECLIPTIC_CENTRE, ECLIPTIC_OUTER - 6.5, fromEcliptic))
  const bar = at({ x: 0, y: 0 }, 1, RETE_ZERO)
  const alongBar = Math.max(-CAPRICORN + 6, Math.min(CAPRICORN - 6, (tip.x - PIN.x) * bar.x + (tip.y - PIN.y) * bar.y))
  candidates.push({ x: PIN.x + alongBar * bar.x, y: PIN.y + alongBar * bar.y })
  const toCapricorn = at({ x: 0, y: 0 }, 1, CAPRICORN_AT)
  const towardCapricorn = (tip.x - PIN.x) * toCapricorn.x + (tip.y - PIN.y) * toCapricorn.y
  if (towardCapricorn < 0) {
    candidates.push(at(PIN, EQUATOR, bearing))
    const alongStrut = Math.max(CANCER, Math.min(CAPRICORN - 6, -towardCapricorn))
    candidates.push(at(PIN, alongStrut, CAPRICORN_AT + 180))
  } else if (tipRadius > 0) candidates.push(at(PIN, INNER_STRAP, bearing))
  let root = candidates[0] ?? PIN
  let reach = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    const gap = distance(candidate, tip)
    if (gap < reach) {
      reach = gap
      root = candidate
    }
  }
  return { root, reach }
}

/** The rete: rim, eccentric ecliptic ring, equinoctial bar, two straps, a strut and the star pointers, cut from one sheet. */
function rete(stock: Stock): { shape: string; markup: string } {
  // Every piece runs clockwise and holes run counter-clockwise, so the pieces melt into one outline under the nonzero rule.
  let sheet = circle(PIN, CAPRICORN) + circle(PIN, CAPRICORN - 6, false)
  sheet += circle(ECLIPTIC_CENTRE, ECLIPTIC_OUTER) + circle(ECLIPTIC_CENTRE, ECLIPTIC_INNER, false)
  const strip = (from: Point, to: Point, halfWidth: number): string => {
    const length = distance(from, to)
    const side = { x: (-(to.y - from.y) / length) * halfWidth, y: ((to.x - from.x) / length) * halfWidth }
    return clockwisePolygon([
      { x: from.x + side.x, y: from.y + side.y },
      { x: to.x + side.x, y: to.y + side.y },
      { x: to.x - side.x, y: to.y - side.y },
      { x: from.x - side.x, y: from.y - side.y },
    ])
  }
  const strap = (radius: number, from: number, to: number): string => {
    const outer = radius + 3
    const inner = radius - 3
    return `M${xy(at(PIN, outer, from))}A${round(outer)} ${round(outer)} 0 ${to - from > 180 ? 1 : 0} 1 ${xy(at(PIN, outer, to))}L${xy(at(PIN, inner, to))}A${round(inner)} ${round(inner)} 0 ${to - from > 180 ? 1 : 0} 0 ${xy(at(PIN, inner, from))}Z`
  }
  sheet += strip(at(PIN, CAPRICORN - 3, RETE_ZERO), at(PIN, CAPRICORN - 3, RETE_ZERO + 180), 3.4)
  sheet += strip(at(PIN, CANCER - 4, CAPRICORN_AT + 180), at(PIN, CAPRICORN - 3, CAPRICORN_AT + 180), 3)
  sheet += strap(EQUATOR, RETE_ZERO - 180, RETE_ZERO)
  sheet += strap(INNER_STRAP, RETE_ZERO, RETE_ZERO + 180)
  sheet += circle(PIN, 16)

  let tips = ''
  RETE_STARS.forEach(([hours, declination], index) => {
    const tip = at(PIN, declinationRadius(declination), RETE_ZERO - hours * 15)
    const { root, reach } = pointerRoot(tip)
    if (reach < 11 || reach > 64) return
    const along = { x: (tip.x - root.x) / reach, y: (tip.y - root.y) / reach }
    const across = { x: -along.y, y: along.x }
    const halfWidth = 3.4 + reach * 0.035
    const lean = (hash(index * 7 + 2) < 0.5 ? -1 : 1) * reach * 0.2
    let first = { x: root.x + across.x * halfWidth - along.x * 2, y: root.y + across.y * halfWidth - along.y * 2 }
    let second = { x: root.x - across.x * halfWidth - along.x * 2, y: root.y - across.y * halfWidth - along.y * 2 }
    // Clockwise: (first, tip, second) must turn the way the rest of the sheet does.
    if ((tip.x - first.x) * (second.y - first.y) - (second.x - first.x) * (tip.y - first.y) < 0) [first, second] = [second, first]
    const bend = (start: Point): Point => ({ x: (start.x + tip.x) / 2 + across.x * lean, y: (start.y + tip.y) / 2 + across.y * lean })
    sheet += `M${xy(first)}Q${xy(bend(first))} ${xy(tip)}Q${xy(bend(second))} ${xy(second)}Z`
    tips += `M${xy(tip)}h0`
  })

  // The ecliptic's own scale: a tick at every second degree of longitude, found through the projection, so the degrees
  // crowd toward Cancer exactly as they do on the instrument. Each tick lies on a line through the pin.
  let scale = ''
  for (let longitude = 0; longitude < 360; longitude += 2) {
    const ascension = Math.atan2(Math.sin(longitude * RAD) * Math.cos(OBLIQUITY * RAD), Math.cos(longitude * RAD)) / RAD
    const declination = Math.asin(Math.sin(OBLIQUITY * RAD) * Math.sin(longitude * RAD)) / RAD
    const outer = at(PIN, declinationRadius(declination) - 0.6, RETE_ZERO - ascension)
    const toPin = distance(outer, PIN)
    const inward = { x: (PIN.x - outer.x) / toPin, y: (PIN.y - outer.y) / toPin }
    let length = longitude % 10 === 0 ? 7 : 3.8
    if (longitude % 30 === 0) {
      const offset = { x: outer.x - ECLIPTIC_CENTRE.x, y: outer.y - ECLIPTIC_CENTRE.y }
      const lead = offset.x * inward.x + offset.y * inward.y
      length = -lead - Math.sqrt(Math.max(0, lead * lead - (offset.x * offset.x + offset.y * offset.y - ECLIPTIC_INNER * ECLIPTIC_INNER))) - 0.6
    }
    scale += `M${xy(outer)}L${round(outer.x + inward.x * length)} ${round(outer.y + inward.y * length)}`
  }

  const markup =
    `<g class="rete">` +
    `<use href="#rete" fill="${stock.metal}" stroke="${stock.accent}" stroke-width="2.1" stroke-opacity=".92"/>` +
    `<use href="#rete" fill="${stock.metal}"/>` +
    `<path d="${scale}" stroke="${stock.accent}" stroke-width=".75" stroke-opacity=".8" stroke-linecap="butt"/>` +
    `<path d="${tips}" stroke="${stock.accent}" stroke-width="3.4"/>` +
    `</g>`
  return { shape: `<path id="rete" d="${sheet}"/>`, markup }
}

/** The rule: one edge passes exactly through the pin and carries a scale of declinations, every ten degrees. */
function rule(stock: Stock): { shape: string; markup: string } {
  const along = at({ x: 0, y: 0 }, 1, RULE_AT)
  const across = at({ x: 0, y: 0 }, 1, RULE_AT + 90)
  const place = (out: number, aside: number): Point => ({ x: PIN.x + out * along.x + aside * across.x, y: PIN.y + out * along.y + aside * across.y })
  const reach = LIMB_INNER - 3
  let sheet = circle(PIN, 13)
  let marks = ''
  for (const side of [1, -1]) {
    sheet += clockwisePolygon([place(side * 6, 0), place(side * reach, 0), place(side * (reach - 16), side * 8.5), place(side * 6, side * 8.5)])
    for (let declination = -20; declination <= 60; declination += 10) {
      const out = side * declinationRadius(declination)
      marks += `M${xy(place(out, 0))}L${xy(place(out, side * (declination === 0 ? 8.5 : 4.5)))}`
    }
  }
  const markup =
    `<g class="rule">` +
    `<use href="#rule" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="2.3" stroke-opacity=".9"/>` +
    `<use href="#rule" fill="${stock.plate}"/>` +
    `<path d="${marks}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".8" stroke-linecap="butt"/>` +
    `</g>` +
    `<circle cx="${PIN.x}" cy="${PIN.y}" r="7.5" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".9"/>` +
    `<circle cx="${PIN.x}" cy="${PIN.y}" r="3.2" fill="${stock.ink}"/>`
  return { shape: `<path id="rule" d="${sheet}"/>`, markup }
}

// ---------------------------------------------------------------------------------------------------------------------
// The chart and its hour ring. The chart is the astrolabe's own projection turned to face the sky: stereographic about
// the pole, seen from the ground, so right ascension grows clockwise and the constellations keep their shapes.

const POLE: Point = { x: 305, y: 795 }
/** Distance from the pole at which the celestial equator would fall. */
const SKY_EQUATOR = 480
/** The hour of right ascension that stands straight up from the pole. */
const SKY_UP = 13.12
const DIAL_INNER = 83
const DIAL_MIDDLE = 94
const DIAL_OUTER = 105.5
/** How far the arm reaches: a little past the further pointer. */
const ARM_LENGTH = 162

interface Star {
  hours: number
  declination: number
  magnitude: number
}

function skyRadius(declination: number): number {
  return SKY_EQUATOR * Math.tan((45 - declination / 2) * RAD)
}

/** Screen angle from the pole of an hour of right ascension. */
function skyAngle(hours: number): number {
  return -90 + (hours - SKY_UP) * 15
}

function sky(star: Star): Point {
  return at(POLE, skyRadius(star.declination), skyAngle(star.hours))
}

function starRadius(star: Star): number {
  return Math.max(1.05, 4.6 - 0.95 * star.magnitude)
}

interface Figure {
  name: string
  /** The two Bears are drawn with a firmer line than their faint neighbours. */
  firm: boolean
  stars: Star[]
  /** The order the pen joins them in. */
  order: number[]
}

const ALKAID: Star = { hours: 13.792, declination: 49.31, magnitude: 1.86 }
const MIZAR: Star = { hours: 13.399, declination: 54.93, magnitude: 2.2 }
const MERAK: Star = { hours: 11.031, declination: 56.38, magnitude: 2.35 }
const DUBHE: Star = { hours: 11.062, declination: 61.75, magnitude: 1.8 }
const ARCTURUS: Star = { hours: 14.261, declination: 19.18, magnitude: -0.05 }
const POLARIS: Star = { hours: 2.53, declination: 89.264, magnitude: 1.98 }

const FIGURES: Figure[] = [
  {
    // The Plough: Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe, and back to Megrez to close the bowl.
    name: 'p',
    firm: true,
    stars: [
      ALKAID,
      MIZAR,
      { hours: 12.9, declination: 55.96, magnitude: 1.77 },
      { hours: 12.257, declination: 57.03, magnitude: 3.3 },
      { hours: 11.897, declination: 53.69, magnitude: 2.4 },
      MERAK,
      DUBHE,
    ],
    order: [0, 1, 2, 3, 4, 5, 6, 3],
  },
  {
    // The Little Bear, out from the pole star: Polaris, Yildun, epsilon, zeta, Kochab, Pherkad, eta, and back to zeta.
    name: 'm',
    firm: true,
    stars: [
      POLARIS,
      { hours: 17.537, declination: 86.586, magnitude: 4.36 },
      { hours: 16.766, declination: 82.037, magnitude: 4.21 },
      { hours: 15.734, declination: 77.794, magnitude: 4.29 },
      { hours: 14.845, declination: 74.156, magnitude: 2.08 },
      { hours: 15.346, declination: 71.834, magnitude: 3.05 },
      { hours: 16.292, declination: 75.755, magnitude: 4.95 },
    ],
    order: [0, 1, 2, 3, 4, 5, 6, 3],
  },
  {
    // As much of the Herdsman as the strip holds: Arcturus and Muphrid.
    name: 'b',
    firm: false,
    stars: [ARCTURUS, { hours: 13.911, declination: 18.4, magnitude: 2.68 }],
    order: [0, 1],
  },
  {
    // The Hunting Dogs: Cor Caroli and Chara.
    name: 'h',
    firm: false,
    stars: [
      { hours: 12.934, declination: 38.32, magnitude: 2.9 },
      { hours: 12.562, declination: 41.36, magnitude: 4.25 },
    ],
    order: [0, 1],
  },
  {
    // Berenice's Hair: gamma, beta, alpha.
    name: 'c',
    firm: false,
    stars: [
      { hours: 12.449, declination: 28.27, magnitude: 4.35 },
      { hours: 13.198, declination: 27.88, magnitude: 4.25 },
      { hours: 13.166, declination: 17.53, magnitude: 4.3 },
    ],
    order: [0, 1, 2],
  },
]

/** Stars that belong to no drawn figure: Alcor beside Mizar, chi of the Great Bear, four more of the Herdsman
 * (tau, upsilon, rho, Seginus), and Errai of Cepheus, alone on the far side of the pole. */
const LOOSE_STARS: Star[] = [
  { hours: 13.42, declination: 54.99, magnitude: 4.0 },
  { hours: 11.767, declination: 47.78, magnitude: 3.7 },
  { hours: 13.788, declination: 17.46, magnitude: 4.5 },
  { hours: 13.824, declination: 15.8, magnitude: 4.05 },
  { hours: 14.531, declination: 30.37, magnitude: 3.57 },
  { hours: 14.535, declination: 38.31, magnitude: 3.03 },
  { hours: 23.656, declination: 77.63, magnitude: 3.2 },
]

/** Screen angle from the pole to the pointers, Dubhe and Merak: the arm rests on them. */
const POINTERS_AT = skyAngle((MERAK.hours + DUBHE.hours) / 2)

/** One unbroken line of the chart, in the direction the pen takes it. */
interface Stroke {
  d: string
  length: number
  width: number
  opacity: number
}

/** An open arc run backwards: counter-clockwise from the larger angle to the smaller. */
function arcBack(centre: Point, radius: number, from: number, to: number): string {
  const size = round(radius)
  return `M${xy(at(centre, radius, to))}A${size} ${size} 0 ${to - from > 180 ? 1 : 0} 0 ${xy(at(centre, radius, from))}`
}

/** The chart's hour lines and circles of declination, kept clear of the column: the lines first, since they are short.
 * The pen goes out along one and comes back along the next, the way a plotter does. */
function gridStrokes(): Stroke[] {
  const strokes: Stroke[] = []
  const reaches: readonly (readonly [number, number])[] = [
    [12, 205],
    [15, 184],
    [13, 300],
    [14, 296],
  ]
  reaches.forEach(([hour, far], index) => {
    const near = at(POLE, DIAL_OUTER + 6, skyAngle(hour))
    const end = at(POLE, far, skyAngle(hour))
    const d = index % 2 === 0 ? `M${xy(near)}L${xy(end)}` : `M${xy(end)}L${xy(near)}`
    strokes.push({ d, length: far - DIAL_OUTER - 6, width: 0.7, opacity: 0.26 })
  })
  for (let ring = 0; ring < 6; ring += 1) {
    const radius = skyRadius(60 - ring * 10)
    // Each circle stops a different distance short of the column, the outer ones sooner, and each is fainter than the last.
    const shy = 14 + 46 * hash(ring * 17 + 3) + ring * 7
    const left = 150 + 36 * hash(ring * 13 + 5)
    const angleAt = (x: number): number => -Math.acos(Math.max(-1, Math.min(1, (x - POLE.x) / radius))) / RAD
    const from = Math.max(-179, angleAt(left))
    const to = angleAt(COLUMN_LEFT - shy)
    strokes.push({
      d: ring % 2 === 0 ? arc(POLE, radius, from, to) : arcBack(POLE, radius, from, to),
      length: radius * (to - from) * RAD,
      width: 0.8,
      opacity: round((0.5 - ring * 0.055) * 100) / 100,
    })
  }
  return strokes
}

/** The joining lines of the figures, each one stroke from its first star to its last. */
function figureStrokes(): Stroke[] {
  return FIGURES.map(figure => {
    const points = figure.order.map(index => {
      const star = figure.stars[index]
      return star ? sky(star) : POLE
    })
    let length = 0
    for (let index = 1; index < points.length; index += 1) {
      const here = points[index]
      const before = points[index - 1]
      if (here && before) length += distance(here, before)
    }
    return { d: `M${points.map(xy).join('L')}`, length, width: figure.firm ? 1.15 : 0.9, opacity: figure.firm ? 0.85 : 0.58 }
  })
}

/** What the pen never redraws: the numerals of the grid, and inside the ring the circle of eighty degrees and the two
 * colures, crossing at the pole. */
function chartFurniture(stock: Stock): string {
  let labels = ''
  // The degrees stand in a column down the chart's left margin, each on its own circle.
  for (let declination = 60; declination >= 20; declination -= 10) {
    const radius = skyRadius(declination) + 7.5
    labels += numeral(`${declination}°`, POLE, radius, -Math.acos((219 - POLE.x) / radius) / RAD, 8)
  }
  const names: readonly (readonly [number, string, number])[] = [
    [12, 'XII', 205],
    [13, 'XIII', 300],
    [14, 'XIV', 296],
    [15, 'XV', 184],
  ]
  for (const [hour, name, far] of names) labels += numeral(name, POLE, far + 13, skyAngle(hour), 8)
  let polar = circle(POLE, skyRadius(80))
  for (let hour = 0; hour < 24; hour += 6) polar += `M${xy(at(POLE, 11, skyAngle(hour)))}L${xy(at(POLE, DIAL_INNER, skyAngle(hour)))}`
  return (
    `<path d="${polar}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".24"/>` +
    `<g class="num" font-size="8" fill="${stock.ink}" fill-opacity=".58">${labels}</g>`
  )
}

/** "Follow the arc to Arcturus": the curve of the Plough's handle, carried on in dots from Alkaid to Arcturus. */
function arcToArcturus(stock: Stock): string {
  const from = sky(ALKAID)
  const to = sky(ARCTURUS)
  const centre = centreThrough(sky(MIZAR), from, to)
  if (!centre) return ''
  const radius = distance(centre, from)
  // Stop short of both stars, by a little more than their rings.
  let first = Math.atan2(from.y - centre.y, from.x - centre.x) / RAD
  let second = Math.atan2(to.y - centre.y, to.x - centre.x) / RAD
  const firstGap = (11 / radius) / RAD
  const secondGap = (14 / radius) / RAD
  if (second < first) {
    ;[first, second] = [second + secondGap, first - firstGap]
  } else {
    first += firstGap
    second -= secondGap
  }
  return `<path d="${arc(centre, radius, first, second)}" stroke="${stock.accent}" stroke-width="1.5" stroke-opacity=".8" stroke-dasharray=".1 6.4"/>`
}

/** Pixels a second. */
const PEN_SPEED = 15
/** Seconds a line stays washed away before the pen comes to it. */
const PEN_ABSENT = 4
/** A line is washed away in this share of the time it takes to draw. */
const WASH_SHARE = 0.6
/** Seconds between one line and the next, while the pen is lifted. */
const PEN_LIFT = 0.7
/** Seconds at the start of every cycle in which nothing is washed or drawn: the sheet is first shown whole. */
const PEN_QUIET = 9

interface PenMarkup {
  shapes: string
  rules: string
  lines: string
  pens: string
}

/** One pen works through the strokes strictly one after another on a shared cycle. Each line is washed away, from its
 * first end on, shortly before its turn, and stands finished the rest of the time. */
function penWork(strokes: Stroke[]): PenMarkup {
  const durations = strokes.map(stroke => Math.max(2.4, stroke.length / PEN_SPEED))
  const starts: number[] = []
  let clock = PEN_QUIET + PEN_ABSENT + (durations[0] ?? 0) * WASH_SHARE
  for (const duration of durations) {
    starts.push(clock)
    clock += duration + PEN_LIFT
  }
  const cycle = Math.ceil(clock)
  const share = (seconds: number): number => Math.round((seconds / cycle) * 10000) / 100
  let shapes = ''
  let rules = `.line,.pen{animation-duration:${cycle}s;animation-timing-function:linear;animation-iteration-count:infinite}`
  let lines = ''
  let pens = ''
  strokes.forEach((stroke, index) => {
    const drawn = share(durations[index] ?? 0)
    const gone = share(cycle - PEN_ABSENT)
    const washFrom = Math.round((gone - drawn * WASH_SHARE) * 100) / 100
    const lifted = Math.round((drawn + 0.05) * 100) / 100
    // Each animation starts where its line's turn starts, so the delay puts the first showing at the cycle's quiet start.
    const timing = `animation-delay:${round((starts[index] ?? 0) - cycle)}s`
    shapes += `<path id="s${index}" pathLength="1" d="${stroke.d}"/>`
    rules +=
      `@keyframes l${index}{0%{stroke-dashoffset:1.01}${drawn}%{stroke-dashoffset:0}${washFrom}%{stroke-dashoffset:0}${gone}%,100%{stroke-dashoffset:-1.01}}` +
      `@keyframes p${index}{0%{stroke-dashoffset:0;opacity:1}${drawn}%{stroke-dashoffset:-1;opacity:1}${lifted}%,100%{stroke-dashoffset:-1;opacity:0}}`
    lines += `<use href="#s${index}" class="line" stroke-width="${stroke.width}" stroke-opacity="${stroke.opacity}" style="animation-name:l${index};${timing}"/>`
    pens += `<use href="#s${index}" class="pen" style="animation-name:p${index};${timing}"/>`
  })
  return { shapes, rules, lines, pens }
}

/** Faint nameless stars, scattered by the hash over the strip the chart covers. */
function fieldStars(stock: Stock, named: Point[]): string {
  let field = ''
  let larger = ''
  for (let index = 0; index < 70; index += 1) {
    const point = at(POLE, DIAL_OUTER + 14 + hash(index * 3 + 1) * 290, -128 + hash(index * 3 + 2) * 84)
    if (point.x < 226 || point.x > COLUMN_LEFT - 24 || point.y < 452) continue
    if (named.some(other => distance(other, point) < 13)) continue
    // Not under the arm, nor on the margin where the degrees stand.
    const bearing = Math.atan2(point.y - POLE.y, point.x - POLE.x) / RAD
    if (Math.abs(bearing - POINTERS_AT) < 5 && distance(point, POLE) < ARM_LENGTH + 10) continue
    if (point.x < 236 && hash(index + 90) < 0.6) continue
    if (index % 4 === 0) larger += `M${xy(point)}h0`
    else field += `M${xy(point)}h0`
  }
  return `<path d="${field}" stroke="${stock.ink}" stroke-width="1.4" stroke-opacity=".46"/><path d="${larger}" stroke="${stock.ink}" stroke-width="2.1" stroke-opacity=".5"/>`
}

/** The stars: a patch of bare paper round each so the joining lines stop short of it, then the dot, sized by magnitude. */
function starDots(stock: Stock): { field: string; dots: string } {
  let clearings = ''
  let dots = ''
  let rings = ''
  let count = 0
  const named: Point[] = []
  const draw = (star: Star): void => {
    const point = sky(star)
    const radius = starRadius(star)
    named.push(point)
    clearings += `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="${round(radius + (star.magnitude < 1.9 ? 3.9 : 2.2))}"/>`
    const period = 9 + (count % 5) * 1.5
    const twinkle = count % 3 === 2 ? ` class="tw" style="animation-duration:${period}s;animation-delay:${round(-hash(count + 40) * 0.25 * period)}s"` : ''
    dots += `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="${round(radius)}"${twinkle}/>`
    // The brightest carry a fine ring, as on a printed chart. The pole star has the arm's pivot for one.
    if (star.magnitude < 1.9) rings += circle(point, radius + 2.7)
    count += 1
  }
  for (const figure of FIGURES) figure.stars.forEach(draw)
  LOOSE_STARS.forEach(draw)
  return {
    field: fieldStars(stock, named),
    dots:
      `<g fill="${stock.paper}">${clearings}</g>` +
      `<path d="${rings}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".6"/>` +
      `<g fill="${stock.ink}">${dots}</g>`,
  }
}

/** The hour ring: a brass annulus round the pole. Its outer band is a fixed calendar, twelve months in five-day steps;
 * its inner band, the hours, turns; the arm lies from the pole over the Plough's two pointers. */
function hourRing(stock: Stock): string {
  let calendar = ''
  let months = ''
  for (let step = 0; step < 72; step += 1) {
    const angle = -90 + step * 5
    const depth = step % 6 === 0 ? DIAL_MIDDLE : step % 2 === 0 ? DIAL_OUTER - 3.6 : DIAL_OUTER - 2.3
    calendar += `M${xy(at(POLE, DIAL_OUTER, angle))}L${xy(at(POLE, depth, angle))}`
    if (step % 6 === 0) months += numeral(String(step / 6 + 1), POLE, 100.4, angle + 15, 6.6)
  }
  // The hours: a tick every quarter, a longer one on the half and the hour, the full band every six, and a wedge for midnight.
  let hourTicks = ''
  for (let quarter = 1; quarter < 96; quarter += 1) {
    const angle = -90 + quarter * 3.75
    const reach = quarter % 24 === 0 ? DIAL_MIDDLE : quarter % 4 === 0 ? DIAL_INNER + 6 : quarter % 2 === 0 ? DIAL_INNER + 3.6 : DIAL_INNER + 2.2
    hourTicks += `M${xy(at(POLE, DIAL_INNER, angle))}L${xy(at(POLE, reach, angle))}`
  }
  const wedge = `M${xy(at(POLE, DIAL_MIDDLE - 0.6, -90))}L${xy(at(POLE, DIAL_INNER + 1.5, -92.6))}L${xy(at(POLE, DIAL_INNER + 1.5, -87.4))}Z`
  const tip = at(POLE, ARM_LENGTH, POINTERS_AT)
  const across = at({ x: 0, y: 0 }, 4, POINTERS_AT + 90)
  const arm = `M${xy(at(POLE, 6.5, POINTERS_AT))}L${xy(tip)}M${round(tip.x - across.x)} ${round(tip.y - across.y)}L${round(tip.x + across.x)} ${round(tip.y + across.y)}`
  return (
    `<path d="${circle(POLE, DIAL_OUTER)}${circle(POLE, DIAL_INNER, false)}" fill="${stock.metal}"/>` +
    `<path d="${circle(POLE, DIAL_OUTER)}" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity=".88"/>` +
    `<path d="${circle(POLE, DIAL_MIDDLE)}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".6"/>` +
    `<path d="${calendar}" stroke="${stock.ink}" stroke-width=".75" stroke-opacity=".72" stroke-linecap="butt"/>` +
    `<g class="num" font-size="6.6" fill="${stock.ink}" fill-opacity=".7">${months}</g>` +
    `<g class="hours">` +
    `<path d="${circle(POLE, DIAL_INNER)}" stroke="${stock.accent}" stroke-width="1.05" stroke-opacity=".9"/>` +
    `<path d="${hourTicks}" stroke="${stock.accent}" stroke-width=".75" stroke-opacity=".85" stroke-linecap="butt"/>` +
    `<path d="${wedge}" fill="${stock.accent}"/>` +
    `</g>` +
    `<g class="arm"><path d="${arm}" stroke="${stock.accent}" stroke-width="1.15" stroke-opacity=".9"/></g>` +
    `<circle cx="${POLE.x}" cy="${POLE.y}" r="6.5" stroke="${stock.accent}" stroke-width="1.05" stroke-opacity=".9"/>`
  )
}

/** The whole sheet on one stock. */
function astrolabeSheet(stock: Stock): string {
  const plate = plateLines()
  const web = rete(stock)
  const ruler = rule(stock)
  const stars = starDots(stock)
  // The grid first, then the figures over it: the same order the pen takes them in.
  const pen = penWork(gridStrokes().concat(figureStrokes()))

  const style = `
.num{font-family:Georgia,'Times New Roman',serif;font-style:italic;text-anchor:middle;stroke:none}
.line{stroke-dasharray:1 2}
.pen{stroke-dasharray:.0001 3;stroke-width:4.6;opacity:0}
.rete,.rule{transform-origin:${PIN.x}px ${PIN.y}px}
.hours,.arm{transform-origin:${POLE.x}px ${POLE.y}px}
.rete{animation:turn 900s linear infinite}
.rule{animation:creep 110s ease-in-out -55s infinite alternate}
.hours{animation:turn 1260s linear infinite reverse}
.arm{animation:sight 96s ease-in-out -48s infinite alternate}
.tw{animation:twinkle 7s ease-in-out infinite}
${pen.rules}
@keyframes turn{to{transform:rotate(360deg)}}
@keyframes creep{from{transform:rotate(-13deg)}to{transform:rotate(13deg)}}
@keyframes sight{from{transform:rotate(-2.4deg)}to{transform:rotate(2.4deg)}}
@keyframes twinkle{0%,78%,100%{opacity:1}89%{opacity:.25}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round"><style>${style}</style><defs>${web.shape}${ruler.shape}${pen.shapes}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
${chartFurniture(stock)}
${stars.field}
${arcToArcturus(stock)}
<g stroke="${stock.ink}">${pen.lines}</g><g stroke="${stock.accent}">${pen.pens}</g>
${hourRing(stock)}
${stars.dots}
${throne(stock)}
<circle cx="${PIN.x}" cy="${PIN.y}" r="${LIMB_INNER}" fill="${stock.plate}"/>
<path d="${plate.hours}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".3"/>
<path d="${plate.fine}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".42"/>
<path d="${plate.firm}" stroke="${stock.ink}" stroke-width=".9" stroke-opacity=".62"/>
${limb(stock)}
${web.markup}
${ruler.markup}
</svg>`
}

/** Astrolabe in sepia on warm paper, for a light window. */
export function daySvg(): string {
  return astrolabeSheet(DAY)
}

/** Astrolabe in brass on umber, for a dark window. */
export function nightSvg(): string {
  return astrolabeSheet(NIGHT)
}
