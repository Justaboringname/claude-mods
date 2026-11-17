// Astrolabe: a brass planispheric astrolabe laid on a hand-drawn chart of the northern sky.
// Right: the astrolabe, entering from the edge. Its plate is the true stereographic projection for latitude 40 north
// (tropics, equator, almucantars every ten degrees, azimuth arcs); over it the pierced rete with its eccentric ecliptic ring
// and star pointers at real right ascensions and declinations turns once in twelve minutes, and the rule creeps back and forth.
// Left: a nocturnal (a star clock) centred on the pole of an equidistant polar chart. Its arm lies on the two pointers of the
// Plough, the way the instrument is used; its toothed hour disc turns slowly. A pen joins the stars and joins them again.
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

const DAY: Stock = { paper: '#f3eee3', plate: '#f1e9d8', metal: '#ebdcbb', ink: '#4a3624', accent: '#b0492a' }
/** The same drawing in brass on umber. Blue is the weakest channel of every colour here. */
const NIGHT: Stock = { paper: '#19130d', plate: '#1d160f', metal: '#2b2013', ink: '#c4a468', accent: '#e58a50' }

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

const PIN: Point = { x: 1580, y: 570 }
const LIMB_OUTER = 330
const LIMB_INNER = 296
const SCALE_OUTER = 309
/** The plate's edge is the tropic of Capricorn; the other circles follow from the obliquity of the ecliptic. */
const CAPRICORN = 288
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
const INNER_STRAP = 112
/** Screen angle of the rule's fiducial edge at rest. */
const RULE_AT = 203

/** Distance from the pin of a circle of declination: stereographic projection from the south pole. */
function declinationRadius(declination: number): number {
  return EQUATOR * Math.tan((45 - declination / 2) * RAD)
}

/** The plate's engraving: `firm` holds the horizon, the tropics and the two axes, `fine` the almucantars and azimuth arcs. */
function plateLines(): { fine: string; firm: string } {
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
  const horizonCentre = at(PIN, (EQUATOR * cosLatitude) / sinLatitude, UP)
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
  return { fine, firm }
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
    if (degree % 10 === 0 && at(PIN, 320, angle).x < WIDTH - 4) numerals += numeral(String(Math.abs(90 - (degree % 180))), PIN, 320, angle, 9.5)
  }
  const rings = circle(PIN, LIMB_OUTER) + circle(PIN, LIMB_INNER)
  return (
    `<path d="${circle(PIN, LIMB_OUTER)}${circle(PIN, LIMB_INNER, false)}" fill="${stock.metal}"/>` +
    `<path d="${rings}" stroke="${stock.ink}" stroke-width="1.25" stroke-opacity=".9"/>` +
    `<path d="${circle(PIN, SCALE_OUTER)}${circle(PIN, LIMB_OUTER - 3.5)}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".55"/>` +
    `<path d="${ticks}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".75" stroke-linecap="butt"/>` +
    `<g class="num" font-size="9.5" fill="${stock.ink}" fill-opacity=".72">${numerals}</g>`
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
    `<path d="${outline}" fill="${stock.metal}" stroke="${stock.ink}" stroke-width="1.25" stroke-opacity=".9"/>` +
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
    `<use href="#rete" fill="${stock.metal}" stroke="${stock.accent}" stroke-width="2.3"/>` +
    `<use href="#rete" fill="${stock.metal}"/>` +
    `<path d="${scale}" stroke="${stock.accent}" stroke-width=".75" stroke-opacity=".8" stroke-linecap="butt"/>` +
    `<path d="${tips}" stroke="${stock.accent}" stroke-width="3.6"/>` +
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
    `<use href="#rule" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="2.4" stroke-opacity=".9"/>` +
    `<use href="#rule" fill="${stock.plate}"/>` +
    `<path d="${marks}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".8" stroke-linecap="butt"/>` +
    `</g>` +
    `<circle cx="${PIN.x}" cy="${PIN.y}" r="7.5" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".9"/>` +
    `<circle cx="${PIN.x}" cy="${PIN.y}" r="3.2" fill="${stock.ink}"/>`
  return { shape: `<path id="rule" d="${sheet}"/>`, markup }
}

