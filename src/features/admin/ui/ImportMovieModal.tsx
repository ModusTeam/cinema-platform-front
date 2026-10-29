import { Download, Image as ImageIcon, Search, SearchX, X } from 'lucide-react'
import { useId, useState } from 'react'
import { moviesService } from '@/entities/movie/api/movies.service'
import type { TmdbSearchResult } from '@/entities/movie/model/movie.types'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import Input from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/modals/Dialog'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

interface ImportMovieModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ImportMovieModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ImportMovieModalProps) => {
  const titleId = useId()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState<number | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchFailed, setSearchFailed] = useState(false)

  const search = async () => {
    if (!query.trim() || isSearching || isImporting !== null) return

    setIsSearching(true)
    setSearchFailed(false)
    try {
      const data = await moviesService.searchTmdb(query)
      setResults(data)
      setHasSearched(true)
    } catch {
      setResults([])
      setSearchFailed(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void search()
  }

  const handleImport = async (tmdbId: number) => {
    if (isImporting !== null) return
    setIsImporting(tmdbId)
    try {
      await moviesService.importMovie(tmdbId)
      toast.info(
        'Запит на імпорт прийнято. Фільм з’явиться в каталозі після завершення обробки.',
      )
      onSuccess()
      onClose()
      setResults([])
      setQuery('')
      setHasSearched(false)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Помилка імпорту')
    } finally {
      setIsImporting(null)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId={titleId}
      isBusy={isImporting !== null}
      className='font-public max-w-2xl rounded-lg'
    >
      <div className='p-6 border-b border-white/10 flex justify-between items-center'>
        <h2 id={titleId} className='type-section font-medium'>
          Імпорт з TMDB
        </h2>
        <Button
          variant='ghost'
          aria-label='Закрити діалог'
          disabled={isImporting !== null}
          onClick={onClose}
          className='w-11 px-0'
        >
          <X size={24} />
        </Button>
      </div>

      <div className='p-6 pb-2'>
        <form onSubmit={handleSearch} className='flex items-center gap-3'>
          <div className='relative min-w-0 flex-1'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
              size={18}
            />
            <Input
              type='search'
              aria-label='Назва фільму в TMDB'
              data-modal-initial-focus
              disabled={isImporting !== null}
              placeholder='Введіть назву фільму (напр. Dune)...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Button
            type='submit'
            disabled={isImporting !== null}
            isLoading={isSearching}
          >
            Пошук
          </Button>
        </form>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pt-2 space-y-3'>
        {searchFailed && !isSearching ? (
          <UnavailableState
            title='Не вдалося виконати пошук TMDB'
            onRetry={() => void search()}
            className='border-0 bg-transparent py-10'
          />
        ) : (
          results.length === 0 &&
          !isSearching && (
            <EmptyState
              icon={
                hasSearched ? (
                  <SearchX className='h-12 w-12' />
                ) : (
                  <Search className='h-12 w-12' />
                )
              }
              title={
                hasSearched
                  ? 'TMDB нічого не знайшов'
                  : 'Знайдіть фільм для імпорту'
              }
              description={
                hasSearched
                  ? 'Спробуйте оригінальну назву, рік випуску або коротший пошуковий запит.'
                  : 'Введіть назву фільму, щоб побачити результати з TMDB і додати потрібну картку в каталог.'
              }
              className='border-0 bg-transparent py-10'
            />
          )
        )}

        {!searchFailed &&
          results.map(movie => (
            <div
              key={movie.tmdbId}
              className='flex gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:border-white/10 transition-colors'
            >
              <div className='w-16 h-24 bg-zinc-800 rounded shrink-0 overflow-hidden'>
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-[var(--text-muted)]'>
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0 py-1'>
                <h3 className='font-bold text-white text-lg truncate'>
                  {movie.title}
                </h3>
                <p className='text-sm text-[var(--text-muted)]'>{movie.year}</p>
              </div>

              <div className='flex items-center'>
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() => handleImport(movie.tmdbId)}
                  disabled={isImporting !== null}
                  className='px-4'
                >
                  {isImporting === movie.tmdbId ? (
                    <GridLoader size={18} className='animate-spin' />
                  ) : (
                    <Download size={18} />
                  )}
                  Імпортувати
                </Button>
              </div>
            </div>
          ))}
      </div>
    </Dialog>
  )
}

export default ImportMovieModal
