export const heroCopy = {
  label: 'Фільми у прокаті',
  carousel: 'карусель',
  programme: 'До фільмів',
  schedule: 'Повний розклад',
  pause: 'Призупинити автоматичну зміну фільмів',
  resume: 'Відновити автоматичну зміну фільмів',
  reducedMotion: 'Автопоказ вимкнено: увімкнено зменшення руху',
  manual: 'Ручний вибір',
  pauseShort: 'Пауза',
  resumeShort: 'Автопоказ',
  select: (title: string, position: number, total: number) =>
    `Показати фільм «${title}», ${position} з ${total}`,
} as const
