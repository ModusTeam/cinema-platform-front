import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Ticket } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { moviesService } from '@/entities/movie/api/movies.service'
import { useAuth } from '@/features/auth/model/AuthContext'
import CataloguePoster from '@/features/movies/ui/CataloguePoster'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'

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
    refetch,
  } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => moviesService.getRecommendations(6),
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    retry: false,
  })

  if (!isAuthLoading && !user) return null

  return (
    <EditorialPageLayout
      title='Персонально для вас'
      subtitle='Ваша добірка фільмів. Знайдіть історію для наступного перегляду.'
      surface='paper'
    >
      {isAuthLoading || isLoading ? (
        <output className='flex min-h-64 items-center justify-center'>
          <GridLoader className='h-8 w-8 animate-spin motion-reduce:animate-none text-[var(--text-muted)]' />
          <span className='sr-only'>Завантаження рекомендацій</span>
        </output>
      ) : isError ? (
        <UnavailableState
          title='Не вдалося завантажити рекомендації'
          onRetry={() => void refetch()}
          className='editorial-state py-20'
        />
      ) : recommendations.length > 0 ? (
        <div className='grid grid-cols-1 gap-x-8 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3'>
          {recommendations.map(movie => (
            <Link
              key={movie.id}
              to={`/movies/${movie.id}`}
              className='group min-w-0'
            >
              <CataloguePoster
                key={movie.posterUrl}
                src={movie.posterUrl ?? undefined}
                title={movie.title}
              />
              <div className='mt-5 flex items-start justify-between gap-4'>
                <h2 className='type-public-section group-hover:underline underline-offset-4'>
                  {movie.title}
                </h2>
                <ArrowUpRight
                  size={20}
                  aria-hidden='true'
                  className='mt-1 shrink-0'
                />
              </div>
              <p className='mt-2 text-sm tabular-nums text-[var(--text-muted)]'>
                Відповідність: {Math.round(movie.similarityScore * 100)}%
              </p>
              <span className='editorial-link mt-2 text-sm'>
                Дивитись деталі
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Ticket className='h-12 w-12' />}
          title='Персональні поради ще готуються'
          description='Відвідайте кілька сеансів, і ми зможемо скласти добірку фільмів саме під ваші вподобання.'
          actionLabel='Обрати перший фільм'
          onAction={() => navigate('/sessions')}
          className='editorial-state py-20'
        />
      )}
    </EditorialPageLayout>
  )
}

export default OffersPage
