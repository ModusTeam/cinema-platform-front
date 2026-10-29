import type { Achievement } from './achievements.types'

export const ACHIEVEMENT_STATUS_LABELS: Record<Achievement['status'], string> =
  {
    unlocked: 'Відкрито',
    'in-progress': 'У прогресі',
    locked: 'Ще не відкрито',
  }

export function getAchievementPresentation(achievement: Achievement) {
  const hidden = achievement.isSecret && achievement.status !== 'unlocked'
  return {
    hidden,
    title: hidden ? 'Секретне досягнення' : achievement.title,
    description: hidden
      ? achievement.secretHint ||
        'Умови відкриються після отримання досягнення.'
      : achievement.description,
    statusLabel: ACHIEVEMENT_STATUS_LABELS[achievement.status],
  }
}
