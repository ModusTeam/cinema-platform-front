import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { GridLoader } from '@/common/components/GridLoader'
import Input from '@/common/components/Input'
import {
  ACHIEVEMENT_CATEGORY_OPTIONS,
  ACHIEVEMENT_RARITY_OPTIONS,
  ACHIEVEMENT_STRATEGY_OPTIONS,
  resolveAchievementIcon,
} from '@/features/loyalty/achievements/achievementContract'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '@/features/admin/api/admin-achievements.service'

const achievementSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Код обовʼязковий')
      .regex(
        /^[A-Z0-9_]+$/,
        'Використовуйте великі літери, цифри та підкреслення',
      ),
    name: z.string().trim().min(1, 'Назва обовʼязкова'),
    description: z.string().trim().min(1, 'Опис обовʼязковий'),
    secretHint: z.string(),
    isSecret: z.boolean(),
    icon: z.string().trim().min(1, 'Іконка обовʼязкова'),
    category: z.number().min(1).max(7),
    rarity: z.number().min(1).max(5),
    strategy: z.number().min(1).max(3),
    criteriaMode: z.enum(['builder', 'json']),
    criteriaField: z.string(),
    criteriaOperator: z.string(),
    criteriaTarget: z.number(),
    criteriaJson: z.string(),
    rewardPoints: z.number().min(0, 'Бали не можуть бути відʼємними'),
    sortOrder: z.number(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.criteriaMode === 'builder') {
      if (!value.criteriaField.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Поле критерію обовʼязкове',
          path: ['criteriaField'],
        })
      }

      if (!value.criteriaOperator.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Оператор обовʼязковий',
          path: ['criteriaOperator'],
        })
      }

      if (!Number.isFinite(value.criteriaTarget)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ціль має бути числом',
          path: ['criteriaTarget'],
        })
      }

      return
    }

    if (!value.criteriaJson.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Критерії обовʼязкові',
        path: ['criteriaJson'],
      })
      return
    }

    try {
      JSON.parse(value.criteriaJson)
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Критерії мають бути валідним JSON',
        path: ['criteriaJson'],
      })
    }
  })

type AchievementFormData = z.infer<typeof achievementSchema>

const DEFAULT_VALUES: AchievementFormData = {
  code: '',
  name: '',
  description: '',
  secretHint: '',
  isSecret: false,
  icon: 'trophy',
  category: 1,
  rarity: 1,
  strategy: 1,
  criteriaMode: 'builder',
  criteriaField: '',
  criteriaOperator: '>=',
  criteriaTarget: 1,
  criteriaJson: '{\n  "field": "",\n  "operator": ">=",\n  "target": 1\n}',
  rewardPoints: 0,
  sortOrder: 0,
  isActive: true,
}

interface AchievementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: AdminAchievementPayload) => Promise<void>
  initialData?: AdminAchievementDto | null
  isSaving: boolean
}

const asNumber = (value: number | string) => Number(value)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const formatJson = (value: unknown): string => JSON.stringify(value, null, 2)

const parseCriteriaDefaults = (
  criteriaJson?: string,
): Pick<
  AchievementFormData,
  'criteriaMode' | 'criteriaField' | 'criteriaOperator' | 'criteriaTarget' | 'criteriaJson'
> => {
  if (!criteriaJson?.trim()) {
    return {
      criteriaMode: 'builder',
      criteriaField: '',
      criteriaOperator: '>=',
      criteriaTarget: 1,
      criteriaJson: DEFAULT_VALUES.criteriaJson,
    }
  }

  try {
    const parsed = JSON.parse(criteriaJson)
    if (isRecord(parsed)) {
      const { field, operator, target } = parsed

      if (
        typeof field === 'string' &&
        typeof operator === 'string' &&
        typeof target === 'number'
      ) {
        return {
          criteriaMode: 'builder',
          criteriaField: field,
          criteriaOperator: operator,
          criteriaTarget: target,
          criteriaJson: formatJson(parsed),
        }
      }
    }

    return {
      criteriaMode: 'json',
      criteriaField: '',
      criteriaOperator: '>=',
      criteriaTarget: 1,
      criteriaJson: formatJson(parsed),
    }
  } catch {
    return {
      criteriaMode: 'json',
      criteriaField: '',
      criteriaOperator: '>=',
      criteriaTarget: 1,
      criteriaJson,
    }
  }
}

