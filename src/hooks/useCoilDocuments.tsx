import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DocumentFolder {
  id: string;
  project_id: string;
  parent_folder_id?: string;
  name: string;
  description?: string;
  created_by: string;
  access_permissions: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  folder_id?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  document_type?: string;
  description?: string;
  tags?: string[];
  version_number: number;
  previous_version_id?: string;
  access_permissions: any;
  uploaded_by: string;
  uploaded_at: string;
  is_public: boolean;
}

// Hooks para Carpetas
export const useDocumentFolders = (projectId: string) => {
  return useQuery({
    queryKey: ['document-folders', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_document_folders')
        .select('*')
        .eq('project_id', projectId)
        .order('name');
      
      if (error) throw error;
      return data as DocumentFolder[];
    },
    enabled: !!projectId
  });
};

export const useCreateDocumentFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (folderData: Partial<DocumentFolder>) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('coil_document_folders')
        .insert([{
          ...folderData,
          created_by: user.data.user.id,
          project_id: folderData.project_id!,
          name: folderData.name!
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-folders', data.project_id] });
      toast({
        title: "Carpeta creada",
        description: "La carpeta ha sido creada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta",
        variant: "destructive"
      });
    }
  });
};

// Hooks para Documentos
export const useProjectDocuments = (projectId: string, folderId?: string) => {
  return useQuery({
    queryKey: ['project-documents', projectId, folderId],
    queryFn: async () => {
      let query = supabase
        .from('coil_project_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!uploaded_by(full_name),
          folder:coil_document_folders(name)
        `)
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (folderId === null) {
        query = query.is('folder_id', null);
      } else if (folderId) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as unknown as (ProjectDocument & { 
        uploaded_by_profile?: { full_name: string },
        folder?: { name: string }
      })[];
    },
    enabled: !!projectId
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      file, 
      projectId, 
      folderId, 
      description, 
      tags 
    }: {
      file: File;
      projectId: string;
      folderId?: string;
      description?: string;
      tags?: string[];
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      // Subir archivo al storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('coil-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('coil-documents')
        .getPublicUrl(fileName);

      // Guardar metadata en la base de datos
      const { data, error } = await supabase
        .from('coil_project_documents')
        .insert([{
          project_id: projectId,
          folder_id: folderId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          document_type: file.type,
          description,
          tags,
          uploaded_by: user.data.user.id,
          version_number: 1,
          access_permissions: { all: true },
          is_public: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-documents', data.project_id] });
      toast({
        title: "Documento subido",
        description: "El documento ha sido subido exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateDocumentPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      permissions 
    }: {
      documentId: string;
      permissions: any;
    }) => {
      const { data, error } = await supabase
        .from('coil_project_documents')
        .update({ access_permissions: permissions })
        .eq('id', documentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-documents', data.project_id] });
      toast({
        title: "Permisos actualizados",
        description: "Los permisos del documento han sido actualizados",
      });
    }
  });
};

export const useCreateDocumentVersion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      file, 
      originalDocumentId 
    }: {
      file: File;
      originalDocumentId: string;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      // Obtener documento original
      const { data: originalDoc, error: fetchError } = await supabase
        .from('coil_project_documents')
        .select('*')
        .eq('id', originalDocumentId)
        .single();

      if (fetchError) throw fetchError;

      // Subir nueva versión
      const fileExt = file.name.split('.').pop();
      const fileName = `${originalDoc.project_id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('coil-document-versions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('coil-document-versions')
        .getPublicUrl(fileName);

      // Crear nueva versión
      const { data, error } = await supabase
        .from('coil_project_documents')
        .insert([{
          project_id: originalDoc.project_id,
          folder_id: originalDoc.folder_id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          document_type: file.type,
          description: originalDoc.description,
          tags: originalDoc.tags,
          uploaded_by: user.data.user.id,
          version_number: originalDoc.version_number + 1,
          previous_version_id: originalDocumentId,
          access_permissions: originalDoc.access_permissions,
          is_public: originalDoc.is_public
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-documents', data.project_id] });
      toast({
        title: "Nueva versión creada",
        description: "Se ha creado una nueva versión del documento",
      });
    }
  });
};