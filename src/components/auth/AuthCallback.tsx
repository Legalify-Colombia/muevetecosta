
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirigir según el rol del usuario
      switch (profile.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'coordinator':
          navigate('/dashboard/coordinator');
          break;
        case 'professor':
          navigate('/dashboard/professor');
          break;
        case 'student':
          navigate('/dashboard/student');
          break;
        default:
          navigate('/');
      }
    } else if (!loading && !user) {
      // Si no hay usuario autenticado, redirigir al login
      navigate('/login');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Procesando autenticación...</p>
        </div>
      </div>
    );
  }

  return null;
};
