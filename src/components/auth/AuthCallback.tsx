
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          // Successful authentication
          toast({
            title: "Sesión iniciada",
            description: "Has iniciado sesión exitosamente",
          });
          
          // Redirect based on user role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profile) {
            switch (profile.role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'coordinator':
                navigate('/coordinator');
                break;
              case 'professor':
                navigate('/professor');
                break;
              case 'student':
                navigate('/student');
                break;
              default:
                navigate('/');
            }
          } else {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Procesando autenticación...</p>
      </div>
    </div>
  );
};
