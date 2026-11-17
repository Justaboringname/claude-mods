// LOCAL CHANGE. Wallpapers of the person's own, read from disk instead of being built into the plugin.
//
// One folder per wallpaper under ~/.claude/wallpapers:
//
//   ~/.claude/wallpapers/<name>/day.svg     the scene for light windows   (theme id: <name>)
//   ~/.claude/wallpapers/<name>/night.svg   the scene for dark windows    (theme id: <name>-night)
//   ~/.claude/wallpapers/<name>/meta.json   optional: title, blurb, blurbNight, glassDay, glassNight
//
// Either scene may stand alone; with both, the two are twins and follow the system's appearance like the built-in pairs.
// This file only turns what was read into themes: register.tsx does the reading. skills/make-wallpaper says how to draw one.
import type { Theme } from './themes'

/** Under the home folder. */
export const CUSTOM_FOLDER = '.claude/wallpapers'
/** The app's own limit for one scene. */
export const SCENE_LIMIT = 131072
/** How many folders are read: a session's start must not wait on a crowded folder. */
export const CUSTOM_MOST = 24

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const NAME_LONGEST = 40
const HEX = /^#[0-9a-fA-F]{6}$/
const SVG_START = /^\s*(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/
const DAY_TINT = '#eef0f2'
const NIGHT_TINT = '#181613'

/** One folder as it was read: the texts of the files that were there. */
export type CustomFound = { name: string; day?: string; night?: string; meta?: string }
/** The themes made of the folders, and one plain line for each thing left out. */
export type CustomLoad = { themes: Theme[]; skipped: string[] }

type Meta = Record<string, unknown>

function metaOf(text: string | undefined): Meta {
  if (text === undefined) return {}

  try {
    const parsed: unknown = JSON.parse(text)

    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as Meta) : {}
  } catch {
    return {}
  }
}

function wordsOf(value: unknown, longest: number): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, longest) : undefined
}

function numberIn(value: unknown, low: number, high: number, otherwise: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high ? value : otherwise
}

/** The glass over a scene: the tint is the scene's own ground colour, and by default nothing is laid over the scene. */
function glassOf(value: unknown, tint: string): Theme['glass'] {
  const given = typeof value === 'object' && value !== null ? (value as Meta) : {}
  const own = given['tint']

  return {
    blur: numberIn(given['blur'], 0, 40, 0),
    tint: typeof own === 'string' && HEX.test(own) ? own : tint,
    opacity: numberIn(given['opacity'], 0, 1, 0),
  }
}

/** "low-library" reads "Low Library". */
function titleOf(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Why a file's text cannot be a scene, or nothing. */
function sceneFaultOf(text: string): string | undefined {
  if (text.length > SCENE_LIMIT) return `${text.length} characters, over the app's limit of ${SCENE_LIMIT}`
  if (!SVG_START.test(text)) return 'it does not start with an <svg> element'

  return undefined
}

/** A short stamp of a text: a changed file reads as a changed stamp. */
export function stampOf(text: string): string {
  let hash = 5381

  for (let at = 0; at < text.length; at += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(at)) | 0
  }

  return `${text.length}:${hash}`
}

/**
 * The themes of the folders that were read. A folder is left out, with a line saying why, where its name is not lower
 * case letters, digits and single hyphens, where a built-in theme already has its name, or where it holds no scene; a
 * scene is left out where it is too long or is no SVG.
 */
export function customThemesOf(found: readonly CustomFound[], taken: ReadonlySet<string>): CustomLoad {
  const themes: Theme[] = []
  const skipped: string[] = []
  const used = new Set<string>()

  for (const folder of found) {
    const { name } = folder
    const nightId = `${name}-night`

    if (!NAME.test(name) || name.length > NAME_LONGEST) {
      skipped.push(`${name}: a wallpaper's folder is named in lower case letters, digits and single hyphens, ${NAME_LONGEST} at most`)
      continue
    }

    if (taken.has(name) || taken.has(nightId) || used.has(name) || used.has(nightId)) {
      skipped.push(`${name}: a theme of that name is already there`)
      continue
    }

    const scenes: { kind: 'day' | 'night'; text: string }[] = []

    for (const kind of ['day', 'night'] as const) {
      const text = folder[kind]

      if (text === undefined) continue

      const fault = sceneFaultOf(text)

      if (fault === undefined) {
        scenes.push({ kind, text })
      } else {
        skipped.push(`${name}/${kind}.svg: ${fault}`)
      }
    }

    if (scenes.length === 0) {
      if (folder.day === undefined && folder.night === undefined) skipped.push(`${name}: no day.svg and no night.svg`)
      continue
    }

    const meta = metaOf(folder.meta)
    const title = wordsOf(meta['title'], 60) ?? titleOf(name)
    const blurb = wordsOf(meta['blurb'], 240) ?? 'A wallpaper of your own.'
    const isPair = scenes.length === 2

    for (const { kind, text } of scenes) {
      const isDay = kind === 'day'
      const id = isDay ? name : nightId

      used.add(id)
      themes.push({
        id,
        title: isDay ? title : `${title}, Night`,
        blurb: isDay ? blurb : (wordsOf(meta['blurbNight'], 240) ?? blurb),
        window: isDay ? 'light' : 'dark',
        ...(isPair && { twin: isDay ? nightId : name }),
        glass: isDay ? glassOf(meta['glassDay'], DAY_TINT) : glassOf(meta['glassNight'], NIGHT_TINT),
        scene: () => text,
      })
    }
  }

  return { themes, skipped }
}
