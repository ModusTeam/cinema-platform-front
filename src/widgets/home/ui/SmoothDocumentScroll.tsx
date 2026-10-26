import { type LenisRef, ReactLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion/react'
import { useEffect, useRef } from 'react'
import 'lenis/dist/lenis.css'

const SmoothDocumentScroll = () => {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    const update = ({ timestamp }: { timestamp: number }) => {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    // Keyboard, hash links and history retain native scrolling, even mid-inertia.
    const resetInertia = () => {
      const lenis = lenisRef.current?.lenis
      if (lenis) lenis.scrollTo(lenis.actualScroll, { immediate: true })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
        ].includes(event.key)
      )
        resetInertia()
    }

    frame.update(update, true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('hashchange', resetInertia)
    window.addEventListener('popstate', resetInertia)
    return () => {
      cancelFrame(update)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('hashchange', resetInertia)
      window.removeEventListener('popstate', resetInertia)
    }
  }, [])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.16,
        syncTouch: false,
        allowNestedScroll: true,
        anchors: false,
        stopInertiaOnNavigate: true,
      }}
    />
  )
}

export default SmoothDocumentScroll
