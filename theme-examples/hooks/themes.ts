import type { ThemeBackdropGlass } from 'claude-code'

import { auroraSvg, deepWaterSvg, emberSvg } from './scenes/classic'
import { blueprintSvg } from './scenes/blueprint'
import { brailleStarsSvg } from './scenes/braille-stars'
import { departureBoardSvg } from './scenes/departure-board'
import { ditherDunesSvg, ditherDunesNightSvg } from './scenes/dither-dunes'
import { halftoneDawnSvg, halftoneDuskSvg } from './scenes/halftone-dawn'
import { honuLagoonSvg } from './scenes/honu-lagoon'
import { koiMosaicSvg } from './scenes/koi-mosaic'
import { nightReefSvg } from './scenes/night-reef'
import { paperGardenSvg, paperGardenKraftSvg } from './scenes/paper-garden'
import { WARM_NIGHTS, plotterTideSvg, plotterTideNightSvg, plotterTideWarmSvg } from './scenes/plotter-tide'
import { snowPinesSvg } from './scenes/snow-pines'
import { teletextCloudsSvg } from './scenes/teletext-clouds'
import { vectorRangeSvg } from './scenes/vector-range'
import { inkMountainsSvg } from './scenes/ink-mountains'
import { sceneSvg as gardenLatticeSvg } from './scenes/garden-lattice'
import { daySvg as gardenLatticeNaturalDaySvg, nightSvg as gardenLatticeNaturalNightSvg } from './scenes/garden-lattice-natural'
import { daySvg as gardenLatticeLanternDaySvg, nightSvg as gardenLatticeLanternNightSvg } from './scenes/garden-lattice-lantern'
import { daySvg as gardenCourtDaySvg, nightSvg as gardenCourtNightSvg } from './scenes/garden-court'

/** One theme: what the card and the list say, the glass over it, and its scene: a function that builds one SVG whose
 *  own CSS animates it. A scene says whether it is dark or light with its tint, picked from it. */
export type Theme = {
  id: string
  title: string
  blurb: string
  /** Which window the scene is made for: the app uses a theme's tint only where its own text reads on it. */
  window: 'light' | 'dark'
  /** The same scene made for the other kind of window, by its id, where there is one: the list and the card name it. */
  twin?: string
  glass: ThemeBackdropGlass
  scene: () => string
}

/** LOCAL CHANGE: what the card and the list say of each warm night stock of Plotter Tide. */
const WARM_NIGHT_WORDS: Record<keyof typeof WARM_NIGHTS, { title: string; blurb: string; tint: string }> = {
  graphite: { title: 'Graphite', blurb: 'pale ink on warm graphite, close to the app\'s own dark panels.', tint: '#1f1e1b' },
  kraft: { title: 'Kraft', blurb: 'sand ink on dark brown kraft paper.', tint: '#272018' },
  ember: { title: 'Ember', blurb: 'rose-sand ink on a deep red-brown.', tint: '#241917' },
  amber: { title: 'Amber', blurb: 'amber ink on near-black, like a night light.', tint: '#18130d' },
  moss: { title: 'Moss', blurb: 'sage ink on a dark olive.', tint: '#1a1f18' },
  ink: { title: 'Ink', blurb: 'dim warm-grey ink on near-black, the darkest of them.', tint: '#131211' },
}

/** LOCAL CHANGE: the warm night stock that stands as Plotter Tide's twin for a dark window. */
export const WARM_TWIN: keyof typeof WARM_NIGHTS = 'kraft'

const WARM_NIGHT_THEMES: Theme[] = (Object.keys(WARM_NIGHTS) as (keyof typeof WARM_NIGHTS)[]).map(stock => ({
  id: `plotter-tide-${stock}`,
  title: `Plotter Tide, ${WARM_NIGHT_WORDS[stock].title}`,
  blurb: `The plotter's tide chart with no blue in it: ${WARM_NIGHT_WORDS[stock].blurb}`,
  window: 'dark',
  twin: 'plotter-tide',
  glass: { blur: 0, tint: WARM_NIGHT_WORDS[stock].tint, opacity: 0.32 },
  scene: () => plotterTideWarmSvg(stock),
}))

