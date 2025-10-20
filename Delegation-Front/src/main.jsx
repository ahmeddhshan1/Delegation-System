import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import AppRouter from './router/index.jsx'
import { Toaster } from 'sonner'
import { Buffer } from 'buffer'
import AuthProvider from './components/Auth/AuthProvider'
import ReduxProvider from './components/ReduxProvider'
import { autoClearOldData } from './utils/clearOldData'

// Polyfill for Buffer
window.Buffer = Buffer

// مسح البيانات القديمة تلقائياً
autoClearOldData()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReduxProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
    </ReduxProvider>
  </StrictMode>,
)
