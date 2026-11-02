import type { IconifyIcon } from '@iconify/react/offline'
import aperture from '@iconify-icons/withicons-retro/aperture'
import armchair from '@iconify-icons/withicons-retro/armchair'
import award from '@iconify-icons/withicons-retro/award'
import calendarCheck from '@iconify-icons/withicons-retro/calendar-check'
import camera from '@iconify-icons/withicons-retro/camera'
import captions from '@iconify-icons/withicons-retro/captions'
import clapperboard from '@iconify-icons/withicons-retro/clapperboard'
import clock from '@iconify-icons/withicons-retro/clock'
import crown from '@iconify-icons/withicons-retro/crown'
import disc from '@iconify-icons/withicons-retro/disc'
import film from '@iconify-icons/withicons-retro/film'
import gem from '@iconify-icons/withicons-retro/gem'
import ghost from '@iconify-icons/withicons-retro/ghost'
import glasses from '@iconify-icons/withicons-retro/glasses'
import headphones from '@iconify-icons/withicons-retro/headphones'
import heart from '@iconify-icons/withicons-retro/heart'
import medal from '@iconify-icons/withicons-retro/medal'
import moon from '@iconify-icons/withicons-retro/moon'
import musicNote from '@iconify-icons/withicons-retro/music-note'
import popcorn from '@iconify-icons/withicons-retro/popcorn'
import projector from '@iconify-icons/withicons-retro/projector'
import rocket from '@iconify-icons/withicons-retro/rocket'
import sparkles from '@iconify-icons/withicons-retro/sparkles'
import speaker from '@iconify-icons/withicons-retro/speaker'
import star from '@iconify-icons/withicons-retro/star'
import sunrise from '@iconify-icons/withicons-retro/sunrise'
import ticket from '@iconify-icons/withicons-retro/ticket'
import trophy from '@iconify-icons/withicons-retro/trophy'
import users from '@iconify-icons/withicons-retro/users'
import videoCamera from '@iconify-icons/withicons-retro/video-camera'
import {
  Award,
  BadgeCheck,
  CalendarClock,
  Clock,
  Coins,
  Flame,
  Lock,
  type LucideIcon,
  Medal,
  Star,
  Ticket,
  Trophy,
} from 'lucide-react'

