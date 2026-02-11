import type { Hall, Seat } from '../../../types/hall'
import { Armchair } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import { useMemo } from 'react'

interface SeatSelectorProps {
  hall: Hall
  selectedSeats: Seat[]
  onToggleSeat: (seat: Seat) => void
  lockingSeatId?: string | null
  occupiedSeatIds?: string[]
}

const getSeatTypeStyle = (typeName: string = 'Standard') => {
  const lowerName = typeName.toLowerCase()
  if (lowerName.includes('vip') || lowerName.includes('lux'))
    return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'
  if (lowerName.includes('love') || lowerName.includes('sofa'))
    return 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]'

  return 'text-zinc-500 hover:text-zinc-300'
}

const SeatSelector = ({
  hall,
  selectedSeats,
  onToggleSeat,
  lockingSeatId,
  occupiedSeatIds = [],
}: SeatSelectorProps) => {
  const cols = hall.colsCount || 10
  const rows = hall.rowsCount || 10

  const occupiedSet = useMemo(() => {
    console.log('Occupied IDs in Selector:', occupiedSeatIds)
    return new Set(occupiedSeatIds.map(id => id.toLowerCase()))
  }, [occupiedSeatIds])

  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    hall.seats.forEach(s => types.add(s.seatTypeName))
    return Array.from(types)
  }, [hall.seats])

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]'>
        <div className='flex items-center gap-2'>
          <Armchair size={18} className='text-zinc-600' />
          <span>Вільне</span>
        </div>
        <div className='flex items-center gap-2'>
          <Armchair
            size={18}
            className='text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]'
            fill='currentColor'
          />
          <span className='text-white'>Обране</span>
        </div>
        <div className='flex items-center gap-2'>
          <Armchair
            size={18}
            className='text-zinc-800'
            fill='currentColor'
            fillOpacity={0.2}
          />
          <span className='opacity-40'>Зайнято</span>
        </div>

        {availableTypes.map(type => {
          if (type.toLowerCase() === 'standard') return null
          return (
            <div key={type} className='flex items-center gap-2'>
              <Armchair
                size={18}
                className={getSeatTypeStyle(type)}
                fill='currentColor'
                fillOpacity={0.2}
              />
              <span>{type}</span>
            </div>
          )
        })}
      </div>

      <div className='relative w-full overflow-x-auto rounded-3xl border border-white/5 bg-[var(--bg-card)] p-8 sm:p-12 shadow-2xl'>
        <div className='relative mx-auto mb-16 w-3/4 max-w-lg perspective-[500px]'>
          <div className='h-12 w-full bg-gradient-to-b from-[var(--color-primary)]/20 to-transparent transform rotateX(-45deg) origin-bottom rounded-t-3xl blur-md opacity-50 absolute -top-8 left-0'></div>
          <div className='h-2 w-full rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent shadow-[0_0_30px_rgba(239,68,68,0.6)] relative z-10' />
          <p className='mt-6 text-center text-[10px] font-black tracking-[0.5em] text-[var(--text-muted)] uppercase opacity-60'>
            Екран
          </p>
        </div>

        <div
          className='grid gap-y-3 gap-x-2 mx-auto w-fit'
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(32px, 1fr))`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const x = index % cols
            const y = Math.floor(index / cols)

            const seat = hall.seats.find(s => s.gridX === x && s.gridY === y)

            if (!seat) return <div key={index} />

            const isOccupied =
              occupiedSet.has(seat.id.toLowerCase()) ||
              seat.status === 'Sold' ||
              seat.status === 'Locked'
            const isSelected = selectedSeats.some(s => s.id === seat.id)
            const isLocking = lockingSeatId === seat.id

            let seatClasses =
              'transition-all duration-300 transform outline-none '
            let iconFill = 'none'
            let fillOpacity = 0

            if (isOccupied) {
              seatClasses += 'text-zinc-800 cursor-not-allowed opacity-60'
              iconFill = 'currentColor'
              fillOpacity = 0.2
            } else if (isLocking) {
              seatClasses +=
                'text-[var(--color-primary)] opacity-50 cursor-wait scale-90'
            } else if (isSelected) {
              seatClasses +=
                'text-[var(--color-primary)] scale-110 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] z-10'
              iconFill = 'currentColor'
              fillOpacity = 1
            } else {
              seatClasses +=
                getSeatTypeStyle(seat.seatTypeName) +
                ' hover:scale-125 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] opacity-80'

              if (seat.seatTypeName.toLowerCase().includes('vip')) {
                iconFill = 'currentColor'
                fillOpacity = 0.3
              }
            }

            return (
              <button
                type='button'
                key={seat.id}
                disabled={isLocking || isOccupied}
                onClick={() => onToggleSeat(seat)}
                className={`group relative flex h-8 w-8 items-center justify-center ${seatClasses}`}
                title={
                  isOccupied
                    ? `Місце зайняте (Ряд ${seat.row}, Місце ${seat.number})`
                    : `Ряд ${seat.row}, Місце ${seat.number} (${seat.seatTypeName})`
                }
              >
                {isLocking ? (
                  <GridLoader size={16} className='animate-spin' />
                ) : (
                  <Armchair
                    size={
                      isSelected ||
                      seat.seatTypeName.toLowerCase().includes('vip')
                        ? 24
                        : 20
                    }
                    strokeWidth={2}
                    fill={iconFill}
                    fillOpacity={fillOpacity}
                  />
                )}

                {!isLocking && !isOccupied && (
                  <div className='absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-20 scale-90 group-hover:scale-100'>
                    Ряд {seat.row} / {seat.number}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SeatSelector
