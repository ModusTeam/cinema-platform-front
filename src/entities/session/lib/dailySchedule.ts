import { type Session, SessionStatus } from '../model/session.types'
import { localDateKey } from './sessionDates'

export function selectDailySessions(
  sessions: Session[],
  date: string,
  movieId?: string,
  now = Date.now(),
): Session[] {
  const seen = new Set<string>()
  return sessions
    .filter(session => {
      const id = session.id.toLowerCase()
      const start = new Date(session.startTime)
      if (
        seen.has(id) ||
        session.status !== SessionStatus.Scheduled ||
        !(start.getTime() > now) ||
        localDateKey(start) !== date ||
        (movieId && session.movieId.toLowerCase() !== movieId.toLowerCase())
      )
        return false
      seen.add(id)
      return true
    })
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
}

export function groupSessionsByMovie(sessions: Session[]): Session[][] {
  const groups = new Map<string, Session[]>()
  for (const session of sessions) {
    const id = session.movieId.toLowerCase()
    const group = groups.get(id)
    if (group) group.push(session)
    else groups.set(id, [session])
  }
  return [...groups.values()]
}
