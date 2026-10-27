import { ReactLenis, useLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion/react'
import { useEffect } from 'react'
import 'lenis/dist/lenis.css'

const SmoothDocumentScroll = () => {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    // The shared modal hook owns the document lock; stop Lenis inertia too.
    // Subscribe after the instance is published, including a mount under a modal.
    const syncModalLock = () => {
      if (document.body.style.overflow === 'hidden') lenis.stop()
      else lenis.start()
    }
    const observer = new MutationObserver(syncModalLock)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    })
    syncModalLock()
    const update = ({ timestamp }: { timestamp: number }) => {
      lenis.raf(timestamp)
    }
    // Keyboard, hash links and history retain native scrolling, even mid-inertia.
    const resetInertia = () => {
      lenis.scrollTo(lenis.actualScroll, { immediate: true })
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
      observer.disconnect()
      cancelFrame(update)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('hashchange', resetInertia)
      window.removeEventListener('popstate', resetInertia)
    }
  }, [lenis])

  return (
    <ReactLenis
      root
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
