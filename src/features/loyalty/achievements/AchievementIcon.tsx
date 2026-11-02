import { Icon } from '@iconify/react/offline'
import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { loadAchievementIcon } from './achievementIconApi'
import { resolveAchievementIcon } from './achievementIcons'

interface AchievementIconProps {
  identifier?: string
  hidden?: boolean
  size?: number
  className?: string
  strokeWidth?: number
}

function RemoteAchievementIcon({
  identifier,
  size = 32,
  className,
}: AchievementIconProps & { identifier: string }) {
  const { data } = useQuery({
    queryKey: ['achievement-icon', identifier],
    queryFn: ({ signal }) => loadAchievementIcon(identifier, signal),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })
  return data ? (
    <Icon
      icon={data}
      width={size}
      height={size}
      className={className}
      aria-hidden='true'
    />
  ) : (
    <Trophy size={size} className={className} aria-hidden='true' />
  )
}

export function AchievementIcon({
  identifier,
  hidden,
  size = 32,
  className,
  strokeWidth = 2,
}: AchievementIconProps) {
  const resolved = resolveAchievementIcon(identifier, hidden)
  if (resolved.kind === 'curated') {
    return (
      <Icon
        icon={resolved.icon.data}
        width={size}
        height={size}
        className={className}
        aria-hidden='true'
      />
    )
  }
  if (resolved.kind === 'remote') {
    return (
      <RemoteAchievementIcon
        identifier={resolved.id}
        size={size}
        className={className}
      />
    )
  }
  const Fallback = resolved.component
  return (
    <Fallback
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden='true'
    />
  )
}