// ---------------------------------------------------------------------------------------------------------------------
// The chart and the nocturnal. The chart is an equidistant projection about the pole, seen from the ground, so right
// ascension grows clockwise; the nocturnal's sighting hole sits on the pole and Polaris shows through it.

const POLE: Point = { x: 275, y: 800 }
/** Pixels per degree of distance from the pole. */
const SKY_SCALE = 6.2
/** Screen angle of right ascension 0, chosen so the Plough stands over the dial. */
const SKY_TURN = -269.7
const DIAL_OUTER = 100
const DIAL_INNER = 84
const ARM_LENGTH = 214
/** Screen angle from the pole to the pointers, Dubhe and Merak: the arm rests on them. */
const POINTERS_AT = SKY_TURN + 165.7

interface Star {
  hours: number
  declination: number
  magnitude: number
}

function sky(star: Star): Point {
  return at(POLE, (90 - star.declination) * SKY_SCALE, SKY_TURN + star.hours * 15)
}

function starRadius(star: Star): number {
  return Math.max(1, 4.5 - 0.95 * star.magnitude)
}

interface Figure {
  name: string
  stars: Star[]
  /** The order the pen joins them in. */
  order: number[]
}

const FIGURES: Figure[] = [
  {
    // The Plough: Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe, and back to Megrez to close the bowl.
    name: 'p',
    stars: [
      { hours: 13.792, declination: 49.31, magnitude: 1.86 },
      { hours: 13.399, declination: 54.93, magnitude: 2.2 },
      { hours: 12.9, declination: 55.96, magnitude: 1.77 },
      { hours: 12.257, declination: 57.03, magnitude: 3.3 },
      { hours: 11.897, declination: 53.69, magnitude: 2.4 },
      { hours: 11.031, declination: 56.38, magnitude: 2.35 },
      { hours: 11.062, declination: 61.75, magnitude: 1.8 },
    ],
    order: [0, 1, 2, 3, 4, 5, 6, 3],
  },
  {
    // The Dragon's tail, between the Plough and the pole: Giausar, kappa, Thuban.
    name: 'd',
    stars: [
      { hours: 11.523, declination: 69.33, magnitude: 3.8 },
      { hours: 12.558, declination: 69.79, magnitude: 3.9 },
      { hours: 14.073, declination: 64.38, magnitude: 3.65 },
    ],
    order: [0, 1, 2],
  },
  {
    // The Hunting Dogs: Cor Caroli and Chara.
    name: 'h',
    stars: [
      { hours: 12.933, declination: 38.32, magnitude: 2.9 },
      { hours: 12.562, declination: 41.36, magnitude: 4.25 },
    ],
    order: [0, 1],
  },
  {
    // Berenice's Hair: gamma, beta, alpha.
    name: 'b',
    stars: [
      { hours: 12.449, declination: 28.27, magnitude: 4.35 },
      { hours: 13.198, declination: 27.88, magnitude: 4.25 },
      { hours: 13.166, declination: 17.53, magnitude: 4.3 },
    ],
    order: [0, 1, 2],
  },
]

/** Stars that belong to no drawn figure: Alcor, chi and psi of the Bear, the two Alulas. */
const LOOSE_STARS: Star[] = [
  { hours: 13.42, declination: 54.99, magnitude: 4.0 },
  { hours: 11.767, declination: 47.78, magnitude: 3.7 },
  { hours: 11.161, declination: 44.5, magnitude: 3.0 },
  { hours: 11.308, declination: 33.09, magnitude: 3.5 },
  { hours: 11.303, declination: 31.53, magnitude: 3.8 },
]

