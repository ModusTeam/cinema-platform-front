import { Film } from 'lucide-react'
import { motion } from 'motion/react'
import type { CatalogueCategory } from '@/entities/movie/lib/catalogue'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import { catalogueCopy as copy } from '../config/catalogue.copy'
import { useCatalogue } from '../model/useCatalogue'
import CatalogueLoading from './CatalogueLoading'
import FilmGallery from './FilmGallery'
import FilmIndex from './FilmIndex'

interface CatalogueProps {
  category: CatalogueCategory
  view: 'posters' | 'index'
  screeningLink: (id: string) => string
  onReset: () => void
}

export default function Catalogue({
  category,
  view,
  screeningLink,
  onReset,
}: CatalogueProps) {
  const query = useCatalogue(category)
  const reducedMotion = useMotionPreference()
  if (query.isPending) return <CatalogueLoading label='Завантажуємо фільми' />
  if (query.isError && !query.data)
    return (
      <UnavailableState
        title={copy.catalogueError}
        onRetry={() => void query.refetch()}
        className='catalogue-state'
      />
    )

  return (
    <>
      {query.isRefetchError && (
        <p role='alert' className='mb-6 text-sm'>
          {copy.refreshError}{' '}
          <button
            type='button'
            className='catalogue-text-link min-h-11'
            onClick={() => void query.refetch()}
          >
            Спробувати ще раз
          </button>
        </p>
      )}
      {query.movies.length === 0 ? (
        <EmptyState
          icon={<Film className='h-12 w-12' />}
          title={query.hasNextPage ? copy.partialEmptyTitle : copy.emptyTitle}
          description={
            query.hasNextPage
              ? copy.partialEmptyDescription
              : copy.emptyDescription
          }
          actionLabel={category !== 'all' ? copy.reset : undefined}
          onAction={category !== 'all' ? onReset : undefined}
          className='catalogue-state'
        />
      ) : (
        <motion.div
          key={view}
          initial={reducedMotion ? false : { opacity: 0.85 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          {view === 'posters' ? (
            <FilmGallery movies={query.movies} screeningLink={screeningLink} />
          ) : (
            <FilmIndex movies={query.movies} screeningLink={screeningLink} />
          )}
        </motion.div>
      )}
      <div className='mt-12 flex flex-wrap items-start justify-between gap-6 border-t border-[var(--catalogue-rule)] pt-6'>
        <div className='max-w-[65ch] text-sm leading-relaxed text-[var(--text-muted)]'>
          <output aria-live='polite'>
            Завантажено {query.loadedCount} із {query.totalCount} записів
            каталогу. У добірці: {query.movies.length}.
          </output>
          {query.hasNextPage && <p className='mt-2'>{copy.partial}</p>}
        </div>
        {query.hasNextPage && (
          <button
            type='button'
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
            className='catalogue-more'
          >
            {query.isFetchingNextPage
              ? copy.loadingMore
              : query.isFetchNextPageError
                ? 'Спробувати ще раз'
                : copy.loadMore}
          </button>
        )}
        {query.isFetchNextPageError && (
          <p role='alert' className='basis-full text-sm'>
            {copy.nextError}
          </p>
        )}
      </div>
    </>
  )
}
