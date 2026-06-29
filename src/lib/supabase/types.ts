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
          subscription_welcome_sent: boolean;
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
          subscription_welcome_sent?: boolean;
        };
        Update: {
          credits?: number;
          free_used?: boolean;
          subscription_status?: string | null;
          subscription_plan_id?: string | null;
          subscription_stripe_id?: string | null;
          subscription_period_end?: string | null;
          subscription_welcome_sent?: boolean;
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
          wants_weekly_newsletter: boolean;
          newsletter_topics: string[];
          country_code: string | null;
          signup_ip: string | null;
          referred_by_affiliate_id: string | null;
          password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          email: string;
          full_name: string;
          wants_recommendations?: boolean;
          wants_weekly_newsletter?: boolean;
          newsletter_topics?: string[];
          country_code?: string | null;
          signup_ip?: string | null;
          referred_by_affiliate_id?: string | null;
          password_hash?: string | null;
        };
        Update: {
          session_id?: string;
          full_name?: string;
          password_hash?: string | null;
          wants_recommendations?: boolean;
          wants_weekly_newsletter?: boolean;
          newsletter_topics?: string[];
          country_code?: string | null;
          signup_ip?: string | null;
          referred_by_affiliate_id?: string | null;
        };
      };
      affiliates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          email: string | null;
          company: string | null;
          is_active: boolean;
          payment_method: "iban" | "paypal" | null;
          payment_details: Record<string, unknown>;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          email?: string | null;
          company?: string | null;
          is_active?: boolean;
          payment_method?: "iban" | "paypal" | null;
          payment_details?: Record<string, unknown>;
          notes?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          email?: string | null;
          company?: string | null;
          is_active?: boolean;
          payment_method?: "iban" | "paypal" | null;
          payment_details?: Record<string, unknown>;
          notes?: string | null;
          updated_at?: string;
        };
      };
      affiliate_applications: {
        Row: {
          id: string;
          email: string;
          company: string | null;
          description: string | null;
          traffic_sources: string[];
          affiliate_id: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          company?: string | null;
          description?: string | null;
          traffic_sources?: string[];
          affiliate_id?: string | null;
        };
        Update: {
          affiliate_id?: string | null;
        };
      };
      affiliate_signups: {
        Row: {
          id: string;
          affiliate_id: string;
          profile_id: string;
          country_code: string;
          commission_region: "eu" | "us" | "other";
          commission_cents: number;
          converted_at: string;
        };
        Insert: {
          affiliate_id: string;
          profile_id: string;
          country_code: string;
          commission_region: "eu" | "us" | "other";
          commission_cents?: number;
        };
      };
      affiliate_purchases: {
        Row: {
          id: string;
          affiliate_id: string;
          profile_id: string | null;
          session_id: string | null;
          purchase_type: "subscription" | "coins";
          amount_cents: number | null;
          stripe_session_id: string | null;
          purchased_at: string;
        };
        Insert: {
          affiliate_id: string;
          profile_id?: string | null;
          session_id?: string | null;
          purchase_type: "subscription" | "coins";
          amount_cents?: number | null;
          stripe_session_id?: string | null;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          session_id: string;
          profile_id: string | null;
          series_id: string;
          series_title: string | null;
          genre: string | null;
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
          series_title?: string | null;
          genre?: string | null;
          episode_number?: number;
          max_panel_reached?: number;
          total_panels?: number;
          completed_at?: string | null;
        };
        Update: {
          profile_id?: string | null;
          series_title?: string | null;
          genre?: string | null;
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
      comment_reactions: {
        Row: {
          id: string;
          comment_id: string;
          session_id: string;
          profile_id: string | null;
          reaction: "like" | "dislike";
          created_at: string;
        };
        Insert: {
          comment_id: string;
          session_id: string;
          profile_id?: string | null;
          reaction: "like" | "dislike";
        };
        Update: {
          reaction?: "like" | "dislike";
          profile_id?: string | null;
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
export type AffiliateRow = Database["public"]["Tables"]["affiliates"]["Row"];
export type AffiliateApplicationRow =
  Database["public"]["Tables"]["affiliate_applications"]["Row"];
export type AffiliateSignupRow =
  Database["public"]["Tables"]["affiliate_signups"]["Row"];
export type AffiliatePurchaseRow =
  Database["public"]["Tables"]["affiliate_purchases"]["Row"];
