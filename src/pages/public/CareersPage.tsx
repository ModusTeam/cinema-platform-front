import { ArrowUpRight } from 'lucide-react'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'
import { PERKS, VACANCIES } from './data/careers'

const CareersPage = () => (
  <EditorialPageLayout
    title='Кіно. Технології. Люди.'
    subtitle='Створюй майбутнє разом з Cinema.'
  >
    <section
      aria-labelledby='careers-positions'
      className='grid gap-8 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-20'
    >
      <h2 id='careers-positions' className='type-public-section'>
        Відкриті позиції
      </h2>
      <ul className='min-w-0 divide-y divide-[var(--editorial-rule)]'>
        {VACANCIES.map(job => (
          <li key={job.id}>
            <a
              href={`mailto:an.stawski@outlook.com?subject=${encodeURIComponent(`Резюме: ${job.title}`)}`}
              className='group block py-6'
            >
              <h3 className='type-public-section group-hover:underline underline-offset-4'>
                {job.title}
              </h3>
              <ul className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]'>
                <li>{job.department}</li>
                <li>{job.type}</li>
                <li>{job.location}</li>
              </ul>
              <span className='mt-4 inline-flex min-h-11 items-center gap-2 text-sm'>
                Відгукнутися <ArrowUpRight size={16} aria-hidden='true' />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
    <section
      aria-label='Умови роботи'
      className='grid gap-8 border-y border-[var(--editorial-rule)] py-10 md:grid-cols-3 md:gap-12'
    >
      {PERKS.map(perk => (
        <div key={perk.title}>
          <h2 className='type-public-section mb-4'>{perk.title}</h2>
          <p className='leading-relaxed text-[var(--text-muted)]'>
            {perk.description}
          </p>
        </div>
      ))}
    </section>
    <section className='grid gap-6 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-20'>
      <h2 className='type-public-section'>Не знайшли своєї вакансії?</h2>
      <div>
        <p className='max-w-[60ch] leading-relaxed text-[var(--text-muted)]'>
          Ми завжди раді знайомству з талановитими людьми. Надішліть нам своє
          резюме, і ми зв'яжемося з вами, коли з'явиться щось цікаве.
        </p>
        <a href='mailto:an.stawski@outlook.com' className='editorial-link mt-6'>
          Написати нам <ArrowUpRight size={18} aria-hidden='true' />
        </a>
      </div>
    </section>
  </EditorialPageLayout>
)

export default CareersPage
