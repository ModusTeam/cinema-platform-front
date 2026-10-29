import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'
import EditorialSpecList from '@/widgets/static-page/ui/EditorialSpecList'
import { HALL_CATEGORIES, HALL_SPECS } from './data/halls'

const HallsPage = () => (
  <EditorialPageLayout
    title='Наші зали'
    subtitle='Ми перетворили перегляд фільму на першокласний відпочинок. Оберіть свій рівень комфорту.'
  >
    <div className='divide-y divide-[var(--editorial-rule)]'>
      {HALL_CATEGORIES.map(hall => (
        <section
          key={hall.title}
          className='grid gap-8 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12'
        >
          <h2 className='editorial-title'>{hall.title}</h2>
          <p className='max-w-[48ch] text-lg leading-relaxed text-[var(--text-muted)]'>
            {hall.description}
          </p>
          <ul className='divide-y divide-[var(--editorial-rule)] text-sm'>
            {hall.features.map(feature => (
              <li key={feature} className='py-3 first:pt-0'>
                {feature}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
    <section className='grid gap-8 border-t border-[var(--editorial-rule)] pt-12 lg:grid-cols-2 lg:gap-20'>
      <div>
        <h2 className='type-public-section'>Деталі простору</h2>
        <Link className='editorial-link mt-6' to='/technologies'>
          Технології кінопоказу <ArrowRight size={18} aria-hidden='true' />
        </Link>
      </div>
      <EditorialSpecList items={HALL_SPECS} />
    </section>
  </EditorialPageLayout>
)

export default HallsPage
