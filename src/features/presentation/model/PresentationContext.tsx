import { createContext, type ReactNode, useContext, useState } from 'react'
import {
  type Presentation,
  persistPresentation,
  readPresentation,
} from './preference'

const PresentationContext = createContext<{
  presentation: Presentation
  selectPresentation: (value: Presentation) => void
} | null>(null)

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [presentation, setPresentation] = useState<Presentation>(() => {
    try {
      return readPresentation(window.localStorage)
    } catch {
      return 'classic'
    }
  })

  function selectPresentation(value: Presentation) {
    setPresentation(value)
    try {
      persistPresentation(window.localStorage, value)
    } catch {
      // Accessing localStorage itself can throw in restricted browsers.
    }
  }

  return (
    <PresentationContext value={{ presentation, selectPresentation }}>
      {children}
    </PresentationContext>
  )
}

export function usePresentation() {
  const context = useContext(PresentationContext)
  if (!context) throw new Error('PresentationProvider is required')
  return context
}
