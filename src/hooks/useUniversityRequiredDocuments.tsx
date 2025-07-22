
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

export interface UniversityRequiredDocument {
  id: string;
  university_id: string;
  document_title: string;
  is_mandatory: boolean;
  mobility_type: 'student' | 'professor' | 'both';
  description?: string;
  template_file_url?: string;
  template_file_name?: string;
  created_at: string;
  updated_at: string;
}

type CreateUniversityRequiredDocument = {
  university_id: string;
  document_title: string;
  is_mandatory: boolean;
  mobility_type: 'student' | 'professor' | 'both';
  description?: string;
  template_file_url?: string;
  template_file_name?: string;
};

export const useUniversityRequiredDocuments = (universityId?: string) => {
  return useQuery({
    queryKey: ['university-required-documents', universityId],
    queryFn: async () => {
      if (!universityId) return [];
      
      const { data, error } = await supabase
        .from('university_required_documents' as any)
        .select('*')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as UniversityRequiredDocument[];
    },
    enabled: !!universityId
  });
};

export const useCreateUniversityRequiredDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { uploadFile } = useFileUpload({ bucket: 'template-documents', folder: 'university-requirements' });

  return useMutation({
    mutationFn: async ({ data, templateFile }: { data: CreateUniversityRequiredDocument, templateFile?: File }) => {
      let finalData = { ...data };
      
      // Si hay un archivo de plantilla, subirlo primero
      if (templateFile) {
        console.log('Uploading template file:', templateFile.name);
        const fileUrl = await uploadFile(templateFile, templateFile.name);
        if (fileUrl) {
          finalData.template_file_url = fileUrl;
          finalData.template_file_name = templateFile.name;
        }
      }
      
      const { data: result, error } = await supabase
        .from('university_required_documents' as any)
        .insert([finalData])
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
      console.error('Error creating university required document:', error);
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
  const { uploadFile } = useFileUpload({ bucket: 'template-documents', folder: 'university-requirements' });

  return useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      templateFile 
    }: { 
      id: string, 
      data: Partial<CreateUniversityRequiredDocument>, 
      templateFile?: File 
    }) => {
      let finalData = { ...data };
      
      // Si hay un archivo de plantilla nuevo, subirlo
      if (templateFile) {
        console.log('Uploading new template file:', templateFile.name);
        const fileUrl = await uploadFile(templateFile, templateFile.name);
        if (fileUrl) {
          finalData.template_file_url = fileUrl;
          finalData.template_file_name = templateFile.name;
        }
      }
      
      const { data: result, error } = await supabase
        .from('university_required_documents' as any)
        .update(finalData)
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
      console.error('Error updating university required document:', error);
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
  const { deleteFile } = useFileUpload({ bucket: 'template-documents', folder: 'university-requirements' });

  return useMutation({
    mutationFn: async (document: UniversityRequiredDocument) => {
      // Eliminar archivo de plantilla si existe
      if (document.template_file_url) {
        console.log('Deleting template file:', document.template_file_url);
        await deleteFile(document.template_file_url);
      }
      
      const { error } = await supabase
        .from('university_required_documents' as any)
        .delete()
        .eq('id', document.id);
      
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
      console.error('Error deleting university required document:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el documento requerido",
        variant: "destructive",
      });
    }
  });
};
