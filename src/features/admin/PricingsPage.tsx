import { useState } from 'react'
import { usePricings } from './hooks/usePricings'
import { Plus, Tag, Edit, Layers, CalendarRange } from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import PricingModal from './components/PricingModal'
import PricingRulesEditor from './components/PricingRulesEditor'
import type { PricingDetailsDto } from '../../services/adminPricingsService'

const PricingsPage = () => {
  const { pricings, isLoading, createPricing, updateRules } = usePricings()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] =
    useState<PricingDetailsDto | null>(null)

  const getPriceRange = (items: any[]) => {
    if (!items || items.length === 0) return 'Не налаштовано'
    const prices = items.map(i => i.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `${min} ₴` : `${min} - ${max} ₴`
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Тарифи</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Управління ціновими політиками для сеансів
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsCreateModalOpen(true)}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> Новий тариф
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {pricings.length === 0 && (
            <div className='col-span-full flex flex-col items-center justify-center py-20 text-[var(--text-muted)] border border-dashed border-white/10 rounded-xl bg-[var(--bg-card)]/30'>
              <Tag className='mb-4 opacity-50' size={48} />
              <p>
                Тарифів ще немає. Створіть перший тариф, щоб почати продаж
                квитків.
              </p>
            </div>
          )}

          {pricings.map(price => (
            <div
              key={price.id}
              className='group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[var(--bg-card)] transition-all hover:border-[var(--color-primary)]/30 hover:shadow-xl hover:-translate-y-1'
            >
              <div className='p-6 flex-1'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-inner'>
                    <Tag size={24} />
                  </div>
                </div>

                <h3 className='text-xl font-bold text-white mb-2 line-clamp-1'>
                  {price.name}
                </h3>

                <div className='flex flex-col gap-3 mt-6 p-4 bg-[var(--bg-main)]/50 rounded-lg border border-white/5'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-[var(--text-muted)] flex items-center gap-2'>
                      <Layers size={14} /> Правил цін:
                    </span>
                    <span className='text-white font-bold'>
                      {price.items?.length || 0}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-[var(--text-muted)] flex items-center gap-2'>
                      <CalendarRange size={14} /> Діапазон:
                    </span>
                    <span className='text-[var(--color-success)] font-bold font-mono bg-[var(--color-success)]/10 px-2 py-0.5 rounded'>
                      {getPriceRange(price.items)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type='button'
                onClick={() => setEditingPricing(price)}
                className='w-full py-4 bg-white/5 hover:bg-[var(--color-primary)] hover:text-white text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] transition-all border-t border-white/5 flex items-center justify-center gap-2'
              >
                <Edit size={14} /> Редагувати ціни
              </button>
            </div>
          ))}
        </div>
      )}

      <PricingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createPricing}
      />

      {editingPricing && (
        <PricingRulesEditor
          pricing={editingPricing}
          onClose={() => setEditingPricing(null)}
          onSave={updateRules}
        />
      )}
    </div>
  )
}

export default PricingsPage
