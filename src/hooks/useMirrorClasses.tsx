import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MirrorClass {
  id: string;
  type: "espejo" | "masterclass";
  title: string;
  description: string | null;
  university_id: string | null;
  partner_university_id: string | null;
  professor_name: string;
  professor_title: string | null;
  professor_bio: string | null;
  professor_photo_url: string | null;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  max_capacity: number;
  meeting_link: string | null;
  image_url: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  university?: { id: string; name: string } | null;
  partner_university?: { id: string; name: string } | null;
  registrations_count?: number;
}

export interface MirrorClassRegistration {
  id: string;
  class_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  registered_at: string;
}

export interface CreateMirrorClassData {
  type: "espejo" | "masterclass";
  title: string;
  description?: string;
  university_id?: string;
  partner_university_id?: string;
  professor_name: string;
  professor_title?: string;
  professor_bio?: string;
  professor_photo_url?: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes?: number;
  max_capacity: number;
  meeting_link?: string;
  image_url?: string;
  status?: "draft" | "published";
}

export const useMirrorClasses = (includeAll = false) => {
  return useQuery({
    queryKey: ["mirror-classes", includeAll],
    queryFn: async () => {
      let query = (supabase as any)
        .from("mirror_classes")
        .select(`
          *,
          university:universities!mirror_classes_university_id_fkey(id, name),
          partner_university:universities!mirror_classes_partner_university_id_fkey(id, name),
          registrations_count:mirror_class_registrations(count)
        `)
        .order("scheduled_date", { ascending: true });

      if (!includeAll) {
        query = query.eq("status", "published");
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[]).map((row) => ({
        ...row,
        registrations_count: row.registrations_count?.[0]?.count ?? 0,
      })) as MirrorClass[];
    },
  });
};

export const useCreateMirrorClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateMirrorClassData) => {
      const { data: result, error } = await (supabase as any)
        .from("mirror_classes")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mirror-classes"] });
      toast({ title: "Clase creada exitosamente" });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear la clase",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMirrorClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateMirrorClassData> & { id: string }) => {
      const { data: result, error } = await (supabase as any)
        .from("mirror_classes")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mirror-classes"] });
      toast({ title: "Clase actualizada" });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRegisterForClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      classId,
      fullName,
      email,
      userId,
    }: {
      classId: string;
      fullName: string;
      email: string;
      userId?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("mirror_class_registrations")
        .insert([{ class_id: classId, full_name: fullName, email, user_id: userId ?? null }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mirror-classes"] });
      toast({ title: "¡Inscripción exitosa!", description: "Recibirás el enlace de conexión por correo." });
    },
    onError: (error: any) => {
      const isDuplicate = error.code === "23505";
      toast({
        title: isDuplicate ? "Ya estás inscrito/a" : "Error al inscribirse",
        description: isDuplicate
          ? "Este correo ya tiene una inscripción para esta clase."
          : error.message,
        variant: "destructive",
      });
    },
  });
};
