import { useState } from 'react'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import {
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
  getAchievementStrategyLabel,
  resolveAchievementCategory,
  resolveAchievementRarity,
  resolveAchievementStrategy,
} from '@/features/loyalty/achievements/achievementContract'
import type { Achievement } from '@/features/loyalty/achievements/achievements.types'
import type { AchievementFormData } from '../model/achievementForm'
import './achievementEditorPreview.css'

export function AchievementEditorPreview({
  values,
}: {
  values: AchievementFormData
}) {
  const [guestView, setGuestView] = useState(false)
  const achievement: Achievement = {
    id: 'editor-preview',
    code: values.code,
    title: values.name || 'Назва досягнення',
    description: values.description || 'Тут з’явиться опис вашого досягнення.',
    icon: values.icon,
    category: resolveAchievementCategory(values.category),
    categoryLabel: getAchievementCategoryLabel(values.category),
    rarity: resolveAchievementRarity(values.rarity),
    rarityLabel: getAchievementRarityLabel(values.rarity),
    strategy: resolveAchievementStrategy(values.strategy),
    strategyLabel: getAchievementStrategyLabel(values.strategy),
    pointsReward: Number.isFinite(values.rewardPoints)
      ? values.rewardPoints
      : 0,
    isSecret: guestView && values.isSecret,
    secretHint: values.secretHint,
    sortOrder: values.sortOrder,
    status: 'locked',
    current: 0,
    target: 0,
    progressPercent: 0,
  }

  return (
    <aside
      aria-label='Попередній вигляд досягнення'
      className='achievement-editor-preview min-w-0 p-5 md:sticky md:top-0'
    >
      <h3 className='text-lg font-semibold'>Попередній вигляд</h3>
      <p className='mt-2 text-xs leading-relaxed text-[var(--text-muted)]'>
        Зміни з’являються одразу. Прогрес гостя тут не відображається.
      </p>
      <label className='my-4 flex min-h-11 items-center gap-3 text-sm'>
        <input
          type='checkbox'
          checked={guestView}
          onChange={event => setGuestView(event.target.checked)}
          className='h-4 w-4 accent-[var(--color-primary)]'
        />
        Як бачить гість
      </label>
      <AchievementCard achievement={achievement} preview />
      <p className='border-t border-[var(--border-default)] pt-4 text-xs leading-relaxed text-[var(--text-muted)]'>
        {values.isSecret
          ? 'Секретне: до відкриття гість побачить замок і публічну підказку.'
          : 'Відкрите: назва, опис та іконка видимі гостям.'}
      </p>
    </aside>
  )
}