/** The faint grid of the chart: circles of declination about the pole and hour lines out of it, kept clear of the column. */
function chartGrid(stock: Stock): string {
  let arcs = ''
  let labels = ''
  const labelAt = SKY_TURN + 13 * 15 + 2.2
  for (let ring = 0; ring < 6; ring += 1) {
    const declination = 70 - ring * 10
    const radius = (90 - declination) * SKY_SCALE
    const shy = 14 + 56 * hash(ring * 17 + 3) + Math.max(0, ring - 2) * 10
    const left = 150 + Math.max(0, ring - 2) * 26
    const keep = (point: Point): boolean => point.x > left && point.x < COLUMN_LEFT - shy && point.y > 70
    const opacity = round((0.44 - ring * 0.045) * 100) / 100
    arcs += `<path d="${arcsWhere(POLE, radius, keep, 186, 354)}" stroke-opacity="${opacity}"/>`
    if (ring > 0 && ring < 5) labels += numeral(`${declination}°`, POLE, radius + 7.5, labelAt, 8)
  }
  let lines = ''
  let hours = ''
  const names = ['XI', 'XII', 'XIII', 'XIV']
  for (let hour = 11; hour <= 14; hour += 1) {
    const angle = SKY_TURN + hour * 15
    let far = 60 * SKY_SCALE
    while (far > 130 && (at(POLE, far + 22, angle).x > COLUMN_LEFT - 22 || at(POLE, far, angle).x < 205)) far -= 4
    far -= 30 * hash(hour * 5 + 1)
    lines += `M${xy(at(POLE, 20 * SKY_SCALE, angle))}L${xy(at(POLE, far, angle))}`
    hours += numeral(names[hour - 11] ?? '', POLE, far + 13, angle, 8)
  }
  return (
    `<g stroke="${stock.ink}" stroke-width=".8">${arcs}</g>` +
    `<path d="${lines}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".24"/>` +
    `<g class="num" font-size="8" fill="${stock.ink}" fill-opacity=".5">${labels}${hours}</g>`
  )
}

interface FigureMarkup {
  shape: string
  keyframes: string
  strokes: string
}

/** One figure's joining line: drawn by a pen, left to rest, washed away from its first star on, drawn again. */
function penFigure(figure: Figure, stock: Stock, cycleSeconds: number, cycleStart: number): FigureMarkup {
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
  // The pen moves at one speed, so a long figure takes a larger share of the cycle.
  const drawn = round(Math.max(1.4, (length / 24 / cycleSeconds) * 100))
  const washFrom = round(88 - drawn)
  const id = `fig-${figure.name}`
  const timing = `style="animation-delay:${round(-cycleStart)}s"`
  const keyframes = `
.${id} .line{animation:line-${figure.name} ${cycleSeconds}s linear infinite}.${id} .pen{animation:pen-${figure.name} ${cycleSeconds}s linear infinite}
@keyframes line-${figure.name}{0%{stroke-dashoffset:1.01}${drawn}%{stroke-dashoffset:0}${washFrom}%{stroke-dashoffset:0}88%{stroke-dashoffset:-1.01}100%{stroke-dashoffset:-1.01}}
@keyframes pen-${figure.name}{0%{stroke-dashoffset:0;opacity:1}${drawn}%{stroke-dashoffset:-1;opacity:1}${round(drawn + 0.3)}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}}`
  const strokes =
    `<g class="${id}"><use href="#${id}" class="line" stroke="${stock.ink}" stroke-width="1.1" stroke-opacity=".78" ${timing}/>` +
    `<use href="#${id}" class="pen" stroke="${stock.accent}" ${timing}/></g>`
  return { shape: `<path id="${id}" pathLength="1" d="M${points.map(xy).join('L')}"/>`, keyframes, strokes }
}

