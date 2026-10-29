import type { ReactNode } from 'react'

export const AdminTable = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <section
    aria-label={label}
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Scrollable tables need a keyboard focus target.
    tabIndex={0}
    className='admin-table max-w-full overflow-x-auto overscroll-x-contain border-y border-[var(--border-default)]'
  >
    {children}
  </section>
)
