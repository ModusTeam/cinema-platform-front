export function achievementQueryScope(prefix: string, userId?: string) {
  return {
    queryKey: [prefix, userId ?? null],
    enabled: Boolean(userId),
  }
}
