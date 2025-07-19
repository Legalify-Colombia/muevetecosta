
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import ProtectedRoute from "./components/ProtectedRoute";
import PostulacionConvenio from "./pages/PostulacionConvenio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {navItems.map(({ to, page, requiresAuth, allowedRoles }) => (
            <Route
              key={to}
              path={to}
              element={
                requiresAuth ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    {page}
                  </ProtectedRoute>
                ) : (
                  page
                )
              }
            />
          ))}
          <Route path="/postulacion-convenio" element={<PostulacionConvenio />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
