import { type Session, SessionStatus } from '../model/session.types'

export function getUpcomingSessions(
  sessions: Session[],
  movieId: string,
  now = Date.now(),
): Session[] {
  return sessions
    .filter(
      session =>
        session.movieId === movieId &&
        session.status === SessionStatus.Scheduled &&
        Date.parse(session.startTime) > now,
    )
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
}
