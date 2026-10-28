import { clsx } from 'clsx'
import {
  Armchair,
  Cpu,
  Eraser,
  MousePointer2,
  PaintBucket,
  Ruler,
  Save,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import {
  getGridCells,
  seatCoordinateKey,
  serializeSeats,
} from '@/entities/hall/lib/seatGeometry'
import type { Seat, Technology } from '@/entities/hall/model/hall.types'
import type {
  HallBuilderData,
  HallSaveScope,
} from '@/features/admin/model/hallBuilder.types'
import { useHallBuilder } from '@/features/admin/model/useHallBuilder'
import Button from '@/shared/ui/Button'
import ConfirmModal from '@/shared/ui/modals/ConfirmModal'
import UnavailableState from '@/shared/ui/UnavailableState'
import { HALL_EDITOR_LIMITS } from '../config/hallEditor.config'
import { seatsOutsideBounds } from '../lib/hallPainting'

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
  onSave: (data: HallBuilderData, scope: HallSaveScope) => void
  isEditing?: boolean
  layoutLocked?: boolean
}

const HallBuilder = ({
  initialRows,
  initialCols,
  initialSeats,
  initialTechnologies = [],
  onSave,
  isEditing = false,
  layoutLocked = false,
}: HallBuilderProps) => {
  const initialTechIds = useMemo(
    () => initialTechnologies.map(t => t.id),
    [initialTechnologies],
  )

  const {
    rows,
    cols,
    maxRows,
    maxCols,
    requestResize,
    pendingResize,
    setPendingResize,
    applyResize,
    availableSeatTypes,
    availableTechnologies,
    selectedPaintType,
    selectPaintType,
    primaryType,
    tool,
    setTool,
    selectedTechIds,
    toggleTech,
    gridConfig,
    handleCellClick,
    isLoading,
    isError,
    retry,
  } = useHallBuilder(
    initialSeats,
    initialRows,
    initialCols,
    initialTechIds,
    isEditing,
  )
  const dragPointer = useRef<number | null>(null)
  const [rowInput, setRowInput] = useState(String(rows))
  const [colInput, setColInput] = useState(String(cols))
  const dimensionsChanged =
    Number(rowInput) !== rows || Number(colInput) !== cols
  const validDimensions =
    Number.isInteger(Number(rowInput)) &&
    Number.isInteger(Number(colInput)) &&
    Number(rowInput) >= 1 &&
    Number(rowInput) <= maxRows &&
    Number(colInput) >= 1 &&
    Number(colInput) <= maxCols
  const cells = useMemo(() => getGridCells(rows, cols), [rows, cols])
  const typesById = new Map(
    availableSeatTypes.map(type => [type.id, type.name]),
  )
  initialSeats?.forEach(seat => {
    if (!typesById.has(seat.seatTypeId))
      typesById.set(seat.seatTypeId, seat.seatTypeName)
  })
  const canSaveLayout =
    !isLoading &&
    !isError &&
    !!primaryType &&
    !!gridConfig?.size &&
    gridConfig.size <= HALL_EDITOR_LIMITS.seats &&
    !dimensionsChanged &&
    validDimensions

  const handleSave = (scope: HallSaveScope) => {
    if (scope === 'all' && !canSaveLayout) return
    onSave(
      {
        rows,
        cols,
        technologyIds: selectedTechIds,
        primarySeatTypeId: primaryType?.id ?? '',
        seatConfig: serializeSeats(gridConfig?.values() ?? []),
      },
      scope,
    )
  }

  return (
    <div className='grid min-w-0 grid-cols-1 gap-6'>
      {isError && (
        <UnavailableState
          title='Не вдалося завантажити типи місць або технології'
          onRetry={retry}
        />
      )}
      {isEditing && (
        <p className='text-sm text-[var(--text-muted)]'>
          {layoutLocked
            ? 'Схему та типи місць заблоковано через історію сеансів або пов’язані записи. Зміни залишилися в редакторі. Назву й технології можна зберегти окремо.'
            : 'Схему та типи місць можна змінювати лише без історії сеансів і пов’язаних записів. Назва й технології редагуються окремо.'}
        </p>
      )}
      <div className='flex flex-col gap-6 rounded-xl border border-white/10 bg-[var(--bg-card)] p-6'>
        <div className='flex flex-wrap gap-8'>
          <div className='flex flex-col gap-3'>
            <h4 className='text-sm font-medium text-[var(--text-muted)] flex items-center gap-2'>
              <Ruler size={16} /> Розміри залу
            </h4>
            <div className='flex gap-4'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='hall-rows' className='field-label'>
                  Рядів
                </label>
                <input
                  id='hall-rows'
                  aria-invalid={!validDimensions}
                  aria-describedby={
                    !validDimensions ? 'hall-dimensions-error' : undefined
                  }
                  type='number'
                  min={1}
                  max={maxRows}
                  value={rowInput}
                  onChange={e => setRowInput(e.target.value)}
                  className='field w-24'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='hall-cols' className='field-label'>
                  Стовпців
                </label>
                <input
                  id='hall-cols'
                  aria-invalid={!validDimensions}
                  aria-describedby={
                    !validDimensions ? 'hall-dimensions-error' : undefined
                  }
                  type='number'
                  min={1}
                  max={maxCols}
                  value={colInput}
                  onChange={e => setColInput(e.target.value)}
                  className='field w-24'
                />
              </div>
              <Button
                type='button'
                disabled={!validDimensions || !dimensionsChanged}
                onClick={() => {
                  setRowInput(String(Number(rowInput)))
                  setColInput(String(Number(colInput)))
                  requestResize(Number(rowInput), Number(colInput))
                }}
                variant='secondary'
                className='self-end px-3'
              >
                Застосувати
              </Button>
            </div>
            {!validDimensions && (
              <p
                id='hall-dimensions-error'
                role='alert'
                className='field-error'
              >
                Рядів: 1–{maxRows}, стовпців: 1–{maxCols}. Вкажіть цілі числа.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-3'>
            <h4 className='text-sm font-medium text-[var(--text-muted)] flex items-center gap-2'>
              <PaintBucket size={16} /> Намалювати місце
            </h4>
            <div className='flex flex-wrap gap-2'>
              {availableSeatTypes.map(type => {
                const isSelected =
                  tool === 'paint' && selectedPaintType?.id === type.id
                return (
                  <button
                    type='button'
                    key={type.id}
                    onClick={() => selectPaintType(type.id)}
                    aria-pressed={isSelected}
                    className={clsx(
                      'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                      isSelected
                        ? 'border-[var(--selection-border)] bg-[var(--selection-bg)] text-[var(--text-main)]'
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
              <button
                type='button'
                aria-pressed={tool === 'erase'}
                onClick={() => setTool('erase')}
                className={clsx(
                  'flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  tool === 'erase'
                    ? 'border-[var(--selection-border)] bg-[var(--selection-bg)] text-[var(--text-main)]'
                    : 'border-transparent text-[var(--text-muted)] hover:bg-white/5',
                )}
              >
                <Eraser size={16} /> Стерти місце
              </button>
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
                  aria-pressed={selectedTechIds.includes(tech.id)}
                  className={clsx(
                    'min-h-11 px-3 py-2 text-sm rounded-md border transition-all',
                    selectedTechIds.includes(tech.id)
                      ? 'bg-[var(--selection-bg)] border-[var(--selection-border)] text-[var(--text-main)]'
                      : 'bg-[var(--bg-main)] border-white/10 text-[var(--text-muted)] hover:border-white/30',
                  )}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
          {isEditing && (
            <Button
              type='button'
              onClick={() => handleSave('metadata')}
              variant='secondary'
            >
              Зберегти лише назву та технології
            </Button>
          )}
          <Button
            type='button'
            onClick={() => handleSave('all')}
            disabled={!canSaveLayout}
            variant='success'
            className='ml-auto px-6 py-3'
          >
            <Save size={18} />{' '}
            {isEditing ? 'Зберегти зміни' : 'Згенерувати зал'}
          </Button>
        </div>
        <output className='block text-sm text-[var(--text-muted)]'>
          Місць: {gridConfig?.size ?? 0}
          {dimensionsChanged &&
            ' · Застосуйте нові розміри перед збереженням схеми.'}
          {gridConfig?.size === 0 &&
            ' · Додайте хоча б одне місце для збереження схеми.'}
          {gridConfig?.size === HALL_EDITOR_LIMITS.seats &&
            ' · Досягнуто ліміту місць.'}
        </output>
      </div>

      <div className='relative overflow-x-auto rounded-xl border border-white/10 bg-[var(--bg-card)] p-4 sm:p-8'>
        <div className='mt-10 w-full flex justify-center'>
          <div className='w-2/3 h-2 bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent rounded-full shadow-[0_5px_15px_rgba(239,68,68,0.2)]' />
        </div>
        <p className='text-center text-xs text-[var(--text-muted)] mb-4 uppercase tracking-widest'>
          Екран
        </p>
        <div className='absolute top-4 right-4 text-xs text-[var(--text-muted)] flex items-center gap-1'>
          <MousePointer2 size={12} /> Натисніть або проведіть мишею
        </div>
        <div
          className='grid gap-2 mx-auto w-fit'
          style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}
        >
          {cells.map(cell => {
            const { gridX: x, gridY: y } = cell
            const seat = gridConfig?.get(seatCoordinateKey(cell))
            const typeName = seat
              ? (typesById.get(seat.seatTypeId) ?? 'Тип місця')
              : undefined
            const label = `Ряд ${y}, стовпець ${x}: ${seat ? typeName : 'порожня клітинка'}`

            return (
              <button
                key={`${x}-${y}`}
                type='button'
                onClick={() => handleCellClick(x, y)}
                onPointerDown={event => {
                  if (event.pointerType !== 'mouse' || event.button !== 0)
                    return
                  dragPointer.current = event.pointerId
                  handleCellClick(x, y)
                }}
                onPointerEnter={event => {
                  if (
                    event.pointerId === dragPointer.current &&
                    event.buttons === 1
                  )
                    handleCellClick(x, y)
                }}
                onPointerUp={() => {
                  dragPointer.current = null
                }}
                onPointerCancel={() => {
                  dragPointer.current = null
                }}
                disabled={gridConfig === null}
                aria-label={label}
                className={clsx(
                  'h-8 w-8 rounded flex items-center justify-center text-[10px] select-none cursor-pointer hover:opacity-80 motion-safe:transition-transform motion-safe:active:scale-95',
                  seat
                    ? getSeatColor(typeName)
                    : 'border border-dashed border-white/15 bg-transparent',
                  'text-white',
                )}
                title={label}
              >
                {seat ? (
                  <Armchair size={16} fill='currentColor' />
                ) : (
                  <span aria-hidden='true' className='text-[var(--text-faint)]'>
                    +
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <ConfirmModal
        isOpen={pendingResize !== null}
        onClose={() => {
          setPendingResize(null)
          setRowInput(String(rows))
          setColInput(String(cols))
        }}
        onConfirm={() => {
          if (pendingResize) applyResize(pendingResize.rows, pendingResize.cols)
        }}
        title='Зменшити схему залу?'
        message={`За новими межами буде видалено місць: ${pendingResize ? seatsOutsideBounds(gridConfig?.values() ?? [], pendingResize.rows, pendingResize.cols).length : 0}. Інші порожні клітинки залишаться порожніми.`}
        confirmText='Зменшити та видалити'
        isDestructive
      />
    </div>
  )
}

export default HallBuilder
