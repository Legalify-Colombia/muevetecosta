import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Link de verificación inválido o expirado');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('¡Email verificado exitosamente!');
        
        toast({
          title: "Email verificado",
          description: "Tu cuenta ha sido activada exitosamente",
        });

        // Redirect to login after success
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error: any) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage(error.message || 'Error al verificar el email');
        
        toast({
          title: "Error de verificación",
          description: error.message || "No se pudo verificar el email",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  const handleResendVerification = async () => {
    const email = searchParams.get('email');
    
    if (!email) {
      toast({
        title: "Error",
        description: "No se encontró el email para reenviar la verificación",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      toast({
        title: "Verificación reenviada",
        description: "Se ha enviado un nuevo email de verificación",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reenviar la verificación",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                <CardTitle>Verificando Email</CardTitle>
                <CardDescription>
                  Por favor espera mientras verificamos tu email...
                </CardDescription>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <CardTitle className="text-green-700">¡Verificación Exitosa!</CardTitle>
                <CardDescription>
                  {message}
                </CardDescription>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <CardTitle className="text-red-700">Error de Verificación</CardTitle>
                <CardDescription>
                  {message}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Serás redirigido al login en unos segundos...
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Ir al Login
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleResendVerification} 
                  variant="outline" 
                  className="w-full"
                >
                  Reenviar Verificación
                </Button>
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Ir al Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};