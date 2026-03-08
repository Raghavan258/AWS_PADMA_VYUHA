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
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_ansP4RU35',
      userPoolClientId: '1sbi69n7ofe8ap7opbs6u224t4',
      identityPoolId: 'us-east-1:7d52c369-24f7-4a93-9665-c8c7334d1bc2',
      loginWith: {
        oauth: {
          domain: 'us-east-1ansp4ru35.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'openid', 'phone'],
          redirectSignIn: ['http://localhost:5173/', 'https://yourproductiondomain.com/'],
          redirectSignOut: ['http://localhost:5173/', 'https://yourproductiondomain.com/'],
          responseType: 'code',
        }
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'lecturai-data-padmavyuha',
      region: 'us-east-1',
    }
  }
});

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
