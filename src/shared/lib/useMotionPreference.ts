import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export const useMotionPreference = () => {
  const initialPreference = useReducedMotion()
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === 'undefined'
      ? initialPreference === true
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  return reducedMotion
}
