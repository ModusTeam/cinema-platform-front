import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  // Home anchors and POP navigation belong to the browser, including Lenis entry.
  // Retain the existing pathname reset on all other routes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only pathname navigation resets scroll, never same-page hash changes.
  useEffect(() => {
    if (pathname === '/' && (navigationType === 'POP' || window.location.hash))
      return
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}

export default ScrollToTop
