export interface BarItemOption {
  label: string
  price: number
}

export interface BarItem {
  name: string
  description?: string
  options: BarItemOption[]
  tags?: string[]
}

export interface BarCategory {
  id: string
  title: string
  icon: string
  gradient: string
  items: BarItem[]
}

export const BAR_MENU: BarCategory[] = [
  {
    id: 'popcorn',
    title: 'Хрусткий Попкорн',
    icon: 'Popcorn',
    gradient: 'from-yellow-400 to-orange-500',
    items: [
      {
        name: 'Класичний Солоний',
        description: 'Традиційний смак кінотеатру. Ідеально хрусткий.',
        options: [
          { label: 'S (0.7л)', price: 90 },
          { label: 'M (1.5л)', price: 130 },
          { label: 'L (3.0л)', price: 180 },
          { label: 'XL Відро', price: 250 },
        ],
        tags: ['Хіт'],
      },
      {
        name: 'Сирний / Карамельний',
        description: 'Насичений смак чеддеру або солодка карамельна скоринка.',
        options: [
          { label: 'S (0.7л)', price: 110 },
          { label: 'M (1.5л)', price: 160 },
          { label: 'L (3.0л)', price: 220 },
        ],
      },
      {
        name: 'Мікс смаків',
        description: 'Поєднайте солоний та солодкий в одному відрі.',
        options: [
          { label: 'L (3.0л)', price: 230 },
          { label: 'XL Відро', price: 290 },
        ],
        tags: ['Рекомендуємо'],
      },
    ],
  },
  {
    id: 'drinks',
    title: 'Напої',
    icon: 'CupSoda',
    gradient: 'from-blue-400 to-indigo-600',
    items: [
      {
        name: 'Розливні напої',
        description: 'Coca-Cola, Fanta, Sprite, Coca-Cola Zero.',
        options: [
          { label: '0.5л', price: 60 },
          { label: '0.8л', price: 85 },
          { label: '1.0л', price: 100 },
        ],
      },
      {
        name: 'Вода та Соки',
        description: 'Негазована/газована вода, соки Rich в асортименті.',
        options: [
          { label: 'Вода 0.5л', price: 45 },
          { label: 'Сік 0.33л', price: 65 },
        ],
      },
      {
        name: 'Слаш (Фруктовий сніг)',
        description:
          'Крижаний фруктовий десерт. Смаки: Вишня, Блакитна малина.',
        options: [
          { label: '0.3л', price: 80 },
          { label: '0.5л', price: 110 },
        ],
        tags: ['Тільки літом'],
      },
    ],
  },
  {
    id: 'coffee',
    title: 'Кава та Чай',
    icon: 'Coffee',
    gradient: 'from-amber-700 to-orange-900',
    items: [
      {
        name: 'Кава',
        description: '100% Арабіка свіжого обсмаження.',
        options: [
          { label: 'Еспресо', price: 40 },
          { label: 'Американо', price: 45 },
          { label: 'Капучино', price: 65 },
          { label: 'Лате', price: 70 },
        ],
      },
      {
        name: 'Чай',
        description: "Чорний, зелений, трав'яний.",
        options: [{ label: '400мл', price: 45 }],
      },
    ],
  },
  {
    id: 'snacks',
    title: 'Снеки',
    icon: 'Pizza',
    gradient: 'from-red-500 to-pink-600',
    items: [
      {
        name: 'Начос',
        description:
          'Кукурудзяні чипси з теплим соусом на вибір (Сирний / Сальса).',
        options: [
          { label: 'Стандарт (100г)', price: 140 },
          { label: 'Великий (180г)', price: 190 },
        ],
        tags: ['До пива'],
      },
      {
        name: 'Шоколадні батончики',
        description: 'Snickers, Mars, KitKat, M&Ms.',
        options: [
          { label: 'Стандарт', price: 45 },
          { label: 'King Size', price: 65 },
        ],
      },
    ],
  },
  {
    id: 'combos',
    title: 'Вигідні Комбо',
    icon: 'Package',
    gradient: 'from-green-400 to-emerald-600',
    items: [
      {
        name: 'Solo Combo',
        description: 'Попкорн M + Напій 0.5л.',
        options: [{ label: 'Набір', price: 180 }],
        tags: ['Вигода 15%'],
      },
      {
        name: 'Duo Combo',
        description: 'Попкорн L + 2 Напої 0.8л.',
        options: [{ label: 'Набір', price: 340 }],
        tags: ['Для двох'],
      },
      {
        name: "Kid's Box",
        description: 'Маленький попкорн + Сік + Іграшка.',
        options: [{ label: 'Набір', price: 160 }],
        tags: ['Дітям'],
      },
    ],
  },
]
