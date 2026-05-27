import StaticPageLayout from '../layouts/StaticPageLayout'

const HallsPage = () => {
  return (
    <StaticPageLayout
      title='Наші зали'
      subtitle='Ми перетворили перегляд фільму на першокласний відпочинок. Оберіть свій рівень комфорту.'
    >
      <div className='space-y-12'>
        <div className='group relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-900/10 via-black to-black p-8 md:p-12 shadow-2xl transition-all hover:border-amber-500/40'>
          <div className='absolute top-0 right-0 h-96 w-96 bg-amber-600/10 blur-[120px] rounded-full transition-opacity opacity-60 group-hover:opacity-100' />

          <div className='relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center'>
            <div className='flex-1'>
              <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'>
                ★ Premium Experience
              </div>
              <h3 className='mb-4 text-4xl md:text-5xl font-black uppercase tracking-tighter text-white'>
                LUX{' '}
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600'>
                  Cinema
                </span>
              </h3>
              <p className='mb-8 text-lg text-zinc-400 leading-relaxed'>
                Максимальна приватність та комфорт бізнес-класу. Зал обладнаний
                шкіряними кріслами-реклайнерами, що розкладаються до
                горизонтального положення.
              </p>

              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-zinc-300 font-medium'>
                <li className='flex items-center gap-3'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400'>
                    ✓
                  </span>
                  Електронне керування спинкою
                </li>
                <li className='flex items-center gap-3'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400'>
                    ✓
                  </span>
                  Персональні столики з підсвіткою
                </li>
                <li className='flex items-center gap-3'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400'>
                    ✓
                  </span>
                  Кнопка виклику офіціанта
                </li>
                <li className='flex items-center gap-3'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400'>
                    ✓
                  </span>
                  USB-порти для зарядки
                </li>
              </ul>
            </div>

            <div className='hidden md:flex h-40 w-40 shrink-0 items-center justify-center rounded-3xl bg-amber-900/20 border border-amber-500/20'>
              <span className='text-4xl'>👑</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 transition-all hover:bg-zinc-900 hover:border-white/20'>
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-2xl group-hover:scale-110 transition-transform'>
              🛋️
            </div>
            <h3 className='mb-3 text-2xl font-black uppercase text-white'>
              Comfort
            </h3>
            <p className='text-zinc-400 mb-6 text-sm leading-relaxed'>
              Золотий стандарт кінопоказу. Ми збільшили відстань між рядами на
              40%, щоб ви могли зручно витягнути ноги.
            </p>
            <div className='flex flex-wrap gap-2'>
              <span className='px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-zinc-300'>
                Широкі підлокітники
              </span>
              <span className='px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-zinc-300'>
                Double-armchair
              </span>
              <span className='px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-zinc-300'>
                Ергономіка
              </span>
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-900/20 to-black p-8 transition-all hover:border-rose-500/30'>
            <div className='absolute bottom-0 right-0 h-32 w-32 bg-rose-600/10 blur-[60px] group-hover:opacity-100 transition-opacity' />

            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-900/30 text-rose-400 text-2xl group-hover:scale-110 transition-transform'>
              ❤️
            </div>
            <h3 className='mb-3 text-2xl font-black uppercase text-white group-hover:text-rose-400 transition-colors'>
              Love Seats
            </h3>
            <p className='text-zinc-400 mb-6 text-sm leading-relaxed'>
              Затишні дивани для двох у останньому ряду. Ідеальний вибір для
              романтичного побачення, де ніхто не заважатиме.
            </p>
            <div className='flex flex-wrap gap-2'>
              <span className='px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300'>
                Без перегородок
              </span>
              <span className='px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300'>
                Приватність
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/5'>
          <div className='text-center md:text-left'>
            <div className='text-2xl font-bold text-white'>120 см</div>
            <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
              Між рядами
            </div>
          </div>
          <div className='text-center md:text-left'>
            <div className='text-2xl font-bold text-white'>65 см</div>
            <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
              Ширина крісла
            </div>
          </div>
          <div className='text-center md:text-left'>
            <div className='text-2xl font-bold text-white'>Premium</div>
            <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
              Матеріали
            </div>
          </div>
          <div className='text-center md:text-left'>
            <div className='text-2xl font-bold text-white'>Climate</div>
            <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
              Контроль
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default HallsPage