const getDefaultValues = (
  initialData?: AdminAchievementDto | null,
): AchievementFormData => {
  if (!initialData) return DEFAULT_VALUES

  return {
    code: initialData.code,
    name: initialData.name,
    description: initialData.description,
    secretHint: initialData.secretHint || '',
    isSecret: initialData.isSecret,
    icon: initialData.icon,
    category: asNumber(initialData.category),
    rarity: asNumber(initialData.rarity),
    strategy: asNumber(initialData.strategy),
    ...parseCriteriaDefaults(initialData.criteriaJson),
    rewardPoints: initialData.rewardPoints,
    sortOrder: initialData.sortOrder,
    isActive: initialData.isActive,
  }
}

const AchievementFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: AchievementFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!isOpen) return
    reset(getDefaultValues(initialData))
  }, [initialData, isOpen, reset])

  if (!isOpen) return null

  const isEditing = !!initialData
  const watchedIcon = watch('icon')
  const watchedCategory = watch('category')
  const watchedRarity = watch('rarity')
  const criteriaMode = watch('criteriaMode')
  const Icon = resolveAchievementIcon(
    watchedIcon,
    watchedCategory,
    watchedRarity,
  )

  const onSubmit = async (data: AchievementFormData) => {
    const {
      criteriaMode,
      criteriaField,
      criteriaOperator,
      criteriaTarget,
      criteriaJson,
      ...achievementData
    } = data
    const resolvedCriteriaJson =
      criteriaMode === 'builder'
        ? formatJson({
            field: criteriaField.trim(),
            operator: criteriaOperator.trim(),
            target: criteriaTarget,
          })
        : JSON.stringify(JSON.parse(criteriaJson))

    await onSave({
      ...achievementData,
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      secretHint: data.secretHint.trim(),
      icon: data.icon.trim(),
      criteriaJson: resolvedCriteriaJson,
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in'>
      <div className='max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[var(--bg-card)] shadow-2xl'>
        <div className='flex items-center justify-between border-b border-white/10 p-6'>
          <div className='flex items-center gap-3'>
            <div className='rounded-xl border border-white/10 bg-white/5 p-2 text-[var(--color-primary)]'>
              <Icon size={20} />
            </div>
            <h2 className='text-xl font-bold text-white'>
              {isEditing ? 'Редагувати досягнення' : 'Нове досягнення'}
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='max-h-[calc(92vh-81px)] space-y-5 overflow-y-auto p-6'
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <Input
              label='Код'
              placeholder='FIRST_VISIT'
              error={errors.code?.message}
              {...register('code')}
            />
            <Input
              label='Іконка'
              placeholder='trophy'
              error={errors.icon?.message}
              {...register('icon')}
            />
          </div>

          <Input
            label='Назва'
            placeholder='Перший похід'
            error={errors.name?.message}
            {...register('name')}
          />

          <div className='space-y-2'>
            <label
              htmlFor='achievement-description'
              className='ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'
            >
              Опис
            </label>
            <textarea
              id='achievement-description'
              rows={3}
              className='w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[var(--color-primary)]'
              placeholder='Опишіть умову досягнення'
              {...register('description')}
            />
            {errors.description?.message && (
              <p className='ml-1 text-xs text-red-400'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <label
                htmlFor='achievement-category'
                className='ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'
              >
                Категорія
              </label>
              <select
                id='achievement-category'
                className='w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-primary)]'
                {...register('category', { valueAsNumber: true })}
              >
                {ACHIEVEMENT_CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='achievement-rarity'
                className='ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'
              >
                Рідкість
              </label>
              <select
                id='achievement-rarity'
                className='w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-primary)]'
                {...register('rarity', { valueAsNumber: true })}
              >
                {ACHIEVEMENT_RARITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='achievement-strategy'
                className='ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'
              >
                Стратегія
              </label>
              <select
                id='achievement-strategy'
                className='w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-primary)]'
                {...register('strategy', { valueAsNumber: true })}
              >
                {ACHIEVEMENT_STRATEGY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Input
              label='Нагорода балами'
              type='number'
              error={errors.rewardPoints?.message}
              {...register('rewardPoints', { valueAsNumber: true })}
            />
            <Input
              label='Порядок'
              type='number'
              error={errors.sortOrder?.message}
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <label className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white'>
              <input
                type='checkbox'
                className='h-4 w-4 accent-[var(--color-primary)]'
                {...register('isSecret')}
              />
              Секретне досягнення
            </label>
            <label className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white'>
              <input
                type='checkbox'
                className='h-4 w-4 accent-[var(--color-primary)]'
                {...register('isActive')}
              />
              Активне
            </label>
          </div>

          <Input
            label='Підказка для секретного'
            placeholder='Необовʼязково'
            error={errors.secretHint?.message}
            {...register('secretHint')}
          />

          <div className='space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div>
                <h3 className='text-sm font-bold text-white'>Критерії</h3>
                <p className='mt-1 text-xs text-[var(--text-muted)]'>
                  Звичайний режим збере JSON з полів field, operator і target.
                </p>
              </div>
              <label className='flex items-center gap-2 text-sm text-white'>
                <input
                  type='checkbox'
                  className='h-4 w-4 accent-[var(--color-primary)]'
                  checked={criteriaMode === 'json'}
                  onChange={event =>
                    reset(
                      {
                        ...watch(),
                        criteriaMode: event.target.checked
                          ? 'json'
                          : 'builder',
                      },
                      { keepDirty: true, keepTouched: true },
                    )
                  }
                />
                Advanced JSON
              </label>
            </div>

            {criteriaMode === 'builder' ? (
              <div className='grid gap-4 md:grid-cols-[1fr_120px_140px]'>
                <Input
                  label='Поле'
                  placeholder='visits'
                  error={errors.criteriaField?.message}
                  {...register('criteriaField')}
                />
                <Input
                  label='Оператор'
                  placeholder='>='
                  error={errors.criteriaOperator?.message}
                  {...register('criteriaOperator')}
                />
                <Input
                  label='Ціль'
                  type='number'
                  error={errors.criteriaTarget?.message}
                  {...register('criteriaTarget', { valueAsNumber: true })}
                />
              </div>
            ) : (
              <div className='space-y-2'>
                <label
                  htmlFor='achievement-criteria-json'
                  className='ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'
                >
                  Criteria JSON
                </label>
                <textarea
                  id='achievement-criteria-json'
                  rows={6}
                  className='w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[var(--color-primary)]'
                  {...register('criteriaJson')}
                />
                {errors.criteriaJson?.message && (
                  <p className='ml-1 text-xs text-red-400'>
                    {errors.criteriaJson.message}
                  </p>
                )}
                <p className='ml-1 text-xs text-[var(--text-muted)]'>
                  Використовуйте цей режим лише для складніших критеріїв.
                </p>
              </div>
            )}
          </div>

          <div className='flex justify-end gap-3 border-t border-white/10 pt-5'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg px-6 py-2 text-sm font-bold text-[var(--text-muted)] transition-colors hover:text-white'
            >
              Скасувати
            </button>
            <button
              type='submit'
              disabled={isSaving}
              className='flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2 font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50'
            >
              {isSaving && <GridLoader className='animate-spin' size={16} />}
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AchievementFormModal
