import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import '@/app/styles/index.css'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource-variable/onest/wght.css'
import '@fontsource-variable/roboto-condensed/wght.css'
import '@fontsource-variable/golos-text/wght.css'
import './lab.css'
import DesignLab from './DesignLab'

const root = document.getElementById('root')
if (!root) throw new Error('Design lab root not found')

createRoot(root).render(
  <StrictMode>
    <MemoryRouter>
      <DesignLab />
    </MemoryRouter>
  </StrictMode>,
)
