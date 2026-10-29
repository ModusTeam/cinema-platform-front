export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseLocalDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return localDateKey(date) === value ? date : null
}

// The API filters UTC calendar days; a visitor's local day can span two.
export function utcDaysForLocalDate(date: Date): string[] {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return [
    ...new Set(
      [start, new Date(end.getTime() - 1)].map(d =>
        d.toISOString().slice(0, 10),
      ),
    ),
  ]
}
