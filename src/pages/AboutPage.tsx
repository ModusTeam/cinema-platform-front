import {
  Mail,
  Github,
  MapPin,
  ArrowRight,
  MonitorPlay,
  Armchair,
  Sparkles,
  Quote,
} from 'lucide-react'
import { AuroraText } from '../common/components/AuroraText'

const AboutPage = () => {
  return (
    <div className='flex min-h-screen flex-col lg:flex-row bg-black'>
      <div className='relative h-[40vh] w-full overflow-hidden bg-zinc-950 lg:sticky lg:top-0 lg:h-screen lg:w-1/2 border-r border-white/5'>
        <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black' />

        <div className='absolute inset-0 flex items-center justify-center p-10'>
          <div className='relative z-10 select-none'>
            <div className='absolute -inset-20 rounded-full bg-[var(--color-primary)]/10 blur-[120px]' />
            <h1 className='relative z-10 text-7xl font-black uppercase tracking-tighter text-white sm:text-8xl lg:text-9xl leading-[0.8]'>
              Cine
              <br />
              ma<span className='text-[var(--color-primary)]'>.</span>
            </h1>
          </div>
        </div>

        <div className='absolute bottom-12 left-12 right-12 hidden lg:block'>
          <Quote
            className='text-[var(--color-primary)] mb-4 opacity-50'
            size={32}
          />
          <p className='text-xl font-medium text-zinc-300 italic leading-relaxed max-w-md'>
            "Не намагайтеся зрозуміти, відчуйте це."
          </p>
          <div className='mt-4 flex items-center gap-3'>
            <div className='h-px w-8 bg-zinc-600'></div>
            <span className='text-xs font-bold uppercase tracking-widest text-zinc-500'>
              Кристофер Нолан
            </span>
          </div>
        </div>
      </div>

      <div className='flex w-full flex-col justify-center bg-[#0a0a0a] px-6 py-20 lg:min-h-screen lg:w-1/2 lg:px-20 lg:py-24 relative'>
        <div className='max-w-xl space-y-20 animate-in slide-in-from-bottom-10 fade-in duration-1000 mx-auto lg:mx-0'>
          <div className='space-y-8'>
            <span className='inline-block px-3 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]'>
              Хто ми є
            </span>
            <h2 className='text-4xl md:text-5xl font-black leading-tight text-white'>
              Інженерія <br />
              <AuroraText className='font-black'>ваших емоцій</AuroraText>
            </h2>
            <p className='text-lg leading-relaxed text-[var(--text-muted)]'>
              Cine<span className='text-white'>ma</span> — це більше, ніж просто
              екран і проєктор. Це пет-проект, який виріс у повноцінну
              платформу, що демонструє можливості сучасного вебу. Ми поєднали
              естетику мінімалізму з потужністю сучасних технологій.
            </p>
          </div>

          <div className='grid gap-8 py-8 border-y border-white/5'>
            <div className='group'>
              <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors'>
                <MonitorPlay size={20} />
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>
                Технологічність
              </h3>
              <p className='text-sm text-zinc-500 leading-relaxed'>
                Використання React, SignalR та оптимізованих алгоритмів для
                миттєвого бронювання без затримок.
              </p>
            </div>

            <div className='group'>
              <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors'>
                <Armchair size={20} />
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>Комфорт UX</h3>
              <p className='text-sm text-zinc-500 leading-relaxed'>
                Інтерфейс, який не заважає. "Quiet Luxury" дизайн, фокус на
                контенті та інтуїтивна навігація.
              </p>
            </div>

            <div className='group'>
              <div className='mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors'>
                <Sparkles size={20} />
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>Атмосфера</h3>
              <p className='text-sm text-zinc-500 leading-relaxed'>
                Темна тема, кінематографічні анімації та увага до дрібниць
                створюють настрій ще до початку сеансу.
              </p>
            </div>
          </div>

          <div className='space-y-8'>
            <h3 className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6'>
              Знімальна група (Контакти)
            </h3>

            <div className='space-y-0'>
              <div className='flex items-baseline justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group'>
                <div className='flex items-center gap-3'>
                  <MapPin
                    size={16}
                    className='text-[var(--color-primary)] opacity-50 group-hover:opacity-100'
                  />
                  <span className='text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider'>
                    Локація
                  </span>
                </div>
                <span className='text-right text-white font-mono text-sm'>
                  Острог, Україна
                </span>
              </div>

              <div className='flex items-baseline justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group'>
                <div className='flex items-center gap-3'>
                  <Mail
                    size={16}
                    className='text-[var(--color-primary)] opacity-50 group-hover:opacity-100'
                  />
                  <span className='text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider'>
                    Email
                  </span>
                </div>
                <a
                  href='mailto:an.stawski@outlook.com'
                  className='text-right text-white font-mono text-sm hover:text-[var(--color-primary)] transition-colors'
                >
                  an.stawski@outlook.com
                </a>
              </div>

              <div className='flex items-baseline justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group'>
                <div className='flex items-center gap-3'>
                  <Github
                    size={16}
                    className='text-[var(--color-primary)] opacity-50 group-hover:opacity-100'
                  />
                  <span className='text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider'>
                    GitHub / Dev
                  </span>
                </div>
                <a
                  href='https://github.com/stkossman'
                  target='_blank'
                  rel='noreferrer'
                  className='text-right text-white font-mono text-sm hover:text-[var(--color-primary)] transition-colors'
                >
                  @stkossman
                </a>
              </div>
            </div>

            <div className='pt-8'>
              <a
                href='mailto:an.stawski@outlook.com'
                className='group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-zinc-200'
              >
                <span className='relative z-10 flex items-center gap-2'>
                  Розпочати співпрацю <ArrowRight size={18} />
                </span>
              </a>
            </div>
          </div>

          <div className='pt-10 text-center lg:text-left opacity-30'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-white font-bold'>
              Designed & Developed by Kossman
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
