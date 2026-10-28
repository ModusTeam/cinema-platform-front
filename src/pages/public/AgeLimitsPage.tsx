import StaticPageLayout from '@/widgets/static-page/ui/StaticPageLayout'

const AgeLimitsPage = () => {
  return (
    <StaticPageLayout
      title='Вікові обмеження'
      subtitle='Індекс кіноаудиторії. Ми дотримуємося законодавства про захист суспільної моралі.'
    >
      <div className='space-y-12'>
        <p className='text-lg leading-relaxed'>
          Вікові рейтинги встановлюються Міністерством культури та інформаційної
          політики України. Будь ласка, звертайте увагу на індекс фільму перед
          покупкою квитків.
        </p>

        <div className='grid gap-10'>
          <div className='border-b border-[var(--editorial-rule)] pb-10'>
            <div className='mb-4 type-public-section tabular-nums'>0+</div>
            <h2 className='text-xl font-bold text-[var(--text-main)] mb-2'>
              Загальна аудиторія
            </h2>
            <p className='text-[var(--text-muted)] text-base'>
              Фільми, доступні для глядачів будь-якого віку. Зазвичай це
              мультфільми, сімейні комедії та казки. Сцени насилля чи грубої
              лексики відсутні.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-10'>
            <div className='mb-4 type-public-section tabular-nums'>12+</div>
            <h2 className='text-xl font-bold text-[var(--text-main)] mb-2'>
              Діти до 12 років
            </h2>
            <p className='text-[var(--text-muted)] text-base'>
              Фільм може містити сцени, що вимагають уваги батьків. Діти до 12
              років допускаються на сеанс{' '}
              <strong>виключно у супроводі батьків</strong> або повнолітніх
              опікунів.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-10'>
            <div className='mb-4 type-public-section tabular-nums'>16+</div>
            <h2 className='text-xl font-bold text-[var(--text-main)] mb-2'>
              Обмеження до 16 років
            </h2>
            <p className='text-[var(--text-muted)] text-base'>
              Перегляд заборонено особам, які не досягли 16-річного віку. Фільм
              може містити сцени насилля, вживання алкоголю або ненормативну
              лексику.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-10'>
            <div className='mb-4 type-public-section tabular-nums'>18+</div>
            <h2 className='text-xl font-bold text-[var(--text-main)] mb-2'>
              Суворо для дорослих
            </h2>
            <p className='text-[var(--text-muted)] text-base'>
              Вхід особам до 18 років <strong>категорично заборонено</strong>,
              навіть у супроводі батьків. Фільм може містити сцени жорстокості
              або контент сексуального характеру.
            </p>
          </div>
        </div>

        <div className='border-t border-[var(--editorial-rule)] pt-8'>
          <div>
            <h2 className='text-lg font-bold text-[var(--text-main)] mb-1'>
              Перевірка документів
            </h2>
            <p className='text-base text-[var(--text-muted)]'>
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
