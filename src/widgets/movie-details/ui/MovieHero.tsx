import { ArrowLeft, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { movieCopy } from '@/entities/movie/config/movie.copy'
import type { Movie } from '@/entities/movie/model/movie.types'
import TicketAction from '@/shared/ui/TicketAction'
import { movieDetailsCopy as copy } from '../config/movieDetails.copy'
import MovieImage from './MovieImage'

interface MovieHeroProps {
  movie: Movie
  hasTrailer: boolean
  onBooking: () => void
}

export default function MovieHero({
  movie,
  hasTrailer,
  onBooking,
}: MovieHeroProps) {
  const metadata = [
    movie.year > 0 ? String(movie.year) : null,
    movie.duration > 0 ? `${movie.duration} ${copy.minutes}` : null,
    movie.rating > 0 ? `IMDb ${movie.rating}` : null,
  ].filter(Boolean)

  return (
    <section
      data-without-backdrop={
        !movie.backdropUrl ||
        movie.backdropUrl.includes('placehold.co/') ||
        undefined
      }
      className='movie-hero relative isolate flex flex-col justify-between overflow-hidden text-white'
      aria-labelledby='movie-title'
    >
      <MovieImage
        key={movie.backdropUrl}
        src={movie.backdropUrl}
        alt=''
        eager
        className='absolute inset-0 -z-20 h-full w-full object-cover object-center'
      />
      <div className='movie-hero-shade absolute inset-0 -z-10' />
      <div className='movie-gutter w-full pt-6'>
        <Link
          to='/'
          className='movie-text-link inline-flex min-h-11 items-center gap-2 text-sm'
        >
          <ArrowLeft size={16} aria-hidden='true' />
          {copy.back}
        </Link>
      </div>
      <div className='movie-gutter w-full pb-12 pt-24 sm:pb-16'>
        <h1
          id='movie-title'
          data-long-title={movie.title.length > 60 || undefined}
          className='movie-title max-w-[18ch]'
        >
          {movie.title}
        </h1>
        {metadata.length > 0 && (
          <p className='mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
            {metadata.map(item => (
              <span key={item}>{item}</span>
            ))}
          </p>
        )}
        <div className='mt-8 flex flex-wrap items-center gap-x-8 gap-y-4'>
          <TicketAction onClick={onBooking}>
            {movieCopy.details.buyTicket}
          </TicketAction>
          {hasTrailer && (
            <a
              href='#movie-trailer'
              className='movie-text-link inline-flex min-h-11 items-center gap-3'
            >
              <Play size={18} aria-hidden='true' />
              {copy.trailer}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
