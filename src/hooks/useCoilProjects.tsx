import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoilProject {
  id: string;
  title: string;
  description: string;
  objectives: string;
  purpose?: string;
  host_university_name?: string;
  start_date: string;
  end_date: string;
  coordinator_id: string;
  status: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  requirements: string;
  benefits: string;
  meeting_platform?: string;
  meeting_links?: any;
  project_phase?: string;
  academic_level?: string;
  subject_area?: string;
  project_type?: string;
  coordinator?: {
    full_name: string;
    document_number: string;
  } | null;
  participants_count?: any;
}

export interface CoilProjectApplication {
  id: string;
  project_id: string;
  professor_id: string;
  motivation: string;
  experience: string;
  status: string;
  created_at: string;
  reviewed_by: string;
  reviewed_at: string;
  review_notes: string;
  project?: CoilProject;
  professor?: {
    full_name: string;
    document_number: string;
  };
}

export const useCoilProjects = () => {
  return useQuery({
    queryKey: ['coil-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_projects')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CoilProject[];
    }
  });
};

export const useCoilProject = (id: string) => {
  return useQuery({
    queryKey: ['coil-project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_projects')
        .select(`
          *,
          coordinator:profiles!coordinator_id(full_name, document_number),
          participants:coil_project_participants(
            id,
            status,
            role,
            joined_at,
            professor:profiles!professor_id(full_name, document_number)
          ),
          documents:coil_project_documents(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useMyCoilProjects = () => {
  return useQuery({
    queryKey: ['my-coil-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_projects')
        .select(`
          *,
          coordinator:profiles!coordinator_id(full_name, document_number),
          participants_count:coil_project_participants(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    }
  });
};

export const useCoilProjectApplications = () => {
  return useQuery({
    queryKey: ['coil-project-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_project_applications')
        .select(`
          *,
          project:coil_projects(*),
          professor:profiles!professor_id(full_name, document_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    }
  });
};

export const useMyCoilApplications = () => {
  return useQuery({
    queryKey: ['my-coil-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_project_applications')
        .select(`
          *,
          project:coil_projects(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    }
  });
};

export const useCreateCoilProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectData: any) => {
      // Get current user to set as coordinator
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('coil_projects')
        .insert({
          ...projectData,
          coordinator_id: user?.id,
          is_public: true, // Ensure projects are public by default
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coil-projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-coil-projects'] });
      toast({
        title: "Proyecto COIL creado",
        description: "El proyecto ha sido creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear proyecto",
        description: error.message || "No se pudo crear el proyecto COIL.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateCoilProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoilProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('coil_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coil-projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-coil-projects'] });
      queryClient.invalidateQueries({ queryKey: ['coil-project'] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar proyecto",
        description: error.message || "No se pudo actualizar el proyecto.",
        variant: "destructive",
      });
    }
  });
};

export const useApplyToCoilProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationData: {
      project_id: string;
      motivation: string;
      experience: string;
    }) => {
      const { data, error } = await supabase
        .from('coil_project_applications')
        .insert({
          ...applicationData,
          professor_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-coil-applications'] });
      queryClient.invalidateQueries({ queryKey: ['coil-project-applications'] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de participación ha sido enviada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar solicitud",
        description: error.message || "No se pudo enviar la solicitud de participación.",
        variant: "destructive",
      });
    }
  });
};

export const useReviewCoilApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      reviewNotes
    }: {
      applicationId: string;
      status: 'approved' | 'rejected';
      reviewNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('coil_project_applications')
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;

      // If approved, create participant entry
      if (status === 'approved') {
        const { error: participantError } = await supabase
          .from('coil_project_participants')
          .insert([{
            project_id: data.project_id,
            professor_id: data.professor_id,
            status: 'approved',
            approved_at: new Date().toISOString()
          }]);
        
        if (participantError) throw participantError;
      }
      
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['coil-project-applications'] });
      queryClient.invalidateQueries({ queryKey: ['coil-project'] });
      toast({
        title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
        description: status === 'approved' 
          ? "El profesor ha sido agregado al proyecto." 
          : "La solicitud ha sido rechazada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al revisar solicitud",
        description: error.message || "No se pudo procesar la solicitud.",
        variant: "destructive",
      });
    }
  });
};