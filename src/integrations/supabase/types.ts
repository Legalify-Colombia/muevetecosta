export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      coil_assignment_grades: {
        Row: {
          feedback: string | null
          graded_at: string | null
          graded_by: string
          id: string
          points_earned: number | null
          rubric_scores: Json | null
          submission_id: string
          updated_at: string | null
        }
        Insert: {
          feedback?: string | null
          graded_at?: string | null
          graded_by: string
          id?: string
          points_earned?: number | null
          rubric_scores?: Json | null
          submission_id: string
          updated_at?: string | null
        }
        Update: {
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string
          id?: string
          points_earned?: number | null
          rubric_scores?: Json | null
          submission_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_assignment_grades_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_assignment_grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "coil_assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_assignment_submissions: {
        Row: {
          assignment_id: string
          attachments: Json | null
          content: string | null
          id: string
          is_late: boolean | null
          participant_id: string
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          attachments?: Json | null
          content?: string | null
          id?: string
          is_late?: boolean | null
          participant_id: string
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          attachments?: Json | null
          content?: string | null
          id?: string
          is_late?: boolean | null
          participant_id?: string
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "coil_project_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_assignment_submissions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_document_folders: {
        Row: {
          access_permissions: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          access_permissions?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          access_permissions?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_document_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "coil_document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_document_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_forum_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          content: string
          created_at: string | null
          edited_at: string | null
          forum_id: string
          id: string
          is_edited: boolean | null
          parent_post_id: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string | null
          edited_at?: string | null
          forum_id: string
          id?: string
          is_edited?: boolean | null
          parent_post_id?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string | null
          edited_at?: string | null
          forum_id?: string
          id?: string
          is_edited?: boolean | null
          parent_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "coil_project_forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "coil_forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_applications: {
        Row: {
          created_at: string
          experience: string | null
          id: string
          motivation: string
          professor_id: string
          project_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          experience?: string | null
          id?: string
          motivation: string
          professor_id: string
          project_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          experience?: string | null
          id?: string
          motivation?: string
          professor_id?: string
          project_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_assignments: {
        Row: {
          assignment_type: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          max_points: number | null
          project_id: string
          rubric: Json | null
          status: string | null
          target_participants: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_points?: number | null
          project_id: string
          rubric?: Json | null
          status?: string | null
          target_participants?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_points?: number | null
          project_id?: string
          rubric?: Json | null
          status?: string | null
          target_participants?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_documents: {
        Row: {
          access_permissions: Json | null
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_url: string
          folder_id: string | null
          id: string
          is_public: boolean | null
          previous_version_id: string | null
          project_id: string
          tags: string[] | null
          uploaded_at: string
          uploaded_by: string
          version_number: number | null
        }
        Insert: {
          access_permissions?: Json | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          folder_id?: string | null
          id?: string
          is_public?: boolean | null
          previous_version_id?: string | null
          project_id: string
          tags?: string[] | null
          uploaded_at?: string
          uploaded_by: string
          version_number?: number | null
        }
        Update: {
          access_permissions?: Json | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          folder_id?: string | null
          id?: string
          is_public?: boolean | null
          previous_version_id?: string | null
          project_id?: string
          tags?: string[] | null
          uploaded_at?: string
          uploaded_by?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "coil_document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_project_documents_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "coil_project_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_forums: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_pinned: boolean | null
          project_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          project_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          project_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_forums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_project_forums_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_participants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          custom_permissions: Json | null
          id: string
          joined_at: string | null
          professor_id: string
          project_id: string
          role: string | null
          role_id: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          custom_permissions?: Json | null
          id?: string
          joined_at?: string | null
          professor_id: string
          project_id: string
          role?: string | null
          role_id?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          custom_permissions?: Json | null
          id?: string
          joined_at?: string | null
          professor_id?: string
          project_id?: string
          role?: string | null
          role_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coil_project_participants_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "coil_project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_project_roles: {
        Row: {
          can_create_assignments: boolean | null
          can_grade_assignments: boolean | null
          can_manage_documents: boolean | null
          can_manage_participants: boolean | null
          can_moderate_forums: boolean | null
          created_at: string | null
          id: string
          permissions: Json
          project_id: string
          role_name: string
        }
        Insert: {
          can_create_assignments?: boolean | null
          can_grade_assignments?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_participants?: boolean | null
          can_moderate_forums?: boolean | null
          created_at?: string | null
          id?: string
          permissions?: Json
          project_id: string
          role_name: string
        }
        Update: {
          can_create_assignments?: boolean | null
          can_grade_assignments?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_participants?: boolean | null
          can_moderate_forums?: boolean | null
          created_at?: string | null
          id?: string
          permissions?: Json
          project_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "coil_project_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "coil_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coil_projects: {
        Row: {
          academic_level: string | null
          benefits: string | null
          coordinator_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          host_university_name: string | null
          id: string
          is_public: boolean | null
          max_participants: number | null
          meeting_links: Json | null
          meeting_platform: string | null
          objectives: string | null
          project_phase: string | null
          project_type: string | null
          purpose: string | null
          requirements: string | null
          start_date: string | null
          status: string
          subject_area: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_level?: string | null
          benefits?: string | null
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          host_university_name?: string | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          meeting_links?: Json | null
          meeting_platform?: string | null
          objectives?: string | null
          project_phase?: string | null
          project_type?: string | null
          purpose?: string | null
          requirements?: string | null
          start_date?: string | null
          status?: string
          subject_area?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_level?: string | null
          benefits?: string | null
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          host_university_name?: string | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          meeting_links?: Json | null
          meeting_platform?: string | null
          objectives?: string | null
          project_phase?: string | null
          project_type?: string | null
          purpose?: string | null
          requirements?: string | null
          start_date?: string | null
          status?: string
          subject_area?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      convenio_configuracion: {
        Row: {
          beneficios: string | null
          correo_notificacion_admin: string | null
          descripcion_convenio: string
          id: string
          mensaje_bienvenida: string | null
          mensaje_confirmacion: string
          nombre_convenio: string
          proceso_habilitado: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          beneficios?: string | null
          correo_notificacion_admin?: string | null
          descripcion_convenio?: string
          id?: string
          mensaje_bienvenida?: string | null
          mensaje_confirmacion?: string
          nombre_convenio?: string
          proceso_habilitado?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          beneficios?: string | null
          correo_notificacion_admin?: string | null
          descripcion_convenio?: string
          id?: string
          mensaje_bienvenida?: string | null
          mensaje_confirmacion?: string
          nombre_convenio?: string
          proceso_habilitado?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      convenio_documentos_universidad: {
        Row: {
          archivo_nombre: string
          archivo_tamaño: number | null
          archivo_url: string
          convenio_id: string
          estado_revision: string | null
          id: string
          observaciones_revision: string | null
          plantilla_documento_id: string | null
          revisado_at: string | null
          revisado_por: string | null
          tipo_documento: string
          uploaded_at: string
        }
        Insert: {
          archivo_nombre: string
          archivo_tamaño?: number | null
          archivo_url: string
          convenio_id: string
          estado_revision?: string | null
          id?: string
          observaciones_revision?: string | null
          plantilla_documento_id?: string | null
          revisado_at?: string | null
          revisado_por?: string | null
          tipo_documento: string
          uploaded_at?: string
        }
        Update: {
          archivo_nombre?: string
          archivo_tamaño?: number | null
          archivo_url?: string
          convenio_id?: string
          estado_revision?: string | null
          id?: string
          observaciones_revision?: string | null
          plantilla_documento_id?: string | null
          revisado_at?: string | null
          revisado_por?: string | null
          tipo_documento?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "convenio_documentos_universidad_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios_universidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convenio_documentos_universidad_plantilla_documento_id_fkey"
            columns: ["plantilla_documento_id"]
            isOneToOne: false
            referencedRelation: "convenio_plantillas_documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      convenio_notificaciones: {
        Row: {
          asunto: string
          convenio_id: string
          created_at: string
          destinatario_email: string
          enviado: boolean | null
          enviado_at: string | null
          error_envio: string | null
          id: string
          mensaje: string
          tipo_notificacion: string
        }
        Insert: {
          asunto: string
          convenio_id: string
          created_at?: string
          destinatario_email: string
          enviado?: boolean | null
          enviado_at?: string | null
          error_envio?: string | null
          id?: string
          mensaje: string
          tipo_notificacion: string
        }
        Update: {
          asunto?: string
          convenio_id?: string
          created_at?: string
          destinatario_email?: string
          enviado?: boolean | null
          enviado_at?: string | null
          error_envio?: string | null
          id?: string
          mensaje?: string
          tipo_notificacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "convenio_notificaciones_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios_universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      convenio_plantillas_documentos: {
        Row: {
          archivo_nombre: string
          archivo_url: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          es_activa: boolean
          es_obligatoria: boolean
          id: string
          nombre: string
          tipo: string
          updated_at: string
          version: number
        }
        Insert: {
          archivo_nombre: string
          archivo_url: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          es_activa?: boolean
          es_obligatoria?: boolean
          id?: string
          nombre: string
          tipo: string
          updated_at?: string
          version?: number
        }
        Update: {
          archivo_nombre?: string
          archivo_url?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          es_activa?: boolean
          es_obligatoria?: boolean
          id?: string
          nombre?: string
          tipo?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      convenio_terminos_condiciones: {
        Row: {
          contenido: string
          created_at: string
          created_by: string | null
          es_activo: boolean
          id: string
          titulo: string
          updated_at: string
          version: number
        }
        Insert: {
          contenido: string
          created_at?: string
          created_by?: string | null
          es_activo?: boolean
          id?: string
          titulo?: string
          updated_at?: string
          version?: number
        }
        Update: {
          contenido?: string
          created_at?: string
          created_by?: string | null
          es_activo?: boolean
          id?: string
          titulo?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      convenios_historial: {
        Row: {
          cambiado_por: string | null
          convenio_id: string
          created_at: string
          estado_anterior: string | null
          estado_nuevo: string
          id: string
          observaciones: string | null
        }
        Insert: {
          cambiado_por?: string | null
          convenio_id: string
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo: string
          id?: string
          observaciones?: string | null
        }
        Update: {
          cambiado_por?: string | null
          convenio_id?: string
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo?: string
          id?: string
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convenios_historial_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios_universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios_universidades: {
        Row: {
          acepta_terminos: boolean
          carta_adhesion_url: string | null
          contrato_firmado_url: string | null
          correo_institucional: string
          created_at: string
          descripcion_universidad: string | null
          direccion: string
          estado: string
          fecha_aprobacion: string | null
          fecha_revision: string | null
          fecha_solicitud: string
          id: string
          ip_registro: unknown | null
          metodo_creacion: string | null
          motivo_rechazo: string | null
          nit_rut: string
          nombre_universidad: string
          observaciones: string | null
          razon_social: string
          responsable_cargo: string
          responsable_correo: string
          responsable_identificacion: string
          responsable_nombre: string
          responsable_telefono: string
          revisado_por: string | null
          sitio_web: string | null
          telefono: string
          terminos_version_aceptados: number | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          acepta_terminos?: boolean
          carta_adhesion_url?: string | null
          contrato_firmado_url?: string | null
          correo_institucional: string
          created_at?: string
          descripcion_universidad?: string | null
          direccion: string
          estado?: string
          fecha_aprobacion?: string | null
          fecha_revision?: string | null
          fecha_solicitud?: string
          id?: string
          ip_registro?: unknown | null
          metodo_creacion?: string | null
          motivo_rechazo?: string | null
          nit_rut: string
          nombre_universidad: string
          observaciones?: string | null
          razon_social: string
          responsable_cargo: string
          responsable_correo: string
          responsable_identificacion: string
          responsable_nombre: string
          responsable_telefono: string
          revisado_por?: string | null
          sitio_web?: string | null
          telefono: string
          terminos_version_aceptados?: number | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          acepta_terminos?: boolean
          carta_adhesion_url?: string | null
          contrato_firmado_url?: string | null
          correo_institucional?: string
          created_at?: string
          descripcion_universidad?: string | null
          direccion?: string
          estado?: string
          fecha_aprobacion?: string | null
          fecha_revision?: string | null
          fecha_solicitud?: string
          id?: string
          ip_registro?: unknown | null
          metodo_creacion?: string | null
          motivo_rechazo?: string | null
          nit_rut?: string
          nombre_universidad?: string
          observaciones?: string | null
          razon_social?: string
          responsable_cargo?: string
          responsable_correo?: string
          responsable_identificacion?: string
          responsable_nombre?: string
          responsable_telefono?: string
          revisado_por?: string | null
          sitio_web?: string | null
          telefono?: string
          terminos_version_aceptados?: number | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
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
      email_configuration: {
        Row: {
          created_at: string
          default_sender_email: string
          default_sender_name: string
          id: string
          is_active: boolean
          resend_api_key: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          default_sender_email?: string
          default_sender_name?: string
          id?: string
          is_active?: boolean
          resend_api_key?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          default_sender_email?: string
          default_sender_name?: string
          id?: string
          is_active?: boolean
          resend_api_key?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_configuration_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_history: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          available_variables: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          template_html_content: string
          template_name: string
          template_subject: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          available_variables?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          template_html_content: string
          template_name: string
          template_subject: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          available_variables?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          template_html_content?: string
          template_name?: string
          template_subject?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          bio: string | null
          contact_email: string | null
          created_at: string | null
          cv_url: string | null
          expertise_areas: string[] | null
          faculty_department: string | null
          google_scholar_url: string | null
          id: string
          is_public_profile: boolean | null
          linkedin_url: string | null
          orcid_id: string | null
          profile_photo_url: string | null
          project_experience: string | null
          relevant_publications: Json | null
          research_interests: string | null
          university: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          cv_url?: string | null
          expertise_areas?: string[] | null
          faculty_department?: string | null
          google_scholar_url?: string | null
          id: string
          is_public_profile?: boolean | null
          linkedin_url?: string | null
          orcid_id?: string | null
          profile_photo_url?: string | null
          project_experience?: string | null
          relevant_publications?: Json | null
          research_interests?: string | null
          university: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          cv_url?: string | null
          expertise_areas?: string[] | null
          faculty_department?: string | null
          google_scholar_url?: string | null
          id?: string
          is_public_profile?: boolean | null
          linkedin_url?: string | null
          orcid_id?: string | null
          profile_photo_url?: string | null
          project_experience?: string | null
          relevant_publications?: Json | null
          research_interests?: string | null
          university?: string
          updated_at?: string | null
          website_url?: string | null
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
      professor_mobility_applications: {
        Row: {
          application_number: string | null
          created_at: string | null
          destination_university_id: string | null
          end_date: string | null
          id: string
          mobility_type: string
          professor_id: string
          purpose: string | null
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          application_number?: string | null
          created_at?: string | null
          destination_university_id?: string | null
          end_date?: string | null
          id?: string
          mobility_type?: string
          professor_id: string
          purpose?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          application_number?: string | null
          created_at?: string | null
          destination_university_id?: string | null
          end_date?: string | null
          id?: string
          mobility_type?: string
          professor_id?: string
          purpose?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_mobility_applications_destination_university_id_fkey"
            columns: ["destination_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_mobility_applications_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_mobility_calls: {
        Row: {
          application_deadline: string
          benefits: string | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          end_date: string | null
          host_university_id: string | null
          id: string
          is_active: boolean
          max_participants: number
          mobility_type: string
          requirements: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline: string
          benefits?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          host_university_id?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number
          mobility_type?: string
          requirements?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string
          benefits?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          host_university_id?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number
          mobility_type?: string
          requirements?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_mobility_calls_host_university_id_fkey"
            columns: ["host_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_mobility_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_mobility_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "professor_mobility_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_mobility_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_mobility_notes: {
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
            foreignKeyName: "professor_mobility_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "professor_mobility_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_mobility_notes_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
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
          origin_university_id: string | null
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
          origin_university_id?: string | null
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
          origin_university_id?: string | null
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
          {
            foreignKeyName: "student_info_origin_university_id_fkey"
            columns: ["origin_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
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
      university_required_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_title: string
          document_type: string | null
          id: string
          is_mandatory: boolean | null
          mobility_type: string | null
          template_file_name: string | null
          template_file_url: string | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_title: string
          document_type?: string | null
          id?: string
          is_mandatory?: boolean | null
          mobility_type?: string | null
          template_file_name?: string | null
          template_file_url?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_title?: string
          document_type?: string | null
          id?: string
          is_mandatory?: boolean | null
          mobility_type?: string | null
          template_file_name?: string | null
          template_file_url?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_required_documents_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
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
      generate_professor_application_number: {
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
