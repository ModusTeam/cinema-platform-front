import {
  Briefcase,
  Code,
  Heart,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'motion/react'
import { AuroraText } from '../common/components/AuroraText'

const VACANCIES = [
  {
    id: 1,
    title: 'Middle Frontend Developer (React)',
    department: 'Розробка',
    type: 'Full-time',
    location: 'Remote / Офіс',
  },
  {
    id: 2,
    title: 'Technical Lead (.NET)',
    department: 'Розробка',
    type: 'Full-time',
    location: 'Remote',
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    department: 'Дизайн',
    type: 'Project-based',
    location: 'Remote',
  },
  {
    id: 4,
    title: 'Адміністратор кінотеатру',
    department: 'Адміністрація',
    type: 'Змінний графік',
    location: 'Київ, ТРЦ Lavina Mall',
  },
  {
    id: 5,
    title: 'Кіномеханік',
    department: 'Технічний відділ',
    type: 'Змінний графік',
    location: 'Київ, ТРЦ River Mall',
  },
  {
    id: 6,
    title: 'Маркетолог',
    department: 'Маркетинг',
    type: 'Full-time',
    location: 'Офіс (Київ)',
  },
  {
    id: 7,
    title: 'Бармен кінобару',
    department: 'HoReCa',
    type: 'Змінний графік',
    location: 'Київ, ТРЦ River Mall',
  },
]

const PERKS = [
  {
    icon: <Heart className='text-[var(--color-primary)]' />,
    title: 'Медичне страхування',
    desc: 'Піклуємося про ваше здоров’я з першого дня.',
  },
  {
    icon: <Briefcase className='text-purple-500' />,
    title: 'Розвиток',
    desc: 'Компенсація курсів, конференцій та навчання.',
  },
  {
    icon: <Clock className='text-orange-500' />,
    title: 'Гнучкий графік',
    desc: 'Головне — результат, а не час проведений в офісі.',
  },
]

const CareersPage = () => {
  return (
    <div className='min-h-screen bg-[var(--bg-main)] pt-32 pb-20 px-4'>
      <div className='container mx-auto max-w-5xl'>
        <div className='text-center mb-20 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700'>
          <span className='inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]'>
            Join the Team
          </span>
          <h1 className='text-4xl md:text-6xl font-black text-white leading-tight'>
            Створюй майбутнє <br />
            <AuroraText>разом з Cinema.</AuroraText>
          </h1>
          <p className='text-lg text-[var(--text-muted)] max-w-2xl mx-auto'>
            Ми шукаємо талановитих людей, які розділяють нашу пристрасть до кіно
            та технологій. Стань частиною команди, що змінює індустрію розваг.
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mb-20'>
          {PERKS.map((perk, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className='p-6 rounded-2xl bg-[var(--bg-card)] border border-white/5 hover:border-white/10 transition-colors'
            >
              <div className='mb-4 p-3 rounded-xl bg-white/5 w-fit'>
                {perk.icon}
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>
                {perk.title}
              </h3>
              <p className='text-sm text-[var(--text-muted)]'>{perk.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className='space-y-8'>
          <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-3'>
            <Code className='text-[var(--color-primary)]' /> Відкриті позиції
          </h2>

          <div className='space-y-4'>
            {VACANCIES.map(job => (
              <motion.a
                key={job.id}
                href={`mailto:an.stawski@outlook.com?subject=Резюме: ${job.title}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer'
              >
                <div className='mb-4 md:mb-0'>
                  <h3 className='text-lg font-bold text-white group-hover:text-[var(--color-primary)] transition-colors'>
                    {job.title}
                  </h3>
                  <div className='flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-muted)]'>
                    <span className='flex items-center gap-1.5'>
                      <Briefcase size={14} /> {job.department}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <Clock size={14} /> {job.type}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <MapPin size={14} /> {job.location}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm font-bold text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'>
                  Відгукнутися <ArrowRight size={16} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        <div className='mt-20 p-8 rounded-3xl bg-gradient-to-r from-zinc-900 to-black border border-white/10 text-center relative overflow-hidden'>
          <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/diagonal-stripes.png")] opacity-5'></div>
          <div className='relative z-10'>
            <div className='inline-flex items-center justify-center p-3 rounded-full bg-white/5 mb-4'>
              <Mail className='text-white' size={24} />
            </div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Не знайшли своєї вакансії?
            </h3>
            <p className='text-[var(--text-muted)] max-w-lg mx-auto mb-6'>
              Ми завжди раді знайомству з талановитими людьми. Надішліть нам
              своє резюме, і ми зв'яжемося з вами, коли з'явиться щось цікаве.
            </p>
            <a
              href='mailto:an.stawski@outlook.com'
              className='inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-hover)] transition-colors shadow-lg shadow-[var(--color-primary)]/20'
            >
              Написати HR-команді
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareersPage
