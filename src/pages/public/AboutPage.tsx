import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'

const AboutPage = () => (
  <EditorialPageLayout
    title='Cinema.'
    subtitle='Інженерія ваших емоцій. Кіно та сучасний веб в одному проєкті.'
  >
    <section className='grid gap-8 py-12 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16'>
      <h2 className='editorial-title max-w-[12ch]'>
        Від пет-проєкту до платформи.
      </h2>
      <div className='space-y-6 text-lg leading-relaxed text-[var(--text-muted)]'>
        <p>
          Cinema — це пет-проєкт, який виріс у повноцінну платформу, що
          демонструє можливості сучасного вебу. Ми поєднали естетику мінімалізму
          з потужністю сучасних технологій.
        </p>
        <p>
          Інтерфейс, який не заважає: фокус на контенті, інтуїтивна навігація та
          увага до дрібниць ще до початку сеансу.
        </p>
      </div>
    </section>

    <section
      aria-label='Продукт і технології'
      className='grid gap-8 border-y border-[var(--editorial-rule)] py-10 md:grid-cols-3 md:gap-12'
    >
      <div>
        <h2 className='type-public-section mb-4'>React + TypeScript</h2>
        <p className='leading-relaxed text-[var(--text-muted)]'>
          Каталог фільмів, розклад сеансів та особистий кабінет у єдиному
          інтерфейсі.
        </p>
      </div>
      <div>
        <h2 className='type-public-section mb-4'>SignalR</h2>
        <p className='leading-relaxed text-[var(--text-muted)]'>
          Оновлення доступності місць під час вибору сеансу та бронювання.
        </p>
      </div>
      <div>
        <h2 className='type-public-section mb-4'>Комфорт UX</h2>
        <p className='leading-relaxed text-[var(--text-muted)]'>
          Темна тема, виразна типографіка та стриманий рух, що залишають кіно на
          першому плані.
        </p>
      </div>
    </section>

    <section className='grid gap-8 py-12 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16'>
      <div>
        <h2 className='editorial-title'>За кадром</h2>
        <p className='mt-4 text-[var(--text-muted)]'>
          Designed &amp; Developed by Kossman
        </p>
      </div>
      <div className='min-w-0'>
        <dl className='divide-y divide-[var(--editorial-rule)]'>
          <div className='flex flex-wrap justify-between gap-x-6 gap-y-2 py-4'>
            <dt className='text-[var(--text-muted)]'>Локація</dt>
            <dd>Острог, Україна</dd>
          </div>
          <div className='flex flex-wrap items-baseline justify-between gap-x-6 py-2'>
            <dt className='text-[var(--text-muted)]'>Email</dt>
            <dd>
              <a
                className='editorial-link'
                href='mailto:an.stawski@outlook.com'
              >
                an.stawski@outlook.com
              </a>
            </dd>
          </div>
          <div className='flex flex-wrap items-baseline justify-between gap-x-6 py-2'>
            <dt className='text-[var(--text-muted)]'>GitHub / Dev</dt>
            <dd>
              <a
                className='editorial-link'
                href='https://github.com/stkossman'
                target='_blank'
                rel='noreferrer'
              >
                @stkossman <ArrowUpRight size={16} aria-hidden='true' />
                <span className='sr-only'> (у новій вкладці)</span>
              </a>
            </dd>
          </div>
        </dl>
        <a href='mailto:an.stawski@outlook.com' className='editorial-link mt-6'>
          Розпочати співпрацю <ArrowUpRight size={18} aria-hidden='true' />
        </a>
      </div>
    </section>

    <Link
      to='/sessions'
      className='group flex min-h-20 items-center justify-between gap-6 border-t border-[var(--editorial-rule)] pt-8 type-public-section hover:underline underline-offset-8'
    >
      Обрати свій наступний фільм{' '}
      <ArrowRight className='shrink-0' aria-hidden='true' />
    </Link>
  </EditorialPageLayout>
)

export default AboutPage
