import { Link } from 'react-router-dom'
import {
  Facebook,
  Instagram,
  Youtube,
  Apple,
  Play,
  Smartphone,
  Film,
} from 'lucide-react'

const Footer = () => {
  return (
    <footer className='bg-[#050505] border-t border-white/5 pt-12 pb-10 text-sm text-[var(--text-muted)] relative z-10'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-16'>
          <div className='lg:col-span-1 md:col-span-2 lg:col-auto mb-6 lg:mb-0'>
            <Link
              to='/'
              className='flex items-center gap-2 text-2xl font-black tracking-tighter text-white uppercase mb-6'
            >
              <Film size={24} className='text-[var(--color-primary)]' />
              Cinema.
            </Link>
            <p className='text-zinc-500 mb-8 leading-relaxed max-w-sm'>
              Створюємо магію кіно, поєднуючи передові технології та бездоганний
              сервіс. Ваш найкращий вечір починається тут.
            </p>
            <div className='flex gap-3'>
              <SocialIcon icon={Instagram} href='#' />
              <SocialIcon icon={Facebook} href='#' />
              <SocialIcon icon={Youtube} href='#' />
            </div>
          </div>

          <div>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-xs'>
              Кінотеатр
            </h4>
            <ul className='space-y-4'>
              <li>
                <FooterLink to='/info/technologies'>Технології</FooterLink>
              </li>
              <li>
                <FooterLink to='/info/halls'>Наші зали</FooterLink>
              </li>
              <li>
                <FooterLink to='/bar'>Меню кінобару</FooterLink>
              </li>
              <li>
                <FooterLink to='/sessions'>Розклад сеансів</FooterLink>
              </li>
              <li>
                <FooterLink to='/careers'>Вакансії</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-xs'>
              Сервіс
            </h4>
            <ul className='space-y-4'>
              <li>
                <FooterLink to='/profile'>Особистий кабінет</FooterLink>
              </li>
              <li>
                <FooterLink to='/faq'>Часті запитання</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-xs'>
              Інформація
            </h4>
            <ul className='space-y-4'>
              <li>
                <FooterLink to='/info/rules'>Правила</FooterLink>
              </li>
              <li>
                <FooterLink to='/info/privacy'>Конфіденційність</FooterLink>
              </li>
              <li>
                <FooterLink to='/info/offer'>Оферта</FooterLink>
              </li>
              <li>
                <FooterLink to='/info/age-limits'>Вікові обмеження</FooterLink>
              </li>
            </ul>
          </div>

          <div className='md:col-span-2 lg:col-auto mt-6 lg:mt-0'>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-xs flex items-center gap-2'>
              <Smartphone size={14} className='text-[var(--color-primary)]' />{' '}
              Мобільний додаток
            </h4>
            <div className='flex flex-row md:flex-col lg:flex-col gap-3'>
              <AppButton icon={Apple} label='App Store' />
              <AppButton icon={Play} label='Google Play' />
            </div>
          </div>
        </div>

        <div className='border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600'>
          <div className='text-center md:text-left'>
            © {new Date().getFullYear()} Cinema Platform. All rights reserved.
          </div>
          <div className='flex gap-4'>
            <Link to='/sitemap' className='hover:text-zinc-400'>
              Мапа сайту
            </Link>
            <Link to='/cookies' className='hover:text-zinc-400'>
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterLink = ({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) => (
  <Link
    to={to}
    className='hover:text-[var(--color-primary)] transition-colors duration-200 block text-base lg:text-sm py-1 lg:py-0'
  >
    {children}
  </Link>
)

const SocialIcon = ({ icon: Icon, href }: { icon: any; href: string }) => (
  <a
    href={href}
    target='_blank'
    rel='noreferrer'
    className='p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition-all duration-300 group'
  >
    <Icon
      size={16}
      className='group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-white'
    />
  </a>
)

const AppButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <button
    type='button'
    className='flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group w-full lg:w-full text-left active:scale-95'
  >
    <Icon
      size={20}
      className='text-zinc-400 group-hover:text-white transition-colors'
    />
    <div className='flex flex-col leading-none'>
      <span className='text-[9px] text-zinc-500 uppercase font-bold'>
        Завантажити з
      </span>
      <span className='text-xs font-bold text-white mt-1'>{label}</span>
    </div>
  </button>
)

export default Footer
