import { ChevronDown, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import Button from '@/shared/ui/Button'

interface Props {
  onCreate: () => void
  onImport: () => void
}

export function MovieCreateButton({ onCreate, onImport }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLFieldSetElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const initialIndex = useRef(0)

  useEffect(() => {
    if (!open) return
    items.current[initialIndex.current]?.focus()
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false)
        trigger.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }
  const choose = (action: () => void) => {
    close()
    action()
  }
  return (
    <fieldset
      ref={container}
      aria-label='Додати фільм'
      className='relative inline-flex'
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <Button onClick={onCreate} className='rounded-r-none'>
        <Plus size={17} aria-hidden='true' />
        Додати фільм
      </Button>
      <Button
        ref={trigger}
        aria-label='Спосіб додавання фільму'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className='w-11 rounded-l-none border-l border-white/30 px-0'
        onClick={() => {
          initialIndex.current = 0
          setOpen(previous => !previous)
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            initialIndex.current = event.key === 'ArrowUp' ? 1 : 0
            setOpen(true)
          }
        }}
      >
        <ChevronDown size={17} aria-hidden='true' />
      </Button>
      {open && (
        <div
          id={id}
          role='menu'
          aria-label='Додавання фільму'
          className='absolute right-0 top-full z-20 mt-2 w-60 border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1'
          onKeyDown={event => {
            const index = items.current.indexOf(
              document.activeElement as HTMLButtonElement,
            )
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              close()
            }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 1
                    : (index + (event.key === 'ArrowDown' ? 1 : -1) + 2) % 2
              items.current[next]?.focus()
            }
          }}
        >
          {['Додати власноруч', 'Імпорт із TMDB'].map((label, index) => (
            <Button
              key={label}
              ref={element => {
                items.current[index] = element
              }}
              role='menuitem'
              tabIndex={-1}
              variant='ghost'
              className='w-full justify-start text-sm'
              onClick={() => choose(index === 0 ? onCreate : onImport)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </fieldset>
  )
}
