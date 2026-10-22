import {
  focusManager,
  onlineManager,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { sessionsService } from '@/entities/session/api/sessions.service'
import { normalizeId } from '@/shared/lib/normalizeId'
import {
  OCCUPANCY_POLL_INTERVAL,
  OccupancyRevision,
  shouldReconcile,
} from '../lib/occupancyReconciliation'

const subscribeActivity = (notify: () => void) => {
  const unfocus = focusManager.subscribe(notify)
  const unonline = onlineManager.subscribe(notify)
  return () => {
    unfocus()
    unonline()
  }
}
const browserActive = () => focusManager.isFocused() && onlineManager.isOnline()

export const useSeatOccupancy = (
  sessionId: string | null,
  userId: string | undefined,
  active: boolean,
) => {
  const queryClient = useQueryClient()
  const browserReady = useSyncExternalStore(subscribeActivity, browserActive)
  const sessionKey = normalizeId(sessionId || '')
  const userKey = normalizeId(userId || '')
  const revision = useMemo(() => new OccupancyRevision(), [sessionKey, userKey])
  useEffect(() => {
    revision.active = true
    return () => {
      revision.active = false
    }
  }, [revision])
  const enabled = shouldReconcile(active && !!sessionId, browserReady, true)
  const queryOptions = useMemo(
    () => ({
      // Ownership is user-specific even though the endpoint is public.
      queryKey: ['session-seat-availability', sessionKey, userKey],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        revision.read(
          () => sessionsService.getSeatAvailability(sessionKey, signal),
          signal,
        ),
      staleTime: 0,
      gcTime: 0,
      retry: false as const,
    }),
    [revision, sessionKey, userKey],
  )
  const query = useQuery({
    ...queryOptions,
    enabled,
    refetchInterval: enabled ? OCCUPANCY_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  })
  const refresh = useCallback(async () => {
    revision.invalidate()
    if (!active || !revision.active || !sessionKey || !browserActive())
      return undefined
    // Share the in-flight request. The revision forces a follow-up read when
    // a notification arrived during it, including the initial HTTP request.
    // fetchQuery binds the request to this captured key. An observer's refetch
    // would follow a later session switch, even from an old lock callback.
    try {
      let result = await queryClient.fetchQuery(queryOptions)
      while (
        revision.active &&
        (result.revision !== revision.value ||
          result.source !== revision.source)
      ) {
        result = await queryClient.fetchQuery(queryOptions)
      }
      return revision.active ? result.data : undefined
    } catch {
      return undefined
    }
  }, [active, queryClient, queryOptions, revision, sessionKey])

  return {
    data: query.data?.data,
    verified:
      enabled &&
      query.isSuccess &&
      query.data.source === revision.source &&
      query.data.revision === revision.value &&
      !query.isFetching,
    isError: query.isError,
    refresh,
  }
}
