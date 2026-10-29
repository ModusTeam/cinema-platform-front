import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'
import EditorialSpecList from '@/widgets/static-page/ui/EditorialSpecList'
import { PROJECTION_SPECS, TECHNOLOGIES } from './data/technologies'

const TechnologiesPage = () => (
  <EditorialPageLayout
    title='Технології'
    subtitle='Інженерія емоцій. Ми використовуємо обладнання, що стирає межу між екраном та реальністю.'
  >
    <section className='grid gap-10 py-12 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20'>
      <div>
        <h2 className='editorial-title'>IMAX Laser 4K</h2>
        <p className='mt-6 max-w-[54ch] text-lg leading-relaxed text-[var(--text-muted)]'>
          Це не просто проєктор. Система подвійних лазерів 4K забезпечує
          зображення з максимальною роздільною здатністю та різкістю. Ми
          відмовилися від ксенонових ламп на користь чистого лазерного світла.
        </p>
      </div>
      <EditorialSpecList items={PROJECTION_SPECS} />
    </section>
    <div className='grid border-t border-[var(--editorial-rule)] md:grid-cols-2 md:gap-16'>
      {TECHNOLOGIES.map(technology => (
        <section
          key={technology.title}
          className='border-b border-[var(--editorial-rule)] py-10 md:py-14'
        >
          <h2 className='editorial-title'>{technology.title}</h2>
          <p className='mt-6 max-w-[54ch] leading-relaxed text-[var(--text-muted)]'>
            {technology.description}
          </p>
          <ul className='mt-8 list-disc space-y-3 pl-5 marker:text-[var(--text-faint)]'>
            {technology.features.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
    <p className='mt-10 max-w-[70ch] text-sm leading-relaxed text-[var(--text-muted)]'>
      Ми регулярно проводимо калібрування обладнання за стандартами THX та IMAX
      Corporation для забезпечення еталонної якості.
    </p>
  </EditorialPageLayout>
)

export default TechnologiesPage
