
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import MobilityApplication from "./pages/MobilityApplication";
import ProfessorMobilityDetail from "./pages/ProfessorMobilityDetail";
import ProfessorMobilityApplication from "./pages/ProfessorMobilityApplication";
import DynamicPage from "./pages/DynamicPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import { AuthCallback } from "./components/auth/AuthCallback";
import { ResetPassword } from "./components/auth/ResetPassword";
import { useMemo } from "react";

const App = () => {
  const { loading } = useAuth();

  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/:id" element={<UniversityDetail />} />
            <Route path="/apply/:universityId" element={
              <ProtectedRoute>
                <MobilityApplication />
              </ProtectedRoute>
            } />
            <Route path="/apply/:universityId/:programId" element={
              <ProtectedRoute>
                <MobilityApplication />
              </ProtectedRoute>
            } />
            <Route path="/professor/mobility/detail/:callId" element={
              <ProtectedRoute>
                <ProfessorMobilityDetail />
              </ProtectedRoute>
            } />
            <Route path="/professor/mobility/apply/:callId" element={
              <ProtectedRoute>
                <ProfessorMobilityApplication />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/professor" element={
              <ProtectedRoute>
                <ProfessorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/coordinator" element={
              <ProtectedRoute>
                <CoordinatorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/pages/:slug" element={<DynamicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
