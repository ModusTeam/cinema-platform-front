import { useSyncExternalStore } from 'react'

const supportedQuery = '(min-width: 768px)'
const desktopQuery = '(min-width: 1024px)'

export const adminViewportStore = {
  getSnapshot: () => {
    if (!window.matchMedia(supportedQuery).matches) return 'unsupported'
    return window.matchMedia(desktopQuery).matches ? 'desktop' : 'tablet'
  },
  subscribe: (onChange: () => void) => {
    const queries = [supportedQuery, desktopQuery].map(query =>
      window.matchMedia(query),
    )
    for (const query of queries) query.addEventListener('change', onChange)
    return () => {
      for (const query of queries) query.removeEventListener('change', onChange)
    }
  },
}

export const useAdminViewport = () =>
  useSyncExternalStore(
    adminViewportStore.subscribe,
    adminViewportStore.getSnapshot,
    () => 'unsupported',
  )
