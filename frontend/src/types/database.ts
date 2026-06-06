/**
 * Supabase DB テーブルの TypeScript 型定義
 * ── backend/supabase/schema.sql と必ず同期させること ──
 * スキーマを変更した場合は、このファイルも同時に更新する。
 */

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          avatar_id: string
          level: number
          exp: number
          streak_days: number
          national_rank: number | null
          deviation_score: number | null
          recovery_code: string | null
          last_login_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_id?: string
          level?: number
          exp?: number
          streak_days?: number
          national_rank?: number | null
          recovery_code?: string | null
          deviation_score?: number | null
        }
        Update: {
          username?: string
          avatar_id?: string
          level?: number
          exp?: number
          streak_days?: number
          national_rank?: number | null
          deviation_score?: number | null
          last_login_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          subject: string
          unit: string
          subunit: string
          selected_label: string
          is_correct: boolean
          time_taken_sec: number
          answered_at: string
        }
        Insert: {
          user_id: string
          question_id: string
          subject: string
          unit: string
          subunit: string
          selected_label: string
          is_correct: boolean
          time_taken_sec: number
        }
        Update: {
          [key: string]: never
        }
        Relationships: []
      }
      learning_stats: {
        Row: {
          id: string
          user_id: string
          subject: string
          unit: string
          subunit: string
          attempts: number
          correct: number
          avg_time_sec: number | null
          last_practiced: string | null
        }
        Insert: {
          user_id: string
          subject: string
          unit: string
          subunit: string
          attempts?: number
          correct?: number
          avg_time_sec?: number | null
          last_practiced?: string | null
        }
        Update: {
          attempts?: number
          correct?: number
          avg_time_sec?: number | null
          last_practiced?: string | null
        }
        Relationships: []
      }
      national_stats: {
        Row: {
          id: string
          subject: string
          calculated_at: string
          total_users: number
          mean_score: number
          std_deviation: number
          calculation_phase: number
        }
        Insert: {
          [key: string]: never
        }
        Update: {
          [key: string]: never
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          subject: string
          title: string
          body: string
          likes: number
          is_resolved: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          question_id: string
          subject: string
          title: string
          body: string
        }
        Update: {
          title?: string
          body?: string
          likes?: number
          is_resolved?: boolean
        }
        Relationships: []
      }
      replies: {
        Row: {
          id: string
          post_id: string
          user_id: string
          body: string
          is_staff: boolean
          likes: number
          created_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          body: string
          is_staff?: boolean
        }
        Update: {
          body?: string
          likes?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      upsert_learning_stats: {
        Args: {
          p_user_id:    string
          p_subject:    string
          p_unit:       string
          p_subunit:    string
          p_is_correct: boolean
          p_time_sec:   number
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ── 便利な型エイリアス ──
export type UserProfile       = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type QuizAnswer        = Database['public']['Tables']['quiz_answers']['Row']
export type QuizAnswerInsert  = Database['public']['Tables']['quiz_answers']['Insert']
export type LearningStats     = Database['public']['Tables']['learning_stats']['Row']
export type NationalStats     = Database['public']['Tables']['national_stats']['Row']
export type Post              = Database['public']['Tables']['posts']['Row']
export type PostInsert        = Database['public']['Tables']['posts']['Insert']
export type Reply             = Database['public']['Tables']['replies']['Row']
export type ReplyInsert       = Database['public']['Tables']['replies']['Insert']
