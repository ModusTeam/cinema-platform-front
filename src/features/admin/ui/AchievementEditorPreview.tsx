import { useId, useState } from 'react'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { ACHIEVEMENT_STATUS_LABELS } from '@/features/loyalty/achievements/achievementPresentation'
import type { AchievementStatus } from '@/features/loyalty/achievements/achievements.types'
import type { AchievementFormData } from '../model/achievementForm'
import { buildAchievementPreview } from '../model/achievementPreview'
import './achievementEditorPreview.css'

export function AchievementEditorPreview({
  values,
}: {
  values: AchievementFormData
}) {
  const [guestView, setGuestView] = useState(false)
  const [status, setStatus] = useState<AchievementStatus>('locked')
  const stateId = useId()
  const helpId = useId()
  const achievement = buildAchievementPreview(values, status, guestView)

  return (
    <aside
      aria-label='Попередній вигляд досягнення'
      className='achievement-editor-preview min-w-0 p-5 md:sticky md:top-0'
    >
      <h3 className='text-lg font-semibold'>Попередній вигляд</h3>
      <p className='mt-2 text-xs leading-relaxed text-[var(--text-muted)]'>
        Зміни з’являються одразу. Стани нижче — лише симуляція вигляду.
      </p>
      <div className='mt-4 space-y-2'>
        <label htmlFor={stateId} className='block text-sm'>
          Стан для перегляду
        </label>
        <select
          id={stateId}
          value={status}
          aria-describedby={helpId}
          onChange={event => setStatus(event.target.value as AchievementStatus)}
          className='w-full min-w-0 border border-[var(--text-muted)] bg-transparent px-2 py-3 text-sm'
        >
          <option value='locked'>{ACHIEVEMENT_STATUS_LABELS.locked}</option>
          <option value='in-progress'>
            {ACHIEVEMENT_STATUS_LABELS['in-progress']}
          </option>
          <option value='unlocked'>{ACHIEVEMENT_STATUS_LABELS.unlocked}</option>
        </select>
      </div>
      <label className='my-4 flex min-h-11 items-center gap-3 text-sm'>
        <input
          type='checkbox'
          checked={guestView}
          onChange={event => setGuestView(event.target.checked)}
          className='h-4 w-4 accent-[var(--color-primary)]'
        />
        Як бачить гість
      </label>
      <p
        id={helpId}
        className='mb-4 text-xs leading-relaxed text-[var(--text-muted)]'
      >
        {guestView && values.isSecret
          ? 'Гість без відкритого секрету: іконку, рідкість і нагороду приховано в усіх станах перегляду.'
          : status === 'in-progress'
            ? 'Симуляція: 35 зі 100 (35%). Це приклад, а не прогрес гостя.'
            : status === 'unlocked'
              ? 'Симуляція користувача, який відкрив досягнення. Секретна іконка та рідкість видимі.'
              : 'Симуляція невідкритого досягнення. Це перегляд адміністратора; секрет можна перевірити в режимі гостя.'}
      </p>
      <AchievementCard achievement={achievement} preview />
      <p className='border-t border-[var(--border-default)] pt-4 text-xs leading-relaxed text-[var(--text-muted)]'>
        {values.isSecret
          ? 'Секретне: до відкриття гість побачить замок і публічну підказку.'
          : 'Відкрите: назва, опис та іконка видимі гостям.'}
      </p>
    </aside>
  )
}
