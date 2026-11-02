import type { LoyaltyTransaction } from '../model/loyalty.types'

const TRANSACTION_TITLES: Record<string, string> = {
  EARN_TICKET: 'Купівля квитків',
  EARN_FOOD: 'Покупки в кінобарі',
  EARN_BIRTHDAY: 'Бонус до дня народження',
  EARN_SPECIAL: 'Спеціальна подія',
  EARN_PROMO: 'Промоційне нарахування',
  EARN_ACHIEVEMENT: 'Нагорода за досягнення',
  BURN_DISCOUNT: 'Використання знижки',
  BURN_REWARD: 'Використання нагороди',
  EXPIRE: 'Завершення терміну дії балів',
  ADJUST: 'Коригування балів',
  REFUND: 'Повернення балів',
  ADMIN_ADDITION: 'Бонусне нарахування',
  ADMIN_DEDUCTION: 'Списання балів',
}

export const formatTransactionDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Дата невідома'
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const getTransactionPointsTone = (
  transaction: LoyaltyTransaction,
): 'positive' | 'negative' | 'neutral' => {
  if (transaction.points > 0) return 'positive'
  if (transaction.points < 0) return 'negative'
  return 'neutral'
}

export const formatSignedPoints = ({ points }: LoyaltyTransaction) =>
  `${points > 0 ? '+' : points < 0 ? '-' : ''}${Math.abs(points).toLocaleString('uk-UA')}`

const getCleanReason = (transaction: LoyaltyTransaction) => {
  const description = transaction.description.trim()
  if (!description) return null

  if (
    transaction.type === 'ADMIN_ADDITION' ||
    transaction.type === 'ADMIN_DEDUCTION'
  ) {
    return (
      description
        .replace(/^\[Admin:[^\]]*\]\s*Reason:\s*/i, '')
        .replace(/^Reason:\s*/i, '')
        .trim() || null
    )
  }
  if (
    (transaction.type === 'EARN_TICKET' ||
      transaction.type === 'EARN_SPECIAL') &&
    /^Earned \d+ pts for order [a-f0-9-]{36}(?: \([A-Z_]+\))?$/i.test(
      description,
    )
  )
    return null
  if (
    transaction.type === 'BURN_DISCOUNT' &&
    /^Redeemed \d+ pts for order [a-f0-9-]{36}$/i.test(description)
  )
    return null
  if (transaction.type === 'EXPIRE' && description === 'Points expired')
    return null
  return description
}

export const formatTransactionInfo = (transaction: LoyaltyTransaction) => ({
  title: Object.hasOwn(TRANSACTION_TITLES, transaction.type)
    ? TRANSACTION_TITLES[transaction.type]
    : 'Операція з балами',
  date: formatTransactionDate(transaction.createdAt),
  description: getCleanReason(transaction),
})
