import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HeroUIProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </HeroUIProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

