import { useEffect, useState } from 'react'
import {
  DollarSign,
  Ticket,
  Film,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  adminStatsService,
  type DashboardStatsDto,
} from '../../services/adminStatsService'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  trendPercent?: number
  isLoading: boolean
  subText?: string
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trendPercent,
  isLoading,
  subText,
}: StatCardProps) => {
  const isPositive = (trendPercent || 0) >= 0

  return (
    <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] p-6 backdrop-blur-sm shadow-lg hover:border-[var(--color-primary)]/20 transition-all duration-300'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-medium text-[var(--text-muted)]'>
          {title}
        </h3>
        <div
          className={`p-2 rounded-lg bg-white/5 ${isLoading ? 'animate-pulse' : ''}`}
        >
          <Icon className='h-5 w-5 text-[var(--color-primary)]' />
        </div>
      </div>

      <div className='space-y-1'>
        {isLoading ? (
          <div className='h-8 w-32 animate-pulse rounded bg-white/5' />
        ) : (
          <div className='text-3xl font-bold text-white tracking-tight'>
            {value}
          </div>
        )}

        <div className='flex items-center gap-2 h-5'>
          {!isLoading && trendPercent !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
            >
              {isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {Math.abs(trendPercent)}%
            </div>
          )}
          {!isLoading && subText && (
            <span className='text-xs text-[var(--text-muted)]'>{subText}</span>
          )}
        </div>
      </div>
    </div>
  )
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dateStr = new Date(label).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    return (
      <div className='rounded-lg border border-white/10 bg-[#1a1a1a]/95 p-3 shadow-xl backdrop-blur-md'>
        <p className='text-xs font-medium text-[var(--text-muted)] mb-1'>
          {dateStr}
        </p>
        <p className='text-sm font-bold text-white'>
          {new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const to = new Date()
        const from = new Date()
        if (dateRange === '7d') from.setDate(to.getDate() - 7)
        if (dateRange === '30d') from.setDate(to.getDate() - 30)
        if (dateRange === '90d') from.setDate(to.getDate() - 90)

        const data = await adminStatsService.getDashboardStats(from, to)
        setStats(data)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [dateRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const chartData = stats?.salesChart || []

  const dateFormatter = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Панель управління</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Огляд ключових показників ефективності кінотеатру
          </p>
        </div>

        <div className='bg-[var(--bg-card)] p-1 rounded-xl border border-white/10 flex w-fit'>
          {['7d', '30d', '90d'].map(range => (
            <button
              type='button'
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRange === range
                  ? 'bg-[var(--color-primary)] text-white shadow-lg'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              {range === '7d'
                ? 'Тиждень'
                : range === '30d'
                  ? 'Місяць'
                  : 'Квартал'}
            </button>
          ))}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Загальний дохід'
          value={stats ? formatCurrency(stats.totalRevenue) : '0 ₴'}
          icon={DollarSign}
          trendPercent={stats?.revenueChangePercent}
          subText='від попереднього періоду'
          isLoading={isLoading}
        />
        <StatCard
          title='Продано квитків'
          value={stats?.ticketsSold || 0}
          icon={Ticket}
          trendPercent={stats?.ticketsChangePercent}
          subText='від попереднього періоду'
          isLoading={isLoading}
        />
        <StatCard
          title='Заповнюваність залів'
          value={`${stats?.occupancyRate || 0}%`}
          icon={Users}
          trendPercent={stats?.occupancyChangePercent}
          subText='середній показник'
          isLoading={isLoading}
        />
        <StatCard
          title='Активні фільми'
          value={stats?.activeMoviesCount || 0}
          icon={Film}
          subText='у прокаті зараз'
          isLoading={isLoading}
        />
      </div>

      <div className='grid lg:grid-cols-[2fr_1fr] gap-8'>
        <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] p-6 backdrop-blur-sm shadow-lg flex flex-col min-h-[400px]'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='font-bold text-white flex items-center gap-2'>
              <TrendingUp size={18} className='text-[var(--color-primary)]' />
              Динаміка продажів
            </h3>
          </div>

          <div className='flex-1 w-full min-h-0'>
            {isLoading ? (
              <div className='w-full h-full flex items-center justify-center'>
                <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width='99%' height='100%'>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='colorRevenue'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor='var(--color-primary)'
                        stopOpacity={0.3}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-primary)'
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#ffffff10'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    stroke='#71717a'
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={dateFormatter}
                  />
                  <YAxis
                    stroke='#71717a'
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value / 1000}k`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='var(--color-primary)'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorRevenue)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm'>
                Немає даних за цей період
              </div>
            )}
          </div>
        </div>

        <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] p-6 backdrop-blur-sm shadow-lg h-fit'>
          <h3 className='font-bold text-white mb-6 flex items-center gap-2'>
            <Film size={18} className='text-yellow-500' />
            Топ фільмів
          </h3>

          <div className='space-y-4'>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className='h-12 w-full animate-pulse rounded bg-white/5'
                />
              ))
            ) : stats?.topMovies && stats.topMovies.length > 0 ? (
              stats.topMovies.map((movie, idx) => (
                <div
                  key={idx}
                  className='group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5'
                >
                  <div className='flex items-center gap-3 overflow-hidden'>
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded font-black text-sm shrink-0 ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-[var(--text-muted)]'}`}
                    >
                      {idx + 1}
                    </div>
                    <div className='truncate'>
                      <div
                        className='text-sm font-bold text-white truncate'
                        title={movie.movieTitle}
                      >
                        {movie.movieTitle}
                      </div>
                      <div className='text-[10px] text-[var(--text-muted)]'>
                        {movie.ticketsSold} квитків
                      </div>
                    </div>
                  </div>
                  <div className='text-xs font-bold text-[var(--color-primary)] whitespace-nowrap'>
                    {formatCurrency(movie.revenue)}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-[var(--text-muted)] text-sm py-10'>
                Список порожній
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
