import { Play } from 'lucide-react'
import { useState } from 'react'
import type { Movie } from '@/entities/movie/model/movie.types'
import { movieDetailsCopy as copy } from '../config/movieDetails.copy'
import MovieImage from './MovieImage'

export default function MovieTrailer({
  movie,
  embedUrl,
}: {
  movie: Movie
  embedUrl: string
}) {
  const [active, setActive] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <section
      id='movie-trailer'
      className='min-w-0 scroll-mt-28'
      aria-labelledby='movie-trailer-heading'
    >
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <h2 id='movie-trailer-heading' className='movie-label'>
          {copy.trailer}
        </h2>
        {active && (
          <a
            href={embedUrl.replace('/embed/', '/watch?v=')}
            target='_blank'
            rel='noopener noreferrer'
            className='movie-text-link text-sm'
          >
            {copy.trailerExternal}
          </a>
        )}
      </div>
      <div className='relative aspect-video overflow-hidden bg-[var(--bg-main)] text-white'>
        {active ? (
          <>
            {!loaded && (
              <output className='absolute inset-0 grid place-items-center text-sm'>
                {copy.trailerLoading}
              </output>
            )}
            <iframe
              ref={element => element?.focus()}
              src={embedUrl}
              title={`${movie.title} — ${copy.trailer}`}
              className='absolute inset-0 h-full w-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <button
            type='button'
            onClick={() => setActive(true)}
            aria-label={`${copy.playTrailer}: ${movie.title}`}
            className='movie-trailer-trigger group absolute inset-0 grid h-full w-full place-items-center'
          >
            <MovieImage
              key={movie.backdropUrl}
              src={movie.backdropUrl}
              alt=''
              className='absolute inset-0 h-full w-full object-cover opacity-60'
            />
            <span className='relative flex items-center gap-3 border border-white/70 bg-black/60 px-5 py-3 text-sm'>
              <Play size={20} aria-hidden='true' />
              {copy.playTrailer}
            </span>
          </button>
        )}
      </div>
      {!active && (
        <p className='mt-3 text-sm text-[var(--movie-muted)]'>
          {copy.trailerNotice}
        </p>
      )}
    </section>
  )
}
