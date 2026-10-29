import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { getMovieTrailerEmbedUrl } from '@/entities/movie/lib/movieTrailer'
import type { Movie } from '@/entities/movie/model/movie.types'
import { useAuth } from '@/features/auth/model/AuthContext'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import DiscoverMovies from './DiscoverMovies'
import MovieEditorial from './MovieEditorial'
import MovieHero from './MovieHero'
import MovieScreenings from './MovieScreenings'
import MovieTrailer from './MovieTrailer'
import './movie-details.css'

export default function MovieDetails({ movie }: { movie: Movie }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const reducedMotion = useMotionPreference()
  const trailerEmbedUrl = getMovieTrailerEmbedUrl(movie.videoUrl)

  const handleBookingClick = () => {
    if (!user) {
      navigate('/auth/login', { state: { from: `/booking/${movie.id}` } })
    } else {
      navigate(`/booking/${movie.id}`)
    }
  }

  return (
    <article className='movie-details font-public'>
      <MovieHero
        movie={movie}
        hasTrailer={!!trailerEmbedUrl}
        onBooking={handleBookingClick}
      />
      <motion.div
        initial={false}
        whileInView={
          reducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: [0.8, 1], y: [12, 0] }
        }
        viewport={{ once: true, amount: 0.08 }}
        style={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
      >
        <MovieEditorial movie={movie} />
      </motion.div>
      <div className='movie-paper movie-gutter movie-section border-t border-[var(--movie-rule)]'>
        <div
          className={
            trailerEmbedUrl
              ? 'grid items-start gap-12 lg:grid-cols-2 lg:gap-16'
              : 'max-w-3xl'
          }
        >
          <MovieScreenings movieId={movie.id} onBooking={handleBookingClick} />
          {trailerEmbedUrl && (
            <MovieTrailer
              key={movie.id}
              movie={movie}
              embedUrl={trailerEmbedUrl}
            />
          )}
        </div>
      </div>
      <DiscoverMovies currentMovieId={movie.id} />
    </article>
  )
}
