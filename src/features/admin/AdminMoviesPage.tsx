import { useState } from 'react'
import { useAdminMovies } from '../../features/admin/hooks/useAdminMovies'
import {
  Search,
  Plus,
  Star,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
  PlayCircle,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import ImportMovieModal from '../../features/admin/components/ImportMovieModal'
import EditMovieModal from '../../features/admin/components/EditMovieModal'
import { type Movie, MovieStatus } from '../../types/movie'

const AdminMoviesPage = () => {
  const {
    movies,
    isLoading,
    searchTerm,
    setSearchTerm,
    pagination,
    changePage,
    deleteMovie,
    refresh,
  } = useAdminMovies()

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей фільм?')) return

    const result = await deleteMovie(id)
    if (!result.success) {
      alert(result.error)
    }
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

      {isLoading ? (
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
                    <td
                      colSpan={5}
                      className='px-6 py-12 text-center text-[var(--text-muted)]'
                    >
                      Фільмів не знайдено
                    </td>
                  </tr>
                ) : (
                  (movies || []).map(movie => (
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

          {movies.length > 0 && (
            <div className='flex items-center justify-between px-2'>
              <div className='text-sm text-[var(--text-muted)]'>
                Показано {(pagination.pageNumber - 1) * pagination.pageSize + 1}
                -
                {Math.min(
                  pagination.pageNumber * pagination.pageSize,
                  pagination.totalCount,
                )}{' '}
                з {pagination.totalCount}
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => changePage(pagination.pageNumber - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5'
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type='button'
                  onClick={() => changePage(pagination.pageNumber + 1)}
                  disabled={!pagination.hasNextPage}
                  className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5'
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
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
    </div>
  )
}

export default AdminMoviesPage