/** The stars: a patch of bare paper round each so the joining lines stop short of it, then the dot, sized by magnitude. */
function starDots(stock: Stock): string {
  let clearings = ''
  let dots = ''
  let rings = ''
  let count = 0
  const named: Point[] = []
  const draw = (star: Star): void => {
    const point = sky(star)
    const radius = starRadius(star)
    named.push(point)
    clearings += `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="${round(radius + 3.4)}"/>`
    const twinkle = count % 3 === 0 ? ` class="tw" style="animation-duration:${6 + (count % 5) * 1.5}s;animation-delay:${round(-hash(count + 40) * 9)}s"` : ''
    dots += `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="${round(radius)}"${twinkle}/>`
    if (star.magnitude < 2) rings += circle(point, radius + 2.8)
    count += 1
  }
  for (const figure of FIGURES) figure.stars.forEach(draw)
  LOOSE_STARS.forEach(draw)
  // Faint field stars, scattered by the hash over the band the chart covers.
  let field = ''
  for (let index = 0; index < 60; index += 1) {
    const point = at(POLE, 135 + hash(index * 3 + 1) * 300, -128 + hash(index * 3 + 2) * 82)
    if (point.x < 208 || point.x > COLUMN_LEFT - 20 || point.y < 330) continue
    if (named.some(other => distance(other, point) < 13)) continue
    if (Math.abs(((Math.atan2(point.y - POLE.y, point.x - POLE.x) / RAD - POINTERS_AT + 540) % 360) - 180) < 5 && distance(point, POLE) < ARM_LENGTH + 10) continue
    field += `M${xy(point)}h0`
  }
  return (
    `<path d="${field}" stroke="${stock.ink}" stroke-width="1.7" stroke-opacity=".5"/>` +
    `<g fill="${stock.paper}">${clearings}</g>` +
    `<path d="${rings}" stroke="${stock.ink}" stroke-width=".7" stroke-opacity=".6"/>` +
    `<g fill="${stock.ink}">${dots}</g>`
  )
}

/** The nocturnal: a calendar disc with a handle, a toothed hour disc that turns on it, and a long arm from the sighting hole. */
function nocturnal(stock: Stock): { shapes: string; markup: string } {
  // The calendar: twelve months, each cut into three decades and six five-day steps.
  let calendar = ''
  let months = ''
  for (let step = 0; step < 72; step += 1) {
    const angle = -90 + step * 5
    const depth = step % 6 === 0 ? DIAL_INNER : step % 2 === 0 ? DIAL_OUTER - 6.5 : DIAL_OUTER - 3.8
    calendar += `M${xy(at(POLE, DIAL_OUTER, angle))}L${xy(at(POLE, depth, angle))}`
    if (step % 6 === 0) months += numeral(String(step / 6 + 1), POLE, 90, angle + 15, 7.5)
  }
  const handle = `M${xy(at(POLE, DIAL_OUTER - 2, 79))}L${POLE.x + 23} ${HEIGHT + 12}L${POLE.x - 23} ${HEIGHT + 12}L${xy(at(POLE, DIAL_OUTER - 2, 101))}`

  // The hour disc: twenty-four teeth to count by touch in the dark, and a longer one for midnight that reads the date.
  const root = 70
  let teeth = ''
  let hourTicks = ''
  let hourNumerals = ''
  for (let tooth = 0; tooth < 24; tooth += 1) {
    const angle = -90 + tooth * 15
    const tip = tooth === 0 ? DIAL_INNER - 1.5 : 77
    teeth += `${tooth === 0 ? 'M' : `A${root} ${root} 0 0 1 `}${xy(at(POLE, root, angle - 3.7))}L${xy(at(POLE, tip, angle - 1.4))}L${xy(at(POLE, tip, angle + 1.4))}L${xy(at(POLE, root, angle + 3.7))}`
    hourTicks += `M${xy(at(POLE, 62, angle))}L${xy(at(POLE, tooth % 2 === 0 ? 56.5 : 59, angle))}`
    if (tooth % 2 === 0) hourNumerals += numeral(String(tooth % 12 === 0 ? 12 : tooth % 12), POLE, 49.5, angle, 7.5)
  }
  teeth += `A${root} ${root} 0 0 1 ${xy(at(POLE, root, -90 - 3.7))}Z`

  // The arm: its straight edge runs out of the centre and lies on the two pointers.
  const along = at({ x: 0, y: 0 }, 1, POINTERS_AT)
  const across = at({ x: 0, y: 0 }, 1, POINTERS_AT + 90)
  const place = (out: number, aside: number): Point => ({ x: POLE.x + out * along.x + aside * across.x, y: POLE.y + out * along.y + aside * across.y })
  const arm = circle(POLE, 14) + clockwisePolygon([place(6, 0), place(ARM_LENGTH, 0), place(ARM_LENGTH - 14, -7.5), place(6, -9)])
  const polaris = at(POLE, 0.74 * SKY_SCALE, SKY_TURN + 2.53 * 15)

  const markup =
    `<path d="${handle}" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="1.15" stroke-opacity=".85"/>` +
    `<circle cx="${POLE.x}" cy="${POLE.y}" r="${DIAL_OUTER}" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="1.25" stroke-opacity=".9"/>` +
    `<path d="${circle(POLE, DIAL_INNER)}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".7"/>` +
    `<path d="${calendar}" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".75" stroke-linecap="butt"/>` +
    `<g class="num" font-size="7.5" fill="${stock.ink}" fill-opacity=".7">${months}</g>` +
    `<g class="hours">` +
    `<path d="${teeth}" fill="${stock.metal}" stroke="${stock.accent}" stroke-width="1.15"/>` +
    `<path d="${circle(POLE, 62)}${hourTicks}" stroke="${stock.accent}" stroke-width=".75" stroke-opacity=".8" stroke-linecap="butt"/>` +
    `<g class="num" font-size="7.5" fill="${stock.accent}" fill-opacity=".85">${hourNumerals}</g>` +
    `</g>` +
    `<g class="arm">` +
    `<use href="#arm" fill="${stock.plate}" stroke="${stock.ink}" stroke-width="2.4" stroke-opacity=".9"/>` +
    `<use href="#arm" fill="${stock.plate}"/>` +
    `</g>` +
    `<circle cx="${POLE.x}" cy="${POLE.y}" r="7" fill="${stock.paper}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".9"/>` +
    `<circle cx="${round(polaris.x)}" cy="${round(polaris.y)}" r="2.3" fill="${stock.ink}"/>`
  return { shapes: `<path id="arm" d="${arm}"/>`, markup }
}

