export const bookingCopy = {
  success: {
    title: 'Оплата успішна!',
    description:
      'Ваші квитки успішно заброньовані. Ми надіслали підтвердження на вашу електронну пошту.',
    profile: 'Go to profile',
    home: 'Go to home',
  },
  checkout: {
    title: 'Ваше замовлення',
    goldUpgrade: 'Ultra-comfort',
    loyaltyPoints: 'Використати бали',
    goldUnavailable: 'GOLD upgrade is unavailable.',
    loyaltyUnavailable: 'Loyalty points are unavailable.',
    previewUnavailable: 'Не вдалося завантажити попередній розрахунок',
    cannotCheckout:
      'Неможливо оформити замовлення. Перевірте обрані місця та параметри знижок.',
    baseTickets: 'Base tickets',
    goldDiscount: 'Gold upgrade discount',
    loyaltyDiscount: 'Loyalty discount',
    total: 'Total',
    pay: 'Оплатити замовлення',
    backToSeats: 'Назад до місць',
  },
  changeSession: 'Змінити сеанс',
  selectSession: 'Оберіть сеанс',
  today: 'Сьогодні',
  backToMovie: 'До фільму',
  noSessionsTitle: 'Актуальних сеансів немає',
  noSessionsDescription:
    'Для цього фільму поки не заплановано майбутніх показів. Перегляньте афішу, щоб знайти інший сеанс.',
  browseMovies: 'Афіша кінотеатру',
  selectSeats: 'Оберіть місця',
  continue: 'Продовжити',
  availability: {
    error: 'Не вдалося перевірити доступність місць. Оформлення тимчасово призупинено.',
    checking: 'Перевіряємо доступність місць…',
    retry: 'Повторити перевірку',
    lockFailed: 'Не вдалося закріпити місце. Можливо, його щойно зайняли.',
    unlockFailed: 'Не вдалося підтвердити звільнення місця. Оновіть доступність і спробуйте ще раз.',
    selectionLost: 'Обрані місця більше не закріплені за вами. Оберіть доступні місця знову.',
  },
  goldDiscount: (amount: string) => `Знижка: ${amount}`,
  pointsDiscount: (points: number, amount: string) =>
    `Доступно: ${points} балів, знижка: ${amount}`,
  seats: {
    available: 'Вільне',
    selected: 'Обране',
    occupied: 'Заброньоване / придбане',
    locked: 'Тимчасово зайняте',
    maintenance: 'Обслуговування',
    pending: 'Обробка запиту',
    unknown: 'Доступність не підтверджена',
    lockedTitle: 'Місце тимчасово зайняте іншим користувачем',
    soldTitle: 'Місце вже заброньоване або придбане',
    maintenanceTitle: 'Місце на технічному обслуговуванні',
    screen: 'Екран',
    availableTitle: (label: string, type: string) => `${label} (${type})`,
    hoverLabel: (row: string, number: number) => `Ряд ${row} / ${number}`,
  },
  fallbackSessionDate: '10 червня, 22:00',
  fallbackSeats: 'Ряд 5, Місце 12, 13',
  fallbackGenre: 'Кіно',
  fallbackHall: 'Зал 1',
} as const

export const GOLD_UPGRADE_REJECTION_CODES = new Set([
  'GOLD_UPGRADE_REQUIRES_GOLD_TIER',
  'GOLD_UPGRADE_ALREADY_USED_THIS_MONTH',
  'GOLD_UPGRADE_NO_ELIGIBLE_TICKET',
])

export const LOYALTY_POINTS_REJECTION_CODES = new Set([
  'LOYALTY_POINTS_NOT_ALLOWED_FOR_SESSION',
  'LOYALTY_POINTS_INSUFFICIENT_BALANCE',
])
