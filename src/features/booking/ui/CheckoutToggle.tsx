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
    className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3 text-left transition-colors ${
      disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/10'
    }`}
  >
    <span>
      <span className='block text-sm font-bold text-white'>{label}</span>
      <span className='mt-1 block text-xs text-zinc-400'>{description}</span>
    </span>
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-red-600' : 'bg-zinc-700'
      }`}
      aria-hidden='true'
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  </button>
)

export default CheckoutToggle
