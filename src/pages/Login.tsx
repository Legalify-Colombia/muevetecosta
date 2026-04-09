
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('Login useEffect - user:', user?.id, 'profile:', profile?.role, 'authLoading:', authLoading);
    
    if (!authLoading && user && profile) {
      console.log('Redirecting user with role:', profile.role);
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
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico y contraseña",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Submitting login form');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de vuelta",
        });
        // La redirección se manejará en el useEffect de arriba
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" 
              alt="Muévete por el Caribe" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              className="text-sm p-0 h-auto"
              onClick={async () => {
                const emailInput = email;
                if (!emailInput) {
                  toast({
                    title: "Email requerido",
                    description: "Por favor ingresa tu email para restablecer la contraseña",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });

                  if (error) throw error;

                  toast({
                    title: "Email enviado",
                    description: "Se ha enviado un enlace para restablecer tu contraseña",
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "No se pudo enviar el email",
                    variant: "destructive",
                  });
                }
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
            <div>
              <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
