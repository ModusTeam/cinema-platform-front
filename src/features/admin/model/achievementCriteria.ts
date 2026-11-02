import { z } from 'zod'

export const ACHIEVEMENT_ACTIONS = [
  'TICKET_PURCHASED',
  'BULK_TICKET_PURCHASED',
  'REVIEW_LEFT',
  'VIP_SEAT_BOUGHT',
] as const

export const criteriaSchema = z
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
      .min(1, 'valueField не може бути порожнім.')
      .max(64, 'valueField: максимум 64 символи.')
      .refine(
        value => value.trim() === value && value.length > 0,
        'Сервер обрізає пробіли valueField. Перевірте поле вручну, щоб не змінити правило.',
      )
      .optional(),
  })
  .catchall(z.unknown())

export const CRITERIA_PRESETS = [
  { value: 'purchase-count', label: 'Кількість покупок' },
  { value: 'purchase-amount', label: 'Загальна вартість покупок' },
] as const
export type CriteriaPreset = (typeof CRITERIA_PRESETS)[number]['value']
export interface CriteriaFormState {
  criteriaMode: 'builder' | 'json'
  criteriaPreset: CriteriaPreset
  criteriaTarget: number
  criteriaJson: string
}

export function getCriteriaSafetyError(criteriaJson: string): string | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(criteriaJson)
  } catch {
    return 'Введіть коректний JSON. Початковий текст збережено.'
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
    return 'Правило має бути JSON-об’єктом із полями field, operator та target.'
  const result = criteriaSchema.safeParse(parsed)
  if (!result.success)
    return result.error.issues.map(issue => issue.message).join(' ')
  const extraKeys = Object.keys(parsed).filter(
    key => !['field', 'operator', 'target', 'valueField'].includes(key),
  )
  if (extraKeys.length)
    return `Сервер не зберігає додаткові поля: ${extraKeys.join(', ')}. Перевірте правило вручну; ми не видалятимемо їх автоматично.`
  if (result.data.operator !== 'sum' && result.data.valueField !== undefined)
    return 'Сервер зберігає valueField лише для sum. Перевірте правило вручну, щоб не втратити це поле.'
  return null
}

export function parseCriteriaDefaults(criteriaJson: string): CriteriaFormState {
  const fallback: CriteriaFormState = {
    criteriaMode: 'json',
    criteriaJson,
    criteriaTarget: 1,
    criteriaPreset: 'purchase-count',
  }
  if (getCriteriaSafetyError(criteriaJson)) return fallback
  const result = criteriaSchema.safeParse(JSON.parse(criteriaJson))
  if (!result.success || result.data.field !== 'TICKET_PURCHASED')
    return fallback
  if (
    result.data.operator === 'sum' &&
    result.data.valueField !== undefined &&
    result.data.valueField !== 'amount'
  )
    return fallback
  return {
    criteriaMode: 'builder',
    criteriaJson,
    criteriaTarget: result.data.target,
    criteriaPreset:
      result.data.operator === 'sum' ? 'purchase-amount' : 'purchase-count',
  }
}

export function serializeCriteria(data: CriteriaFormState): string {
  if (data.criteriaMode === 'json') return data.criteriaJson
  const original = parseCriteriaDefaults(data.criteriaJson)
  if (
    original.criteriaMode === 'builder' &&
    original.criteriaPreset === data.criteriaPreset
  ) {
    if (original.criteriaTarget === data.criteriaTarget)
      return data.criteriaJson
    return JSON.stringify(
      { ...JSON.parse(data.criteriaJson), target: data.criteriaTarget },
      null,
      2,
    )
  }
  return JSON.stringify(
    {
      field: 'TICKET_PURCHASED',
      operator: data.criteriaPreset === 'purchase-amount' ? 'sum' : 'gte',
      target: data.criteriaTarget,
    },
    null,
    2,
  )
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

const number = (value: number) => value.toLocaleString('uk-UA')
const purchases = (value: number) => {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return 'покупку'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'покупки'
  return 'покупок'
}

export function getCriteriaSummary(criteriaJson: string) {
  const safetyError = getCriteriaSafetyError(criteriaJson)
  if (safetyError)
    return {
      text: 'Умова потребує перевірки',
      needsReview: true,
      explanation: safetyError,
    }
  const criteria = criteriaSchema.parse(JSON.parse(criteriaJson))
  if (criteria.field !== 'TICKET_PURCHASED')
    return {
      text: 'Подія без підтвердженого джерела',
      needsReview: true,
      explanation:
        criteria.field === 'VIP_SEAT_BOUGHT'
          ? 'Потрібне поле seatClass, яке поточне джерело покупок не передає.'
          : 'Джерело цієї події не підтверджене. Збільшення прогресу не гарантоване.',
    }
  if (criteria.operator === 'gte')
    return {
      text: `Щонайменше ${number(criteria.target)} ${purchases(criteria.target)}`,
      needsReview: false,
      explanation:
        'Одна оброблена покупка (замовлення) додає одиницю прогресу, незалежно від кількості квитків. Це не підтвердження відвідування.',
    }
  const valueField = criteria.valueField ?? 'amount'
  if (valueField === 'amount')
    return {
      text: `Вартість покупок: від ${number(criteria.target)} грн`,
      needsReview: false,
      explanation:
        'Сума вартостей оброблених замовлень до списання балів. Кожна додатна сума округлюється до цілої гривні перед додаванням; нульові суми не збільшують прогрес. Це не сума фактичних оплат.',
    }
  return {
    text: `Сума за полем ${valueField}: ${number(criteria.target)}`,
    needsReview: true,
    explanation:
      'Одиниці та наявність цього поля потребують перевірки. Сервер округлює кожне додатне значення перед додаванням.',
  }
}

export function criteriaMeaning(criteriaJson: string): string {
  if (getCriteriaSafetyError(criteriaJson)) return criteriaJson
  const criteria = criteriaSchema.parse(JSON.parse(criteriaJson))
  return JSON.stringify([
    criteria.field,
    criteria.operator,
    criteria.target,
    criteria.operator === 'sum' ? (criteria.valueField ?? 'amount') : null,
  ])
}
