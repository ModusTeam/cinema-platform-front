import StaticPageLayout from '@/widgets/static-page/ui/StaticPageLayout'

const RulesPage = () => {
  return (
    <StaticPageLayout
      title='Правила відвідування'
      subtitle='Взаємоповага та безпека — наші головні пріоритети.'
    >
      <div className='space-y-12'>
        <div className='grid gap-8'>
          <div className='border-b border-[var(--editorial-rule)] pb-8'>
            <div className='mb-4 text-lg tabular-nums text-[var(--text-muted)]'>
              1
            </div>
            <h2 className='type-section text-[var(--text-main)] mb-2'>
              Вхід до зали
            </h2>
            <p className='text-[var(--text-muted)] text-base leading-relaxed'>
              Вхід можливий тільки за наявності дійсного квитка (електронного на
              смартфоні або роздрукованого). Зберігайте квиток до кінця сеансу.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-8'>
            <div className='mb-4 text-lg tabular-nums text-[var(--text-muted)]'>
              2
            </div>
            <h2 className='type-section text-[var(--text-main)] mb-2'>
              Їжа та напої
            </h2>
            <p className='text-[var(--text-muted)] text-base leading-relaxed'>
              Вхід зі своїми продуктами харчування та напоями заборонений. Ви
              можете насолодитися попкорном та напоями з нашого кінобару.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-8'>
            <div className='mb-4 text-lg tabular-nums text-[var(--text-muted)]'>
              3
            </div>
            <h2 className='type-section text-[var(--text-main)] mb-2'>
              Зйомка заборонена
            </h2>
            <p className='text-[var(--text-muted)] text-base leading-relaxed'>
              Будь-яка фото- та відеозйомка екрану під час фільму суворо
              заборонена (Закон про авторське право). Порушники будуть виведені
              із зали без повернення коштів.
            </p>
          </div>

          <div className='border-b border-[var(--editorial-rule)] pb-8'>
            <div className='mb-4 text-lg tabular-nums text-[var(--text-muted)]'>
              4
            </div>
            <h2 className='type-section text-[var(--text-main)] mb-2'>
              Дрес-код та стан
            </h2>
            <p className='text-[var(--text-muted)] text-base leading-relaxed'>
              Адміністрація має право відмовити у вході особам у стані сильного
              алкогольного або наркотичного сп&apos;яніння, а також у брудному
              одязі, що може забруднити крісла.
            </p>
          </div>
        </div>

        <div className='border-b border-[var(--editorial-rule)] pb-8'>
          <div>
            <h2 className='text-lg font-bold text-[var(--text-main)] mb-1'>
              Діти до 5 років
            </h2>
            <p className='text-base text-[var(--text-muted)]'>
              Відвідують сеанси безкоштовно без надання окремого місця (на руках
              у дорослих). Це правило не поширюється на сеанси з віковим
              обмеженням 16+ та 18+.
            </p>
          </div>
        </div>

        <div className='border-t border-[var(--editorial-rule)] pt-8'>
          <h2 className='text-lg font-bold text-[var(--text-main)] mb-2 flex items-center gap-2'>
            Повітряна тривога
          </h2>
          <p className='text-base text-[var(--text-muted)] leading-relaxed'>
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
