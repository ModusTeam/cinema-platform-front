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
    goldUpgradeAvailable:
      'Доступне підвищення квитка до VIP за статусом Gold. Умови перевіряються під час оформлення.',
    maximumTier: 'Максимальний рівень програми лояльності',
    qualificationNotice:
      'Доступні бали можна витрачати. Їхній залишок не показує прогрес до наступного рівня.',
    progressionUnavailable: 'Прогрес до наступного рівня наразі недоступний.',
    pointsThisYear: 'Нараховано балів цього року',
    visitsThisYear: 'Візитів цього року',
    activeUntil: (date: string) => `Статус активний до ${date}.`,
    maximumReached: 'Максимальний рівень досягнуто',
  },
} as const