export const RETRO_PREFIX = 'withicons-retro'
export const RETRO_ICON_PATTERN = /^withicons-retro:[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface CuratedAchievementIcon {
  id: string
  label: string
  keywords: string
  group: string
  data: IconifyIcon
}

// Artwork: with icons Retro © Evergrow, MIT. See /licenses/withicons-retro.txt.
export const CURATED_ACHIEVEMENT_ICONS: readonly CuratedAchievementIcon[] = [
  {
    id: 'withicons-retro:film',
    label: 'Кіноплівка',
    keywords: 'film cinema movie reel',
    group: 'Кіно',
    data: film,
  },
  {
    id: 'withicons-retro:clapperboard',
    label: 'Кінохлопавка',
    keywords: 'clapperboard cinema movie take',
    group: 'Кіно',
    data: clapperboard,
  },
  {
    id: 'withicons-retro:projector',
    label: 'Проєктор',
    keywords: 'projector cinema screening',
    group: 'Кіно',
    data: projector,
  },
  {
    id: 'withicons-retro:ticket',
    label: 'Квиток',
    keywords: 'ticket cinema admission booking',
    group: 'Кіно',
    data: ticket,
  },
  {
    id: 'withicons-retro:popcorn',
    label: 'Попкорн',
    keywords: 'popcorn cinema snack food',
    group: 'Кіно',
    data: popcorn,
  },
  {
    id: 'withicons-retro:armchair',
    label: 'Крісло',
    keywords: 'armchair seat hall screening',
    group: 'Сеанс',
    data: armchair,
  },
  {
    id: 'withicons-retro:camera',
    label: 'Фотоапарат',
    keywords: 'camera photo picture',
    group: 'Сеанс',
    data: camera,
  },
  {
    id: 'withicons-retro:video-camera',
    label: 'Кінокамера',
    keywords: 'video-camera movie filming video',
    group: 'Сеанс',
    data: videoCamera,
  },
  {
    id: 'withicons-retro:captions',
    label: 'Субтитри',
    keywords: 'captions screening language text',
    group: 'Сеанс',
    data: captions,
  },
  {
    id: 'withicons-retro:glasses',
    label: 'Окуляри',
    keywords: 'glasses screening 3d vision',
    group: 'Сеанс',
    data: glasses,
  },
  {
    id: 'withicons-retro:speaker',
    label: 'Колонка',
    keywords: 'speaker sound audio',
    group: 'Кіномистецтво',
    data: speaker,
  },
  {
    id: 'withicons-retro:headphones',
    label: 'Навушники',
    keywords: 'headphones sound audio listening',
    group: 'Кіномистецтво',
    data: headphones,
  },
  {
    id: 'withicons-retro:music-note',
    label: 'Музична нота',
    keywords: 'music-note soundtrack music audio',
    group: 'Кіномистецтво',
    data: musicNote,
  },
  {
    id: 'withicons-retro:aperture',
    label: 'Діафрагма',
    keywords: 'aperture lens photography',
    group: 'Кіномистецтво',
    data: aperture,
  },
  {
    id: 'withicons-retro:disc',
    label: 'Диск',
    keywords: 'disc record soundtrack collection',
    group: 'Кіномистецтво',
    data: disc,
  },
  {
    id: 'withicons-retro:award',
    label: 'Відзнака',
    keywords: 'award recognition prize',
    group: 'Визнання',
    data: award,
  },
  {
    id: 'withicons-retro:medal',
    label: 'Медаль',
    keywords: 'medal recognition prize winner',
    group: 'Визнання',
    data: medal,
  },
  {
    id: 'withicons-retro:trophy',
    label: 'Кубок',
    keywords: 'trophy recognition champion prize',
    group: 'Визнання',
    data: trophy,
  },
  {
    id: 'withicons-retro:star',
    label: 'Зірка',
    keywords: 'star recognition favorite',
    group: 'Визнання',
    data: star,
  },
  {
    id: 'withicons-retro:crown',
    label: 'Корона',
    keywords: 'crown recognition royal leader',
    group: 'Визнання',
    data: crown,
  },
  {
    id: 'withicons-retro:gem',
    label: 'Самоцвіт',
    keywords: 'gem rare treasure collection',
    group: 'Колекція',
    data: gem,
  },
  {
    id: 'withicons-retro:sparkles',
    label: 'Іскри',
    keywords: 'sparkles magic special collection',
    group: 'Колекція',
    data: sparkles,
  },
  {
    id: 'withicons-retro:users',
    label: 'Спільнота',
    keywords: 'users friends group people',
    group: 'Колекція',
    data: users,
  },
  {
    id: 'withicons-retro:heart',
    label: 'Серце',
    keywords: 'heart love favorite collection',
    group: 'Колекція',
    data: heart,
  },
  {
    id: 'withicons-retro:calendar-check',
    label: 'Дата в календарі',
    keywords: 'calendar-check date schedule collection',
    group: 'Колекція',
    data: calendarCheck,
  },
  {
    id: 'withicons-retro:clock',
    label: 'Годинник',
    keywords: 'clock time hour',
    group: 'Час та образи',
    data: clock,
  },
  {
    id: 'withicons-retro:moon',
    label: 'Місяць',
    keywords: 'moon night evening',
    group: 'Час та образи',
    data: moon,
  },
  {
    id: 'withicons-retro:sunrise',
    label: 'Світанок',
    keywords: 'sunrise morning sun early',
    group: 'Час та образи',
    data: sunrise,
  },
  {
    id: 'withicons-retro:ghost',
    label: 'Привид',
    keywords: 'ghost horror mystery secret',
    group: 'Час та образи',
    data: ghost,
  },
  {
    id: 'withicons-retro:rocket',
    label: 'Ракета',
    keywords: 'rocket space adventure launch',
    group: 'Час та образи',
    data: rocket,
  },
]

const curatedById = new Map(
  CURATED_ACHIEVEMENT_ICONS.map(icon => [icon.id, icon]),
)
const legacyIcons: Partial<Record<string, LucideIcon>> = {
  award: Award,
  badge: BadgeCheck,
  badge_check: BadgeCheck,
  calendar: CalendarClock,
  clock: Clock,
  coins: Coins,
  flame: Flame,
  medal: Medal,
  star: Star,
  ticket: Ticket,
  trophy: Trophy,
}

type AchievementIconResolution =
  | { kind: 'curated'; icon: CuratedAchievementIcon }
  | { kind: 'remote'; id: string }
  | { kind: 'legacy' | 'unknown' | 'secret'; component: LucideIcon }

export function resolveAchievementIcon(
  identifier?: string,
  hidden = false,
): AchievementIconResolution {
  if (hidden) return { kind: 'secret', component: Lock }
  const id = identifier?.trim() ?? ''
  // Legacy punctuation normalization would corrupt Iconify namespaces.
  if (id.includes(':')) {
    const curated = curatedById.get(id)
    if (curated) return { kind: 'curated', icon: curated }
    return RETRO_ICON_PATTERN.test(id)
      ? { kind: 'remote', id }
      : { kind: 'unknown', component: Trophy }
  }
  const normalized = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const component = Object.hasOwn(legacyIcons, normalized)
    ? legacyIcons[normalized]
    : undefined
  return component
    ? { kind: 'legacy', component }
    : { kind: 'unknown', component: Trophy }
}
