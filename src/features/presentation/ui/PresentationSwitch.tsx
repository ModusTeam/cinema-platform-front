import { usePresentation } from '../model/PresentationContext'
import './presentation-switch.css'

export function PresentationSwitch() {
  const { presentation, selectPresentation } = usePresentation()
  return (
    <fieldset className='presentation-switch' aria-label='Вигляд сайту'>
      {(['classic', 'new'] as const).map(value => (
        <button
          key={value}
          type='button'
          aria-pressed={presentation === value}
          onClick={() => selectPresentation(value)}
        >
          {value === 'classic' ? 'Classic' : 'New'}
        </button>
      ))}
    </fieldset>
  )
}
