import { Check, ChevronDown } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { usePresentation } from '../model/PresentationContext'
import type { Presentation } from '../model/preference'

const OPTIONS = [
  { value: 'classic', label: 'Classic' },
  { value: 'new', label: 'New' },
] as const

export function PresentationSwitch({
  appearance = 'classic',
  align = 'end',
  className,
}: {
  appearance?: Presentation
  align?: 'start' | 'end'
  className?: string
}) {
  const { presentation, selectPresentation } = usePresentation()
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const triggerId = useId()

  useLayoutEffect(() => {
    if (isOpen) optionRefs.current[focusedIndex]?.focus()
  }, [isOpen, focusedIndex])

  useLayoutEffect(() => {
    if (!isOpen) return
    const dismissOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false)
    }
    const dismissOnFocusLeave = (event: FocusEvent) => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false)
    }
    // Handle Escape before a containing mobile navigation dialog does.
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('focusin', dismissOnFocusLeave)
    window.addEventListener('keydown', dismissOnEscape, true)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('focusin', dismissOnFocusLeave)
      window.removeEventListener('keydown', dismissOnEscape, true)
    }
  }, [isOpen])

  function openMenu(
    index = OPTIONS.findIndex(option => option.value === presentation),
  ) {
    setFocusedIndex(index)
    setIsOpen(true)
  }

  function choose(value: Presentation) {
    setIsOpen(false)
    selectPresentation(value)
    // Home changes its header; restore focus to the visible replacement trigger.
    requestAnimationFrame(() => {
      const trigger =
        triggerRef.current ??
        Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            '[data-presentation-trigger]',
          ),
        ).find(
          element => !element.closest('[inert]') && element.checkVisibility(),
        ) ??
        document.querySelector<HTMLButtonElement>(
          'header button[aria-controls]',
        )
      trigger?.focus({ preventScroll: true })
    })
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative shrink-0 text-sm font-semibold', className)}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        data-presentation-trigger
        className='flex min-h-9 cursor-pointer items-center gap-1.5 py-2 text-inherit opacity-80 hover:opacity-100 focus-visible:opacity-100'
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={event => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          openMenu(event.key === 'ArrowDown' ? 0 : OPTIONS.length - 1)
        }}
      >
        Версія <ChevronDown size={14} aria-hidden='true' />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role='menu'
          aria-labelledby={triggerId}
          className={cn(
            'absolute top-full z-[80] mt-1 min-w-36 p-1',
            align === 'start' ? 'left-0' : 'right-0',
            appearance === 'new'
              ? 'bg-[var(--signal-ink)] text-[var(--signal-chalk)] [--focus-ring:var(--signal-chalk)]'
              : 'rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-main)]',
          )}
          onKeyDown={event => {
            let nextIndex: number
            switch (event.key) {
              case 'ArrowDown':
                nextIndex = (focusedIndex + 1) % OPTIONS.length
                break
              case 'ArrowUp':
                nextIndex = (focusedIndex + OPTIONS.length - 1) % OPTIONS.length
                break
              case 'Home':
                nextIndex = 0
                break
              case 'End':
                nextIndex = OPTIONS.length - 1
                break
              default:
                nextIndex = OPTIONS.findIndex(option =>
                  option.label
                    .toLowerCase()
                    .startsWith(event.key.toLowerCase()),
                )
                if (event.key.length !== 1 || nextIndex < 0) return
            }
            event.preventDefault()
            setFocusedIndex(nextIndex)
          }}
        >
          {OPTIONS.map((option, index) => (
            <button
              key={option.value}
              type='button'
              role='menuitemradio'
              aria-checked={presentation === option.value}
              tabIndex={-1}
              ref={element => {
                optionRefs.current[index] = element
              }}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => choose(option.value)}
              className={cn(
                'flex min-h-10 w-full cursor-pointer items-center justify-between gap-6 px-3 py-2 text-left hover:bg-white/10 focus-visible:-outline-offset-2',
                presentation === option.value && 'bg-white/5',
                appearance === 'classic' && 'rounded',
              )}
            >
              {option.label}
              {presentation === option.value && (
                <Check size={14} aria-hidden='true' />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
