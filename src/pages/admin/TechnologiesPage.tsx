import { Cpu, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTechnologies } from '@/features/admin/model/useTechnologies'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import CreateTechnologyModal from '@/features/admin/ui/CreateTechnologyModal'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import UnavailableState from '@/shared/ui/UnavailableState'

const TechnologiesPage = () => {
  const { technologies, isLoading, isError, refetch, createTechnology } =
    useTechnologies()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className='space-y-6'>
      <AdminPageHeader title='Технології' description='Типи проекції та звуку'>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Додати технологію
        </Button>
      </AdminPageHeader>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : isError && technologies.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <AdminTable label='Технології'>
          <table className='min-w-[560px]'>
            <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs tracking-wider'>
              <tr>
                <th className='px-6 py-4'>Назва</th>
                <th className='px-6 py-4'>Тип</th>
                <th className='px-6 py-4 text-right'>Дії</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {technologies.length === 0 ? (
                <tr>
                  <td colSpan={3} className='px-6 py-8'>
                    <EmptyState
                      icon={<Cpu className='h-12 w-12' />}
                      title='Технологій ще немає'
                      description='Додайте формати проекції, звуку або залу, щоб привʼязувати їх до кінотеатральних залів.'
                      actionLabel='Додати технологію'
                      onAction={() => setIsModalOpen(true)}
                      className='border-0 bg-transparent py-10'
                    />
                  </td>
                </tr>
              ) : (
                technologies.map(tech => (
                  <tr
                    key={tech.id}
                    className='group hover:bg-[var(--bg-hover)] transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)]'>
                          <Cpu size={16} />
                        </div>
                        <span className='font-bold text-white'>
                          {tech.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm text-[var(--text-muted)]'>
                        {tech.type}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          type='button'
                          disabled // Поки що API не має методу Delete
                          className='p-2 rounded-lg text-[var(--text-muted)] opacity-50 cursor-not-allowed hover:bg-red-500/10'
                          title='Видалення недоступне'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTable>
      )}

      <CreateTechnologyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTechnology}
      />
    </div>
  )
}

export default TechnologiesPage
