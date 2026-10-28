import type { Movie } from '@/entities/movie/model/movie.types'
import type { Session } from '@/entities/session/model/session.types'
import { bookingCopy } from '../config/booking.copy'
import { formatBookingSessionDateTime } from '../lib/bookingDisplay'

const BookingScreening = ({
  movie,
  session,
}: {
  movie: Movie
  session?: Session
}) => (
  <div className='flex min-w-0 items-start gap-4 sm:gap-6'>
    {movie.posterUrl && (
      <img
        src={movie.posterUrl}
        alt=''
        className='h-28 w-[4.5rem] shrink-0 bg-[var(--bg-card)] object-cover sm:h-36 sm:w-24'
        onError={event => {
          event.currentTarget.style.visibility = 'hidden'
        }}
      />
    )}
    <div className='min-w-0'>
      <h1 className='type-public-display max-w-4xl text-balance'>
        {movie.title}
      </h1>
      <p className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]'>
        {movie.duration > 0 && <span>{movie.duration} хв</span>}
        {movie.year > 0 && <span>{movie.year}</span>}
        {movie.genres.length > 0 && <span>{movie.genres.join(', ')}</span>}
      </p>
      {session && (
        <p className='mt-3 text-sm leading-relaxed'>
          <time dateTime={session.startTime}>
            {formatBookingSessionDateTime(session.startTime)}
          </time>
          {session.hallName && (
            <span className='block text-[var(--text-muted)]'>
              {bookingCopy.hall}: {session.hallName}
            </span>
          )}
        </p>
      )}
    </div>
  </div>
)

export default BookingScreening
