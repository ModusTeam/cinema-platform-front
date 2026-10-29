import type { Session } from '@/entities/session/model/session.types'
import { SessionStatus } from '@/entities/session/model/session.types'
import { normalizeId } from '@/shared/lib/normalizeId'

export const readSessionHandoff = (state: unknown): string | undefined => {
  if (!state || typeof state !== 'object' || !('sessionId' in state)) return
  const id = state.sessionId
  return typeof id === 'string' && /^[a-z0-9-]{1,128}$/i.test(id)
    ? normalizeId(id)
    : undefined
}

export const isBookableSession = (
  session: Session,
  movieId: string,
  now = Date.now(),
) =>
  normalizeId(session.movieId) === normalizeId(movieId) &&
  session.status === SessionStatus.Scheduled &&
  new Date(session.startTime).getTime() > now

export const validateSessionHandoff = (
  session: Session,
  sessionId: string,
  movieId: string,
  now = Date.now(),
) =>
  normalizeId(session.id) === normalizeId(sessionId) &&
  isBookableSession(session, movieId, now)
