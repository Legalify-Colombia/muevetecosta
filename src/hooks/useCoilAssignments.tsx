import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Assignment {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
  assignment_type: 'individual' | 'group' | 'peer_review';
  target_participants: string[];
  rubric: any;
  created_by: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  participant_id: string;
  content?: string;
  attachments: any[];
  submitted_at: string;
  is_late: boolean;
  status: 'submitted' | 'graded' | 'returned';
  participant?: {
    full_name: string;
    document_number: string;
  };
  grade?: {
    points_earned?: number;
    feedback?: string;
    rubric_scores?: any;
    graded_by?: string;
    graded_at?: string;
  };
}

export interface AssignmentGrade {
  id: string;
  submission_id: string;
  graded_by: string;
  points_earned?: number;
  feedback?: string;
  rubric_scores: any;
  graded_at: string;
}

// Hooks para Assignments
export const useProjectAssignments = (projectId: string) => {
  return useQuery({
    queryKey: ['project-assignments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_project_assignments')
        .select(`
          *,
          created_by_profile:profiles!created_by(full_name),
          submissions_count:coil_assignment_submissions(count)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Assignment & { 
        created_by_profile?: { full_name: string },
        submissions_count?: { count: number }[]
      })[];
    },
    enabled: !!projectId
  });
};

export const useAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coil_project_assignments')
        .select(`
          *,
          created_by_profile:profiles!created_by(full_name),
          submissions:coil_assignment_submissions(
            *,
            participant:profiles!participant_id(full_name, document_number),
            grade:coil_assignment_grades(*)
          )
        `)
        .eq('id', assignmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentData: Partial<Assignment>) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('coil_project_assignments')
        .insert([{
          ...assignmentData,
          created_by: user.data.user.id,
          project_id: assignmentData.project_id!,
          title: assignmentData.title!,
          max_points: assignmentData.max_points || 100
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-assignments', data.project_id] });
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      updates 
    }: {
      assignmentId: string;
      updates: Partial<Assignment>;
    }) => {
      const { data, error } = await supabase
        .from('coil_project_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-assignments', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['assignment', data.id] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      });
    }
  });
};

// Hooks para Submissions
export const useMySubmissions = (projectId?: string) => {
  return useQuery({
    queryKey: ['my-submissions', projectId],
    queryFn: async () => {
      let query = supabase
        .from('coil_assignment_submissions')
        .select(`
          *,
          assignment:coil_project_assignments(
            id,
            title,
            due_date,
            max_points,
            project_id
          ),
          grade:coil_assignment_grades(*)
        `);

      if (projectId) {
        query = query.eq('assignment.project_id', projectId);
      }

      const { data, error } = await query
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentSubmission[];
    }
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      content, 
      attachments 
    }: {
      assignmentId: string;
      content?: string;
      attachments?: File[];
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      // Subir archivos adjuntos si los hay
      let attachmentUrls: any[] = [];
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${assignmentId}/${user.data.user.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('coil-submission-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('coil-submission-files')
            .getPublicUrl(fileName);

          attachmentUrls.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }

      const { data, error } = await supabase
        .from('coil_assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          participant_id: user.data.user.id,
          content,
          attachments: attachmentUrls
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', data.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      toast({
        title: "Entrega enviada",
        description: "Tu entrega ha sido enviada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la entrega",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      content, 
      attachments 
    }: {
      submissionId: string;
      content?: string;
      attachments?: File[];
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      // Obtener submission actual
      const { data: currentSubmission, error: fetchError } = await supabase
        .from('coil_assignment_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      let attachmentUrls: any[] = Array.isArray(currentSubmission.attachments) ? currentSubmission.attachments : [];

      // Agregar nuevos archivos si los hay
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${currentSubmission.assignment_id}/${user.data.user.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('coil-submission-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('coil-submission-files')
            .getPublicUrl(fileName);

          attachmentUrls.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }

      const { data, error } = await supabase
        .from('coil_assignment_submissions')
        .update({
          content,
          attachments: attachmentUrls
        })
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', data.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      toast({
        title: "Entrega actualizada",
        description: "Tu entrega ha sido actualizada exitosamente",
      });
    }
  });
};

// Hooks para Grades
export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      submissionId,
      pointsEarned,
      feedback,
      rubricScores
    }: {
      submissionId: string;
      pointsEarned?: number;
      feedback?: string;
      rubricScores?: any;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('coil_assignment_grades')
        .insert([{
          submission_id: submissionId,
          graded_by: user.data.user.id,
          points_earned: pointsEarned,
          feedback,
          rubric_scores: rubricScores
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Actualizar estado de la submission
      await supabase
        .from('coil_assignment_submissions')
        .update({ status: 'graded' })
        .eq('id', submissionId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      toast({
        title: "Calificación registrada",
        description: "La calificación ha sido registrada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la calificación",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      gradeId,
      pointsEarned,
      feedback,
      rubricScores
    }: {
      gradeId: string;
      pointsEarned?: number;
      feedback?: string;
      rubricScores?: any;
    }) => {
      const { data, error } = await supabase
        .from('coil_assignment_grades')
        .update({
          points_earned: pointsEarned,
          feedback,
          rubric_scores: rubricScores
        })
        .eq('id', gradeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      toast({
        title: "Calificación actualizada",
        description: "La calificación ha sido actualizada exitosamente",
      });
    }
  });
};