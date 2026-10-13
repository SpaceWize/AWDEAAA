import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App'
import { RouterProvider } from './lib/router'
import { AccountProvider } from './lib/AccountContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <AccountProvider>
          <App />
        </AccountProvider>
      </RouterProvider>
    </MotionConfig>
  </StrictMode>,
)
