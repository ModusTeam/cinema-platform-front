import { useState } from 'react'
import { X, Search, Download, Image as ImageIcon } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import { moviesService } from '../../../services/moviesService'
import type { TmdbSearchResult } from '../../../types/movie'

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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState<number | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const data = await moviesService.searchTmdb(query)
      setResults(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (tmdbId: number) => {
    setIsImporting(tmdbId)
    try {
      await moviesService.importMovie(tmdbId)
      onSuccess()
      onClose()
      setResults([])
      setQuery('')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Помилка імпорту')
    } finally {
      setIsImporting(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in'>
      <div className='w-full max-w-2xl bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[80vh]'>
        <div className='p-6 border-b border-white/10 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-white'>Імпорт з TMDB</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <div className='p-6 pb-2'>
          <form onSubmit={handleSearch} className='relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
              size={18}
            />
            <input
              type='text'
              autoFocus
              placeholder='Введіть назву фільму (напр. Dune)...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='w-full bg-[var(--bg-main)] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[var(--color-primary)] outline-none'
            />
            <button
              type='submit'
              disabled={isSearching}
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-[var(--color-primary-hover)] disabled:opacity-50'
            >
              {isSearching ? (
                <GridLoader className='animate-spin' size={14} />
              ) : (
                'Пошук'
              )}
            </button>
          </form>
        </div>

        <div className='flex-1 overflow-y-auto p-6 pt-2 space-y-3 custom-scrollbar'>
          {results.length === 0 && !isSearching && (
            <div className='text-center text-[var(--text-muted)] py-10'>
              Введіть назву фільму для пошуку
            </div>
          )}

          {results.map(movie => (
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
                <button
                  type='button'
                  onClick={() => handleImport(movie.tmdbId)}
                  disabled={isImporting !== null}
                  className='flex items-center gap-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50'
                >
                  {isImporting === movie.tmdbId ? (
                    <GridLoader size={18} className='animate-spin' />
                  ) : (
                    <Download size={18} />
                  )}
                  Import
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImportMovieModal
