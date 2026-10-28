import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { seatTypesService } from '@/entities/hall/api/seat-types.service'
import type {
  PricingDetailsDto,
  SetPricingRuleDto,
} from '@/features/admin/api/admin-pricings.service'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'
import { AdminTable } from './AdminTable'

interface PricingRulesEditorProps {
  pricing: PricingDetailsDto
  onClose: () => void
  onSave: (
    id: string,
    rules: SetPricingRuleDto[],
  ) => Promise<{
    success: boolean
    error?: string
  }>
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
  const {
    data: seatTypes = [],
    isLoading: isLoadingTypes,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['seat-types'],
    queryFn: seatTypesService.getAll,
    staleTime: Infinity,
  })

  const [matrix, setMatrix] = useState<Record<string, number | string>>({})
  const toast = useToast()
  const [isDirty, setIsDirty] = useState(false)

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
    if (value !== '' && Number.isNaN(numValue)) return
    setIsDirty(true)

    const key = `${day}${SEPARATOR}${typeId}`
    setMatrix(prev => ({ ...prev, [key]: value === '' ? '' : numValue }))
  }

  const fillRow = (typeId: string, value: number) => {
    setIsDirty(true)
    const updates: Record<string, number> = {}
    DAYS.forEach(d => {
      updates[`${d.id}${SEPARATOR}${typeId}`] = value
    })
    setMatrix(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    const rules: SetPricingRuleDto[] = []

    Object.entries(matrix).forEach(([key, price]) => {
      const [dayStr, typeId] = key.split(SEPARATOR)

      if (price === '' || !Number.isFinite(Number(price)) || Number(price) < 0)
        throw new Error('Вкажіть невідʼємну ціну для кожної зміненої клітинки.')
      if (dayStr && typeId) {
        rules.push({
          dayOfWeek: parseInt(dayStr, 10),
          seatTypeId: typeId,
          price: Number(price),
        })
      }
    })

    const res = await onSave(pricing.id, rules)
    if (!res.success) throw new Error(res.error || 'Не вдалося зберегти ціни')
    toast.success('Ціни оновлено')
    onClose()
  }

  return (
    <FormDialog
      isOpen
      onClose={onClose}
      onSubmit={handleSave}
      title={`Редагування цін: ${pricing.name}`}
      description='Встановіть ціни для кожного типу місця та дня тижня. Перевірте зміни перед збереженням.'
      className='max-w-5xl'
      isDirty={isDirty}
      submitDisabled={isLoadingTypes || isError || seatTypes.length === 0}
    >
      {isLoadingTypes ? (
        <output className='flex justify-center py-10'>
          <GridLoader aria-hidden='true' />
          <span className='sr-only'>Завантажуємо типи місць</span>
        </output>
      ) : isError && seatTypes.length === 0 ? (
        <UnavailableState
          onRetry={() => void refetch()}
          className='border-0 bg-transparent'
        />
      ) : seatTypes.length === 0 ? (
        <EmptyState
          icon={<Tag className='h-12 w-12' />}
          title='Типів місць ще немає'
          description='Додайте типи місць, щоб налаштувати правила цін.'
          className='border-0 bg-transparent'
        />
      ) : (
        <AdminTable label='Ціни за днями тижня'>
          <table className='w-full min-w-[1000px] table-fixed text-sm text-left'>
            <caption className='sr-only'>
              Ціни у гривнях за типами місць і днями тижня
            </caption>
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
                    const price = matrix[`${day.id}${SEPARATOR}${type.id}`] ?? 0
                    return (
                      <td key={day.id} className='p-2 border-l border-white/5'>
                        <div className='relative group'>
                          <input
                            type='number'
                            aria-label={`${type.name}, ${day.name}, ціна у гривнях`}
                            required
                            min='0'
                            step='any'
                            value={price}
                            onChange={e =>
                              handlePriceChange(day.id, type.id, e.target.value)
                            }
                            className='field px-2 text-center tabular-nums'
                          />
                        </div>
                      </td>
                    )
                  })}
                  <td className='px-2 text-center border-l border-white/5'>
                    <button
                      type='button'
                      onClick={() => {
                        const basePrice =
                          matrix[`${DAYS[0].id}${SEPARATOR}${type.id}`] ?? 150
                        fillRow(type.id, Number(basePrice))
                      }}
                      className='action action-ghost w-11 px-0'
                      title='Заповнити весь рядок ціною понеділка'
                      aria-label={`Заповнити ціною понеділка: ${type.name}`}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      )}
    </FormDialog>
  )
}

export default PricingRulesEditor
