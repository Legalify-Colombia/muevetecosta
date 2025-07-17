
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Universities from '@/pages/Universities';
import UniversityDetail from '@/pages/UniversityDetail';
import MobilityApplication from '@/pages/MobilityApplication';
import TermsAndConditions from '@/pages/TermsAndConditions';
import NotFound from '@/pages/NotFound';
import DynamicPage from '@/pages/DynamicPage';

// Dashboard Pages
import AdminDashboard from '@/pages/AdminDashboard';
import CoordinatorDashboard from '@/pages/CoordinatorDashboard';
import ProfessorDashboard from '@/pages/ProfessorDashboard';
import StudentDashboard from '@/pages/StudentDashboard';

// Admin Pages
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUniversities from '@/pages/admin/AdminUniversities';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminSettings from '@/pages/admin/AdminSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/:id" element={<UniversityDetail />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/pages/:slug" element={<DynamicPage />} />

            {/* Student Routes */}
            <Route 
              path="/apply" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MobilityApplication />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/universities" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUniversities />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/applications" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApplications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />

            {/* Coordinator Routes */}
            <Route 
              path="/dashboard/coordinator" 
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Professor Routes */}
            <Route 
              path="/dashboard/professor" 
              element={
                <ProtectedRoute allowedRoles={['professor']}>
                  <ProfessorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
