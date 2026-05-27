import StaticPageLayout from '../layouts/StaticPageLayout'

const RulesPage = () => {
  return (
    <StaticPageLayout
      title='Правила відвідування'
      subtitle='Взаємоповага та безпека — наші головні пріоритети.'
    >
      <div className='space-y-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10'>
            <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold'>
              1
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>Вхід до зали</h3>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Вхід можливий тільки за наявності дійсного квитка (електронного на
              смартфоні або роздрукованого). Зберігайте квиток до кінця сеансу.
            </p>
          </div>

          <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10'>
            <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold'>
              2
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>Їжа та напої</h3>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Вхід зі своїми продуктами харчування та напоями заборонений. Ви
              можете насолодитися попкорном та напоями з нашого кінобару.
            </p>
          </div>

          <div className='relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-900/10 to-transparent p-6 transition-all hover:border-red-500/40'>
            <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-bold'>
              3
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Зйомка заборонена
            </h3>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Будь-яка фото- та відеозйомка екрану під час фільму суворо
              заборонена (Закон про авторське право). Порушники будуть виведені
              із зали без повернення коштів.
            </p>
          </div>

          <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10'>
            <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-white font-bold'>
              4
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Дрес-код та стан
            </h3>
            <p className='text-zinc-400 text-sm leading-relaxed'>
              Адміністрація має право відмовити у вході особам у стані сильного
              алкогольного або наркотичного сп&apos;яніння, а також у брудному
              одязі, що може забруднити крісла.
            </p>
          </div>
        </div>

        <div className='rounded-2xl border border-blue-500/20 bg-blue-900/10 p-6 flex flex-col md:flex-row gap-6 items-center'>
          <div className='h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-blue-500/20 text-2xl'>
            👶
          </div>
          <div>
            <h3 className='text-lg font-bold text-white mb-1'>
              Діти до 5 років
            </h3>
            <p className='text-sm text-zinc-400'>
              Відвідують сеанси безкоштовно без надання окремого місця (на руках
              у дорослих). Це правило не поширюється на сеанси з віковим
              обмеженням 16+ та 18+.
            </p>
          </div>
        </div>

        <div className='rounded-2xl border border-yellow-500/20 bg-yellow-900/10 p-6'>
          <h3 className='text-lg font-bold text-white mb-2 flex items-center gap-2'>
            <span className='inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse' />
            Повітряна тривога
          </h3>
          <p className='text-sm text-zinc-400 leading-relaxed'>
            У разі оголошення повітряної тривоги сеанс зупиняється. Всі
            відвідувачі повинні пройти в найближче укриття. Якщо тривога триває
            менше 30 хв, сеанс буде продовжено. Якщо довше — квитки можна
            обміняти на інший сеанс протягом 14 днів.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default RulesPage
