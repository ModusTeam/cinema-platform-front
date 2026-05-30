import { clsx } from 'clsx'
import {
  Armchair,
  Cpu,
  MousePointer2,
  PaintBucket,
  Ruler,
  Save,
} from 'lucide-react'
import { useMemo } from 'react'
import type { Seat, Technology } from '@/features/halls/model/hall.types'
import { useHallBuilder } from '../hooks/useHallBuilder'

const getSeatColor = (typeName: string = 'Standard') => {
  const lowerName = typeName.toLowerCase()
  if (lowerName.includes('vip') || lowerName.includes('lux'))
    return 'bg-yellow-500'
  if (lowerName.includes('love') || lowerName.includes('sofa'))
    return 'bg-pink-500'
  return 'bg-[var(--color-primary)]'
}

interface HallBuilderProps {
  initialRows?: number
  initialCols?: number
  initialSeats?: Seat[]
  initialTechnologies?: Technology[]
  onSave: (data: any) => void
  isEditing?: boolean
}

const HallBuilder = ({
  initialRows,
  initialCols,
  initialSeats,
  initialTechnologies = [],
  onSave,
  isEditing = false,
}: HallBuilderProps) => {
  const initialTechIds = useMemo(
    () => initialTechnologies.map(t => t.id),
    [initialTechnologies],
  )

  const {
    rows,
    setRows,
    cols,
    setCols,
    availableSeatTypes,
    availableTechnologies,
    selectedPaintType,
    setSelectedPaintType,
    selectedTechIds,
    toggleTech,
    gridConfig,
    handleCellClick,
  } = useHallBuilder(initialSeats, initialRows, initialCols, initialTechIds)

  const handleSave = () => {
    if (!availableSeatTypes.length) return
    const primaryType =
      availableSeatTypes.find(t => t.name.toLowerCase().includes('standard')) ||
      availableSeatTypes[0]
    const configArray = []

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const key = `${x}-${y}`
        const typeId = gridConfig.get(key) || primaryType.id
        configArray.push({ gridX: x + 1, gridY: y + 1, seatTypeId: typeId })
      }
    }

    onSave({
      rows,
      cols,
      technologyIds: selectedTechIds,
      primarySeatTypeId: primaryType.id,
      seatConfig: configArray,
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-6 rounded-xl border border-white/10 bg-[var(--bg-card)] p-6'>
        <div className='flex flex-wrap gap-8'>
          <div className='flex flex-col gap-3'>
            <h4 className='text-sm font-medium text-[var(--text-muted)] flex items-center gap-2'>
              <Ruler size={16} /> Розміри залу
            </h4>
            <div className='flex gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-[var(--text-muted)]'>
                  Рядів
                </label>
                <input
                  type='number'
                  min={1}
                  max={20}
                  value={rows}
                  onChange={e => setRows(Number(e.target.value))}
                  disabled={isEditing}
                  className='w-20 rounded bg-[var(--bg-main)] px-3 py-2 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[var(--color-primary)] focus:outline-none'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-[var(--text-muted)]'>
                  Місць в ряду
                </label>
                <input
                  type='number'
                  min={1}
                  max={30}
                  value={cols}
                  onChange={e => setCols(Number(e.target.value))}
                  disabled={isEditing}
                  className='w-20 rounded bg-[var(--bg-main)] px-3 py-2 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus:border-[var(--color-primary)] focus:outline-none'
                />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <h4 className='text-sm font-medium text-[var(--text-muted)] flex items-center gap-2'>
              <PaintBucket size={16} /> Тип для малювання
            </h4>
            <div className='flex flex-wrap gap-2'>
              {availableSeatTypes.map(type => {
                const isSelected = selectedPaintType?.id === type.id
                return (
                  <button
                    type='button'
                    key={type.id}
                    onClick={() => setSelectedPaintType(type)}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                      isSelected
                        ? 'border-white bg-white/10 text-white shadow-lg'
                        : 'border-transparent hover:bg-white/5 text-[var(--text-muted)]',
                    )}
                  >
                    <div
                      className={`h-4 w-4 rounded ${getSeatColor(type.name)} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-card)]' : ''}`}
                    />
                    {type.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <hr className='border-white/5' />

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <span className='text-xs text-[var(--text-muted)] flex items-center gap-1 uppercase tracking-wider'>
              <Cpu size={12} /> Технології
            </span>
            <div className='flex flex-wrap gap-2'>
              {availableTechnologies.map(tech => (
                <button
                  key={tech.id}
                  type='button'
                  onClick={() => toggleTech(tech.id)}
                  className={clsx(
                    'px-3 py-1 text-xs rounded-full border transition-all',
                    selectedTechIds.includes(tech.id)
                      ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'bg-[var(--bg-main)] border-white/10 text-[var(--text-muted)] hover:border-white/30',
                  )}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
          <button
            type='button'
            onClick={handleSave}
            className='flex items-center gap-2 rounded-lg bg-[var(--color-success)] px-6 py-3 text-sm font-bold text-white hover:brightness-110 ml-auto shadow-lg shadow-[var(--color-success)]/20'
          >
            <Save size={18} />{' '}
            {isEditing ? 'Зберегти зміни' : 'Згенерувати зал'}
          </button>
        </div>
      </div>

      <div className='relative overflow-hidden rounded-xl border border-white/10 bg-[var(--bg-card)] p-8'>
        <div className='mt-10 w-full flex justify-center'>
          <div className='w-2/3 h-2 bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent rounded-full shadow-[0_5px_15px_rgba(239,68,68,0.2)]' />
        </div>
        <p className='text-center text-xs text-[var(--text-muted)] mb-4 uppercase tracking-widest'>
          Екран
        </p>
        <div className='absolute top-4 right-4 text-xs text-[var(--text-muted)] flex items-center gap-1'>
          <MousePointer2 size={12} /> Натисніть, щоб змінити тип
        </div>
        <div
          className='grid gap-2 mx-auto w-fit transition-all duration-300'
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(30px, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const x = i % cols
            const y = Math.floor(i / cols)
            const configTypeId = gridConfig.get(`${x}-${y}`)
            const displayType = configTypeId
              ? availableSeatTypes.find(t => t.id === configTypeId)
              : availableSeatTypes.find(t =>
                  t.name.toLowerCase().includes('standard'),
                )

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={clsx(
                  'h-8 w-8 rounded flex items-center justify-center text-[10px] select-none shadow-lg cursor-pointer hover:opacity-80 transition-transform active:scale-95',
                  getSeatColor(displayType?.name),
                  'text-white',
                )}
                title={`Row: ${y}, Num: ${x} (${displayType?.name})`}
              >
                <Armchair size={16} fill='currentColor' />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HallBuilder
