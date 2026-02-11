import { useState, useEffect } from 'react'
import { X, Save, RefreshCw } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import {
  type PricingDetailsDto,
  type SetPricingRuleDto,
} from '../../../services/adminPricingsService'
import { seatTypesService } from '../../../services/seatTypesService'
import { useQuery } from '@tanstack/react-query'

interface PricingRulesEditorProps {
  pricing: PricingDetailsDto
  onClose: () => void
  onSave: (id: string, rules: SetPricingRuleDto[]) => Promise<any>
}

const DAYS = [
  { id: 1, name: 'Пн' },
  { id: 2, name: 'Вт' },
  { id: 3, name: 'Ср' },
  { id: 4, name: 'Чт' },
  { id: 5, name: 'Пт' },
  { id: 6, name: 'Сб' },
  { id: 0, name: 'Нд' },
]

const SEPARATOR = '__'

const PricingRulesEditor = ({
  pricing,
  onClose,
  onSave,
}: PricingRulesEditorProps) => {
  const { data: seatTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['seat-types'],
    queryFn: seatTypesService.getAll,
    staleTime: Infinity,
  })

  const [matrix, setMatrix] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (pricing) {
      const initialMatrix: Record<string, number> = {}
      pricing.items.forEach(item => {
        const key = `${item.dayOfWeek}${SEPARATOR}${item.seatTypeId}`
        initialMatrix[key] = item.price
      })
      setMatrix(initialMatrix)
    }
  }, [pricing])

  const handlePriceChange = (day: number, typeId: string, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const key = `${day}${SEPARATOR}${typeId}`
    setMatrix(prev => ({ ...prev, [key]: numValue }))
  }

  const fillRow = (typeId: string, value: number) => {
    const updates: Record<string, number> = {}
    DAYS.forEach(d => {
      updates[`${d.id}${SEPARATOR}${typeId}`] = value
    })
    setMatrix(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const rules: SetPricingRuleDto[] = []

    Object.entries(matrix).forEach(([key, price]) => {
      const [dayStr, typeId] = key.split(SEPARATOR)

      if (dayStr && typeId) {
        rules.push({
          dayOfWeek: parseInt(dayStr),
          seatTypeId: typeId,
          price: price,
        })
      }
    })

    const res = await onSave(pricing.id, rules)
    setIsSaving(false)
    if (res.success) onClose()
    else alert(res.error)
  }

  if (isLoadingTypes)
    return (
      <div className='p-10 flex justify-center'>
        <GridLoader className='animate-spin' />
      </div>
    )

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in'>
      <div className='w-full max-w-5xl bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh]'>
        <div className='flex items-center justify-between border-b border-white/10 p-6'>
          <div>
            <h2 className='text-xl font-bold text-white'>
              Редагування цін: {pricing.name}
            </h2>
            <p className='text-sm text-[var(--text-muted)]'>
              Встановіть ціни для кожного типу місця та дня тижня
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 overflow-auto p-6'>
          <div className='border border-white/10 rounded-lg overflow-hidden'>
            <table className='w-full text-sm text-left'>
              <thead className='text-xs uppercase bg-white/5 text-[var(--text-muted)] font-medium'>
                <tr>
                  <th className='px-4 py-3 w-48'>Тип місця</th>
                  {DAYS.map(day => (
                    <th
                      key={day.id}
                      className='px-2 py-3 text-center w-24 border-l border-white/5'
                    >
                      {day.name}
                    </th>
                  ))}
                  <th className='px-4 py-3 w-10'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {seatTypes.map(type => (
                  <tr
                    key={type.id}
                    className='hover:bg-white/5 transition-colors'
                  >
                    <td className='px-4 py-3 font-bold text-white'>
                      {type.name}
                      <div className='text-[10px] font-normal text-[var(--text-muted)] line-clamp-1'>
                        {type.description}
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const price =
                        matrix[`${day.id}${SEPARATOR}${type.id}`] || 0
                      return (
                        <td
                          key={day.id}
                          className='p-2 border-l border-white/5'
                        >
                          <div className='relative group'>
                            <input
                              type='number'
                              min='0'
                              step='10'
                              value={price}
                              onChange={e =>
                                handlePriceChange(
                                  day.id,
                                  type.id,
                                  e.target.value,
                                )
                              }
                              className='w-full bg-[var(--bg-main)] border border-transparent focus:border-[var(--color-primary)] rounded px-2 py-1.5 text-center text-white font-medium focus:outline-none transition-all'
                            />
                            <span className='absolute right-2 top-1.5 text-[10px] text-[var(--text-muted)] pointer-events-none opacity-50'>
                              ₴
                            </span>
                          </div>
                        </td>
                      )
                    })}
                    <td className='px-2 text-center border-l border-white/5'>
                      <button
                        type='button'
                        onClick={() => {
                          const basePrice =
                            matrix[`${DAYS[0].id}${SEPARATOR}${type.id}`] || 150
                          fillRow(type.id, basePrice)
                        }}
                        className='p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white'
                        title='Заповнити весь рядок ціною понеділка'
                      >
                        <RefreshCw size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='p-6 border-t border-white/10 flex justify-end gap-3 bg-[var(--bg-card)] rounded-b-xl'>
          <button
            type='button'
            onClick={onClose}
            className='px-6 py-2 rounded-lg font-bold text-[var(--text-muted)] hover:text-white transition-colors'
          >
            Скасувати
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='flex items-center gap-2 bg-[var(--color-success)] text-white px-8 py-2 rounded-lg font-bold hover:brightness-110 shadow-lg shadow-[var(--color-success)]/20 transition-all'
          >
            {isSaving ? (
              <GridLoader className='animate-spin' />
            ) : (
              <Save size={18} />
            )}
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  )
}

export default PricingRulesEditor
