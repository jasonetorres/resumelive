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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ats_settings: {
        Row: {
          ats_enabled: boolean
          id: number
          updated_at: string
        }
        Insert: {
          ats_enabled?: boolean
          id?: number
          updated_at?: string
        }
        Update: {
          ats_enabled?: boolean
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          status: string
          time_slot_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          status?: string
          time_slot_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          status?: string
          time_slot_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: true
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          message: string
          target_person: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          message: string
          target_person: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          message?: string
          target_person?: string
        }
        Relationships: []
      }
      current_target: {
        Row: {
          id: number
          target_person: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          target_person?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          target_person?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      display_settings: {
        Row: {
          id: number
          results_hidden: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          results_hidden?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          results_hidden?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ats_score: number | null
          created_at: string
          email: string
          experience_level: string | null
          first_name: string | null
          id: string
          job_title: string
          keywords: string[] | null
          last_name: string | null
          name: string
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          email: string
          experience_level?: string | null
          first_name?: string | null
          id?: string
          job_title: string
          keywords?: string[] | null
          last_name?: string | null
          name: string
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          email?: string
          experience_level?: string | null
          first_name?: string | null
          id?: string
          job_title?: string
          keywords?: string[] | null
          last_name?: string | null
          name?: string
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      question_upvotes: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_upvotes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          author_name: string | null
          created_at: string
          id: string
          is_answered: boolean
          question: string
          target_person: string
          upvotes: number
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          question: string
          target_person: string
          upvotes?: number
        }
        Update: {
          author_name?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          question?: string
          target_person?: string
          upvotes?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          agreement: string | null
          category: string
          content: number | null
          created_at: string
          feedback: string | null
          id: string
          overall: number | null
          presentation: number | null
          reaction: string | null
          target_person: string
        }
        Insert: {
          agreement?: string | null
          category: string
          content?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          overall?: number | null
          presentation?: number | null
          reaction?: string | null
          target_person: string
        }
        Update: {
          agreement?: string | null
          category?: string
          content?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          overall?: number | null
          presentation?: number | null
          reaction?: string | null
          target_person?: string
        }
        Relationships: []
      }
      resume_analysis: {
        Row: {
          analysis_data: Json | null
          ats_score: number | null
          created_at: string
          formatting_score: number | null
          id: string
          keywords_found: string[] | null
          lead_id: string
          resume_id: string | null
          skills_extracted: string[] | null
          suggestions: string[] | null
        }
        Insert: {
          analysis_data?: Json | null
          ats_score?: number | null
          created_at?: string
          formatting_score?: number | null
          id?: string
          keywords_found?: string[] | null
          lead_id: string
          resume_id?: string | null
          skills_extracted?: string[] | null
          suggestions?: string[] | null
        }
        Update: {
          analysis_data?: Json | null
          ats_score?: number | null
          created_at?: string
          formatting_score?: number | null
          id?: string
          keywords_found?: string[] | null
          lead_id?: string
          resume_id?: string | null
          skills_extracted?: string[] | null
          suggestions?: string[] | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      scheduling_settings: {
        Row: {
          id: number
          scheduling_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          scheduling_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          scheduling_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sounds: {
        Row: {
          created_at: string
          id: string
          sound_name: string
          target_person: string
        }
        Insert: {
          created_at?: string
          id?: string
          sound_name: string
          target_person?: string
        }
        Update: {
          created_at?: string
          id?: string
          sound_name?: string
          target_person?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      timer: {
        Row: {
          id: number
          is_running: boolean
          minutes: number
          paused_at: string | null
          seconds: number
          started_at: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          is_running?: boolean
          minutes?: number
          paused_at?: string | null
          seconds?: number
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          is_running?: boolean
          minutes?: number
          paused_at?: string | null
          seconds?: number
          started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
