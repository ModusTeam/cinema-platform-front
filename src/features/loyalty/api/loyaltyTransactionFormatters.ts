import type { LoyaltyTransaction } from './loyalty.types'

const EARNING_KEYWORDS = ['earn', 'bonus', 'refund', 'grant', 'credit']
const SPENDING_KEYWORDS = ['redeem', 'spend', 'expire', 'debit', 'charge']
const UUID_PATTERN = /\b[a-f0-9-]{36}\b/gi

const TRANSACTION_TITLES: Record<string, string> = {
  EARN_TICKET: 'Купівля квитків',
  BURN_DISCOUNT: 'Використання знижки',
  ADMIN_ADDITION: 'Бонусне нарахування',
  ADMIN_DEDUCTION: 'Списання балів',
}

export const formatTransactionDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Дата невідома'
  }

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

  const normalizedType = transaction.type.trim().toLowerCase()

  if (EARNING_KEYWORDS.some(keyword => normalizedType.includes(keyword))) {
    return 'positive'
  }

  if (SPENDING_KEYWORDS.some(keyword => normalizedType.includes(keyword))) {
    return 'negative'
  }

  return 'neutral'
}

export const formatSignedPoints = (transaction: LoyaltyTransaction) => {
  const tone = getTransactionPointsTone(transaction)
  const absolutePoints = Math.abs(transaction.points)

  if (tone === 'positive') return `+${absolutePoints}`
  if (tone === 'negative') return `-${absolutePoints}`

  return `${absolutePoints}`
}

const sanitizeDescription = (description: string) =>
  description
    .replace(UUID_PATTERN, '')
    .replace(/\[Admin:\s*\]/gi, '')
    .replace(/\bfor\s+order\b.*$/i, '')
    .replace(/\(\s*STANDARD\s*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,:;])/g, '$1')
    .trim()

const getAdminReason = (description: string) => {
  const reasonMatch = description.match(/\bReason:\s*(.+)$/i)

  if (!reasonMatch?.[1]) return null

  const reason = sanitizeDescription(reasonMatch[1])

  return reason || null
}

const getCleanReason = (transaction: LoyaltyTransaction) => {
  if (transaction.type.startsWith('ADMIN_')) {
    return getAdminReason(transaction.description)
  }

  const cleanDescription = sanitizeDescription(transaction.description)

  if (!cleanDescription) return null
  if (/^earned\s+\d+\s+pts$/i.test(cleanDescription)) return null
  if (/^burned\s+\d+\s+pts$/i.test(cleanDescription)) return null
  if (/^used\s+\d+\s+pts$/i.test(cleanDescription)) return null

  return cleanDescription
}

export const formatTransactionInfo = (transaction: LoyaltyTransaction) => {
  const title = TRANSACTION_TITLES[transaction.type] ?? 'Операція з балами'
  const date = formatTransactionDate(transaction.createdAt)
  const reason = getCleanReason(transaction)

  return {
    title,
    subtitle: reason ? `${date} · ${reason}` : date,
  }
}
