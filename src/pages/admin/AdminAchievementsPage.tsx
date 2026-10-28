import { clsx } from 'clsx'
import { Edit, Plus, Search, Trash2, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '@/features/admin/api/admin-achievements.service'
import { useAdminAchievements } from '@/features/admin/model/useAdminAchievements'
import AchievementFormModal from '@/features/admin/ui/AchievementFormModal'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import {
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
  getAchievementStrategyLabel,
  resolveAchievementIcon,
} from '@/features/loyalty/achievements/achievementContract'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

type SecretFilter = 'all' | 'secret' | 'regular'

const SECRET_FILTER_OPTIONS: Array<{
  value: SecretFilter
  label: string
}> = [
  { value: 'all', label: 'Усі' },
  { value: 'secret', label: 'Секретні' },
  { value: 'regular', label: 'Несекретні' },
]

const AdminAchievementsPage = () => {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const [search, setSearch] = useState('')
  const [secretFilter, setSecretFilter] = useState<SecretFilter>('all')
  const [editingAchievement, setEditingAchievement] =
    useState<AdminAchievementDto | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminAchievementDto | null>(
    null,
  )

  const {
    achievements,
    total,
    isLoading,
    error,
    refetch,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    isSaving,
    isDeleting,
  } = useAdminAchievements(includeInactive)

  const filteredAchievements = useMemo(() => {
    const query = search.trim().toLowerCase()

    return achievements.filter(item => {
      const matchesSecretFilter =
        secretFilter === 'all' ||
        (secretFilter === 'secret' && item.isSecret) ||
        (secretFilter === 'regular' && !item.isSecret)
      const matchesSearch =
        !query ||
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)

      return matchesSecretFilter && matchesSearch
    })
  }, [achievements, search, secretFilter])

  const hasActiveFilters =
    Boolean(search.trim()) || includeInactive || secretFilter !== 'all'

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
    setIsFormOpen(false)
    setEditingAchievement(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    await deleteAchievement(deleteTarget.id)
    toast.success('Досягнення видалено')
    setDeleteTarget(null)
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <AdminPageHeader
        title='Досягнення'
        description='Керуйте правилами досягнень, нагородами та активністю.'
      >
        <Button onClick={handleCreate}>
          <Plus size={18} aria-hidden='true' />
          Нове досягнення
        </Button>
      </AdminPageHeader>

      <div className='flex flex-col gap-3 rounded-lg border border-white/5 bg-[var(--bg-card)] p-4 xl:flex-row xl:items-center xl:justify-between'>
        <label className='relative block w-full md:max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]' />
          <input
            type='search'
            aria-label='Пошук досягнення за кодом або назвою'
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder='Пошук за кодом або назвою'
            className='field pl-10'
          />
        </label>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='flex rounded-xl border border-white/10 bg-black/20 p-1'>
            {SECRET_FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                type='button'
                onClick={() => setSecretFilter(option.value)}
                aria-pressed={secretFilter === option.value}
                className={clsx(
                  'selection-control px-3 text-sm',
                  secretFilter === option.value
                    ? 'text-[var(--text-main)]'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className='flex items-center gap-3 text-sm text-neutral-300'>
            <input
              type='checkbox'
              checked={includeInactive}
              onChange={event => setIncludeInactive(event.target.checked)}
              className='h-4 w-4 accent-[var(--color-primary)]'
            />
            Показувати неактивні
          </label>
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border border-white/5 bg-[var(--bg-card)]'>
        <div className='flex items-center justify-between border-b border-white/5 p-5'>
          <div className='text-sm text-neutral-400'>
            Знайдено{' '}
            <span className='font-bold text-white'>
              {filteredAchievements.length}
            </span>{' '}
            з {total}
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-16'>
            <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
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
              hasActiveFilters
                ? 'Досягнень за фільтрами немає'
                : 'Досягнень ще немає'
            }
            description={
              hasActiveFilters
                ? 'Змініть пошук, секретність або фільтр активності, щоб знайти потрібне правило.'
                : 'Створіть перше досягнення, щоб винагороджувати гостей за активність.'
            }
            actionLabel={
              hasActiveFilters ? 'Скинути фільтри' : 'Нове досягнення'
            }
            onAction={
              hasActiveFilters
                ? () => {
                    setSearch('')
                    setIncludeInactive(false)
                    setSecretFilter('all')
                  }
                : handleCreate
            }
            className='border-0 bg-transparent py-16'
          />
        ) : (
          <AdminTable label='Досягнення'>
            <table className='w-full min-w-[980px] text-left text-sm'>
              <thead className='border-b border-white/5 text-xs uppercase tracking-wider text-[var(--text-faint)]'>
                <tr>
                  <th className='px-5 py-4'>Досягнення</th>
                  <th className='px-5 py-4'>Категорія</th>
                  <th className='px-5 py-4'>Рідкість</th>
                  <th className='px-5 py-4'>Стратегія</th>
                  <th className='px-5 py-4'>Нагорода</th>
                  <th className='px-5 py-4'>Статус</th>
                  <th className='px-5 py-4 text-right'>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.map(achievement => {
                  const Icon = resolveAchievementIcon(
                    achievement.icon,
                    achievement.category,
                    achievement.rarity,
                  )

                  return (
                    <tr
                      key={achievement.id}
                      className='border-b border-white/5 last:border-0'
                    >
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[var(--color-primary)]'>
                            <Icon size={20} />
                          </div>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2 font-semibold text-white'>
                              {achievement.name}
                              {achievement.isSecret && (
                                <span className='rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-200'>
                                  Секретне
                                </span>
                              )}
                            </div>
                            <div className='mt-1 font-mono text-xs text-[var(--text-faint)]'>
                              {achievement.code}
                            </div>
                            {achievement.isSecret && achievement.secretHint && (
                              <div className='mt-2 max-w-md text-xs leading-5 text-neutral-400'>
                                Підказка: {achievement.secretHint}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-5 py-4 text-neutral-300'>
                        {getAchievementCategoryLabel(achievement.category)}
                      </td>
                      <td className='px-5 py-4 text-neutral-300'>
                        {getAchievementRarityLabel(achievement.rarity)}
                      </td>
                      <td className='px-5 py-4 text-neutral-300'>
                        {getAchievementStrategyLabel(achievement.strategy)}
                      </td>
                      <td className='px-5 py-4 text-amber-300'>
                        +{achievement.rewardPoints}
                      </td>
                      <td className='px-5 py-4'>
                        <span
                          className={clsx(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            achievement.isActive
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-neutral-500/10 text-neutral-400',
                          )}
                        >
                          {achievement.isActive ? 'Активне' : 'Неактивне'}
                        </span>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex justify-end gap-2'>
                          <button
                            type='button'
                            onClick={() => handleEdit(achievement)}
                            className='action action-ghost w-11 px-0 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white'
                            aria-label='Редагувати досягнення'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type='button'
                            onClick={() => setDeleteTarget(achievement)}
                            className='action action-ghost w-11 px-0 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400'
                            aria-label='Видалити досягнення'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </AdminTable>
        )}
      </div>

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
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Видалити досягнення?'
        message={`Досягнення "${deleteTarget?.name || ''}" буде видалено.`}
        confirmText='Видалити'
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  )
}

export default AdminAchievementsPage
