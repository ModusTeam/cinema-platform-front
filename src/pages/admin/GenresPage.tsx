import { Edit, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Genre } from '@/features/admin/api/genres.service'
import { useGenres } from '@/features/admin/model/useGenres'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import GenreModal from '@/features/admin/ui/GenreModal'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const GenresPage = () => {
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null)
  const {
    genres,
    isLoading,
    isError,
    refetch,
    createGenre,
    updateGenre,
    deleteGenre,
  } = useGenres()

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
      <AdminPageHeader
        title='Жанри'
        description='Категорії фільмів (Action, Drama тощо)'
      >
        <Button onClick={handleCreateClick}>
          <Plus size={18} /> Додати жанр
        </Button>
      </AdminPageHeader>

      <div className='relative max-w-md'>
        <Search
          className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
          size={20}
        />
        <input
          type='search'
          aria-label='Пошук жанру за назвою або TMDB ID'
          placeholder='Пошук жанру...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='field pl-10'
        />
      </div>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : isError && genres.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <AdminTable label='Жанри'>
          <table className='min-w-[560px]'>
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
                  <td colSpan={3} className='px-6 py-8'>
                    <EmptyState
                      icon={<Tag className='h-12 w-12' />}
                      title={
                        searchTerm
                          ? 'Жанрів за запитом немає'
                          : 'Жанрів ще немає'
                      }
                      description={
                        searchTerm
                          ? 'Змініть пошуковий запит або очистьте поле, щоб повернутися до списку жанрів.'
                          : 'Додайте перший жанр, щоб категоризувати фільми в каталозі.'
                      }
                      actionLabel={
                        searchTerm ? 'Очистити пошук' : 'Додати жанр'
                      }
                      onAction={
                        searchTerm ? () => setSearchTerm('') : handleCreateClick
                      }
                      className='border-0 bg-transparent py-10'
                    />
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
                        <span className='inline-flex items-center px-2 py-1 rounded bg-white/5 text-xs text-[var(--text-faint)]'>
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
                          onClick={() => setDeleteTarget(genre)}
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
        </AdminTable>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title='Видалити жанр?'
        message={`Жанр «${deleteTarget?.name ?? ''}» буде видалено. Це може вплинути на існуючі фільми.`}
        confirmText='Видалити'
        isDestructive
        onConfirm={async () => {
          if (!deleteTarget) return
          const result = await deleteGenre(deleteTarget.id)
          if (!result.success)
            throw new Error(result.error || 'Не вдалося видалити жанр')
          toast.success('Жанр видалено')
          setDeleteTarget(null)
        }}
      />
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
