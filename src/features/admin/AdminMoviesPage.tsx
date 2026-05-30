import EmptyState from '@/common/components/EmptyState'
import { GridLoader } from '@/common/components/GridLoader'
import ConfirmModal from '@/common/components/Modals/ConfirmModal'
import { useToast } from '@/common/components/Toast/ToastContext'
import EditMovieModal from '@/features/admin/components/EditMovieModal'
import ImportMovieModal from '@/features/admin/components/ImportMovieModal'
import { useAdminMovies } from '@/features/admin/hooks/useAdminMovies'
import { type Movie, MovieStatus } from '@/features/movies/model/movie.types'
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Film,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

type MoviesTab = 'active' | 'deleted'

interface PaginationState {
  pageNumber: number
  pageSize: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const formatDeletedAt = (deletedAt: string | null | undefined) => {
  if (!deletedAt) return '—'

  const date = new Date(deletedAt)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const AdminMoviesPage = () => {
  const [activeTab, setActiveTab] = useState<MoviesTab>('active')
  const {
    movies,
    deletedMovies,
    isLoading,
    isDeletedLoading,
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

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей фільм?')) return

    const result = await deleteMovie(id)
    if (!result.success) {
      toast.error(result.error || 'Не вдалося видалити фільм')
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return

    const result = await restoreMovie(restoreTarget.id)
    if (result.success) {
      setRestoreTarget(null)
      toast.success('Фільм відновлено')
      return
    }

    toast.error(result.error || 'Не вдалося відновити фільм')
  }

  const getStatusBadge = (status: MovieStatus) => {
    switch (status) {
      case MovieStatus.Active:
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-500 border border-green-500/20'>
            <PlayCircle size={12} /> Active
          </span>
        )
      case MovieStatus.ComingSoon:
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-500 border border-yellow-500/20'>
            <Clock size={12} /> Soon
          </span>
        )
      case MovieStatus.Archived:
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-500 border border-zinc-500/20'>
            <Archive size={12} /> Archived
          </span>
        )
      default:
        return <span className='text-xs text-[var(--text-muted)]'>Unknown</span>
    }
  }

  const renderPagination = (
    currentPagination: PaginationState,
    onPageChange: (page: number) => void,
  ) => (
    <div className='flex items-center justify-between px-2'>
      <div className='text-sm text-[var(--text-muted)]'>
        Показано{' '}
        {(currentPagination.pageNumber - 1) * currentPagination.pageSize + 1}-
        {Math.min(
          currentPagination.pageNumber * currentPagination.pageSize,
          currentPagination.totalCount,
        )}{' '}
        з {currentPagination.totalCount}
      </div>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => onPageChange(currentPagination.pageNumber - 1)}
          disabled={!currentPagination.hasPreviousPage}
          className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5'
          aria-label='Попередня сторінка'
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type='button'
          onClick={() => onPageChange(currentPagination.pageNumber + 1)}
          disabled={!currentPagination.hasNextPage}
          className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5'
          aria-label='Наступна сторінка'
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  return (
    <div className='space-y-6 pb-20'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Фільми</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Управління каталогом кінотеатру
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsImportModalOpen(true)}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> Імпорт з TMDB
        </button>
      </div>

      <div className='inline-flex rounded-xl border border-white/10 bg-[var(--bg-card)] p-1'>
        <button
          type='button'
          onClick={() => setActiveTab('active')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'active'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Активні
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('deleted')}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'deleted'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Видалені
        </button>
      </div>

      {activeTab === 'active' && (
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
            size={20}
          />
          <input
            type='text'
            placeholder='Пошук фільму за назвою...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full rounded-xl bg-[var(--bg-card)] border border-white/5 py-3 pl-10 pr-4 text-white placeholder-[var(--text-muted)] focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50'
          />
        </div>
      )}

