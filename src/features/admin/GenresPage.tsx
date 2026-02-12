import { useState, useMemo } from 'react'
import { useGenres } from './hooks/useGenres'
import { Plus, Tag, Edit, Trash2, Search } from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import GenreModal from './components/GenreModal'
import { type Genre } from '../../services/genresService'

const GenresPage = () => {
  const { genres, isLoading, createGenre, updateGenre, deleteGenre } =
    useGenres()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateClick = () => {
    setEditingGenre(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (genre: Genre) => {
    setEditingGenre(genre)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (genre: Genre) => {
    const idDisplay = genre.externalId ? `ID: ${genre.externalId}` : 'Custom'
    if (
      !confirm(
        `Видалити жанр "${genre.name}" (${idDisplay})? Це може вплинути на існуючі фільми.`,
      )
    )
      return

    await deleteGenre(genre.id)
  }

  const handleSave = async (externalId: number | null, name: string) => {
    if (editingGenre) {
      return await updateGenre(editingGenre.id, name)
    } else {
      return await createGenre(externalId, name)
    }
  }

  const filteredGenres = useMemo(() => {
    if (!genres) return []
    const term = searchTerm.toLowerCase()

    return genres.filter(
      g =>
        g.name.toLowerCase().includes(term) ||
        (g.externalId?.toString() || '').includes(term),
    )
  }, [genres, searchTerm])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Жанри</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Категорії фільмів (Action, Drama тощо)
          </p>
        </div>
        <button
          type='button'
          onClick={handleCreateClick}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> Додати жанр
        </button>
      </div>

      <div className='relative max-w-md'>
        <Search
          className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
          size={20}
        />
        <input
          type='text'
          placeholder='Пошук жанру...'
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
        <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] overflow-hidden backdrop-blur-sm shadow-xl'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs tracking-wider'>
              <tr>
                <th className='px-6 py-4'>ID (TMDB)</th>
                <th className='px-6 py-4'>Назва</th>
                <th className='px-6 py-4 text-right'>Дії</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {filteredGenres.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className='px-6 py-8 text-center text-[var(--text-muted)]'
                  >
                    Жанрів не знайдено
                  </td>
                </tr>
              ) : (
                filteredGenres.map(genre => (
                  <tr
                    key={genre.id}
                    className='group hover:bg-[var(--bg-hover)] transition-colors'
                  >
                    <td className='px-6 py-4 font-mono text-[var(--text-muted)]'>
                      {genre.externalId !== null ? (
                        genre.externalId
                      ) : (
                        <span className='inline-flex items-center px-2 py-1 rounded bg-white/5 text-xs text-zinc-500'>
                          Custom
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)]'>
                          <Tag size={16} />
                        </div>
                        <span className='font-bold text-white'>
                          {genre.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          type='button'
                          onClick={() => handleEditClick(genre)}
                          className='p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-blue-500/20 transition-colors'
                          title='Редагувати'
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeleteClick(genre)}
                          className='p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors'
                          title='Видалити'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <GenreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingGenre}
      />
    </div>
  )
}

export default GenresPage
