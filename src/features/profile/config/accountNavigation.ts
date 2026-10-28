export const ACCOUNT_SECTIONS = [
  {
    id: 'active-tickets',
    label: 'Мої квитки',
    description: 'Найближчі сеанси та ваші замовлення.',
  },
  {
    id: 'history',
    label: 'Історія',
    description: 'Минулі сеанси та завершені замовлення.',
  },
  {
    id: 'achievements',
    label: 'Досягнення',
    description: 'Ваша історія знайомства з кіно.',
  },
  {
    id: 'settings',
    label: 'Профіль',
    description: 'Особисті дані та безпека акаунту.',
  },
] as const

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number]['id']

export const getAccountSection = (id: string | null) =>
  ACCOUNT_SECTIONS.find(section => section.id === id) ?? ACCOUNT_SECTIONS[0]