/** LOCAL CHANGE: Ink Mountains, a scene of our own: ink-wash ridges under a dusk sky after the Token Counter wallpaper. */
const INK_THEMES: Theme[] = [
  {
    id: 'ink-mountains',
    title: 'Ink Mountains',
    blurb: 'Ink-wash ridges rising into mist under a pale dusk sky: an orange sun, birds, a lone pine.',
    window: 'light',
    twin: 'ink-mountains-night-blue',
    glass: { blur: 0, tint: '#f3e4e8', opacity: 0 },
    scene: () => inkMountainsSvg('day'),
  },
  {
    id: 'ink-mountains-night',
    title: 'Ink Mountains, Night',
    blurb: 'The same ridges in pale ink under a wine-dark sky with one orange glow. No blue.',
    window: 'dark',
    twin: 'ink-mountains',
    glass: { blur: 0, tint: '#20131b', opacity: 0 },
    scene: () => inkMountainsSvg('night'),
  },
  {
    id: 'ink-mountains-vivid',
    title: 'Ink Mountains, Vivid',
    blurb: 'The ridges under the dusk sky at full strength: orange, mauve and periwinkle.',
    window: 'light',
    twin: 'ink-mountains-night-blue',
    glass: { blur: 14, tint: '#fff3ec', opacity: 0.5 },
    scene: () => inkMountainsSvg('dayVivid'),
  },
  {
    id: 'ink-mountains-night-blue',
    title: 'Ink Mountains, Night Blue',
    blurb: 'The night sky as the Token Counter has it: orange falling off through wine and violet into blue.',
    window: 'dark',
    twin: 'ink-mountains',
    glass: { blur: 0, tint: '#15141e', opacity: 0 },
    scene: () => inkMountainsSvg('nightBlue'),
  },
]

/** LOCAL CHANGE: a Suzhou garden wall with lattice windows, a scene of our own. The person found the first dusk skies too
 * vivid for a garden and the near-colourless ink sheets too grey; the default pair is what they then chose: natural daylight
 * colours by day (garden-lattice-natural.ts) and lantern-lit windows on a warm black, moonlit night (garden-lattice-lantern.ts), both
 * with opaque white plaster and dark tiles. The older sheets stay as extra themes. */
const GARDEN_THEMES: Theme[] = [
  {
    // LOCAL CHANGE, the default by day since 0.5.0. The person found the three walls of Lattice Windows too alike and asked
    // for one sheet that brings the motifs together: a wall with a round gate and a Taihu stone at the left, a pavilion at
    // the right, the sun or moon above. Same colours as the lattice pair they chose (natural daylight, warm black night).
    // Glass opacity 0 for the reason given at 'garden-lattice' below.
    id: 'garden-court',
    title: 'Pavilion and Stones',
    blurb: 'A Suzhou garden in soft daylight: a white wall with a round gate, a Taihu stone and a banana plant at its end, a pavilion on a rockery by the water, a willow bough over the sun.',
    window: 'light',
    twin: 'garden-court-night',
    glass: { blur: 0, tint: '#d4dce7', opacity: 0 },
    scene: () => gardenCourtDaySvg(),
  },
  {
    // The default by night since 0.5.0.
    id: 'garden-court-night',
    title: 'Pavilion and Stones, Moonlit Night',
    blurb: 'The same garden on a warm black night: a pale yellow glow round the moon, the gate lit amber from the court behind, a lantern in the pavilion, the stones in moonlit grey.',
    window: 'dark',
    twin: 'garden-court',
    glass: { blur: 0, tint: '#181613', opacity: 0 },
    scene: () => gardenCourtNightSvg(),
  },
  {
    // The default until 0.5.0: the natural colours of a photograph (the person chose this one for light mode).
    // Glass opacity 0: the app's reading veil (the glass tint ramped in beside the chat column) shows as vertical stripes,
    // and this scene keeps the column clear, so it needs no veil.
    id: 'garden-lattice',
    title: 'Lattice Windows',
    blurb: 'A Suzhou garden wall, white under dark tiles, in soft daylight: green bamboo, a pink-flushed magnolia, an ice-crack window.',
    window: 'light',
    twin: 'garden-lattice-night',
    glass: { blur: 0, tint: '#d4dce7', opacity: 0 },
    scene: () => gardenLatticeNaturalDaySvg(),
  },
  {
    // The default by night until 0.5.0: the garden open after dark, its lattice windows lit from inside (the person chose this one for dark mode).
    id: 'garden-lattice-night',
    title: 'Lattice Windows, Lantern Night',
    blurb: 'The same wall on a warm black night, a pale yellow glow round the moon, its three lattice windows lit amber from inside.',
    window: 'dark',
    twin: 'garden-lattice',
    glass: { blur: 0, tint: '#181613', opacity: 0 },
    scene: () => gardenLatticeLanternNightSvg(),
  },
  {
    id: 'garden-lattice-moonlit',
    title: 'Lattice Windows, Moonlit',
    blurb: 'The garden wall on a plum-indigo moonlit night, the windows dark, the bamboo deep green.',
    window: 'dark',
    twin: 'garden-lattice',
    glass: { blur: 0, tint: '#271c2c', opacity: 0 },
    scene: () => gardenLatticeNaturalNightSvg(),
  },
  {
    id: 'garden-lattice-sunset',
    title: 'Lattice Windows, Late Sun',
    blurb: 'The garden wall in late-afternoon light, a rose-lilac air with a warm corner round the sun.',
    window: 'light',
    twin: 'garden-lattice-night',
    glass: { blur: 0, tint: '#e2d1e1', opacity: 0 },
    scene: () => gardenLatticeLanternDaySvg(),
  },
  {
    id: 'garden-lattice-ink',
    title: 'Lattice Windows, Ink',
    blurb: 'The garden wall in near-colourless ink on pale mist: the greyest sheet of the set.',
    window: 'light',
    twin: 'garden-lattice-ink-night',
    glass: { blur: 0, tint: '#ebe9e8', opacity: 0 },
    scene: () => gardenLatticeSvg('dayInk'),
  },
  {
    id: 'garden-lattice-ink-night',
    title: 'Lattice Windows, Ink Night',
    blurb: 'The garden wall in pale ink on charcoal: the greyest sheet of the set.',
    window: 'dark',
    twin: 'garden-lattice-ink',
    glass: { blur: 0, tint: '#161618', opacity: 0 },
    scene: () => gardenLatticeSvg('nightInk'),
  },
  {
    id: 'garden-lattice-dusk',
    title: 'Lattice Windows, Dusk',
    blurb: 'The garden wall under the pale dusk sky of Ink Mountains: more colour.',
    window: 'light',
    twin: 'garden-lattice-dusk-night',
    glass: { blur: 0, tint: '#f3e4e8', opacity: 0.32 },
    scene: () => gardenLatticeSvg('day'),
  },
  {
    id: 'garden-lattice-dusk-night',
    title: 'Lattice Windows, Dusk Night',
    blurb: 'The garden wall under the blue night sky with one orange glow.',
    window: 'dark',
    twin: 'garden-lattice-dusk',
    glass: { blur: 0, tint: '#15141e', opacity: 0.32 },
    scene: () => gardenLatticeSvg('night'),
  },
  {
    id: 'garden-lattice-wine',
    title: 'Lattice Windows, Wine Night',
    blurb: 'The garden wall under the wine-dark night sky.',
    window: 'dark',
    twin: 'garden-lattice-dusk',
    glass: { blur: 0, tint: '#20131b', opacity: 0.32 },
    scene: () => gardenLatticeSvg('nightWine'),
  },
]

