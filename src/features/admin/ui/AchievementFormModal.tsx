import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ACHIEVEMENT_CATEGORY_OPTIONS,
  ACHIEVEMENT_RARITY_OPTIONS,
  ACHIEVEMENT_STRATEGY_OPTIONS,
} from '@/features/loyalty/achievements/achievementContract'
import Input from '@/shared/ui/Input'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '../api/admin-achievements.service'
import {
  CRITERIA_PRESETS,
  getCriteriaSafetyError,
  getCriteriaSummary,
  serializeCriteria,
} from '../model/achievementCriteria'
import {
  ACHIEVEMENT_EDIT_WARNING,
  type AchievementFormData,
  achievementSchema,
  buildAchievementPayload,
  DEFAULT_ACHIEVEMENT_VALUES,
  getAchievementFormDefaults,
  getMeaningfulAchievementChanges,
  switchCriteriaMode,
} from '../model/achievementForm'
import { AchievementEditorPreview } from './AchievementEditorPreview'
import { AchievementIconPicker } from './AchievementIconPicker'

interface AchievementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: AdminAchievementPayload) => Promise<void>
  initialData?: AdminAchievementDto | null
  isSaving: boolean
}

const AchievementFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: AchievementFormModalProps) => {
  const [pendingPayload, setPendingPayload] =
    useState<AdminAchievementPayload | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: DEFAULT_ACHIEVEMENT_VALUES,
  })

  useEffect(() => {
    if (isOpen) {
      reset(getAchievementFormDefaults(initialData))
      setPendingPayload(null)
    }
  }, [initialData, isOpen, reset])

  const values = watch()
  const meaningfulChanges = getMeaningfulAchievementChanges(initialData, values)
  const criteriaSummary = getCriteriaSummary(serializeCriteria(values))
  const criteriaSafetyError =
    values.criteriaMode === 'json'
      ? getCriteriaSafetyError(values.criteriaJson)
      : null
  const deactivating = initialData?.isActive && !values.isActive
  if (!isOpen) return null

  const changeCriteriaMode = (mode: AchievementFormData['criteriaMode']) => {
    const next = switchCriteriaMode(getValues(), mode)
    if (!next) {
      setError('criteriaJson', {
        message:
          'Це правило не можна безпечно перенести в конструктор. JSON залишено без змін. Конструктор підтримує кількість покупок та їхню загальну вартість без додаткових полів.',
      })
      return
    }
    clearErrors(['criteriaJson', 'criteriaTarget'])
    setValue('criteriaJson', next.criteriaJson, { shouldDirty: true })
    setValue('criteriaTarget', next.criteriaTarget, { shouldDirty: true })
    setValue('criteriaPreset', next.criteriaPreset, { shouldDirty: true })
    setValue('criteriaMode', next.criteriaMode, { shouldDirty: true })
  }

  return (
    <>
      <FormDialog
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? 'Редагувати досягнення' : 'Нове досягнення'}
        description='Оберіть образ, опишіть умову та налаштуйте нагороду.'
        isBusy={isSaving}
        isDirty={isDirty}
        className='max-w-6xl'
        noValidate
        onSubmit={handleSubmit(async data => {
          const payload = buildAchievementPayload(data)
          if (
            getMeaningfulAchievementChanges(initialData, data).length ||
            (initialData?.isActive && !data.isActive)
          ) {
            setPendingPayload(payload)
            return
          }
          await onSave(payload)
        })}
      >
        <div className='grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8'>
          <div className='min-w-0 space-y-8'>
            <section aria-labelledby='achievement-basic' className='space-y-4'>
              <h3 id='achievement-basic' className='text-xl font-semibold'>
                Основна інформація
              </h3>
              <Input
                label='Назва'
                placeholder='Перший квиток'
                maxLength={128}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label='Код'
                placeholder='FIRST_TICKET'
                maxLength={64}
                hint='Службовий ідентифікатор. Гості його не бачать.'
                error={errors.code?.message}
                {...register('code')}
              />
              <div className='space-y-2'>
                <label
                  htmlFor='achievement-description'
                  className='field-label'
                >
                  Опис
                </label>
                <textarea
                  id='achievement-description'
                  rows={3}
                  maxLength={10_000}
                  className='field'
                  placeholder='Поясніть гостю, за що він отримає досягнення.'
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description
                      ? 'achievement-description-error'
                      : undefined
                  }
                  {...register('description')}
                />
                {errors.description && (
                  <p
                    id='achievement-description-error'
                    role='alert'
                    className='field-error'
                  >
                    {errors.description.message}
                  </p>
                )}
              </div>
            </section>

            <section
              aria-labelledby='achievement-appearance'
              className='space-y-4 border-t border-[var(--border-default)] pt-6'
            >
              <h3 id='achievement-appearance' className='text-xl font-semibold'>
                Вигляд
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label htmlFor='achievement-category' className='field-label'>
                    Категорія
                  </label>
                  <select
                    id='achievement-category'
                    className='field'
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
                  <label htmlFor='achievement-rarity' className='field-label'>
                    Рідкість
                  </label>
                  <select
                    id='achievement-rarity'
                    className='field'
                    {...register('rarity', { valueAsNumber: true })}
                  >
                    {ACHIEVEMENT_RARITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className='field-hint'>
                Категорія та рідкість описують досягнення й не змінюють умову
                отримання.
              </p>
              <AchievementIconPicker
                value={values.icon}
                onChange={icon =>
                  setValue('icon', icon, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={errors.icon?.message}
              />
            </section>

            <section
              aria-labelledby='achievement-conditions'
              className='space-y-4 border-t border-[var(--border-default)] pt-6'
            >
              <h3 id='achievement-conditions' className='text-xl font-semibold'>
                Умова отримання
              </h3>
              <p className='text-sm leading-relaxed text-[var(--text-muted)]'>
                Оберіть, що накопичує гість після обробки покупки квитків. Одна
                покупка — одне замовлення, незалежно від кількості квитків.
              </p>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  className='selection-control px-4 py-2 text-sm font-semibold'
                  aria-pressed={values.criteriaMode === 'builder'}
                  onClick={() => changeCriteriaMode('builder')}
                >
                  Конструктор
                </button>
                <button
                  type='button'
                  className='selection-control px-4 py-2 text-sm font-semibold'
                  aria-pressed={values.criteriaMode === 'json'}
                  onClick={() => changeCriteriaMode('json')}
                >
                  Розширений режим · JSON
                </button>
              </div>
              {values.criteriaMode === 'builder' ? (
                <>
                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='space-y-2'>
                      <label
                        htmlFor='achievement-condition-type'
                        className='field-label'
                      >
                        Тип умови
                      </label>
                      <select
                        id='achievement-condition-type'
                        className='field'
                        {...register('criteriaPreset')}
                      >
                        {CRITERIA_PRESETS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='space-y-2'>
                      <label
                        htmlFor='achievement-comparison'
                        className='field-label'
                      >
                        Умова
                      </label>
                      <select
                        id='achievement-comparison'
                        className='field'
                        value='at-least'
                        disabled
                      >
                        <option value='at-least'>Щонайменше</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label={
                      values.criteriaPreset === 'purchase-count'
                        ? 'Необхідно покупок'
                        : 'Необхідна загальна вартість, грн'
                    }
                    type='number'
                    min={1}
                    max={1_000_000_000}
                    step={1}
                    hint='Ціле число від 1 до 1 000 000 000.'
                    error={errors.criteriaTarget?.message}
                    {...register('criteriaTarget', { valueAsNumber: true })}
                  />
                </>
              ) : (
                <div className='space-y-3'>
                  <p className='text-sm leading-relaxed text-[var(--text-muted)]'>
                    Правило залишається в JSON, якщо конструктор не може
                    передати його без втрат. Дозволені оператори: gte та sum.
                    Для sum необов’язкове valueField визначає поле суми; без
                    нього сервер використовує amount.
                  </p>
                  <label
                    htmlFor='achievement-criteria-json'
                    className='field-label'
                  >
                    Критерії JSON
                  </label>
                  <textarea
                    id='achievement-criteria-json'
                    rows={8}
                    className='field font-mono text-sm'
                    aria-invalid={
                      !!errors.criteriaJson || !!criteriaSafetyError
                    }
                    aria-describedby='achievement-json-help achievement-json-error'
                    {...register('criteriaJson')}
                  />
                  <p id='achievement-json-help' className='field-hint'>
                    TICKET_PURCHASED має підтверджене джерело подій.
                    VIP_SEAT_BOUGHT потребує відсутнього seatClass; для
                    BULK_TICKET_PURCHASED та REVIEW_LEFT джерела не
                    підтверджені. Їх спрацювання не гарантоване.
                  </p>
                </div>
              )}
              <p
                id='achievement-json-error'
                role={errors.criteriaJson ? 'alert' : undefined}
                className='field-error'
              >
                {errors.criteriaJson?.message || criteriaSafetyError}
              </p>
              <div
                className='space-y-2 border-y border-[var(--border-default)] py-4'
                aria-live='polite'
              >
                <p className='text-sm font-medium'>{criteriaSummary.text}</p>
                {criteriaSummary.needsReview && (
                  <p className='text-sm text-[var(--color-warning)]'>
                    Потребує перевірки
                  </p>
                )}
                <p className='text-sm leading-relaxed text-[var(--text-muted)]'>
                  {criteriaSummary.explanation}
                </p>
                {!criteriaSummary.needsReview && (
                  <p className='field-hint'>
                    Прогрес збільшується після підтвердженої обробки покупки.
                  </p>
                )}
              </div>
            </section>

            <section
              aria-labelledby='achievement-reward'
              className='space-y-4 border-t border-[var(--border-default)] pt-6'
            >
              <h3 id='achievement-reward' className='text-xl font-semibold'>
                Нагорода та видимість
              </h3>
              <Input
                label='Нагорода балами'
                type='number'
                min={0}
                max={1_000_000}
                step={1}
                hint='Нараховується після відкриття досягнення.'
                error={errors.rewardPoints?.message}
                {...register('rewardPoints', { valueAsNumber: true })}
              />
              <label className='flex min-h-11 items-center gap-3 text-sm'>
                <input
                  type='checkbox'
                  className='h-4 w-4 accent-[var(--color-primary)]'
                  {...register('isSecret')}
                />
                Секретне досягнення
              </label>
              {values.isSecret && (
                <Input
                  label='Публічна підказка'
                  placeholder='Необов’язково'
                  hint='Гість побачить її замість опису, доки не відкриє досягнення.'
                  error={errors.secretHint?.message}
                  {...register('secretHint')}
                />
              )}
              <label className='flex min-h-11 items-center gap-3 text-sm'>
                <input
                  type='checkbox'
                  className='h-4 w-4 accent-[var(--color-primary)]'
                  {...register('isActive')}
                />
                Активне досягнення
              </label>
            </section>

            <details
              className='border-t border-[var(--border-default)] pt-6'
              open={errors.strategy || errors.sortOrder ? true : undefined}
            >
              <summary className='cursor-pointer py-2 text-lg font-semibold'>
                Додаткові налаштування
              </summary>
              <div className='mt-4 space-y-4'>
                <div className='space-y-2'>
                  <label htmlFor='achievement-strategy' className='field-label'>
                    Стратегія
                  </label>
                  <select
                    id='achievement-strategy'
                    className='field'
                    aria-describedby='achievement-strategy-help'
                    {...register('strategy', { valueAsNumber: true })}
                  >
                    {ACHIEVEMENT_STRATEGY_OPTIONS.filter(
                      option =>
                        option.value === 2 ||
                        option.value === Number(initialData?.strategy),
                    ).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value === 2
                          ? 'Накопичення до цілі'
                          : `${option.label} (збережене значення)`}
                      </option>
                    ))}
                  </select>
                  <p id='achievement-strategy-help' className='field-hint'>
                    Сервер накопичує прогрес до цілі для всіх стратегій. Старі
                    значення збережено для сумісності. «Серія» не рахує
                    послідовні відвідування.
                  </p>
                </div>
                <Input
                  label='Порядок показу'
                  type='number'
                  min={-32768}
                  max={32767}
                  step={1}
                  hint='Менші значення показуються раніше.'
                  error={errors.sortOrder?.message}
                  {...register('sortOrder', { valueAsNumber: true })}
                />
              </div>
            </details>
          </div>
          <AchievementEditorPreview values={values} />
        </div>
        {meaningfulChanges.length > 0 && (
          <output className='block border-t border-[var(--border-default)] pt-4 text-sm leading-relaxed text-[var(--color-warning)]'>
            Змінено: {meaningfulChanges.join(', ')}. {ACHIEVEMENT_EDIT_WARNING}
          </output>
        )}
      </FormDialog>
      <ConfirmModal
        isOpen={!!pendingPayload}
        onClose={() => setPendingPayload(null)}
        onConfirm={async () => {
          if (!pendingPayload) return
          await onSave(pendingPayload)
          setPendingPayload(null)
        }}
        title={
          deactivating
            ? 'Деактивувати досягнення?'
            : 'Зберегти зміни умов або нагороди?'
        }
        message={
          deactivating
            ? `Досягнення стане неактивним і не отримуватиме новий прогрес. Воно може зникнути з колекцій гостей. ${meaningfulChanges.length ? ACHIEVEMENT_EDIT_WARNING : ''}`
            : ACHIEVEMENT_EDIT_WARNING
        }
        confirmText='Зберегти зміни'
        cancelText='Повернутися до редагування'
        isDestructive
        isLoading={isSaving}
      />
    </>
  )
}

export default AchievementFormModal
