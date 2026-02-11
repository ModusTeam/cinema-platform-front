import { useState } from 'react'
import { BAR_MENU } from '../data/staticContent'
import {
  CupSoda,
  Coffee,
  Pizza,
  Package,
  ShoppingBag,
  Flame,
  Search,
  Popcorn,
} from 'lucide-react'
import { clsx } from 'clsx'
import { AuroraText } from '../common/components/AuroraText'

const iconMap: Record<string, any> = {
  Popcorn: Popcorn,
  CupSoda: CupSoda,
  Coffee: Coffee,
  Pizza: Pizza,
  Package: Package,
}

const CinemaBarPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
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
    <div className='min-h-screen bg-[var(--bg-main)] pb-20'>
      <div className='relative h-[40vh] w-full overflow-hidden flex items-center justify-center bg-black'>
        <div className='absolute inset-0 bg-gradient-to-br from-orange-900/40 via-black to-purple-900/40 animate-pulse'></div>
        <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-10'></div>

        <div className='relative z-10 text-center px-4'>
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 backdrop-blur-md'>
            <Flame size={14} /> Найсмачніша частина фільму
          </div>
          <h1 className='text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-4'>
            Кіно
            <AuroraText className='font-black'>Бар</AuroraText>
          </h1>
          <p className='text-[var(--text-muted)] text-lg max-w-lg mx-auto'>
            Хрусткий попкорн, крижані напої та снеки для ідеального перегляду.
          </p>
        </div>
      </div>

      <div className='container mx-auto px-4 -mt-8 relative z-20'>
        <div className='bg-[var(--bg-card)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between'>
          <div
            className='flex gap-2 overflow-x-auto md:flex-wrap w-full md:w-auto pb-2 md:pb-0 p-1 no-scrollbar'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              type='button'
              onClick={() => setActiveCategory('all')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border',
                activeCategory === 'all'
                  ? 'bg-white text-black border-white scale-105'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-white/5 hover:text-white',
              )}
            >
              Всі меню
            </button>
            {BAR_MENU.map(cat => (
              <button
                type='button'
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2',
                  activeCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] scale-105'
                    : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-white/5 hover:text-white',
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div className='relative w-full md:w-64'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
              size={16}
            />
            <input
              type='text'
              placeholder='Пошук смаколиків...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full bg-[var(--bg-main)] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none'
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className='space-y-12'>
          {filteredMenu.map(category => {
            const IconComponent = iconMap[category.icon] || Package

            return (
              <div
                key={category.id}
                className='animate-in fade-in slide-in-from-bottom-4 duration-500'
              >
                <div className='flex items-center gap-4 mb-6'>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg`}
                  >
                    <IconComponent size={24} className='text-white' />
                  </div>
                  <h2 className='text-2xl font-bold text-white'>
                    {category.title}
                  </h2>
                  <div className='h-px bg-white/5 flex-1'></div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className='group relative bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-[var(--color-primary)]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col'
                    >
                      {item.tags && (
                        <div className='absolute top-3 right-3 flex flex-col gap-1 items-end z-10'>
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className='bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className='p-6 flex-1'>
                        <h3 className='text-lg font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors'>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className='text-sm text-[var(--text-muted)] mb-4 leading-relaxed'>
                            {item.description}
                          </p>
                        )}

                        <div className='space-y-2 mt-auto'>
                          {item.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className='flex justify-between items-center text-sm p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/[0.07] transition-colors'
                            >
                              <span className='text-zinc-300 font-medium'>
                                {option.label}
                              </span>
                              <span className='font-bold text-white'>
                                {option.price} ₴
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {filteredMenu.length === 0 && (
            <div className='text-center py-20 text-[var(--text-muted)]'>
              <ShoppingBag size={48} className='mx-auto mb-4 opacity-20' />
              <p>Нічого не знайдено за вашим запитом.</p>
            </div>
          )}
        </div>

        <div className='mt-20 p-8 rounded-3xl bg-gradient-to-r from-zinc-900 to-black border border-white/10 text-center relative overflow-hidden'>
          <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/diagonal-stripes.png")] opacity-5'></div>
          <div className='relative z-10'>
            <h3 className='text-xl font-bold text-white mb-2'>
              💡 Зверніть увагу
            </h3>
            <p className='text-[var(--text-muted)] max-w-2xl mx-auto'>
              Покупка товарів кінобару доступна{' '}
              <strong>тільки на касі кінотеатру</strong>. <br />
              Онлайн-замовлення їжі та напоїв незабаром з'явиться у додатку!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CinemaBarPage
