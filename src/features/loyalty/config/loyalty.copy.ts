export const loyaltyCopy = {
  checkout: {
    checkingBalance: 'Перевіряємо баланс',
    goldUpgrade: 'Оновити до VIP (+60 ₴)',
    usePoints: (pointsBalance: number) =>
      `Використати бали (Доступно: ${pointsBalance})`,
  },
  tier: {
    currentStatus: 'Поточний статус',
    highestTier: 'У вас найвищий рівень програми.',
    nextTier: (label: string) => `Наступний рівень: ${label}.`,
    goldUpgradeAvailable: 'Доступне підвищення до Gold',
    maximumTier: 'Максимальний рівень програми лояльності',
    pointsRemaining: (points: number, label: string | undefined) =>
      `Залишилось ${points} балів до ${label}`,
    pointsThisYear: 'Балів цього року',
    visitsThisYear: 'Візитів цього року',
    activeUntil: (date: string) => `Статус активний до ${date}.`,
    maximumReached: 'Максимальний рівень досягнуто',
  },
} as const
