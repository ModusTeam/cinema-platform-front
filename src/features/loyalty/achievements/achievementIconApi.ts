import type { IconifyIcon } from '@iconify/react/offline'
import { RETRO_ICON_PATTERN, RETRO_PREFIX } from './achievementIcons'

const ICONIFY_API = 'https://api.iconify.design'
export const ICON_SEARCH_LIMIT = 32

async function requestJson(
  path: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await fetch(`${ICONIFY_API}/${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    credentials: 'omit',
  })
  if (!response.ok) throw new Error('Iconify is unavailable')
  return response.json()
}

export async function searchAchievementIcons(
  query: string,
  signal: AbortSignal,
) {
  const params = new URLSearchParams({
    query,
    prefix: RETRO_PREFIX,
    limit: String(ICON_SEARCH_LIMIT),
  })
  const result = await requestJson(`search?${params}`, signal)
  if (
    !result ||
    typeof result !== 'object' ||
    !('icons' in result) ||
    !Array.isArray(result.icons)
  ) {
    throw new Error('Invalid icon search response')
  }
  return result.icons
    .filter(
      (id): id is string =>
        typeof id === 'string' && RETRO_ICON_PATTERN.test(id),
    )
    .slice(0, ICON_SEARCH_LIMIT)
}

export async function loadAchievementIcon(
  id: string,
  signal: AbortSignal,
): Promise<IconifyIcon> {
  if (!RETRO_ICON_PATTERN.test(id))
    throw new Error('Unsupported icon collection')
  const name = id.slice(RETRO_PREFIX.length + 1)
  const result = await requestJson(
    `${RETRO_PREFIX}.json?icons=${encodeURIComponent(name)}`,
    signal,
  )
  if (
    !result ||
    typeof result !== 'object' ||
    !('icons' in result) ||
    !result.icons ||
    typeof result.icons !== 'object' ||
    !(name in result.icons)
  ) {
    throw new Error('Icon artwork is unavailable')
  }
  const icon: unknown = result.icons[name as keyof typeof result.icons]
  if (
    !icon ||
    typeof icon !== 'object' ||
    !('body' in icon) ||
    typeof icon.body !== 'string'
  ) {
    throw new Error('Invalid icon artwork')
  }
  const width =
    'width' in result && typeof result.width === 'number' ? result.width : 24
  const height =
    'height' in result && typeof result.height === 'number' ? result.height : 24
  return {
    body: icon.body,
    width:
      'width' in icon && typeof icon.width === 'number' ? icon.width : width,
    height:
      'height' in icon && typeof icon.height === 'number'
        ? icon.height
        : height,
  }
}
