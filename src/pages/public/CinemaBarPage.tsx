import { Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '@/shared/ui/EmptyState'
import Input from '@/shared/ui/Input'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'
import { BAR_MENU } from './data/bar'

const CinemaBarPage = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMenu = BAR_MENU.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  })).filter(
    category =>
      (activeCategory === 'all' || category.id === activeCategory) &&
      category.items.length > 0,
  )

  return (
    <EditorialPageLayout
      title='Кінобар'
      subtitle='Хрусткий попкорн, крижані напої та снеки для ідеального перегляду.'
      surface='paper'
    >
      <div className='grid items-end gap-8 border-b border-[var(--editorial-rule)] py-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12'>
        <nav
          aria-label='Категорії кінобару'
          className='flex min-w-0 flex-wrap gap-x-6 gap-y-1'
        >
          <button
            type='button'
            className='editorial-category'
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            Всі меню
          </button>
          {BAR_MENU.map(category => (
            <button
              type='button'
              key={category.id}
              className='editorial-category'
              aria-pressed={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </nav>
        <div className='relative'>
          <Input
            type='search'
            label='Пошук у меню'
            placeholder='Назва смаколика'
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className='pr-10'
            aria-controls='bar-menu'
          />
          <Search
            size={18}
            aria-hidden='true'
            className='pointer-events-none absolute right-3 bottom-4 text-[var(--text-muted)]'
          />
        </div>
      </div>
      <output className='sr-only'>
        Знайдено позицій:{' '}
        {filteredMenu.reduce(
          (count, category) => count + category.items.length,
          0,
        )}
      </output>
      <div id='bar-menu' className='divide-y divide-[var(--editorial-rule)]'>
        {filteredMenu.map(category => (
          <section
            key={category.id}
            aria-labelledby={`bar-${category.id}`}
            className='grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16'
          >
            <h2 id={`bar-${category.id}`} className='type-public-section'>
              {category.title}
            </h2>
            <div className='grid gap-x-12 gap-y-10 md:grid-cols-2'>
              {category.items.map(item => (
                <div key={item.name} className='min-w-0'>
                  <h3 className='type-public-section'>{item.name}</h3>
                  {item.tags && (
                    <p className='mt-2 text-sm text-[var(--text-muted)]'>
                      {item.tags.join(' · ')}
                    </p>
                  )}
                  {item.description && (
                    <p className='mt-3 leading-relaxed text-[var(--text-muted)]'>
                      {item.description}
                    </p>
                  )}
                  <dl className='mt-5 space-y-3'>
                    {item.options.map(option => (
                      <div
                        key={option.label}
                        className='grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6'
                      >
                        <dt className='text-sm text-[var(--text-muted)]'>
                          {option.label}
                        </dt>
                        <dd className='whitespace-nowrap text-lg tabular-nums'>
                          {option.price} ₴
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ))}
        {filteredMenu.length === 0 && (
          <EmptyState
            icon={<ShoppingBag className='h-12 w-12' />}
            title='Смаколиків за запитом немає'
            description='Спробуйте іншу назву або перегляньте всі категорії кінобару.'
            actionLabel='Показати все меню'
            onAction={() => {
              setSearchTerm('')
              setActiveCategory('all')
            }}
            className='editorial-state py-20'
          />
        )}
      </div>
      <aside className='grid gap-4 border-t border-[var(--editorial-rule)] pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:gap-16'>
        <h2 className='type-public-section'>Зверніть увагу</h2>
        <p className='max-w-[60ch] leading-relaxed text-[var(--text-muted)]'>
          Покупка товарів кінобару доступна{' '}
          <strong className='font-medium text-[var(--text-main)]'>
            тільки на касі кінотеатру
          </strong>
          .
        </p>
      </aside>
    </EditorialPageLayout>
  )
}

export default CinemaBarPage
