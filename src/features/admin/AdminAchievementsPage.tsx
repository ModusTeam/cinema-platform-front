import { clsx } from 'clsx'
import { AlertCircle, Edit, Plus, Search, Trash2, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'

import EmptyState from '@/common/components/EmptyState'
import { GridLoader } from '@/common/components/GridLoader'
import ConfirmModal from '@/common/components/Modals/ConfirmModal'
import { useToast } from '@/common/components/Toast/ToastContext'
import AchievementFormModal from '@/features/admin/components/AchievementFormModal'
import { useAdminAchievements } from '@/features/admin/hooks/useAdminAchievements'
import {
  getAchievementCategoryLabel,
  getAchievementRarityLabel,
  getAchievementStrategyLabel,
  resolveAchievementIcon,
} from '@/features/loyalty/achievements/achievementContract'
import type {
  AdminAchievementDto,
  AdminAchievementPayload,
} from '@/features/admin/api/admin-achievements.service'

const AdminAchievementsPage = () => {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const [search, setSearch] = useState('')
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
    createAchievement,
    updateAchievement,
    deleteAchievement,
    isSaving,
    isDeleting,
  } = useAdminAchievements(includeInactive)

  const filteredAchievements = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return achievements

    return achievements.filter(item => {
      return (
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
      )
    })
  }, [achievements, search])

  const handleCreate = () => {
    setEditingAchievement(null)
    setIsFormOpen(true)
  }

  const handleEdit = (achievement: AdminAchievementDto) => {
    setEditingAchievement(achievement)
    setIsFormOpen(true)
  }

  const handleSave = async (payload: AdminAchievementPayload) => {
    try {
      if (editingAchievement) {
        await updateAchievement({ id: editingAchievement.id, payload })
        toast.success('Досягнення оновлено')
      } else {
        await createAchievement(payload)
        toast.success('Досягнення створено')
      }

      setIsFormOpen(false)
      setEditingAchievement(null)
    } catch (saveError) {
      toast.error((saveError as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteAchievement(deleteTarget.id)
      toast.success('Досягнення видалено')
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error((deleteError as Error).message)
    }
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Досягнення</h1>
          <p className='mt-1 text-sm text-[var(--text-muted)]'>
            Керуйте правилами досягнень, нагородами та активністю.
          </p>
        </div>

        <button
          type='button'
          onClick={handleCreate}
          className='flex w-fit items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-colors hover:bg-[var(--color-primary-hover)]'
        >
          <Plus size={18} />
          Нове досягнення
        </button>
      </div>

      <div className='flex flex-col gap-3 rounded-2xl border border-white/5 bg-[var(--bg-card)] p-4 md:flex-row md:items-center md:justify-between'>
        <label className='relative block w-full md:max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder='Пошук за кодом або назвою'
            className='w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[var(--color-primary)]'
          />
        </label>

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

      <div className='overflow-hidden rounded-2xl border border-white/5 bg-[var(--bg-card)]'>
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
          <div className='flex items-start gap-3 border-l-2 border-red-500/50 p-6 text-red-300'>
            <AlertCircle size={20} className='mt-0.5' />
            <div>
              <div className='font-medium'>Досягнення тимчасово недоступні</div>
              <p className='mt-1 text-sm text-neutral-400'>
                {error instanceof Error
                  ? error.message
                  : 'Спробуйте оновити сторінку пізніше.'}
              </p>
            </div>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <EmptyState
            icon={<Trophy className='h-12 w-12' />}
            title={
              search || includeInactive
                ? 'Досягнень за фільтрами немає'
                : 'Досягнень ще немає'
            }
            description={
              search || includeInactive
                ? 'Змініть пошук або фільтр активності, щоб знайти потрібне правило.'
                : 'Створіть перше досягнення, щоб винагороджувати гостей за активність.'
            }
            actionLabel={
              search || includeInactive ? 'Скинути фільтри' : 'Нове досягнення'
            }
            onAction={
              search || includeInactive
                ? () => {
                    setSearch('')
                    setIncludeInactive(false)
                  }
                : handleCreate
            }
            className='border-0 bg-transparent py-16'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[980px] text-left text-sm'>
              <thead className='border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500'>
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
                          <div>
                            <div className='font-semibold text-white'>
                              {achievement.name}
                            </div>
                            <div className='mt-1 font-mono text-xs text-neutral-500'>
                              {achievement.code}
                            </div>
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
                            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white'
                            aria-label='Редагувати досягнення'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type='button'
                            onClick={() => setDeleteTarget(achievement)}
                            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400'
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
          </div>
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
