import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WorkInProgress from '@/pages/WorkInProgress'
import '@/app/styles/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const root = createRoot(rootElement)

if (import.meta.env.PROD) {
  root.render(
    <StrictMode>
      <WorkInProgress />
    </StrictMode>,
  )
} else {
  void import('@/app/DevelopmentApp').then(({ default: DevelopmentApp }) => {
    root.render(
      <StrictMode>
        <DevelopmentApp />
      </StrictMode>,
    )
  })
}