      {activeTab === 'active' &&
        (isLoading ? (
          <div className='flex justify-center py-20'>
            <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
          </div>
        ) : (
          <>
            <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] overflow-hidden backdrop-blur-sm shadow-xl'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs tracking-wider'>
                  <tr>
                    <th className='px-6 py-4 w-[80px]'>Постер</th>
                    <th className='px-6 py-4'>Інформація</th>
                    <th className='px-6 py-4 hidden md:table-cell'>Жанри</th>
                    <th className='px-6 py-4'>Статус</th>
                    <th className='px-6 py-4 text-right'>Дії</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {movies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='px-6 py-8'>
                        <EmptyState
                          icon={<Film className='h-12 w-12' />}
                          title={
                            searchTerm
                              ? 'Фільмів за запитом не знайдено'
                              : 'Каталог фільмів порожній'
                          }
                          description={
                            searchTerm
                              ? 'Спробуйте іншу назву або очистьте пошук, щоб повернутися до всього каталогу.'
                              : 'Імпортуйте перший фільм з TMDB, щоб додати його до афіші кінотеатру.'
                          }
                          actionLabel={
                            searchTerm ? 'Очистити пошук' : 'Імпорт з TMDB'
                          }
                          onAction={
                            searchTerm
                              ? () => setSearchTerm('')
                              : () => setIsImportModalOpen(true)
                          }
                          className='border-0 bg-transparent py-10'
                        />
                      </td>
                    </tr>
                  ) : (
                    movies.map(movie => (
                      <tr
                        key={movie.id}
                        className='group hover:bg-[var(--bg-hover)] transition-colors'
                      >
                        <td className='px-6 py-4'>
                          <div className='w-12 h-16 bg-zinc-800 rounded overflow-hidden shadow-sm'>
                            <img
                              src={movie.posterUrl || movie.backdropUrl}
                              alt={movie.title}
                              className='w-full h-full object-cover'
                              loading='lazy'
                            />
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='font-bold text-white text-base'>
                            {movie.title}
                          </div>
                          <div className='text-[var(--text-muted)] text-xs mt-1 flex gap-2'>
                            <span>{movie.year}</span>
                            <span>•</span>
                            <span>{movie.duration} хв</span>
                            <span className='hidden sm:inline'>•</span>
                            <span className='hidden sm:flex items-center gap-1 text-yellow-500'>
                              <Star size={10} fill='currentColor' />{' '}
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 hidden md:table-cell'>
                          <div className='flex flex-wrap gap-1'>
                            {movie.genres.slice(0, 2).map(g => (
                              <span
                                key={g}
                                className='px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs text-[var(--text-muted)]'
                              >
                                {g}
                              </span>
                            ))}
                            {movie.genres.length > 2 && (
                              <span className='px-2 py-0.5 rounded-full bg-white/5 text-xs text-[var(--text-muted)]'>
                                +{movie.genres.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          {getStatusBadge(movie.status)}
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button
                              type='button'
                              onClick={() => setEditingMovie(movie)}
                              className='p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-blue-500/20 transition-colors'
                              title='Редагувати'
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDelete(movie.id)}
                              className='p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors'
                              title='Видалити'
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {movies.length > 0 && renderPagination(pagination, changePage)}
          </>
        ))}

      {activeTab === 'deleted' &&
        (isDeletedLoading ? (
          <div className='flex justify-center py-20'>
            <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
          </div>
        ) : (
          <>
            <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] overflow-hidden backdrop-blur-sm shadow-xl'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs tracking-wider'>
                  <tr>
                    <th className='px-6 py-4 w-[80px]'>Poster</th>
                    <th className='px-6 py-4'>Title</th>
                    <th className='px-6 py-4'>Release Year</th>
                    <th className='px-6 py-4 hidden md:table-cell'>Genres</th>
                    <th className='px-6 py-4'>Дата видалення</th>
                    <th className='px-6 py-4 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {deletedMovies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='px-6 py-8'>
                        <EmptyState
                          icon={<CheckCircle2 className='h-12 w-12' />}
                          title='Видалених фільмів немає'
                          description='Тут зʼявляться фільми, які були прибрані з каталогу й очікують на можливе відновлення.'
                          className='border-0 bg-transparent py-10'
                        />
                      </td>
                    </tr>
                  ) : (
                    deletedMovies.map(movie => (
                      <tr
                        key={movie.id}
                        className='group opacity-70 transition-colors hover:bg-[var(--bg-hover)] hover:opacity-100'
                      >
                        <td className='px-6 py-4'>
                          <div className='w-12 h-16 bg-zinc-800 rounded overflow-hidden shadow-sm'>
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className='w-full h-full object-cover grayscale'
                                loading='lazy'
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center text-[var(--text-faint)]'>
                                <Film size={18} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='font-bold text-white text-base'>
                            {movie.title}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-[var(--text-muted)]'>
                          {movie.year}
                        </td>
                        <td className='px-6 py-4 hidden md:table-cell'>
                          <div className='flex flex-wrap gap-1'>
                            {movie.genres.slice(0, 2).map(g => (
                              <span
                                key={g}
                                className='px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs text-[var(--text-muted)]'
                              >
                                {g}
                              </span>
                            ))}
                            {movie.genres.length > 2 && (
                              <span className='px-2 py-0.5 rounded-full bg-white/5 text-xs text-[var(--text-muted)]'>
                                +{movie.genres.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-[var(--text-muted)]'>
                          {formatDeletedAt(movie.deletedAt)}
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <button
                            type='button'
                            onClick={() => setRestoreTarget(movie)}
                            className='inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm font-bold text-green-400 transition-colors hover:bg-green-500/20 hover:text-green-300'
                          >
                            <RotateCcw size={16} />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {deletedMovies.length > 0 &&
              renderPagination(deletedPagination, changeDeletedPage)}
          </>
        ))}

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
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title='Відновити фільм?'
        message={`Відновити фільм «${restoreTarget?.title || ''}»? Він знову буде доступний у каталозі.`}
        confirmText='Restore'
        isLoading={isRestoring}
      />
    </div>
  )
}

export default AdminMoviesPage
