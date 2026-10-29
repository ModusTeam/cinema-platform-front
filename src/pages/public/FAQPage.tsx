import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import EditorialPageLayout from '@/widgets/static-page/ui/EditorialPageLayout'
import { FAQ_ITEMS } from './data/faq'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const accordionId = useId()

  return (
    <EditorialPageLayout
      title='Поширені запитання'
      subtitle='Ми зібрали відповіді на найпопулярніші питання, щоб ваш похід у кіно був максимально комфортним.'
      surface='paper'
    >
      <div className='grid gap-12 pt-8 md:pt-12 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:gap-20'>
        <div className='min-w-0 divide-y divide-[var(--editorial-rule)]'>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            const buttonId = `${accordionId}-question-${index}`
            const panelId = `${accordionId}-answer-${index}`
            return (
              <section key={item.question}>
                <h2>
                  <button
                    id={buttonId}
                    type='button'
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenIndex(current =>
                        current === index ? null : index,
                      )
                    }
                    className='flex min-h-16 w-full cursor-pointer items-start justify-between gap-6 py-5 text-left hover:underline underline-offset-4'
                  >
                    <span className='type-public-title'>{item.question}</span>
                    <ChevronDown
                      size={20}
                      aria-hidden='true'
                      className={cn(
                        'mt-1 shrink-0 transition-transform duration-150 motion-reduce:transition-none',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                </h2>
                <section
                  id={panelId}
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className='max-w-[68ch] pb-7 pr-4 leading-relaxed text-[var(--text-muted)]'
                >
                  {item.answer}
                </section>
              </section>
            )
          })}
        </div>
        <aside>
          <h2 className='type-public-section'>Не знайшли відповіді?</h2>
          <div className='mt-4 flex flex-col items-start'>
            <a href='tel:+380800500500' className='editorial-link'>
              0 800 500 500
            </a>
            <a href='mailto:support@cinema.ua' className='editorial-link'>
              Написати нам
            </a>
          </div>
        </aside>
      </div>
    </EditorialPageLayout>
  )
}

export default FAQPage
