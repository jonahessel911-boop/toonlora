export interface Database {
  public: {
    Tables: {
      user_sessions: {
        Row: {
          session_id: string;
          credits: number;
          free_used: boolean;
          subscription_status: string | null;
          subscription_plan_id: string | null;
          subscription_stripe_id: string | null;
          subscription_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          credits?: number;
          free_used?: boolean;
          subscription_status?: string | null;
          subscription_plan_id?: string | null;
          subscription_stripe_id?: string | null;
          subscription_period_end?: string | null;
        };
        Update: {
          credits?: number;
          free_used?: boolean;
          subscription_status?: string | null;
          subscription_plan_id?: string | null;
          subscription_stripe_id?: string | null;
          subscription_period_end?: string | null;
        };
      };
      series: {
        Row: {
          id: string;
          owner_session_id: string;
          title: string;
          genre: string;
          cover_gradient: string;
          main_character: string | null;
          love_interest: string | null;
          story_idea: string | null;
          user_input: Record<string, unknown> | null;
          story_bible: Record<string, unknown> | null;
          continuity_memory: Record<string, unknown> | null;
          pipeline_result: Record<string, unknown> | null;
          legacy_pages: { chapters: unknown[]; pages: unknown[] };
          is_public: boolean;
          source: string;
          status: string;
          published_at: string | null;
          featured_rank: number | null;
          synopsis: string | null;
          creator_display_name: string | null;
          views_count: number;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_session_id: string;
          title: string;
          genre: string;
          cover_gradient: string;
          main_character?: string | null;
          love_interest?: string | null;
          story_idea?: string | null;
          user_input?: Record<string, unknown> | null;
          story_bible?: Record<string, unknown> | null;
          continuity_memory?: Record<string, unknown> | null;
          pipeline_result?: Record<string, unknown> | null;
          legacy_pages?: { chapters: unknown[]; pages: unknown[] };
          is_public?: boolean;
          source?: string;
          status?: string;
          published_at?: string | null;
          featured_rank?: number | null;
          synopsis?: string | null;
          creator_display_name?: string | null;
          views_count?: number;
          likes_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
      };
      episodes: {
        Row: {
          id: string;
          series_id: string;
          episode_number: number;
          title: string;
          script: Record<string, unknown>;
          panel_breakdown: Record<string, unknown>;
          image_prompt: Record<string, unknown>;
          comic_page: Record<string, unknown>;
          text_overlay: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          series_id: string;
          episode_number: number;
          title: string;
          script: Record<string, unknown>;
          panel_breakdown: Record<string, unknown>;
          image_prompt: Record<string, unknown>;
          comic_page: Record<string, unknown>;
          text_overlay: Record<string, unknown>;
        };
      };
      profiles: {
        Row: {
          id: string;
          session_id: string;
          email: string;
          full_name: string;
          wants_recommendations: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          email: string;
          full_name: string;
          wants_recommendations?: boolean;
        };
        Update: {
          session_id?: string;
          full_name?: string;
          wants_recommendations?: boolean;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          session_id: string;
          profile_id: string | null;
          series_id: string;
          episode_number: number;
          max_panel_reached: number;
          total_panels: number;
          completed_at: string | null;
          first_opened_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          profile_id?: string | null;
          series_id: string;
          episode_number?: number;
          max_panel_reached?: number;
          total_panels?: number;
          completed_at?: string | null;
        };
        Update: {
          profile_id?: string | null;
          max_panel_reached?: number;
          total_panels?: number;
          completed_at?: string | null;
        };
      };
      platform_sessions: {
        Row: {
          id: string;
          session_id: string;
          profile_id: string | null;
          entry_path: string | null;
          started_at: string;
          last_active_at: string;
          duration_seconds: number;
        };
        Insert: {
          session_id: string;
          profile_id?: string | null;
          entry_path?: string | null;
          duration_seconds?: number;
        };
        Update: {
          profile_id?: string | null;
          last_active_at?: string;
          duration_seconds?: number;
        };
      };
      login_events: {
        Row: {
          id: string;
          profile_id: string;
          logged_in_at: string;
          method: string;
        };
        Insert: {
          profile_id: string;
          method?: string;
        };
      };
      episode_comments: {
        Row: {
          id: string;
          series_id: string;
          episode_number: number;
          profile_id: string | null;
          session_id: string | null;
          author_name: string;
          author_email: string | null;
          body: string;
          likes: number;
          dislikes: number;
          is_spoiler: boolean;
          created_at: string;
        };
        Insert: {
          series_id: string;
          episode_number?: number;
          profile_id?: string | null;
          session_id?: string | null;
          author_name: string;
          author_email?: string | null;
          body: string;
          is_spoiler?: boolean;
        };
        Update: {
          likes?: number;
          dislikes?: number;
        };
      };
    };
  };
}

export type SeriesRow = Database["public"]["Tables"]["series"]["Row"];
export type EpisodeRow = Database["public"]["Tables"]["episodes"]["Row"];
export type UserSessionRow = Database["public"]["Tables"]["user_sessions"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ReadingProgressRow =
  Database["public"]["Tables"]["reading_progress"]["Row"];
export type PlatformSessionRow =
  Database["public"]["Tables"]["platform_sessions"]["Row"];
export type LoginEventRow = Database["public"]["Tables"]["login_events"]["Row"];
export type EpisodeCommentRow =
  Database["public"]["Tables"]["episode_comments"]["Row"];
