import { type RefObject, useLayoutEffect, useRef } from 'react'

interface ActiveModal {
  container: HTMLElement
  trigger: Element | null
}

const activeModals: ActiveModal[] = []
const inertElements = new Map<
  HTMLElement,
  { count: number; wasInert: boolean }
>()
let previousOverflow = ''
let focusRevision = 0

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]',
    ),
  ).filter(
    element =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[inert]') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  )

// Isolate siblings at every ancestor so inline overlays and portals behave alike.
const isolateBackground = (container: HTMLElement) => {
  const isolated: HTMLElement[] = []
  let branch: HTMLElement = container
  while (branch.parentElement && branch !== document.body) {
    for (const sibling of branch.parentElement.children) {
      if (sibling === branch || !(sibling instanceof HTMLElement)) continue
      const state = inertElements.get(sibling) ?? {
        count: 0,
        wasInert: sibling.inert,
      }
      state.count += 1
      inertElements.set(sibling, state)
      sibling.inert = true
      isolated.push(sibling)
    }
    branch = branch.parentElement
  }
  return () => {
    for (const element of isolated) {
      const state = inertElements.get(element)
      if (!state || --state.count > 0) continue
      element.inert = state.wasInert
      inertElements.delete(element)
    }
  }
}

export const useModalFocus = (
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void,
  isBusy = false,
) => {
  const dismissRef = useRef(onDismiss)
  const busyRef = useRef(isBusy)
  const triggerRef = useRef<Element | null>(null)
  useLayoutEffect(() => {
    dismissRef.current = onDismiss
    busyRef.current = isBusy
  })

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!isOpen || !container) return

    // Keep the original trigger through StrictMode's setup/cleanup replay.
    const trigger = triggerRef.current ?? document.activeElement
    triggerRef.current = trigger
    const restoreBackground = isolateBackground(container)
    if (activeModals.length === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    const modal = { container, trigger }
    activeModals.push(modal)
    focusRevision += 1
    const isTopModal = () => activeModals.at(-1) === modal
    const focusInitial = () => {
      const initial = container.querySelector<HTMLElement>(
        '[data-modal-initial-focus]',
      )
      const target =
        initial && !initial.matches(':disabled')
          ? initial
          : (getFocusableElements(container)[0] ?? container)
      target.focus()
    }
    focusInitial()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal()) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (!busyRef.current) dismissRef.current()
      }
      if (event.key !== 'Tab') return
      const elements = getFocusableElements(container)
      const first = elements[0]
      const last = elements.at(-1)
      if (!first || !last) {
        event.preventDefault()
        container.focus()
        return
      }
      const active = document.activeElement
      if (!elements.includes(active as HTMLElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const handleFocus = (event: FocusEvent) => {
      if (isTopModal() && !container.contains(event.target as Node))
        focusInitial()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('focusin', handleFocus)

    return () => {
      const wasTop = isTopModal()
      activeModals.splice(activeModals.indexOf(modal), 1)
      // If a parent closes first, the child can still restore the outer trigger.
      for (const remaining of activeModals) {
        if (remaining.trigger && container.contains(remaining.trigger)) {
          remaining.trigger = modal.trigger
        }
      }
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('focusin', handleFocus)
      restoreBackground()
      if (activeModals.length === 0)
        document.body.style.overflow = previousOverflow
      const revision = ++focusRevision
      queueMicrotask(() => {
        if (!activeModals.some(entry => entry.container === container))
          triggerRef.current = null
        if (!wasTop || revision !== focusRevision) return
        const top = activeModals.at(-1)?.container
        const trigger = modal.trigger
        if (
          trigger instanceof HTMLElement &&
          trigger.isConnected &&
          !trigger.closest('[inert]') &&
          (!top || top.contains(trigger))
        ) {
          trigger.focus({ preventScroll: true })
        } else {
          top?.focus({ preventScroll: true })
        }
      })
    }
  }, [containerRef, isOpen])
}
