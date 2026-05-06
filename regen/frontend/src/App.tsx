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
import ProtectedRoute from '@/router/protected'
import { useAuthStore } from '@/stores/authStore'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
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
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobList />} />
            <Route path="jobs/create" element={<JobCreate />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="experiences" element={<ExperienceListPage />} />
            <Route path="experiences/:id" element={<ExperienceDetailPage />} />
            <Route path="resumes" element={<ResumeList />} />
            <Route path="resumes/builder" element={<ResumeBuilder />} />
            <Route path="resumes/:id" element={<ResumeDetail />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
