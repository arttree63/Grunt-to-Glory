import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App'
import './ui/styles.css'

const isReview = window.location.pathname === '/review' || window.location.pathname === '/review/'
const ReviewApp = isReview ? React.lazy(() => import('./review/GameReview')) : null

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {ReviewApp ? (
      <React.Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d0c12' }} />}>
        <ReviewApp />
      </React.Suspense>
    ) : <App />}
  </React.StrictMode>,
)
