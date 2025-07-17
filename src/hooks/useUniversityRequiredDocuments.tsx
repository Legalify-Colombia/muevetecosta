
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UniversityRequiredDocument {
  id: string;
  university_id: string;
  document_title: string;
  is_mandatory: boolean;
  mobility_type: 'student' | 'professor' | 'both';
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useUniversityRequiredDocuments = (universityId?: string) => {
  return useQuery({
    queryKey: ['university-required-documents', universityId],
    queryFn: async () => {
      if (!universityId) return [];
      
      const { data, error } = await supabase
        .from('university_required_documents')
        .select('*')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UniversityRequiredDocument[];
    },
    enabled: !!universityId
  });
};

export const useCreateUniversityRequiredDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<UniversityRequiredDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('university_required_documents')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['university-required-documents'] });
      toast({
        title: "Documento agregado",
        description: "El documento requerido ha sido agregado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al agregar el documento requerido",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUniversityRequiredDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<UniversityRequiredDocument> }) => {
      const { data: result, error } = await supabase
        .from('university_required_documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-required-documents'] });
      toast({
        title: "Documento actualizado",
        description: "El documento requerido ha sido actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el documento requerido",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteUniversityRequiredDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('university_required_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-required-documents'] });
      toast({
        title: "Documento eliminado",
        description: "El documento requerido ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el documento requerido",
        variant: "destructive",
      });
    }
  });
};
