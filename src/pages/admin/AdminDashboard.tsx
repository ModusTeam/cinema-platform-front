import { Film, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  adminStatsService,
  type DashboardStatsDto,
} from '@/features/admin/api/admin-stats.service'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(amount)
const ranges = [
  { value: '7d', label: 'Тиждень' },
  { value: '30d', label: 'Місяць' },
  { value: '90d', label: 'Квартал' },
]

interface StatCardProps {
  title: string
  value: string | number
  trendPercent?: number
  isLoading: boolean
  subText: string
}

const StatCard = ({
  title,
  value,
  trendPercent,
  isLoading,
  subText,
}: StatCardProps) => (
  <div className='min-w-0 border-b border-[var(--border-default)] py-6'>
    <dt className='text-sm text-[var(--text-muted)]'>{title}</dt>
    <dd className='mt-3'>
      {isLoading ? (
        <span className='block h-10 w-28 rounded-sm bg-[var(--bg-card)]' />
      ) : (
        <span className='block break-words text-3xl font-medium tracking-tight tabular-nums'>
          {value}
        </span>
      )}
      <span className='mt-3 block text-xs leading-relaxed text-[var(--text-muted)]'>
        {!isLoading && trendPercent !== undefined && (
          <span className='mr-2 font-medium tabular-nums text-[var(--text-main)]'>
            {trendPercent > 0 ? '+' : trendPercent < 0 ? '−' : ''}
            {Math.abs(trendPercent)}%
          </span>
        )}{' '}
        {subText}
      </span>
    </dd>
  </div>
)

interface ChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string }>
  label?: string | number
}

const CustomChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length || label === undefined) return null
  return (
    <div className='font-public rounded-md border border-[var(--border-default)] bg-[var(--surface-elevated)] p-3'>
      <p className='mb-1 text-xs text-[var(--text-muted)]'>
        {new Date(label).toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <p className='text-sm font-medium tabular-nums'>
        {formatCurrency(Number(payload[0].value))}
      </p>
    </div>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [dateRange, setDateRange] = useState('30d')

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly reloads the same date range.
  useEffect(() => {
    // Ignore an old period's response after a range change or viewport unmount.
    let active = true
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const to = new Date()
        const from = new Date()
        if (dateRange === '7d') from.setDate(to.getDate() - 7)
        if (dateRange === '30d') from.setDate(to.getDate() - 30)
        if (dateRange === '90d') from.setDate(to.getDate() - 90)
        const data = await adminStatsService.getDashboardStats(from, to)
        if (active) {
          setStats(data)
          setLoadError(false)
        }
      } catch {
        if (active) {
          setStats(null)
          setLoadError(true)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void fetchStats()
    return () => {
      active = false
    }
  }, [dateRange, retryCount])

  const chartData = stats?.salesChart || []
  const dateFormatter = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    })

  return (
    <div className='space-y-8 pb-10'>
      <AdminPageHeader
        title='Панель управління'
        description='Огляд ключових показників ефективності кінотеатру'
      >
        <fieldset aria-label='Період статистики' className='flex gap-1'>
          {ranges.map(range => (
            <button
              type='button'
              key={range.value}
              onClick={() => setDateRange(range.value)}
              aria-pressed={dateRange === range.value}
              className='admin-filter'
            >
              {range.label}
            </button>
          ))}
        </fieldset>
      </AdminPageHeader>

      {!isLoading && loadError ? (
        <UnavailableState
          title='Статистика тимчасово недоступна'
          onRetry={() => setRetryCount(count => count + 1)}
        />
      ) : (
        <>
          <dl
            aria-label='Ключові показники'
            aria-busy={isLoading}
            className='grid grid-cols-2 gap-x-8 xl:grid-cols-4'
          >
            <StatCard
              title='Загальний дохід'
              value={stats ? formatCurrency(stats.totalRevenue) : '—'}
              trendPercent={stats?.revenueChangePercent}
              subText='від попереднього періоду'
              isLoading={isLoading}
            />
            <StatCard
              title='Продано квитків'
              value={stats?.ticketsSold ?? '—'}
              trendPercent={stats?.ticketsChangePercent}
              subText='від попереднього періоду'
              isLoading={isLoading}
            />
            <StatCard
              title='Заповнюваність залів'
              value={stats ? `${stats.occupancyRate}%` : '—'}
              trendPercent={stats?.occupancyChangePercent}
              subText='середній показник'
              isLoading={isLoading}
            />
            <StatCard
              title='Активні фільми'
              value={stats?.activeMoviesCount ?? '—'}
              subText='у прокаті зараз'
              isLoading={isLoading}
            />
          </dl>

          <div className='grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)]'>
            <section aria-labelledby='admin-sales-title' className='min-w-0'>
              <div className='mb-6 flex items-baseline justify-between gap-4'>
                <h2 id='admin-sales-title' className='text-lg font-medium'>
                  Динаміка продажів
                </h2>
                <span className='text-xs text-[var(--text-muted)]'>
                  Дохід, ₴
                </span>
              </div>
              <div className='h-[300px] min-w-0'>
                {isLoading ? (
                  <output className='flex h-full items-center justify-center'>
                    <GridLoader
                      aria-hidden='true'
                      className='h-7 w-7 animate-spin motion-reduce:animate-none text-[var(--text-muted)]'
                    />
                    <span className='sr-only'>Завантаження статистики</span>
                  </output>
                ) : chartData.length ? (
                  <ResponsiveContainer width='100%' height={300} minWidth={0}>
                    <AreaChart
                      data={chartData}
                      accessibilityLayer
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke='var(--border-default)'
                        vertical={false}
                      />
                      <XAxis
                        dataKey='date'
                        stroke='var(--text-faint)'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={dateFormatter}
                        minTickGap={24}
                      />
                      <YAxis
                        stroke='var(--text-faint)'
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => `${value / 1000}k`}
                        width={48}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type='monotone'
                        name='Дохід'
                        dataKey='revenue'
                        stroke='var(--color-primary)'
                        strokeWidth={2}
                        fill='var(--color-primary)'
                        fillOpacity={0.06}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={<TrendingUp className='h-12 w-12' />}
                    title='Продажів за період немає'
                    description='Коли зʼявляться оплачені замовлення в обраному діапазоні, графік покаже динаміку доходу.'
                    className='h-full border-0 bg-transparent py-10'
                  />
                )}
              </div>
              {!isLoading && chartData.length > 0 && (
                <details className='mt-5 text-xs text-[var(--text-muted)]'>
                  <summary className='w-fit cursor-pointer py-2'>
                    Дані графіка у таблиці
                  </summary>
                  <table className='mt-2 w-full text-left tabular-nums'>
                    <caption className='sr-only'>Дохід за датами</caption>
                    <thead>
                      <tr>
                        <th scope='col' className='py-2 font-medium'>
                          Дата
                        </th>
                        <th scope='col' className='text-right font-medium'>
                          Дохід
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map(day => (
                        <tr
                          key={day.date}
                          className='border-t border-[var(--border-default)]'
                        >
                          <th scope='row' className='py-2 font-normal'>
                            {dateFormatter(day.date)}
                          </th>
                          <td className='text-right'>
                            {formatCurrency(day.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </section>
            <section
              aria-labelledby='admin-top-title'
              className='min-w-0 xl:border-l xl:border-[var(--border-default)] xl:pl-8'
            >
              <h2 id='admin-top-title' className='mb-6 text-lg font-medium'>
                Топ фільмів
              </h2>
              {isLoading ? (
                <div className='h-60 bg-[var(--surface-muted)]' />
              ) : stats?.topMovies.length ? (
                <ol className='divide-y divide-[var(--border-default)]'>
                  {stats.topMovies.map((movie, idx) => (
                    <li
                      key={`${idx}-${movie.movieTitle}`}
                      className='flex items-baseline gap-3 py-4 first:pt-0'
                    >
                      <span className='w-4 shrink-0 text-xs tabular-nums text-[var(--text-faint)]'>
                        {idx + 1}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <h3 className='text-sm font-medium leading-snug'>
                          {movie.movieTitle}
                        </h3>
                        <p className='mt-1 text-xs tabular-nums text-[var(--text-muted)]'>
                          {movie.ticketsSold} квитків
                        </p>
                      </div>
                      <span className='shrink-0 text-sm tabular-nums'>
                        {formatCurrency(movie.revenue)}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon={<Film className='h-12 w-12' />}
                  title='Топ фільмів ще порожній'
                  description='Рейтинг сформується після перших продажів квитків за обраний період.'
                  className='border-0 bg-transparent px-3 py-10'
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
