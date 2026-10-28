import {
  ACCOUNT_SECTIONS,
  type AccountSection,
} from '../config/accountNavigation'

interface AccountNavigationProps {
  active: AccountSection
  onChange: (section: AccountSection) => void
}

export default function AccountNavigation({
  active,
  onChange,
}: AccountNavigationProps) {
  return (
    <nav
      aria-label='Розділи кабінету'
      className='account-navigation-list grid gap-x-4 gap-y-1 border-y border-[var(--account-rule)] py-4 lg:gap-1 lg:border-0 lg:py-0'
    >
      {ACCOUNT_SECTIONS.map(section => (
        <button
          key={section.id}
          type='button'
          aria-current={active === section.id ? 'page' : undefined}
          aria-controls='account-content'
          onClick={() => onChange(section.id)}
          className='account-navigation text-left'
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
