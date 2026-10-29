interface CheckoutToggleProps {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onToggle: (value: boolean) => void
}

const CheckoutToggle = ({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: CheckoutToggleProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onToggle(!checked)}
    aria-label={label}
    className={`flex min-h-24 w-full items-center justify-between gap-5 border-b border-[var(--border-default)] py-5 text-left transition-colors ${
      disabled ? 'cursor-not-allowed' : 'hover:bg-[var(--surface-muted)]'
    }`}
  >
    <span>
      <span className='block text-base font-medium text-[var(--text-main)]'>
        {label}
      </span>
      <span className='mt-2 block text-sm leading-relaxed text-[var(--text-muted)]'>
        {description}
      </span>
    </span>
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[var(--action-primary)]' : 'bg-[var(--border-field)]'
      }`}
      aria-hidden='true'
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform motion-reduce:transition-none ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  </button>
)

export default CheckoutToggle
