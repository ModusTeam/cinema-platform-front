// Only the existing booking route is accepted; URL schemes, queries, encoded
// separators and other destinations cannot turn login into an open redirect.
export const getBookingReturn = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('from' in state)) return
  if (
    typeof state.from !== 'string' ||
    !/^\/booking\/[a-z0-9-]{1,128}$/i.test(state.from)
  )
    return
  const sessionId =
    'sessionId' in state && typeof state.sessionId === 'string'
      ? state.sessionId
      : undefined
  return {
    pathname: state.from,
    state: sessionId ? { sessionId } : null,
  }
}