export const THEMES: readonly Theme[] = [
  ...GARDEN_THEMES,
  ...INK_THEMES,
  ...WARM_NIGHT_THEMES,
  {
    id: 'honu-lagoon',
    title: 'Honu Lagoon',
    blurb: 'A live ASCII lagoon from above: a tile turtle swims by a sand island',
    window: 'light',
    glass: { blur: 7, tint: '#e6fbff', opacity: 0.42 },
    scene: honuLagoonSvg,
  },
  {
    id: 'koi-mosaic',
    title: 'Koi Mosaic',
    blurb: 'A tiled koi pond from above: two koi, lily pads, slow ripples.',
    window: 'light',
    glass: { blur: 12, tint: '#eef8f1', opacity: 0.36 },
    scene: koiMosaicSvg,
  },
  {
    id: 'halftone-dawn',
    title: 'Halftone Dawn',
    blurb: 'A two-ink riso sunrise: halftone dots that breathe outward.',
    window: 'light',
    twin: 'halftone-dusk',
    glass: { blur: 14, tint: '#f6ead9', opacity: 0.55 },
    scene: halftoneDawnSvg,
  },
  {
    id: 'halftone-dusk',
    title: 'Halftone Dusk',
    blurb: 'The riso sunrise on night-blue stock: an ember sun in breathing dots.',
    window: 'dark',
    twin: 'halftone-dawn',
    glass: { blur: 14, tint: '#1f2336', opacity: 0.5 },
    scene: halftoneDuskSvg,
  },
  {
    id: 'plotter-tide',
    title: 'Plotter Tide',
    blurb: 'Pen-plotter tide lines drawing themselves on warm paper.',
    window: 'light',
    // LOCAL CHANGE: its twin for a dark window is the warm night stock, not the blue-black one.
    twin: `plotter-tide-${WARM_TWIN}`,
    glass: { blur: 0, tint: '#f4efe4', opacity: 0.32 },
    scene: plotterTideSvg,
  },
  {
    id: 'plotter-tide-night',
    title: 'Plotter Tide, Night',
    blurb: 'The plotter\'s tide chart in pale ink on blue-black night paper.',
    window: 'dark',
    twin: 'plotter-tide',
    glass: { blur: 0, tint: '#141a27', opacity: 0.32 },
    scene: plotterTideNightSvg,
  },
  {
    id: 'dither-dunes',
    title: 'Dither Dunes',
    blurb: 'One-bit dunes on sand paper, shaded in dots, under a terracotta sun',
    window: 'light',
    twin: 'dither-dunes-night',
    glass: { blur: 18, tint: '#f1e8d6', opacity: 0.34 },
    scene: ditherDunesSvg,
  },
  {
    id: 'dither-dunes-night',
    title: 'Dither Dunes Night',
    blurb: 'The same dunes after dark: pale dots on umber, an ember sun',
    window: 'dark',
    twin: 'dither-dunes',
    glass: { blur: 18, tint: '#1c1712', opacity: 0.4 },
    scene: ditherDunesNightSvg,
  },
  {
    id: 'paper-garden',
    title: 'Paper Garden',
    blurb: 'Cut-paper leaves at the edges of a warm white sheet, one coral bloom.',
    window: 'light',
    twin: 'paper-garden-kraft',
    glass: { blur: 16, tint: '#fbf6ec', opacity: 0.5 },
    scene: paperGardenSvg,
  },
  {
    id: 'paper-garden-kraft',
    title: 'Paper Garden, Kraft',
    blurb: 'Cut-paper leaves at the edges of dark kraft paper, one coral bloom.',
    window: 'dark',
    twin: 'paper-garden',
    glass: { blur: 16, tint: '#35312a', opacity: 0.5 },
    scene: paperGardenKraftSvg,
  },
  {
    id: 'night-reef',
    title: 'Night Reef',
    blurb: 'The lagoon after dark: a turtle and a ray that glow as they swim',
    window: 'dark',
    glass: { blur: 14, tint: '#0a1430', opacity: 0.4 },
    scene: nightReefSvg,
  },
  {
    id: 'snow-pines',
    title: 'Snow Pines',
    blurb: 'An ASCII pine forest at dusk, snow drifting down through the trees.',
    window: 'dark',
    glass: { blur: 16, tint: '#14143a', opacity: 0.5 },
    scene: snowPinesSvg,
  },
  {
    id: 'braille-stars',
    title: 'Braille Stars',
    blurb: 'A slow night sky drawn dot by dot on a braille grid.',
    window: 'dark',
    glass: { blur: 20, tint: '#0a1430', opacity: 0.3 },
    scene: brailleStarsSvg,
  },
  {
    id: 'teletext-clouds',
    title: 'Block Clouds',
    blurb: 'Night clouds built from blocks on a teletext grid, drifting in',
    window: 'dark',
    glass: { blur: 12, tint: '#0d173f', opacity: 0.34 },
    scene: teletextCloudsSvg,
  },
  {
    id: 'vector-range',
    title: 'Vector Range',
    blurb: 'Phosphor mountains on black; an amber beam keeps retracing them.',
    window: 'dark',
    glass: { blur: 22, tint: '#0e2f27', opacity: 0.42 },
    scene: vectorRangeSvg,
  },
  {
    id: 'departure-board',
    title: 'Departure Board',
    blurb: 'An amber LED board re-lettering itself, row by row.',
    window: 'dark',
    glass: { blur: 14, tint: '#1a120b', opacity: 0.34 },
    scene: departureBoardSvg,
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    blurb: 'A cyanotype sheet; a comet goes round its plotted orbit in the corner.',
    window: 'dark',
    glass: { blur: 14, tint: '#0c2444', opacity: 0.42 },
    scene: blueprintSvg,
  },
  {
    id: 'deep-water',
    title: 'Deep Water',
    blurb: 'Light falling through deep water, and one quiet turtle',
    window: 'dark',
    glass: { blur: 14, tint: '#062c3a', opacity: 0.34 },
    scene: deepWaterSvg,
  },
  {
    id: 'aurora',
    title: 'Aurora',
    blurb: 'Northern lights swaying over a dark ridge',
    window: 'dark',
    glass: { blur: 18, tint: '#14123a', opacity: 0.3 },
    scene: auroraSvg,
  },
  {
    id: 'ember',
    title: 'Ember',
    blurb: 'A warm glow in the corners and a few embers rising',
    window: 'dark',
    glass: { blur: 12, tint: '#2a0d12', opacity: 0.3 },
    scene: emberSvg,
  },
]

const built = new Map<string, string>()

/** A theme's SVG, built the first time it is asked for: a session pays only for the scenes it shows. */
export function sceneOf(theme: Theme): string {
  const ready = built.get(theme.id)
  if (ready !== undefined) return ready
  const source = theme.scene()
  built.set(theme.id, source)
  return source
}

/** Why a theme's scene cannot be drawn, in the fault's own words; nothing where it builds. */
export function sceneFault(theme: Theme): string | undefined {
  try {
    sceneOf(theme)

    return undefined
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}
