import StaticPageLayout from '../layouts/StaticPageLayout'

const TechnologiesPage = () => {
  return (
    <StaticPageLayout
      title='Технології'
      subtitle='Інженерія емоцій. Ми використовуємо обладнання, що стирає межу між екраном та реальністю.'
    >
      <div className='space-y-8'>
        <div className='group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black p-8 md:p-12 transition-all hover:border-cyan-500/30'>
          <div className='absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 blur-[100px] transition-opacity opacity-50 group-hover:opacity-100' />

          <div className='relative z-10'>
            <div className='mb-4 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400'>
              Візуал
            </div>
            <h3 className='mb-4 text-4xl font-black uppercase tracking-tighter text-white'>
              IMAX{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600'>
                Laser 4K
              </span>
            </h3>
            <p className='mb-8 text-lg text-zinc-400 leading-relaxed max-w-2xl'>
              Це не просто проєктор. Система подвійних лазерів 4K забезпечує
              зображення з максимальною роздільною здатністю та різкістю. Ми
              відмовилися від ксенонових ламп на користь чистого лазерного
              світла.
            </p>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6'>
              <div>
                <div className='text-2xl font-bold text-white'>60 fps</div>
                <div className='text-xs text-zinc-500 uppercase font-bold'>
                  High Frame Rate
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-white'>+50%</div>
                <div className='text-xs text-zinc-500 uppercase font-bold'>
                  Яскравість
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-white'>1.43:1</div>
                <div className='text-xs text-zinc-500 uppercase font-bold'>
                  Співвідношення сторін
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-white'>12.0 ch</div>
                <div className='text-xs text-zinc-500 uppercase font-bold'>
                  Звукова схема
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='group relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 hover:border-indigo-500/30 transition-all'>
            <div className='absolute bottom-0 left-0 h-40 w-40 bg-indigo-600/20 blur-[80px]' />

            <div className='mb-4 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-400'>
              Звук
            </div>
            <h3 className='mb-3 text-2xl font-black uppercase text-white'>
              Dolby <span className='text-indigo-500'>Atmos</span>
            </h3>
            <p className='text-zinc-400 mb-6 text-sm leading-relaxed'>
              Звук більше не прив&apos;язаний до каналів. Він рухається навколо
              вас. Об&apos;єкто-орієнтована аудіосистема дозволяє розміщувати
              звукові ефекти в будь-якій точці зали, навіть над головою.
            </p>
            <ul className='space-y-2 text-sm text-zinc-300 font-medium'>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' /> 64
                незалежних канали
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />{' '}
                Стельові динаміки
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />{' '}
                Акустична прозорість екрану
              </li>
            </ul>
          </div>

          <div className='group relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 hover:border-red-500/30 transition-all'>
            <div className='absolute bottom-0 right-0 h-40 w-40 bg-red-600/20 blur-[80px]' />

            <div className='mb-4 inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400'>
              Відчуття
            </div>
            <h3 className='mb-3 text-2xl font-black uppercase text-white'>
              D-BOX <span className='text-red-500'>Motion</span>
            </h3>
            <p className='text-zinc-400 mb-6 text-sm leading-relaxed'>
              Ваше тіло бере участь у подіях фільму. Крісла D-BOX
              синхронізуються з дією на екрані, імітуючи вібрацію, падіння,
              прискорення та текстуру поверхні.
            </p>
            <ul className='space-y-2 text-sm text-zinc-300 font-medium'>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-500' /> 3 осі
                руху (MFX)
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-500' />{' '}
                Індивідуальне налаштування інтенсивності
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-500' />{' '}
                Сертифікація кіностудій
              </li>
            </ul>
          </div>
        </div>

        <div className='rounded-2xl bg-white/5 border border-white/5 p-6 text-center text-sm text-zinc-500'>
          Ми регулярно проводимо калібрування обладнання за стандартами THX та
          IMAX Corporation для забезпечення еталонної якості.
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default TechnologiesPage
