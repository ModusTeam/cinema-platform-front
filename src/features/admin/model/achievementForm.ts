import { z } from 'zod'
import {
  ACHIEVEMENT_CATEGORY_OPTIONS,
  ACHIEVEMENT_RARITY_OPTIONS,
  ACHIEVEMENT_STRATEGY_OPTIONS,
  resolveAchievementCategory,
  resolveAchievementRarity,
  resolveAchievementStrategy,
} from '@/features/loyalty/achievements/achievementContract'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '../api/admin-achievements.service'

import {
  criteriaMeaning,
  getCriteriaSafetyError,
  parseCriteriaDefaults,
  serializeCriteria,
} from './achievementCriteria'

export {
  ACHIEVEMENT_ACTIONS,
  parseCriteriaDefaults,
  serializeCriteria,
  switchCriteriaMode,
} from './achievementCriteria'

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label}: обов’язкове поле.`)
    .max(max, `${label}: максимум ${max} символів.`)

export const achievementSchema = z
  .object({
    code: requiredText('Код', 64).regex(
      /^[A-Z0-9_]+$/,
      'Використовуйте великі літери, цифри та підкреслення.',
    ),
    name: requiredText('Назва', 128),
    description: requiredText('Опис', 10_000),
    secretHint: z.string(),
    isSecret: z.boolean(),
    // Keep unsupported stored identifiers intact for unrelated edits.
    icon: z
      .string()
      .refine(value => value.trim().length > 0, 'Оберіть іконку.')
      .max(128, 'Іконка: максимум 128 символів.'),
    category: z.number().int().min(1).max(7),
    rarity: z.number().int().min(1).max(5),
    strategy: z.number().int().min(1).max(3),
    criteriaMode: z.enum(['builder', 'json']),
    criteriaPreset: z.enum(['purchase-count', 'purchase-amount']),
    criteriaTarget: z.number().or(z.nan()),
    criteriaJson: z.string(),
    rewardPoints: z
      .number()
      .int('Вкажіть цілу кількість балів.')
      .min(0, 'Бали не можуть бути від’ємними.')
      .max(1_000_000, 'Максимальна нагорода — 1 000 000 балів.'),
    sortOrder: z
      .number()
      .int('Порядок має бути цілим числом.')
      .min(-32768)
      .max(32767),
    isActive: z.boolean(),
  })
  .superRefine((data, context) => {
    const error = getCriteriaSafetyError(serializeCriteria(data))
    if (error)
      context.addIssue({
        code: 'custom',
        path: [
          data.criteriaMode === 'builder' ? 'criteriaTarget' : 'criteriaJson',
        ],
        message: error,
      })
  })

export type AchievementFormData = z.infer<typeof achievementSchema>
export const DEFAULT_ACHIEVEMENT_VALUES: AchievementFormData = {
  code: '',
  name: '',
  description: '',
  secretHint: '',
  isSecret: false,
  icon: 'withicons-retro:trophy',
  category: 1,
  rarity: 1,
  strategy: 2,
  criteriaMode: 'builder',
  criteriaPreset: 'purchase-count',
  criteriaTarget: 1,
  criteriaJson: JSON.stringify(
    { field: 'TICKET_PURCHASED', operator: 'gte', target: 1 },
    null,
    2,
  ),
  rewardPoints: 0,
  sortOrder: 0,
  isActive: true,
}

function normalizeStoredEnums(initial: AdminAchievementDto) {
  // Unsupported values stay invalid rather than silently becoming defaults.
  return {
    category:
      ACHIEVEMENT_CATEGORY_OPTIONS.find(
        option => option.key === resolveAchievementCategory(initial.category),
      )?.value ?? Number.NaN,
    rarity:
      ACHIEVEMENT_RARITY_OPTIONS.find(
        option => option.key === resolveAchievementRarity(initial.rarity),
      )?.value ?? Number.NaN,
    strategy:
      ACHIEVEMENT_STRATEGY_OPTIONS.find(
        option => option.key === resolveAchievementStrategy(initial.strategy),
      )?.value ?? Number.NaN,
  }
}

export function getAchievementFormDefaults(
  initial?: AdminAchievementDto | null,
): AchievementFormData {
  if (!initial) return { ...DEFAULT_ACHIEVEMENT_VALUES }
  return {
    code: initial.code,
    name: initial.name,
    description: initial.description,
    secretHint: initial.secretHint ?? '',
    isSecret: initial.isSecret,
    icon: initial.icon,
    ...normalizeStoredEnums(initial),
    ...parseCriteriaDefaults(initial.criteriaJson),
    rewardPoints: initial.rewardPoints,
    sortOrder: initial.sortOrder,
    isActive: initial.isActive,
  }
}

export function buildAchievementPayload(
  data: AchievementFormData,
): AdminAchievementPayload {
  const {
    criteriaMode,
    criteriaPreset,
    criteriaTarget,
    criteriaJson,
    ...payload
  } = achievementSchema.parse(data)
  return {
    ...payload,
    secretHint: payload.secretHint.trim(),
    criteriaJson: serializeCriteria({
      criteriaMode,
      criteriaPreset,
      criteriaTarget,
      criteriaJson,
    }),
  }
}

export const ACHIEVEMENT_EDIT_WARNING =
  'Історичний прогрес може не перерахуватися одразу. Уже відкриті досягнення можуть зберегти попередній прогрес і стан нагороди; зміна не нараховує нагороду повторно.'

export function getMeaningfulAchievementChanges(
  initial: AdminAchievementDto | null | undefined,
  next: AchievementFormData,
): string[] {
  if (!initial) return []
  const changes: string[] = []
  if (
    criteriaMeaning(initial.criteriaJson) !==
    criteriaMeaning(serializeCriteria(next))
  )
    changes.push('Умова отримання')
  if (initial.rewardPoints !== next.rewardPoints)
    changes.push('Нагорода балами')
  if (normalizeStoredEnums(initial).strategy !== next.strategy)
    changes.push('Стратегія')
  return changes
}

export function buildAchievementReactivationPayload(
  initial: AdminAchievementDto,
): AdminAchievementPayload {
  if (initial.icon !== initial.icon.trim())
    throw new Error(
      'Сервер змінить збережений ідентифікатор іконки. Перевірте його в редакторі.',
    )
  const payload = buildAchievementPayload({
    ...getAchievementFormDefaults(initial),
    isActive: true,
  })
  const storedEnums = normalizeStoredEnums(initial)
  // Reactivation uses full PUT; normalization must not overwrite stored data.
  for (const key of Object.keys(payload) as Array<
    keyof AdminAchievementPayload
  >) {
    if (key === 'isActive') continue
    const stored = initial[key]
    const expected =
      key === 'category' || key === 'rarity' || key === 'strategy'
        ? storedEnums[key]
        : key === 'secretHint'
          ? (stored ?? '')
          : stored
    if (payload[key] !== expected)
      throw new Error(
        'Активацію заблоковано: повне оновлення змінить збережені дані. Перевірте досягнення в редакторі.',
      )
  }
  return payload
}

export function getReactivationRestriction(
  initial: AdminAchievementDto,
): string | null {
  try {
    buildAchievementReactivationPayload(initial)
    return null
  } catch {
    return 'Активація недоступна без зміни збережених даних. Перевірте правило й налаштування в редакторі.'
  }
}