/** The whole sheet on one stock. */
function astrolabeSheet(stock: Stock): string {
  const plate = plateLines()
  const web = rete(stock)
  const ruler = rule(stock)
  const dial = nocturnal(stock)
  const figures = FIGURES.map((figure, index) => penFigure(figure, stock, 150, [4, 118, 82, 46][index] ?? 0))

  const style = `
.num{font-family:Georgia,'Times New Roman',serif;font-style:italic;text-anchor:middle;stroke:none}
.line{stroke-dasharray:1 2}
.pen{stroke-dasharray:.0001 3;stroke-width:5;opacity:0}
.rete,.rule{transform-origin:${PIN.x}px ${PIN.y}px}
.hours,.arm{transform-origin:${POLE.x}px ${POLE.y}px}
.rete{animation:turn 720s linear infinite}
.rule{animation:creep 110s ease-in-out -55s infinite alternate}
.hours{animation:turn 900s linear infinite reverse}
.arm{animation:sight 70s ease-in-out infinite alternate}
.tw{animation:twinkle 7s ease-in-out infinite}${figures.map(figure => figure.keyframes).join('')}
@keyframes turn{to{transform:rotate(360deg)}}
@keyframes creep{from{transform:rotate(-13deg)}to{transform:rotate(13deg)}}
@keyframes sight{0%,22%{transform:rotate(0deg)}100%{transform:rotate(-11deg)}}
@keyframes twinkle{0%,100%{opacity:1}50%{opacity:.28}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round"><style>${style}</style><defs>${web.shape}${ruler.shape}${dial.shapes}${figures.map(figure => figure.shape).join('')}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
${chartGrid(stock)}
${figures.map(figure => figure.strokes).join('')}
${starDots(stock)}
${dial.markup}
${throne(stock)}
<circle cx="${PIN.x}" cy="${PIN.y}" r="${LIMB_INNER}" fill="${stock.plate}"/>
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
