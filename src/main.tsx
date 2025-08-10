
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { disableZoom } from './disableZoom'
import Landing from './pages/Landing'
import Speed from './pages/Speed'
import Freestyle from './pages/Freestyle'
import VibrateTest from './pages/VibrateTest'
import SpeedPractice from './pages/SpeedPractice'

disableZoom();

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/speed', element: <Speed /> },
  { path: '/freestyle', element: <Freestyle /> },
  { path: '/vibrate-test', element: <VibrateTest /> },
  { path: '/speed-practice', element: <SpeedPractice /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
