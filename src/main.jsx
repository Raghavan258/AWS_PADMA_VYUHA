import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LandingView from './components/views/LandingView'
import LoginView from './components/views/LoginView'
import RegisterView from './components/views/RegisterView'
import GoalSelectionView from './components/views/GoalSelectionView'
import UploadView from './components/views/UploadView'
import DashboardView from './components/views/DashboardView'
import QuizView from './components/views/QuizView'
import CurriculumView from './components/views/CurriculumView'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<LandingView />} />
            <Route path="login" element={<LoginView />} />
            <Route path="register" element={<RegisterView />} />
            <Route path="goal-selection" element={<GoalSelectionView />} />
            <Route path="upload" element={<UploadView />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="curriculum/:id" element={<CurriculumView />} />
            <Route path="quiz" element={<QuizView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
