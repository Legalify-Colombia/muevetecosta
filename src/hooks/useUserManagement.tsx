import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface UseUserManagementReturn {
  updateUserRole: (userId: string, newRole: 'admin' | 'coordinator' | 'professor' | 'student') => Promise<boolean>;
  loading: boolean;
}

export const useUserManagement = (): UseUserManagementReturn => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateUserRole = async (userId: string, newRole: 'admin' | 'coordinator' | 'professor' | 'student'): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_user_role', {
        p_user_id: userId,
        p_new_role: newRole
      });

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: 'Error',
          description: error.message || 'No se pudo actualizar el rol',
          variant: 'destructive'
        });
        return false;
      }

      if (!data?.success) {
        toast({
          title: 'Error',
          description: data?.error || 'No se pudo actualizar el rol',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Éxito',
        description: `Rol actualizado a ${newRole}`,
      });

      return true;
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserRole,
    loading
  };
};
