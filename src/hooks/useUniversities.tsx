
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUniversities = () => {
  return useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (
            id,
            name,
            description,
            duration_semesters
          )
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });
};

export const useUniversity = (id: string) => {
  return useQuery({
    queryKey: ['university', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          academic_programs (
            id,
            name,
            description,
            duration_semesters,
            courses (
              id,
              name,
              code,
              description,
              credits,
              semester
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};
