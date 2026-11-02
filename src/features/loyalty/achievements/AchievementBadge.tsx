import { Check } from 'lucide-react'
import { AchievementIcon } from './AchievementIcon'
import {
  getBadgeProgressPercent,
  getBadgeRarityPresentation,
} from './achievementBadgePresentation'
import type {
  AchievementRarityKey,
  AchievementStatus,
} from './achievements.types'
import './achievementBadge.css'

export type AchievementBadgeSize = 'small' | 'medium' | 'large' | 'display'

interface AchievementBadgeProps {
  icon?: string
  rarity: AchievementRarityKey
  status: AchievementStatus
  progress?: number
  target?: number
  hidden?: boolean
  size?: AchievementBadgeSize
}

export function AchievementBadge({
  icon,
  rarity,
  status,
  progress,
  target,
  hidden = false,
  size = 'medium',
}: AchievementBadgeProps) {
  const { tone, rim } = getBadgeRarityPresentation(rarity, hidden)
  const state = hidden ? 'locked' : status
  const percent = getBadgeProgressPercent(progress, target)
  const showProgress = state === 'in-progress' && percent !== null

  return (
    <span
      aria-hidden='true'
      className='achievement-badge'
      data-size={size}
      data-tone={tone}
      data-rim={rim}
      data-state={state}
    >
      <svg
        aria-hidden='true'
        className='achievement-badge__rim'
        viewBox='0 0 104 104'
        fill='none'
      >
        <circle className='achievement-badge__outline' cx='52' cy='52' r='40' />
        {rim !== 'single' && (
          <circle className='achievement-badge__inner' cx='52' cy='52' r='35' />
        )}
        {(rim === 'marked' || rim === 'etched') && (
          <path
            className='achievement-badge__marks'
            d='m52 8 4 4-4 4-4-4Zm0 80 4 4-4 4-4-4Z'
          />
        )}
        {rim === 'etched' && (
          <circle
            className='achievement-badge__engraving'
            cx='52'
            cy='52'
            r='43'
            strokeDasharray='1 4'
          />
        )}
        {(showProgress || state === 'unlocked') && (
          <>
            <circle
              className='achievement-badge__track'
              cx='52'
              cy='52'
              r='48'
            />
            <circle
              className='achievement-badge__progress'
              cx='52'
              cy='52'
              r='48'
              pathLength='100'
              strokeDasharray='100 100'
              strokeDashoffset={state === 'unlocked' ? 0 : 100 - (percent ?? 0)}
              transform='rotate(-90 52 52)'
            />
          </>
        )}
      </svg>
      <AchievementIcon
        identifier={icon}
        hidden={hidden}
        className='achievement-badge__artwork'
        strokeWidth={1.5}
      />
      {state === 'unlocked' && (
        <Check className='achievement-badge__complete' strokeWidth={2} />
      )}
    </span>
  )
}
