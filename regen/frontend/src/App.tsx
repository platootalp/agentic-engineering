import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/pages/Layout'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { DashboardPage } from '@/pages/Dashboard'
import { JobList } from '@/pages/jobs/JobList'
import { JobCreate } from '@/pages/jobs/JobCreate'
import { JobDetail } from '@/pages/jobs/JobDetail'
import { ExperienceListPage } from '@/pages/experiences/ExperienceList'
import { ExperienceDetailPage } from '@/pages/experiences/ExperienceDetail'
import { ResumeList } from '@/pages/resumes/ResumeList'
import { ResumeBuilder } from '@/pages/resumes/ResumeBuilder'
import { ResumeDetail } from '@/pages/resumes/ResumeDetail'
import HomePage from '@/pages/index'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { useAuthStore } from '@/stores/auth.store'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="jobs" element={<ProtectedRoute><JobList /></ProtectedRoute>} />
          <Route path="jobs/create" element={<ProtectedRoute><JobCreate /></ProtectedRoute>} />
          <Route path="jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="experiences" element={<ProtectedRoute><ExperienceListPage /></ProtectedRoute>} />
          <Route path="experiences/:id" element={<ProtectedRoute><ExperienceDetailPage /></ProtectedRoute>} />
          <Route path="resumes" element={<ProtectedRoute><ResumeList /></ProtectedRoute>} />
          <Route path="resumes/builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
          <Route path="resumes/:id" element={<ProtectedRoute><ResumeDetail /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
