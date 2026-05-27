import StaticPageLayout from '../layouts/StaticPageLayout'

const PrivacyPage = () => {
  return (
    <StaticPageLayout
      title='Політика конфіденційності'
      subtitle='Ваша довіра — наш найцінніший актив. Прозорість у обробці даних.'
    >
      <div className='space-y-10 text-base md:text-lg leading-relaxed'>
        <div className='border-l-4 border-[var(--color-primary)] bg-white/5 p-6 rounded-r-xl'>
          <p className='text-zinc-300 italic'>
            Ця Політика конфіденційності пояснює, як &quot;Cinema Platform&quot;
            збирає, використовує та захищає ваші персональні дані. Ми діємо
            відповідно до Закону України «Про захист персональних даних».
          </p>
        </div>

        <div>
          <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-3'>
            <span className='text-[var(--color-primary)]'>01.</span> Збір
            інформації
          </h3>
          <p className='text-zinc-400 mb-4'>
            Ми збираємо лише ті дані, які необхідні для надання послуг
            бронювання та покращення вашого досвіду:
          </p>
          <ul className='list-disc pl-6 space-y-2 text-zinc-400 marker:text-[var(--color-primary)]'>
            <li>
              <strong className='text-white'>Особисті дані:</strong> Ім&apos;я,
              прізвище, номер телефону та адреса електронної пошти (для
              ідентифікації та надсилання квитків).
            </li>
            <li>
              <strong className='text-white'>Платіжні дані:</strong> Ми не
              зберігаємо повні дані ваших банківських карток. Всі транзакції
              обробляються через сертифіковані платіжні шлюзи (PCI DSS).
            </li>
            <li>
              <strong className='text-white'>Технічні дані:</strong> IP-адреса,
              тип пристрою, історія переглядів на сайті (для аналітики та
              безпеки).
            </li>
          </ul>
        </div>

        <div>
          <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-3'>
            <span className='text-[var(--color-primary)]'>02.</span>{' '}
            Використання даних
          </h3>
          <p className='text-zinc-400 mb-4'>
            Ваша інформація використовується для:
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white/5 p-4 rounded-lg border border-white/5 text-sm text-zinc-300'>
              🎫 Обробки бронювань та покупок квитків.
            </div>
            <div className='bg-white/5 p-4 rounded-lg border border-white/5 text-sm text-zinc-300'>
              📞 Служби підтримки та зворотного зв&apos;язку.
            </div>
            <div className='bg-white/5 p-4 rounded-lg border border-white/5 text-sm text-zinc-300'>
              🛡️ Запобігання шахрайству та безпеки акаунту.
            </div>
            <div className='bg-white/5 p-4 rounded-lg border border-white/5 text-sm text-zinc-300'>
              🎁 Персональних пропозицій (тільки за вашою згодою).
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-3'>
            <span className='text-[var(--color-primary)]'>03.</span> Захист
            інформації
          </h3>
          <p className='text-zinc-400'>
            Ми впровадили комплекс технічних та організаційних заходів безпеки.
            Веб-сайт використовує протокол шифрування{' '}
            <strong>SSL (HTTPS)</strong>, що гарантує захищену передачу даних
            між вашим браузером та нашими серверами. Паролі користувачів
            зберігаються у вигляді хеш-сум і не доступні навіть співробітникам
            компанії.
          </p>
        </div>

        <div>
          <h3 className='text-2xl font-bold text-white mb-4 flex items-center gap-3'>
            <span className='text-[var(--color-primary)]'>04.</span>{' '}
            Cookie-файли
          </h3>
          <p className='text-zinc-400'>
            Ми використовуємо файли cookie для збереження вашої сесії
            авторизації та налаштувань. Ви можете відключити їх у налаштуваннях
            браузера, проте це може вплинути на коректну роботу сайту.
          </p>
        </div>

        <div className='pt-8 border-t border-white/10 mt-12'>
          <p className='text-sm text-zinc-500'>
            Якщо ви бажаєте видалити свій акаунт або отримати виписку про
            зібрані дані, будь ласка, зв&apos;яжіться з нашим Data Protection
            Officer за адресою:{' '}
            <a
              href='mailto:privacy@cinema.ua'
              className='text-white hover:text-[var(--color-primary)] underline decoration-dotted underline-offset-4'
            >
              privacy@cinema.ua
            </a>
            .
          </p>
          <p className='text-xs text-zinc-600 mt-2'>
            Останнє оновлення: 1 лютого 2026 року
          </p>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default PrivacyPage
