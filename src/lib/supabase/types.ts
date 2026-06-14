export interface Database {
  public: {
    Tables: {
      user_sessions: {
        Row: {
          session_id: string;
          credits: number;
          free_used: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          credits?: number;
          free_used?: boolean;
        };
        Update: {
          credits?: number;
          free_used?: boolean;
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
    };
  };
}

export type SeriesRow = Database["public"]["Tables"]["series"]["Row"];
export type EpisodeRow = Database["public"]["Tables"]["episodes"]["Row"];
export type UserSessionRow = Database["public"]["Tables"]["user_sessions"]["Row"];
