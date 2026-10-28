import { Edit, Film, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type Movie, MovieStatus } from '@/entities/movie/model/movie.types'
import { useAdminMovies } from '@/features/admin/model/useAdminMovies'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminPagination } from '@/features/admin/ui/AdminPagination'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import EditMovieModal from '@/features/admin/ui/EditMovieModal'
import ImportMovieModal from '@/features/admin/ui/ImportMovieModal'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import Input from '@/shared/ui/Input'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const statusLabels: Record<MovieStatus, string> = {
  [MovieStatus.Active]: 'У прокаті',
  [MovieStatus.ComingSoon]: 'Скоро у кіно',
  [MovieStatus.Archived]: 'Архів',
}

const formatDeletedAt = (value: string | null | undefined) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('uk-UA')
    : '—'
}

const AdminMoviesPage = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const {
    movies,
    deletedMovies,
    isLoading,
    isError,
    refetch,
    isDeletedLoading,
    isDeletedError,
    refetchDeleted,
    isRestoring,
    searchTerm,
    setSearchTerm,
    pagination,
    deletedPagination,
    changePage,
    changeDeletedPage,
    deleteMovie,
    restoreMovie,
    refresh,
  } = useAdminMovies(activeTab === 'deleted')
  const toast = useToast()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<Movie | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null)
  const isDeleted = activeTab === 'deleted'
  const visibleMovies = isDeleted ? deletedMovies : movies
  const loading = isDeleted ? isDeletedLoading : isLoading
  const failed = isDeleted ? isDeletedError : isError

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteMovie(deleteTarget.id)
    if (!result.success) {
      throw new Error(result.error || 'Не вдалося видалити фільм')
    }
    setDeleteTarget(null)
    toast.success('Фільм видалено')
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    const result = await restoreMovie(restoreTarget.id)
    if (result.success) {
      setRestoreTarget(null)
      toast.success('Фільм відновлено')
      return
    }
    throw new Error(result.error || 'Не вдалося відновити фільм')
  }

  return (
    <div className='space-y-6 pb-10'>
      <AdminPageHeader
        title='Фільми'
        description='Управління каталогом кінотеатру'
      >
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Plus size={17} aria-hidden='true' />
          Імпорт з TMDB
        </Button>
      </AdminPageHeader>

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <fieldset aria-label='Каталог фільмів' className='flex gap-3'>
          <button
            type='button'
            onClick={() => setActiveTab('active')}
            aria-pressed={!isDeleted}
            className='admin-filter'
          >
            Активні
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('deleted')}
            aria-pressed={isDeleted}
            className='admin-filter'
          >
            Видалені
          </button>
        </fieldset>
        {!isDeleted && (
          <div className='relative w-full max-w-sm'>
            <Search
              aria-hidden='true'
              size={17}
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]'
            />
            <Input
              type='search'
              aria-label='Пошук фільму за назвою'
              placeholder='Пошук за назвою…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        )}
      </div>
      {isDeleted && (
        <p className='text-sm text-[var(--text-muted)]'>
          Видалені фільми можна відновити. Архівні фільми залишаються в
          активному каталозі зі статусом «Архів».
        </p>
      )}

      {loading ? (
        <output className='flex justify-center py-20'>
          <GridLoader
            aria-hidden='true'
            className='h-8 w-8 animate-spin motion-reduce:animate-none text-[var(--text-muted)]'
          />
          <span className='sr-only'>Завантаження фільмів</span>
        </output>
      ) : failed && visibleMovies.length === 0 ? (
        <UnavailableState
          onRetry={() => void (isDeleted ? refetchDeleted() : refetch())}
        />
      ) : (
        <>
          {failed && (
            <UnavailableState
              title='Не вдалося оновити каталог'
              description='Показано раніше завантажені дані.'
              onRetry={() => void (isDeleted ? refetchDeleted() : refetch())}
            />
          )}
          <AdminTable label={isDeleted ? 'Видалені фільми' : 'Активні фільми'}>
            <table className='min-w-[680px]'>
              <caption className='sr-only'>
                {isDeleted
                  ? 'Видалені фільми та відновлення'
                  : 'Каталог фільмів та керування'}
              </caption>
              <thead>
                <tr>
                  <th scope='col'>Фільм</th>
                  <th scope='col'>Жанри</th>
                  <th scope='col'>{isDeleted ? 'Дата видалення' : 'Статус'}</th>
                  <th scope='col'>Дії</th>
                </tr>
              </thead>
              <tbody>
                {visibleMovies.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={<Film className='h-12 w-12' />}
                        title={
                          isDeleted
                            ? 'Видалених фільмів немає'
                            : searchTerm
                              ? 'Фільмів за запитом не знайдено'
                              : 'Каталог фільмів порожній'
                        }
                        description={
                          isDeleted
                            ? 'Тут зʼявляться прибрані з каталогу фільми, які можна відновити.'
                            : searchTerm
                              ? 'Спробуйте іншу назву або очистьте пошук.'
                              : 'Імпортуйте перший фільм з TMDB, щоб додати його до афіші.'
                        }
                        actionLabel={
                          isDeleted
                            ? undefined
                            : searchTerm
                              ? 'Очистити пошук'
                              : 'Імпорт з TMDB'
                        }
                        onAction={
                          isDeleted
                            ? undefined
                            : searchTerm
                              ? () => setSearchTerm('')
                              : () => setIsImportModalOpen(true)
                        }
                        className='border-0 bg-transparent py-12'
                      />
                    </td>
                  </tr>
                ) : (
                  visibleMovies.map(movie => (
                    <tr key={movie.id}>
                      <th
                        scope='row'
                        className='!bg-transparent !font-normal !whitespace-normal'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='relative flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[var(--bg-card)] text-[var(--text-faint)]'>
                            <Film size={18} aria-hidden='true' />
                            {movie.posterUrl && (
                              <img
                                key={movie.posterUrl}
                                src={movie.posterUrl}
                                alt=''
                                loading='lazy'
                                className='absolute inset-0 h-full w-full object-cover'
                                onError={e => {
                                  e.currentTarget.hidden = true
                                }}
                              />
                            )}
                          </div>
                          <div className='min-w-0 max-w-md'>
                            <div className='text-sm font-medium leading-snug text-[var(--text-main)]'>
                              {movie.title}
                            </div>
                            <p className='mt-1 text-xs tabular-nums text-[var(--text-muted)]'>
                              {movie.year} · {movie.duration} хв · Рейтинг{' '}
                              {movie.rating.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </th>
                      <td className='max-w-44 text-xs leading-relaxed text-[var(--text-muted)]'>
                        {movie.genres.join(', ') || '—'}
                      </td>
                      <td className='whitespace-nowrap text-xs tabular-nums'>
                        {isDeleted ? (
                          formatDeletedAt(movie.deletedAt)
                        ) : (
                          <span
                            className={
                              movie.status === MovieStatus.Active
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--text-muted)]'
                            }
                          >
                            {statusLabels[movie.status] ?? 'Невідомий статус'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className='flex items-center justify-end gap-1'>
                          {isDeleted ? (
                            <Button
                              variant='ghost'
                              onClick={() => setRestoreTarget(movie)}
                              className='px-3'
                              aria-label={`Відновити фільм «${movie.title}»`}
                            >
                              <RotateCcw size={16} aria-hidden='true' />
                              Відновити
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant='ghost'
                                onClick={() => setEditingMovie(movie)}
                                className='w-11 px-0'
                                title='Редагувати'
                                aria-label={`Редагувати фільм «${movie.title}»`}
                              >
                                <Edit size={17} aria-hidden='true' />
                              </Button>
                              <Button
                                variant='ghost'
                                onClick={() => setDeleteTarget(movie)}
                                className='w-11 px-0 text-[var(--color-error)]'
                                title='Видалити'
                                aria-label={`Видалити фільм «${movie.title}»`}
                              >
                                <Trash2 size={17} aria-hidden='true' />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTable>
          <AdminPagination
            {...(isDeleted ? deletedPagination : pagination)}
            onPageChange={isDeleted ? changeDeletedPage : changePage}
          />
        </>
      )}
      <ImportMovieModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refresh}
      />
      <EditMovieModal
        isOpen={!!editingMovie}
        movie={editingMovie}
        onClose={() => setEditingMovie(null)}
        onSuccess={refresh}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='Видалити фільм?'
        message={`Видалити фільм «${deleteTarget?.title || ''}» з каталогу? Він зʼявиться у списку видалених.`}
        confirmText='Видалити'
        isDestructive
      />
      <ConfirmModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title='Відновити фільм?'
        message={`Відновити фільм «${restoreTarget?.title || ''}»? Він знову буде доступний у каталозі.`}
        confirmText='Відновити'
        isLoading={isRestoring}
      />
    </div>
  )
}

export default AdminMoviesPage
