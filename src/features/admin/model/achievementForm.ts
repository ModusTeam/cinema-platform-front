import { z } from 'zod'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '../api/admin-achievements.service'

export const ACHIEVEMENT_ACTIONS = [
  'TICKET_PURCHASED',
  'BULK_TICKET_PURCHASED',
  'REVIEW_LEFT',
  'VIP_SEAT_BOUGHT',
] as const

const criteriaSchema = z
  .object({
    field: z.enum(ACHIEVEMENT_ACTIONS, {
      error: 'Вкажіть підтримувану подію.',
    }),
    operator: z.enum(['gte', 'sum'], {
      error: 'Підтримуються лише gte та sum.',
    }),
    target: z
      .number({ error: 'Ціль має бути числом.' })
      .int('Ціль має бути цілим числом.')
      .positive('Ціль має бути більшою за 0.')
      .max(1_000_000_000, 'Максимальна ціль — 1 000 000 000.'),
    valueField: z
      .string()
      .trim()
      .min(1, 'valueField не може бути порожнім.')
      .max(64, 'valueField: максимум 64 символи.')
      .optional(),
  })
  .catchall(z.unknown())

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
    let criteria: unknown
    try {
      criteria = JSON.parse(serializeCriteria(data))
    } catch {
      context.addIssue({
        code: 'custom',
        path: ['criteriaJson'],
        message: 'Введіть коректний JSON. Початковий текст збережено.',
      })
      return
    }
    const validation = criteriaSchema.safeParse(criteria)
    const errorPath =
      data.criteriaMode === 'builder' ? 'criteriaTarget' : 'criteriaJson'
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        context.addIssue({
          code: 'custom',
          path: [errorPath],
          message: issue.message,
        })
      }
      return
    }
    const extraKeys = Object.keys(validation.data).filter(
      key => !['field', 'operator', 'target', 'valueField'].includes(key),
    )
    if (extraKeys.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['criteriaJson'],
        message: `Сервер не зберігає додаткові поля: ${extraKeys.join(', ')}. Перевірте правило вручну; ми не видалятимемо їх автоматично.`,
      })
    }
    if (
      validation.data.operator !== 'sum' &&
      validation.data.valueField !== undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['criteriaJson'],
        message:
          'Сервер зберігає valueField лише для sum. Перевірте правило вручну, щоб не втратити це поле.',
      })
    }
  })

export type AchievementFormData = z.infer<typeof achievementSchema>
type CriteriaFormState = Pick<
  AchievementFormData,
  'criteriaMode' | 'criteriaJson' | 'criteriaTarget'
>
const defaultCriteria = {
  field: 'TICKET_PURCHASED',
  operator: 'gte',
  target: 1,
}

export const DEFAULT_ACHIEVEMENT_VALUES: AchievementFormData = {
  code: '',
  name: '',
  description: '',
  secretHint: '',
  isSecret: false,
  icon: 'withicons-retro:trophy',
  category: 1,
  rarity: 1,
  strategy: 1,
  criteriaMode: 'builder',
  criteriaTarget: 1,
  criteriaJson: JSON.stringify(defaultCriteria, null, 2),
  rewardPoints: 0,
  sortOrder: 0,
  isActive: true,
}

export function parseCriteriaDefaults(criteriaJson: string): CriteriaFormState {
  try {
    const parsed: unknown = JSON.parse(criteriaJson)
    const result = criteriaSchema.safeParse(parsed)
    if (
      result.success &&
      result.data.field === 'TICKET_PURCHASED' &&
      result.data.operator === 'gte' &&
      Object.keys(result.data).every(key =>
        ['field', 'operator', 'target'].includes(key),
      )
    ) {
      return {
        criteriaMode: 'builder',
        criteriaJson,
        criteriaTarget: result.data.target,
      }
    }
  } catch {
    // Invalid historical JSON remains editable without replacing the original text.
  }
  return { criteriaMode: 'json', criteriaJson, criteriaTarget: 1 }
}

export function serializeCriteria(data: CriteriaFormState): string {
  return data.criteriaMode === 'builder'
    ? JSON.stringify(
        { ...defaultCriteria, target: data.criteriaTarget },
        null,
        2,
      )
    : data.criteriaJson
}

export function switchCriteriaMode(
  data: CriteriaFormState,
  mode: CriteriaFormState['criteriaMode'],
): CriteriaFormState | null {
  if (mode === data.criteriaMode) return data
  if (mode === 'json')
    return {
      ...data,
      criteriaMode: 'json',
      criteriaJson: serializeCriteria(data),
    }
  const parsed = parseCriteriaDefaults(data.criteriaJson)
  return parsed.criteriaMode === 'builder' ? parsed : null
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
    category: Number(initial.category),
    rarity: Number(initial.rarity),
    strategy: Number(initial.strategy),
    ...parseCriteriaDefaults(initial.criteriaJson),
    rewardPoints: initial.rewardPoints,
    sortOrder: initial.sortOrder,
    isActive: initial.isActive,
  }
}

export function buildAchievementPayload(
  data: AchievementFormData,
): AdminAchievementPayload {
  const { criteriaMode, criteriaTarget, criteriaJson, ...payload } =
    achievementSchema.parse(data)
  return {
    ...payload,
    secretHint: payload.secretHint.trim(),
    criteriaJson: serializeCriteria({
      criteriaMode,
      criteriaTarget,
      criteriaJson,
    }),
  }
}
