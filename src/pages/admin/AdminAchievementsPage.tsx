import { Edit, Plus, Power, Search, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '@/features/admin/api/admin-achievements.service'
import { getCriteriaSummary } from '@/features/admin/model/achievementCriteria'
import {
  buildAchievementReactivationPayload,
  getReactivationRestriction,
} from '@/features/admin/model/achievementForm'
import {
  ACHIEVEMENTS_PAGE_SIZE,
  type AchievementPageFilters,
  DEFAULT_ACHIEVEMENT_FILTERS,
  filterAchievementPage,
  lastAchievementPage,
} from '@/features/admin/model/achievementManagement'
import { useAdminAchievements } from '@/features/admin/model/useAdminAchievements'
import AchievementFormModal from '@/features/admin/ui/AchievementFormModal'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminPagination } from '@/features/admin/ui/AdminPagination'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import { AchievementIcon } from '@/features/loyalty/achievements/AchievementIcon'
import {
  ACHIEVEMENT_CATEGORY_OPTIONS,
  ACHIEVEMENT_RARITY_OPTIONS,
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
} from '@/features/loyalty/achievements/achievementContract'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const AdminAchievementsPage = () => {
  const toast = useToast()
  const [filters, setFilters] = useState(DEFAULT_ACHIEVEMENT_FILTERS)
  const [page, setPage] = useState(1)
  const [editingAchievement, setEditingAchievement] =
    useState<AdminAchievementDto | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<AdminAchievementDto | null>(
    null,
  )
  const resultsRef = useRef<HTMLHeadingElement>(null)
  const focusAfterLoad = useRef(false)
  const {
    achievements,
    total,
    isFetching,
    error,
    refetch,
    createAchievement,
    updateAchievement,
    deactivateAchievement,
    isSaving,
    isDeactivating,
  } = useAdminAchievements(filters.status !== 'active', page)
  const lastPage = lastAchievementPage(total, ACHIEVEMENTS_PAGE_SIZE)
  const correctingPage = !isFetching && !error && page > lastPage
  const loading = isFetching || correctingPage

  useEffect(() => {
    if (correctingPage) setPage(lastPage)
  }, [correctingPage, lastPage])
  useEffect(() => {
    if (!loading && !isFormOpen && !statusTarget && focusAfterLoad.current) {
      focusAfterLoad.current = false
      resultsRef.current?.focus({ preventScroll: true })
    }
  }, [loading, isFormOpen, statusTarget])

  const changeFilter = <K extends keyof AchievementPageFilters>(
    key: K,
    value: AchievementPageFilters[K],
  ) => {
    setFilters(current => ({ ...current, [key]: value }))
    if (key === 'status') setPage(1)
  }
  const resetFilters = () => {
    setFilters(DEFAULT_ACHIEVEMENT_FILTERS)
    setPage(1)
  }
  const filteredAchievements = filterAchievementPage(achievements, filters)
  const hasActiveFilters = Object.keys(DEFAULT_ACHIEVEMENT_FILTERS).some(
    key => {
      const filter = key as keyof AchievementPageFilters
      return filters[filter] !== DEFAULT_ACHIEVEMENT_FILTERS[filter]
    },
  )
  const handleCreate = () => {
    setEditingAchievement(null)
    setIsFormOpen(true)
  }
  const handleEdit = (achievement: AdminAchievementDto) => {
    setEditingAchievement(achievement)
    setIsFormOpen(true)
  }
  const handleSave = async (payload: AdminAchievementPayload) => {
    if (editingAchievement) {
      await updateAchievement({ id: editingAchievement.id, payload })
      toast.success('Досягнення оновлено')
    } else {
      await createAchievement(payload)
      toast.success('Досягнення створено')
    }
    focusAfterLoad.current = true
    setIsFormOpen(false)
    setEditingAchievement(null)
  }
  const handleStatusChange = async () => {
    if (!statusTarget) return
    if (statusTarget.isActive) {
      await deactivateAchievement(statusTarget.id)
      toast.success('Досягнення деактивовано')
    } else {
      await updateAchievement({
        id: statusTarget.id,
        payload: buildAchievementReactivationPayload(statusTarget),
      })
      toast.success('Досягнення активовано')
    }
    focusAfterLoad.current = true
    setStatusTarget(null)
  }

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title='Досягнення'
        description='Умови отримання, нагороди та доступність для гостей.'
      >
        <Button onClick={handleCreate}>
          <Plus size={18} aria-hidden='true' />
          Нове досягнення
        </Button>
      </AdminPageHeader>
      <section aria-label='Фільтри досягнень' className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 xl:grid-cols-[minmax(15rem,2fr)_repeat(4,minmax(0,1fr))]'>
          <div className='space-y-2'>
            <label htmlFor='achievement-search' className='field-label'>
              Назва або код на сторінці
            </label>
            <div className='relative'>
              <Search
                aria-hidden='true'
                size={16}
                className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]'
              />
              <input
                id='achievement-search'
                type='search'
                value={filters.search}
                onChange={event => changeFilter('search', event.target.value)}
                placeholder='Пошук на цій сторінці'
                className='field pl-10'
                aria-describedby='achievement-filter-scope'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label htmlFor='achievement-status-filter' className='field-label'>
              Активність
            </label>
            <select
              id='achievement-status-filter'
              className='field'
              value={filters.status}
              onChange={event =>
                changeFilter(
                  'status',
                  event.target.value as AchievementPageFilters['status'],
                )
              }
            >
              <option value='active'>Активні</option>
              <option value='all'>Усі</option>
              <option value='inactive'>Неактивні на сторінці</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label htmlFor='achievement-secret-filter' className='field-label'>
              Секретність
            </label>
            <select
              id='achievement-secret-filter'
              className='field'
              value={filters.secret}
              onChange={event =>
                changeFilter(
                  'secret',
                  event.target.value as AchievementPageFilters['secret'],
                )
              }
            >
              <option value='all'>Усі</option>
              <option value='secret'>Секретні</option>
              <option value='regular'>Несекретні</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='achievement-category-filter'
              className='field-label'
            >
              Категорія
            </label>
            <select
              id='achievement-category-filter'
              className='field'
              value={filters.category}
              onChange={event => changeFilter('category', event.target.value)}
            >
              <option value='all'>Усі категорії</option>
              {ACHIEVEMENT_CATEGORY_OPTIONS.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <label htmlFor='achievement-rarity-filter' className='field-label'>
              Рідкість
            </label>
            <select
              id='achievement-rarity-filter'
              className='field'
              value={filters.rarity}
              onChange={event => changeFilter('rarity', event.target.value)}
            >
              <option value='all'>Усі рівні рідкості</option>
              {ACHIEVEMENT_RARITY_OPTIONS.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <p
            id='achievement-filter-scope'
            className='max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]'
          >
            Пошук, секретність, категорія, рідкість і вибір неактивних
            фільтрують лише завантажену сторінку з {ACHIEVEMENTS_PAGE_SIZE}{' '}
            записів. Для решти каталогу перейдіть на іншу сторінку. Вибір
            «Активні» або «Усі» застосовується до каталогу на сервері.
          </p>
          {hasActiveFilters && (
            <Button variant='ghost' onClick={resetFilters}>
              Скинути фільтри
            </Button>
          )}
        </div>
      </section>
      <section
        aria-labelledby='achievement-results'
        aria-busy={loading}
        className='space-y-4'
      >
        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <h2
            id='achievement-results'
            ref={resultsRef}
            tabIndex={-1}
            className='text-lg font-medium'
          >
            Перелік досягнень
          </h2>
          <output className='text-sm tabular-nums text-[var(--text-muted)]'>
            {loading
              ? 'Завантажуємо сторінку…'
              : error
                ? 'Не вдалося завантажити сторінку'
                : `На цій сторінці: ${filteredAchievements.length} із ${achievements.length}. У каталозі ${filters.status === 'active' ? 'активних' : 'всього'}: ${total}.`}
            {hasActiveFilters && ' Фільтри застосовано.'}
          </output>
        </div>
        {loading ? (
          <div className='flex justify-center border-y border-[var(--border-default)] py-16'>
            <GridLoader className='h-8 w-8 animate-spin text-[var(--text-muted)] motion-reduce:animate-none' />
          </div>
        ) : error ? (
          <UnavailableState
            title='Досягнення тимчасово недоступні'
            onRetry={() => void refetch()}
          />
        ) : filteredAchievements.length === 0 ? (
          <EmptyState
            icon={<Trophy className='h-12 w-12' />}
            title={
              total === 0 && !hasActiveFilters
                ? 'Досягнень ще немає'
                : 'На цій сторінці збігів немає'
            }
            description={
              total === 0 && !hasActiveFilters
                ? 'Створіть перше досягнення, щоб винагороджувати гостей за покупки.'
                : 'Змініть фільтри або перейдіть на іншу сторінку. Пошук не охоплює решту каталогу.'
            }
            actionLabel={
              hasActiveFilters ? 'Скинути фільтри' : 'Нове досягнення'
            }
            onAction={hasActiveFilters ? resetFilters : handleCreate}
            className='border-x-0 bg-transparent py-16'
          />
        ) : (
          <AdminTable label='Таблиця досягнень'>
            <table className='w-full min-w-[1120px] table-fixed text-left text-sm'>
              <thead className='border-b border-[var(--border-default)] text-xs text-[var(--text-faint)]'>
                <tr>
                  <th scope='col' className='w-[28%] px-4 py-4 font-medium'>
                    Досягнення / код
                  </th>
                  <th scope='col' className='w-[15%] px-4 py-4 font-medium'>
                    Категорія / рідкість
                  </th>
                  <th scope='col' className='w-[25%] px-4 py-4 font-medium'>
                    Умова отримання
                  </th>
                  <th scope='col' className='w-[10%] px-4 py-4 font-medium'>
                    Нагорода
                  </th>
                  <th scope='col' className='w-[10%] px-4 py-4 font-medium'>
                    Статус
                  </th>
                  <th
                    scope='col'
                    className='w-[12%] px-4 py-4 text-right font-medium'
                  >
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.map(achievement => {
                  const summary = getCriteriaSummary(achievement.criteriaJson)
                  const restriction = achievement.isActive
                    ? null
                    : getReactivationRestriction(achievement)
                  return (
                    <tr
                      key={achievement.id}
                      className='border-b border-[var(--border-default)] align-top last:border-0 hover:bg-[var(--surface-muted)]'
                    >
                      <td className='px-4 py-5 text-left font-normal'>
                        <div className='flex items-start gap-4'>
                          <AchievementIcon
                            identifier={achievement.icon}
                            size={32}
                            className='mt-1 shrink-0'
                          />
                          <div className='min-w-0 space-y-2'>
                            <p className='break-words font-medium text-[var(--text-main)]'>
                              {achievement.name}
                            </p>
                            <p className='break-all font-mono text-xs text-[var(--text-faint)]'>
                              {achievement.code}
                            </p>
                            {achievement.isSecret && (
                              <p className='text-xs text-[var(--text-muted)]'>
                                Секретне
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='space-y-2 px-4 py-5 text-[var(--text-muted)]'>
                        <p>
                          {getAchievementCategoryLabel(achievement.category)}
                        </p>
                        <p className='text-xs'>
                          {getAchievementRarityLabel(achievement.rarity)}
                        </p>
                      </td>
                      <td className='px-4 py-5'>
                        <p className='break-words'>{summary.text}</p>
                        {summary.needsReview && (
                          <p className='mt-2 text-xs text-[var(--color-warning)]'>
                            Потребує перевірки
                          </p>
                        )}
                        <details className='mt-2 text-xs text-[var(--text-muted)]'>
                          <summary className='min-h-11 cursor-pointer py-3'>
                            Переглянути правило
                            <span className='sr-only'>
                              : {achievement.name}
                            </span>
                          </summary>
                          <p className='mb-3 leading-relaxed'>
                            {summary.explanation}
                          </p>
                          <pre className='max-h-48 overflow-auto whitespace-pre-wrap break-all border-t border-[var(--border-default)] pt-3'>
                            {achievement.criteriaJson}
                          </pre>
                        </details>
                      </td>
                      <td className='px-4 py-5 tabular-nums'>
                        +{achievement.rewardPoints.toLocaleString('uk-UA')}
                        <span className='mt-2 block text-xs text-[var(--text-muted)]'>
                          балів
                        </span>
                      </td>
                      <td className='px-4 py-5 text-[var(--text-muted)]'>
                        {achievement.isActive ? 'Активне' : 'Неактивне'}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex justify-end gap-1'>
                          <button
                            type='button'
                            onClick={() => handleEdit(achievement)}
                            className='action action-ghost w-11 shrink-0 px-0'
                            aria-label={`Редагувати досягнення «${achievement.name}»`}
                          >
                            <Edit size={17} aria-hidden='true' />
                          </button>
                          <button
                            type='button'
                            onClick={() => setStatusTarget(achievement)}
                            disabled={
                              !!restriction || isDeactivating || isSaving
                            }
                            className='action action-ghost w-11 shrink-0 px-0'
                            aria-describedby={
                              restriction
                                ? `activation-restriction-${achievement.id}`
                                : undefined
                            }
                            aria-label={`${achievement.isActive ? 'Деактивувати' : 'Активувати'} досягнення «${achievement.name}»`}
                          >
                            <Power size={17} aria-hidden='true' />
                          </button>
                        </div>
                        {restriction && (
                          <p
                            id={`activation-restriction-${achievement.id}`}
                            className='mt-2 text-xs leading-relaxed text-[var(--color-warning)]'
                          >
                            {restriction}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </AdminTable>
        )}
        {!loading && !error && (
          <AdminPagination
            pageNumber={page}
            pageSize={ACHIEVEMENTS_PAGE_SIZE}
            totalCount={total}
            hasPreviousPage={page > 1}
            hasNextPage={page < lastPage}
            onPageChange={next => {
              focusAfterLoad.current = true
              setPage(next)
            }}
          />
        )}
      </section>
      <AchievementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingAchievement(null)
        }}
        onSave={handleSave}
        initialData={editingAchievement}
        isSaving={isSaving}
      />
      <ConfirmModal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusChange}
        title={
          statusTarget?.isActive
            ? 'Деактивувати досягнення?'
            : 'Активувати досягнення?'
        }
        message={
          statusTarget?.isActive
            ? `«${statusTarget.name}» стане неактивним і не отримуватиме новий прогрес. Запис не видаляється назавжди, проте досягнення може зникнути з колекцій гостей.`
            : `«${statusTarget?.name ?? ''}» стане активним зі збереженою умовою. Історичний прогрес і нагороди не перераховуються автоматично.`
        }
        confirmText={statusTarget?.isActive ? 'Деактивувати' : 'Активувати'}
        isDestructive={statusTarget?.isActive}
        isLoading={isDeactivating || isSaving}
      />
    </div>
  )
}

export default AdminAchievementsPage
