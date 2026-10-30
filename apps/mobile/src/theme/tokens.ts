/**
 * The design system, as typed tokens.
 *
 * SPEC-ui.md §4. This is the ONLY file in the app allowed to contain a hex
 * colour — an ESLint rule enforces it. That is not tidiness: a hardcoded colour
 * is a colour that silently ignores dark mode and never gets contrast-checked.
 *
 * THE COLOUR RULE THAT MATTERS MOST:
 *
 *   Red is reserved for SAFETY warnings only. Never for food, never for a missed
 *   goal, never for a number being "bad".
 *
 * The app we are replacing reuses one coral hue for both "protein" and "you
 * missed your goal", which turns a food-group identity colour into a shame
 * signal. Uncertainty here is VIOLET — an invitation to check, not a scold.
 * A scolding colour is what makes people switch the indicator off, which defeats
 * the entire point of having one.
 */

export const palette = {
  // Neutrals
  ink900: '#0B0B0F',
  ink800: '#16161C',
  ink700: '#22222B',
  ink600: '#3A3A46',
  ink500: '#5C5C6B',
  ink400: '#8A8A99',
  ink300: '#B8B8C4',
  ink200: '#DCDCE4',
  ink100: '#EFEFF3',
  ink50: '#F7F7FA',
  white: '#FFFFFF',

  // Macro identity. These are IDENTITY colours: one macro, one hue, everywhere.
  // They never double as status.
  protein: '#3E7BFA',
  carbs: '#F2A93B',
  fat: '#7B5EA7',

  // Uncertainty. Violet, deliberately not amber and never red.
  uncertain: '#8B7BD8',
  uncertainBg: '#F1EEFB',

  // Safety only. If you are reaching for this and it is not a safety warning,
  // you want `uncertain` or a neutral.
  safety: '#D5453B',
  safetyBg: '#FDEDEC',

  // Success is quiet on purpose. Logging a meal is not an achievement to
  // celebrate; it is a thing you did.
  affirm: '#2E9E6B',

  // Brand accent: fresh lime, from the design reference.
  lime50: '#F1F9DF',
  lime100: '#E2F4B8',
  lime200: '#CDEB8B',
  lime500: '#8CD03B',
  lime600: '#6DB320',
  pageGray: '#F3F4F0',
} as const

export interface Theme {
  bg: string
  bgElevated: string
  bgSunken: string
  border: string
  text: string
  textMuted: string
  textFaint: string
  ring: string
  ringTrack: string
  protein: string
  carbs: string
  fat: string
  uncertain: string
  uncertainBg: string
  safety: string
  safetyBg: string
  affirm: string
  accent: string
  accentSoft: string
  accentStrong: string
  onAccent: string
  isDark: boolean
}

export const lightTheme: Theme = {
  bg: palette.pageGray,
  bgElevated: palette.white,
  bgSunken: palette.white,
  border: palette.ink100,
  text: palette.ink900,
  textMuted: palette.ink500,
  textFaint: palette.ink400,
  ring: palette.lime500,
  ringTrack: palette.lime100,
  protein: palette.protein,
  carbs: palette.carbs,
  fat: palette.fat,
  uncertain: palette.uncertain,
  uncertainBg: palette.uncertainBg,
  safety: palette.safety,
  safetyBg: palette.safetyBg,
  affirm: palette.affirm,
  accent: palette.lime500,
  accentSoft: palette.lime100,
  accentStrong: palette.lime600,
  onAccent: palette.ink900,
  isDark: false,
}

/**
 * Dark theme.
 *
 * [VERIFY] These ratios were designed to AA targets but have never been computed.
 * The M7 contrast sweep must run over this matrix as a CI step, not by eye — the
 * dark palette is the one most likely to have a quiet failure.
 */
export const darkTheme: Theme = {
  bg: palette.ink900,
  bgElevated: palette.ink800,
  bgSunken: palette.ink700,
  border: palette.ink700,
  text: palette.ink50,
  textMuted: palette.ink300,
  textFaint: palette.ink400,
  ring: palette.lime500,
  ringTrack: palette.ink700,
  protein: '#6E9BFF',
  carbs: '#F5BC63',
  fat: '#A288CC',
  uncertain: '#A99AE6',
  uncertainBg: '#241F38',
  safety: '#F0655B',
  safetyBg: '#3A1E1C',
  affirm: '#4FBE8C',
  accent: '#9BDC4C',
  accentSoft: '#2A3A14',
  accentStrong: '#B4EC6E',
  onAccent: palette.ink900,
  isDark: true,
}

/** 4pt base scale. Every margin in the app is one of these. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const

/**
 * Type scale. The rhythm the incumbent gets right and is worth copying: a big
 * bold number next to a small grey unit.
 */
export const type = {
  hero: { fontSize: 56, fontWeight: '700' as const, letterSpacing: -1.5 },
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  label: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  micro: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
} as const

/**
 * Motion durations, in ms.
 *
 * Every one of these is multiplied by the motionScale from the Reduce Motion
 * context (1 or 0). At 0 the transforms become opacity crossfades and nothing
 * loops — the result reveal must still communicate arrival without movement.
 */
export const motion = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 380,
  reveal: 520,
} as const

/** Minimum tap target. Anything smaller MUST set hitSlop — an ESLint rule checks. */
export const MIN_TAP_TARGET = 44
