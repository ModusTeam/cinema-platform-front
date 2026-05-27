import StaticPageLayout from '../layouts/StaticPageLayout'

const AgeLimitsPage = () => {
  return (
    <StaticPageLayout
      title='Вікові обмеження'
      subtitle='Індекс кіноаудиторії. Ми дотримуємося законодавства про захист суспільної моралі.'
    >
      <div className='space-y-12'>
        <p className='text-zinc-400 text-lg leading-relaxed border-l-4 border-white/10 pl-6'>
          Вікові рейтинги встановлюються Міністерством культури та інформаційної
          політики України. Будь ласка, звертайте увагу на індекс фільму перед
          покупкою квитків.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='group relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-900/10 to-transparent p-8 transition-all hover:border-green-500/50 hover:bg-green-900/20'>
            <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity'>
              <span className='text-6xl font-black text-green-500'>0+</span>
            </div>

            <div className='inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-500 text-black font-black text-xl mb-4 shadow-[0_0_15px_rgba(34,197,94,0.4)]'>
              0+
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Загальна аудиторія
            </h3>
            <p className='text-zinc-400 text-sm'>
              Фільми, доступні для глядачів будь-якого віку. Зазвичай це
              мультфільми, сімейні комедії та казки. Сцени насилля чи грубої
              лексики відсутні.
            </p>
          </div>

          <div className='group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-transparent p-8 transition-all hover:border-yellow-500/50 hover:bg-yellow-900/20'>
            <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity'>
              <span className='text-6xl font-black text-yellow-500'>12+</span>
            </div>

            <div className='inline-flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-500 text-black font-black text-xl mb-4 shadow-[0_0_15px_rgba(234,179,8,0.4)]'>
              12+
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Діти до 12 років
            </h3>
            <p className='text-zinc-400 text-sm'>
              Фільм може містити сцени, що вимагають уваги батьків. Діти до 12
              років допускаються на сеанс{' '}
              <strong>виключно у супроводі батьків</strong> або повнолітніх
              опікунів.
            </p>
          </div>

          <div className='group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-900/10 to-transparent p-8 transition-all hover:border-orange-500/50 hover:bg-orange-900/20'>
            <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity'>
              <span className='text-6xl font-black text-orange-500'>16+</span>
            </div>

            <div className='inline-flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500 text-black font-black text-xl mb-4 shadow-[0_0_15px_rgba(249,115,22,0.4)]'>
              16+
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Обмеження до 16 років
            </h3>
            <p className='text-zinc-400 text-sm'>
              Перегляд заборонено особам, які не досягли 16-річного віку. Фільм
              може містити сцени насилля, вживання алкоголю або ненормативну
              лексику.
            </p>
          </div>

          <div className='group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-900/10 to-transparent p-8 transition-all hover:border-red-500/50 hover:bg-red-900/20'>
            <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity'>
              <span className='text-6xl font-black text-red-600'>18+</span>
            </div>

            <div className='inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-600 text-white font-black text-xl mb-4 shadow-[0_0_15px_rgba(220,38,38,0.4)]'>
              18+
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Суворо для дорослих
            </h3>
            <p className='text-zinc-400 text-sm'>
              Вхід особам до 18 років <strong>категорично заборонено</strong>,
              навіть у супроводі батьків. Фільм може містити сцени жорстокості
              або контент сексуального характеру.
            </p>
          </div>
        </div>

        <div className='rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col md:flex-row gap-6 items-center'>
          <div className='h-14 w-14 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-3xl'>
            🪪
          </div>
          <div>
            <h4 className='text-lg font-bold text-white mb-1'>
              Перевірка документів
            </h4>
            <p className='text-sm text-zinc-400'>
              Адміністрація кінотеатру та контролери мають законне право
              перевірити документ, що підтверджує вік відвідувача (паспорт,
              студентський квиток, водійські права або Дія), якщо виникають
              сумніви щодо досягнення необхідного віку. У разі відсутності
              документа у вході може бути відмовлено без повернення коштів.
            </p>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default AgeLimitsPage
