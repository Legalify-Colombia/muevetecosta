import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface UsePasswordResetReturn {
  requestReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  validateAndReset: (code: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const requestReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('password-reset', {
        body: { email }
      });

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error.message || 'Ha ocurrido un error',
          variant: 'destructive'
        });
        return { success: false };
      }

      toast({
        title: 'Éxito',
        description: 'Se ha enviado un código de recuperación a tu email',
      });

      return { success: true, message: 'Email enviado' };
    } catch (error: any) {
      console.error('Reset request error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error',
        variant: 'destructive'
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const validateAndReset = async (code: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('reset-password', {
        body: { code, newPassword }
      });

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error.message || 'Ha ocurrido un error',
          variant: 'destructive'
        });
        return { success: false };
      }

      toast({
        title: 'Éxito',
        description: 'Tu contraseña ha sido actualizada',
      });

      return { success: true, message: 'Contraseña actualizada' };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error',
        variant: 'destructive'
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    requestReset,
    validateAndReset,
    loading
  };
};
