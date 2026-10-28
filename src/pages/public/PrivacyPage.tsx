import StaticPageLayout from '@/widgets/static-page/ui/StaticPageLayout'

const PrivacyPage = () => {
  return (
    <StaticPageLayout
      title='Політика конфіденційності'
      subtitle='Ваша довіра — наш найцінніший актив. Прозорість у обробці даних.'
    >
      <div className='space-y-12'>
        <div className='border-b border-[var(--editorial-rule)] pb-8'>
          <p className='text-[var(--text-muted)] italic'>
            Ця Політика конфіденційності пояснює, як &quot;Cinema Platform&quot;
            збирає, використовує та захищає ваші персональні дані. Ми діємо
            відповідно до Закону України «Про захист персональних даних».
          </p>
        </div>

        <div>
          <h2 className='text-2xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-3'>
            <span>01.</span> Збір інформації
          </h2>
          <p className='text-[var(--text-muted)] mb-4'>
            Ми збираємо лише ті дані, які необхідні для надання послуг
            бронювання та покращення вашого досвіду:
          </p>
          <ul className='list-disc pl-6 space-y-2 text-[var(--text-muted)] marker:text-[var(--text-muted)]'>
            <li>
              <strong className='text-[var(--text-main)]'>
                Особисті дані:
              </strong>{' '}
              Ім&apos;я, прізвище, номер телефону та адреса електронної пошти
              (для ідентифікації та надсилання квитків).
            </li>
            <li>
              <strong className='text-[var(--text-main)]'>
                Платіжні дані:
              </strong>{' '}
              Ми не зберігаємо повні дані ваших банківських карток. Всі
              транзакції обробляються через сертифіковані платіжні шлюзи (PCI
              DSS).
            </li>
            <li>
              <strong className='text-[var(--text-main)]'>
                Технічні дані:
              </strong>{' '}
              IP-адреса, тип пристрою, історія переглядів на сайті (для
              аналітики та безпеки).
            </li>
          </ul>
        </div>

        <div>
          <h2 className='text-2xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-3'>
            <span>02.</span> Використання даних
          </h2>
          <p className='text-[var(--text-muted)] mb-4'>
            Ваша інформація використовується для:
          </p>
          <ul className='list-disc space-y-3 pl-6'>
            <li>Обробки бронювань та покупок квитків.</li>
            <li>Служби підтримки та зворотного зв&apos;язку.</li>
            <li>Запобігання шахрайству та безпеки акаунту.</li>
            <li>Персональних пропозицій (тільки за вашою згодою).</li>
          </ul>
        </div>

        <div>
          <h2 className='text-2xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-3'>
            <span>03.</span> Захист інформації
          </h2>
          <p className='text-[var(--text-muted)]'>
            Ми впровадили комплекс технічних та організаційних заходів безпеки.
            Веб-сайт використовує протокол шифрування{' '}
            <strong>SSL (HTTPS)</strong>, що гарантує захищену передачу даних
            між вашим браузером та нашими серверами. Паролі користувачів
            зберігаються у вигляді хеш-сум і не доступні навіть співробітникам
            компанії.
          </p>
        </div>

        <div>
          <h2 className='text-2xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-3'>
            <span>04.</span> Cookie-файли
          </h2>
          <p className='text-[var(--text-muted)]'>
            Ми використовуємо файли cookie для збереження вашої сесії
            авторизації та налаштувань. Ви можете відключити їх у налаштуваннях
            браузера, проте це може вплинути на коректну роботу сайту.
          </p>
        </div>

        <div className='pt-8 border-t border-[var(--editorial-rule)] mt-12'>
          <p className='text-base text-[var(--text-muted)]'>
            Якщо ви бажаєте видалити свій акаунт або отримати виписку про
            зібрані дані, будь ласка, зв&apos;яжіться з нашим Data Protection
            Officer за адресою:{' '}
            <a
              href='mailto:privacy@cinema.ua'
              className='text-[var(--text-main)] hover:text-[var(--text-muted)] underline decoration-dotted underline-offset-4'
            >
              privacy@cinema.ua
            </a>
            .
          </p>
          <p className='text-base text-[var(--text-muted)] mt-2'>
            Останнє оновлення: 1 лютого 2026 року
          </p>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default PrivacyPage
