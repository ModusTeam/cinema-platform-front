import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Ticket, SearchX, Play, Circle } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { moviesService } from '../services/moviesService'
import { GridLoader } from '../common/components/GridLoader'

const OffersPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/auth/login', { replace: true })
    }
  }, [user, isAuthLoading, navigate])

  const {
    data: recommendations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => moviesService.getRecommendations(6),
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    retry: false,
  })

  if (isAuthLoading || (isLoading && user)) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--bg-main)]'>
        <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className='min-h-[calc(100vh-4rem)] px-4 py-12 bg-[var(--bg-main)] overflow-hidden relative'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-20 pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)]/30 rounded-full blur-[120px]' />
        <div className='absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]' />
      </div>

      <div className='relative z-10 container mx-auto max-w-6xl'>
        <div className='text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2'>
            <Sparkles size={14} /> AI Powered
          </div>
          <h1 className='text-4xl sm:text-5xl font-black text-white tracking-tight uppercase'>
            Персонально для{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-purple-500'>
              Вас
            </span>
          </h1>
          <p className='text-lg text-[var(--text-muted)] max-w-2xl mx-auto'>
            Ми проаналізували вашу історію переглядів за допомогою штучного
            інтелекту та підібрали фільми, які вам точно сподобаються.
          </p>
        </div>

        {isError && (
          <div className='text-center text-red-400 py-10'>
            Не вдалося завантажити рекомендації. Спробуйте пізніше.
          </div>
        )}

        {!isError && recommendations.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {recommendations.map((movie, index) => {
              const matchPercentage = Math.round(movie.similarityScore * 100)

              const radius = 10
              const circumference = 2 * Math.PI * radius
              const strokeDashoffset =
                circumference - (matchPercentage / 100) * circumference

              return (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  className='group relative aspect-[2/3] overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/5 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_var(--color-primary)]/30 animate-in fade-in zoom-in duration-500'
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                  />

                  <div className='absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity' />

                  <div className='absolute top-4 right-4'>
                    <div className='relative flex items-center justify-center w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg group-hover:scale-110 transition-transform'>
                      <Circle
                        size={48}
                        strokeWidth={2}
                        className='absolute text-white/10'
                      />
                      <Circle
                        size={48}
                        strokeWidth={2}
                        className={`absolute -rotate-90 transition-all duration-1000 ${
                          matchPercentage > 80
                            ? 'text-green-500'
                            : matchPercentage > 60
                              ? 'text-yellow-500'
                              : 'text-[var(--color-primary)]'
                        }`}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap='round'
                      />
                      <span className='text-[10px] font-bold text-white absolute'>
                        {matchPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className='absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform'>
                    <h3 className='text-xl font-bold text-white leading-tight mb-2 line-clamp-2 drop-shadow-md'>
                      {movie.title}
                    </h3>
                    <div className='flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity delay-100'>
                      <Play size={12} fill='currentColor' /> Дивитись деталі
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          !isLoading && (
            <div className='flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500'>
              <div className='relative mb-8 group cursor-default'>
                <div className='absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500' />
                <div className='relative w-32 h-32 bg-[#1a1a1a] rounded-full border border-white/10 flex items-center justify-center shadow-2xl'>
                  <SearchX
                    size={48}
                    className='text-[var(--text-muted)] group-hover:text-white transition-colors duration-500'
                  />
                  <div className='absolute -top-2 -right-2 w-10 h-10 bg-[var(--bg-card)] rounded-full border border-white/10 flex items-center justify-center animate-bounce'>
                    <Ticket size={16} className='text-[var(--color-primary)]' />
                  </div>
                </div>
              </div>

              <h2 className='text-2xl font-bold text-white mb-3'>
                Штучний інтелект ще навчається...
              </h2>
              <p className='text-[var(--text-muted)] max-w-md mb-8'>
                У нас поки недостатньо даних про ваші вподобання. Відвідайте
                кілька сеансів, щоб ми могли скласти ваш персональний
                кіно-профіль!
              </p>

              <Link
                to='/sessions'
                className='group relative inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-lg shadow-[var(--color-primary)]/25'
              >
                <span className='relative z-10 flex items-center gap-2'>
                  <Ticket size={18} />
                  Обрати перший фільм
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out' />
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default OffersPage
