import type { PricingItemDto } from '../api/admin-pricings.service'

export const getPriceRange = (items: PricingItemDto[]): string => {
  if (!items || items.length === 0) return 'Не налаштовано'
  const prices = items.map(item => item.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `${min} ₴` : `${min} - ${max} ₴`
}
