import type { AchievementRarityKey } from './achievements.types'

interface BadgeRarityPresentation {
  tone: 'neutral' | 'green' | 'blue' | 'violet' | 'gold'
  rim: 'single' | 'double' | 'strong' | 'marked' | 'etched'
}

const NEUTRAL_BADGE: BadgeRarityPresentation = {
  tone: 'neutral',
  rim: 'single',
}

export const BADGE_RARITY_PRESENTATIONS: Readonly<
  Record<AchievementRarityKey, BadgeRarityPresentation>
> = {
  common: NEUTRAL_BADGE,
  uncommon: { tone: 'green', rim: 'double' },
  rare: { tone: 'blue', rim: 'strong' },
  epic: { tone: 'violet', rim: 'marked' },
  legendary: { tone: 'gold', rim: 'etched' },
  unspecified: NEUTRAL_BADGE,
}

export function getBadgeRarityPresentation(rarity?: string, hidden = false) {
  if (hidden || !rarity || !Object.hasOwn(BADGE_RARITY_PRESENTATIONS, rarity))
    return NEUTRAL_BADGE
  return BADGE_RARITY_PRESENTATIONS[rarity as AchievementRarityKey]
}

// Only present an existing percentage when the server supplied a usable target.
export function getBadgeProgressPercent(progress?: number, target?: number) {
  if (
    typeof target !== 'number' ||
    !Number.isFinite(target) ||
    target <= 0 ||
    typeof progress !== 'number' ||
    !Number.isFinite(progress)
  )
    return null
  return Math.min(100, Math.max(0, progress))
}
