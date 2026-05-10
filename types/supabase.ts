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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_id: string
          applied_at: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          event_type: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          project_id: string | null
          status: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          event_type?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          project_id?: string | null
          status?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          event_type?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          project_id?: string | null
          status?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      profile_links: {
        Row: {
          created_at: string
          id: string
          label: string
          link_type: string
          sort_order: number
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          link_type: string
          sort_order?: number
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          link_type?: string
          sort_order?: number
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_projects: {
        Row: {
          created_at: string
          description: string
          id: string
          role: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          year: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          role: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
          year: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          role?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          displayname: string | null
          email: string | null
          faculty: string | null
          headline: string | null
          id: string
          interests: string[]
          location: string | null
          major: string | null
          name: string | null
          phone: string | null
          skills: string[]
          status: string | null
          status_text: string | null
          student_id: string | null
          updated_at: string
          username: string | null
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          displayname?: string | null
          email?: string | null
          faculty?: string | null
          headline?: string | null
          id: string
          interests?: string[]
          location?: string | null
          major?: string | null
          name?: string | null
          phone?: string | null
          skills?: string[]
          status?: string | null
          status_text?: string | null
          student_id?: string | null
          updated_at?: string
          username?: string | null
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          displayname?: string | null
          email?: string | null
          faculty?: string | null
          headline?: string | null
          id?: string
          interests?: string[]
          location?: string | null
          major?: string | null
          name?: string | null
          phone?: string | null
          skills?: string[]
          status?: string | null
          status_text?: string | null
          student_id?: string | null
          updated_at?: string
          username?: string | null
          year?: string | null
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          additional_note: string | null
          applicant_id: string
          created_at: string
          id: string
          motivation_message: string | null
          note: string | null
          portfolio_urls: string[]
          position_id: string | null
          project_id: string
          rejection_reason: string | null
          skills: string[]
          status: string
          updated_at: string
        }
        Insert: {
          additional_note?: string | null
          applicant_id: string
          created_at?: string
          id?: string
          motivation_message?: string | null
          note?: string | null
          portfolio_urls?: string[]
          position_id?: string | null
          project_id: string
          rejection_reason?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          additional_note?: string | null
          applicant_id?: string
          created_at?: string
          id?: string
          motivation_message?: string | null
          note?: string | null
          portfolio_urls?: string[]
          position_id?: string | null
          project_id?: string
          rejection_reason?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "project_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_categories: {
        Row: {
          category_name: string
          id: string
          project_id: string
        }
        Insert: {
          category_name: string
          id?: string
          project_id: string
        }
        Update: {
          category_name?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          position_id: string | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position_id?: string | null
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position_id?: string | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "project_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_position_basic_qualifications: {
        Row: {
          id: string
          position_id: string
          qualification_text: string
        }
        Insert: {
          id?: string
          position_id: string
          qualification_text: string
        }
        Update: {
          id?: string
          position_id?: string
          qualification_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_position_basic_qualifications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "project_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_position_skills: {
        Row: {
          id: string
          position_id: string
          skill_name: string
        }
        Insert: {
          id?: string
          position_id: string
          skill_name: string
        }
        Update: {
          id?: string
          position_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_position_skills_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "project_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_positions: {
        Row: {
          accepted_count: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_members: number
          needed_count: number
          preferred_qualifications: string | null
          project_id: string
          required_skills: string[] | null
          title: string
        }
        Insert: {
          accepted_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_members?: number
          needed_count?: number
          preferred_qualifications?: string | null
          project_id: string
          required_skills?: string[] | null
          title: string
        }
        Update: {
          accepted_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_members?: number
          needed_count?: number
          preferred_qualifications?: string | null
          project_id?: string
          required_skills?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_positions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          admin_feedback: string | null
          application_end_date: string | null
          application_start_date: string | null
          benefits: string[]
          compensation_detail: string | null
          created_at: string
          description: string | null
          id: string
          owner_id: string
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          title: string
          updated_at: string
          work_mode: string | null
          working_hours: string | null
        }
        Insert: {
          admin_feedback?: string | null
          application_end_date?: string | null
          application_start_date?: string | null
          benefits?: string[]
          compensation_detail?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          title: string
          updated_at?: string
          work_mode?: string | null
          working_hours?: string | null
        }
        Update: {
          admin_feedback?: string | null
          application_end_date?: string | null
          application_start_date?: string | null
          benefits?: string[]
          compensation_detail?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          work_mode?: string | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          tu_id: string
        }
        Insert: {
          created_at: string
          email: string
          id: string
          name: string
          tu_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          tu_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_project_with_relations: {
        Args: { p_form_data: Json; p_owner_id: string; p_status: string }
        Returns: string
      }
      update_my_project_with_relations: {
        Args: {
          p_form_data: Json
          p_owner_id: string
          p_project_id: string
          p_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "applied" | "in_review" | "rejected" | "accepted"
      notification_category: "my-project" | "applied"
      project_status:
        | "draft"
        | "pending_approval"
        | "rejected_by_admin"
        | "approved"
        | "open"
        | "reviewing"
        | "closed"
        | "recruiting"
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
      application_status: ["applied", "in_review", "rejected", "accepted"],
      notification_category: ["my-project", "applied"],
      project_status: [
        "draft",
        "pending_approval",
        "rejected_by_admin",
        "approved",
        "open",
        "reviewing",
        "closed",
        "recruiting",
      ],
    },
  },
} as const
