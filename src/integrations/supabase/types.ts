export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academic_programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_semesters: number | null
          id: string
          is_active: boolean | null
          name: string
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_semesters?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_semesters?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          application_id?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mobility_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          coordinator_id: string
          created_at: string
          id: string
          is_internal: boolean | null
          note: string
          updated_at: string
        }
        Insert: {
          application_id: string
          coordinator_id: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          coordinator_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mobility_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_equivalences: {
        Row: {
          application_id: string | null
          created_at: string | null
          destination_course_id: string | null
          id: string
          origin_course_code: string | null
          origin_course_name: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          destination_course_id?: string | null
          id?: string
          origin_course_code?: string | null
          origin_course_name: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          destination_course_id?: string | null
          id?: string
          origin_course_code?: string | null
          origin_course_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_equivalences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "mobility_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_equivalences_destination_course_id_fkey"
            columns: ["destination_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string | null
          created_at: string | null
          credits: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          program_id: string | null
          semester: number | null
          syllabus_url: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          program_id?: string | null
          semester?: number | null
          syllabus_url?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          program_id?: string | null
          semester?: number | null
          syllabus_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_applications: {
        Row: {
          application_number: string | null
          created_at: string | null
          destination_program_id: string | null
          destination_university_id: string | null
          id: string
          status: Database["public"]["Enums"]["application_status"] | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          application_number?: string | null
          created_at?: string | null
          destination_program_id?: string | null
          destination_university_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          application_number?: string | null
          created_at?: string | null
          destination_program_id?: string | null
          destination_university_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobility_applications_destination_program_id_fkey"
            columns: ["destination_program_id"]
            isOneToOne: false
            referencedRelation: "academic_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_applications_destination_university_id_fkey"
            columns: ["destination_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_application_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_application_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_application_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_application_id_fkey"
            columns: ["related_application_id"]
            isOneToOne: false
            referencedRelation: "mobility_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages_content: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          last_updated_by: string | null
          meta_description: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          last_updated_by?: string | null
          meta_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          last_updated_by?: string | null
          meta_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_content_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_info: {
        Row: {
          created_at: string | null
          cv_url: string | null
          expertise_areas: string[] | null
          faculty_department: string | null
          id: string
          profile_photo_url: string | null
          project_experience: string | null
          relevant_publications: Json | null
          research_interests: string | null
          university: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cv_url?: string | null
          expertise_areas?: string[] | null
          faculty_department?: string | null
          id: string
          profile_photo_url?: string | null
          project_experience?: string | null
          relevant_publications?: Json | null
          research_interests?: string | null
          university: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cv_url?: string | null
          expertise_areas?: string[] | null
          faculty_department?: string | null
          id?: string
          profile_photo_url?: string | null
          project_experience?: string | null
          relevant_publications?: Json | null
          research_interests?: string | null
          university?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          professor_id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          professor_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          professor_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          project_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          project_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          project_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          documents_urls: string[] | null
          id: string
          milestone_date: string
          next_steps: string | null
          professor_id: string | null
          project_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          documents_urls?: string[] | null
          id?: string
          milestone_date: string
          next_steps?: string | null
          professor_id?: string | null
          project_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          documents_urls?: string[] | null
          id?: string
          milestone_date?: string
          next_steps?: string | null
          professor_id?: string | null
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          id: string
          joined_at: string | null
          professor_id: string | null
          project_id: string | null
          role: string
          status: string | null
          university_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          professor_id?: string | null
          project_id?: string | null
          role: string
          status?: string | null
          university_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          professor_id?: string | null
          project_id?: string | null
          role?: string
          status?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_universities: {
        Row: {
          id: string
          project_id: string | null
          role: string | null
          university_id: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          role?: string | null
          university_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          role?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_universities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_universities_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_public: boolean | null
          lead_university_id: string | null
          objectives: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          lead_university_id?: string | null
          objectives?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          lead_university_id?: string | null
          objectives?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_projects_lead_university_id_fkey"
            columns: ["lead_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_info: {
        Row: {
          academic_director_email: string | null
          academic_director_name: string | null
          academic_director_phone: string | null
          academic_program: string
          birth_country: string | null
          birth_date: string | null
          birth_place: string | null
          blood_type: string | null
          created_at: string | null
          cumulative_gpa: number | null
          current_semester: number
          gender: string | null
          health_insurance: string | null
          id: string
          origin_faculty: string | null
          origin_institution_campus: string | null
          origin_university: string
          student_code: string | null
          updated_at: string | null
        }
        Insert: {
          academic_director_email?: string | null
          academic_director_name?: string | null
          academic_director_phone?: string | null
          academic_program: string
          birth_country?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          current_semester: number
          gender?: string | null
          health_insurance?: string | null
          id: string
          origin_faculty?: string | null
          origin_institution_campus?: string | null
          origin_university: string
          student_code?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_director_email?: string | null
          academic_director_name?: string | null
          academic_director_phone?: string | null
          academic_program?: string
          birth_country?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          created_at?: string | null
          cumulative_gpa?: number | null
          current_semester?: number
          gender?: string | null
          health_insurance?: string | null
          id?: string
          origin_faculty?: string | null
          origin_institution_campus?: string | null
          origin_university?: string
          student_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          address: string | null
          city: string | null
          coordinator_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "universities_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_coordinator_to_university: {
        Args: { coordinator_user_id: string; university_id: string }
        Returns: boolean
      }
      generate_application_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
      document_type: "cc" | "ti" | "passport" | "ce"
      user_role: "admin" | "coordinator" | "professor" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed",
      ],
      document_type: ["cc", "ti", "passport", "ce"],
      user_role: ["admin", "coordinator", "professor", "student"],
    },
  },
} as const
