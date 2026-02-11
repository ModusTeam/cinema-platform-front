import { useState } from 'react'
import { ChevronDown, HelpCircle, Phone, Mail } from 'lucide-react'
import { clsx } from 'clsx'
import { FAQ_ITEMS } from '../data/staticContent'
import { FlipWords } from '../common/components/FlipWords'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const flipWords = ['запитання', 'теми', 'ситуації', 'міфи']

  return (
    <div className='min-h-screen bg-[var(--bg-main)] px-4 py-20 text-[var(--text-main)]'>
      <div className='container mx-auto max-w-3xl'>
        <div className='mb-16 text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-700'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-red-900 shadow-[0_0_40px_rgba(239,68,68,0.4)] transform rotate-3'>
            <HelpCircle size={40} className='text-white' />
          </div>
          <h1 className='text-4xl sm:text-6xl font-black tracking-tighter text-white'>
            Поширені{' '}
            <FlipWords
              words={flipWords}
              className='text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            />
          </h1>
          <p className='text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed'>
            Ми зібрали відповіді на найпопулярніші питання, щоб ваш похід у кіно
            був максимально комфортним.
          </p>
        </div>

        <div className='space-y-4'>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={clsx(
                  'overflow-hidden rounded-2xl border transition-all duration-300',
                  isOpen
                    ? 'bg-[var(--bg-card)] border-[var(--color-primary)]/30 shadow-[0_0_20px_-5px_rgba(239,68,68,0.1)]'
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10',
                )}
              >
                <button
                  type='button'
                  onClick={() => toggleItem(index)}
                  className='flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none group'
                >
                  <span
                    className={clsx(
                      'font-bold text-lg transition-colors pr-4',
                      isOpen
                        ? 'text-white'
                        : 'text-zinc-300 group-hover:text-white',
                    )}
                  >
                    {item.question}
                  </span>
                  <div
                    className={clsx(
                      'p-2 rounded-full transition-all duration-300 shrink-0',
                      isOpen
                        ? 'bg-[var(--color-primary)] text-white rotate-180'
                        : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-white',
                    )}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                <div
                  className={clsx(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className='overflow-hidden'>
                    <div className='px-6 pb-6 pt-0 text-[var(--text-muted)] leading-relaxed text-base border-t border-white/5 mt-2'>
                      <div className='pt-4'>{item.answer}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--bg-card)] to-black p-10 text-center shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px] group-hover:bg-[var(--color-primary)]/20 transition-colors duration-500'></div>

          <h3 className='mb-3 text-2xl font-bold text-white relative z-10'>
            Не знайшли відповіді?
          </h3>
          <p className='mb-8 text-[var(--text-muted)] relative z-10'>
            Наша служба підтримки працює 24/7 і готова допомогти.
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 relative z-10'>
            <a
              href='tel:+380800500500'
              className='flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-zinc-200 transition-colors shadow-lg active:scale-95'
            >
              <Phone size={18} />0 800 500 500
            </a>
            <a
              href='mailto:support@cinema.ua'
              className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95'
            >
              <Mail size={18} />
              Написати нам
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
