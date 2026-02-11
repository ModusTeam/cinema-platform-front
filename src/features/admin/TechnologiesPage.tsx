import { useState } from 'react'
import { useTechnologies } from './hooks/useTechnologies'
import { Plus, Cpu, Trash2 } from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import CreateTechnologyModal from './components/CreateTechnologyModal'

const TechnologiesPage = () => {
  const { technologies, isLoading, createTechnology } = useTechnologies()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visual':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'audio':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'seating':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'experience':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Технології</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Типи проекції та звуку
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[var(--color-primary)]/20'
        >
          <Plus size={18} /> Додати технологію
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : (
        <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] overflow-hidden backdrop-blur-sm shadow-xl'>
          <table className='w-full text-left text-sm'>
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
                  <td
                    colSpan={3}
                    className='px-6 py-8 text-center text-[var(--text-muted)]'
                  >
                    Список порожній
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
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold border ${getTypeColor(tech.type)}`}
                      >
                        {tech.type}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
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
        </div>
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
