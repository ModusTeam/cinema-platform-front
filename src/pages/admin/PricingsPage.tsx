import { CalendarRange, Edit, Layers, Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import type { PricingDetailsDto } from '@/features/admin/api/admin-pricings.service'
import { getPriceRange } from '@/features/admin/lib/pricingDisplay'
import { usePricings } from '@/features/admin/model/usePricings'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import PricingModal from '@/features/admin/ui/PricingModal'
import PricingRulesEditor from '@/features/admin/ui/PricingRulesEditor'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'

const PricingsPage = () => {
  const { pricings, isLoading, isError, refetch, createPricing, updateRules } =
    usePricings()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] =
    useState<PricingDetailsDto | null>(null)

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title='Тарифи'
        description='Управління ціновими політиками для сеансів'
      >
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> Новий тариф
        </Button>
      </AdminPageHeader>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : isError && pricings.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {pricings.length === 0 && (
            <EmptyState
              icon={<Tag className='h-12 w-12' />}
              title='Тарифів ще немає'
              description='Створіть перший тариф і налаштуйте правила цін, щоб почати продаж квитків.'
              actionLabel='Новий тариф'
              onAction={() => setIsCreateModalOpen(true)}
              className='col-span-full py-20'
            />
          )}

          {pricings.map(price => (
            <div
              key={price.id}
              className='relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-muted)]'
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
