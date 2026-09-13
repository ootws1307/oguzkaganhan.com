export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_links: {
        Row: {
          id: string
          is_visible: boolean
          kind: Database["public"]["Enums"]["contact_kind"]
          label: string
          position: number
          url: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          kind: Database["public"]["Enums"]["contact_kind"]
          label: string
          position?: number
          url: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          kind?: Database["public"]["Enums"]["contact_kind"]
          label?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          description_md: Json
          ended_on: string | null
          id: string
          is_visible: boolean
          kind: Database["public"]["Enums"]["experience_kind"]
          location: string
          organization: string
          position: number
          role: Json
          started_on: string
          updated_at: string
          url: string | null
        }
        Insert: {
          description_md?: Json
          ended_on?: string | null
          id?: string
          is_visible?: boolean
          kind: Database["public"]["Enums"]["experience_kind"]
          location?: string
          organization: string
          position?: number
          role?: Json
          started_on: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          description_md?: Json
          ended_on?: string | null
          id?: string
          is_visible?: boolean
          kind?: Database["public"]["Enums"]["experience_kind"]
          location?: string
          organization?: string
          position?: number
          role?: Json
          started_on?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      github_repos: {
        Row: {
          description: string | null
          forks: number
          full_name: string
          homepage: string | null
          html_url: string
          id: number
          is_archived: boolean
          is_fork: boolean
          language: string | null
          name: string
          pushed_at: string | null
          readme_md: string | null
          removed_at: string | null
          stars: number
          synced_at: string
          topics: string[]
        }
        Insert: {
          description?: string | null
          forks?: number
          full_name: string
          homepage?: string | null
          html_url: string
          id: number
          is_archived?: boolean
          is_fork?: boolean
          language?: string | null
          name: string
          pushed_at?: string | null
          readme_md?: string | null
          removed_at?: string | null
          stars?: number
          synced_at?: string
          topics?: string[]
        }
        Update: {
          description?: string | null
          forks?: number
          full_name?: string
          homepage?: string | null
          html_url?: string
          id?: number
          is_archived?: boolean
          is_fork?: boolean
          language?: string | null
          name?: string
          pushed_at?: string | null
          readme_md?: string | null
          removed_at?: string | null
          stars?: number
          synced_at?: string
          topics?: string[]
        }
        Relationships: []
      }
      project_images: {
        Row: {
          alt: Json
          created_at: string
          height: number | null
          id: string
          path: string
          position: number
          project_id: string
          width: number | null
        }
        Insert: {
          alt?: Json
          created_at?: string
          height?: number | null
          id?: string
          path: string
          position?: number
          project_id: string
          width?: number | null
        }
        Update: {
          alt?: Json
          created_at?: string
          height?: number | null
          id?: string
          path?: string
          position?: number
          project_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body_md: Json
          cover_path: string | null
          created_at: string
          ended_on: string | null
          github_repo_id: number | null
          id: string
          is_featured: boolean
          is_visible: boolean
          live_url: string | null
          position: number
          repo_url: string | null
          slug: string
          source: Database["public"]["Enums"]["project_source"]
          started_on: string | null
          summary: Json
          tech: string[]
          title: Json
          updated_at: string
        }
        Insert: {
          body_md?: Json
          cover_path?: string | null
          created_at?: string
          ended_on?: string | null
          github_repo_id?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          live_url?: string | null
          position?: number
          repo_url?: string | null
          slug: string
          source: Database["public"]["Enums"]["project_source"]
          started_on?: string | null
          summary?: Json
          tech?: string[]
          title?: Json
          updated_at?: string
        }
        Update: {
          body_md?: Json
          cover_path?: string | null
          created_at?: string
          ended_on?: string | null
          github_repo_id?: number | null
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          live_url?: string | null
          position?: number
          repo_url?: string | null
          slug?: string
          source?: Database["public"]["Enums"]["project_source"]
          started_on?: string | null
          summary?: Json
          tech?: string[]
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_github_repo_id_fkey"
            columns: ["github_repo_id"]
            isOneToOne: true
            referencedRelation: "github_repos"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          content: Json
          id: string
          is_visible: boolean
          key: Database["public"]["Enums"]["section_key"]
          options: Json
          position: number
          updated_at: string
        }
        Insert: {
          content?: Json
          id?: string
          is_visible?: boolean
          key: Database["public"]["Enums"]["section_key"]
          options?: Json
          position?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          id?: string
          is_visible?: boolean
          key?: Database["public"]["Enums"]["section_key"]
          options?: Json
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          auto_publish_new_repos: boolean
          avatar_path: string | null
          cv_paths: Json
          github_username: string
          id: boolean
          last_github_sync_at: string | null
          og_image_path: string | null
          seo_description: Json
          seo_title: Json
          site_name: string
          updated_at: string
        }
        Insert: {
          auto_publish_new_repos?: boolean
          avatar_path?: string | null
          cv_paths?: Json
          github_username: string
          id?: boolean
          last_github_sync_at?: string | null
          og_image_path?: string | null
          seo_description?: Json
          seo_title?: Json
          site_name: string
          updated_at?: string
        }
        Update: {
          auto_publish_new_repos?: boolean
          avatar_path?: string | null
          cv_paths?: Json
          github_username?: string
          id?: boolean
          last_github_sync_at?: string | null
          og_image_path?: string | null
          seo_description?: Json
          seo_title?: Json
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_groups: {
        Row: {
          id: string
          is_visible: boolean
          name: Json
          position: number
          updated_at: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          name?: Json
          position?: number
          updated_at?: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          name?: Json
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          group_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          group_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          group_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "skill_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      contact_kind: "email" | "github" | "linkedin" | "x" | "website" | "other"
      experience_kind: "work" | "education"
      project_source: "github" | "custom"
      section_key:
        | "hero"
        | "about"
        | "projects"
        | "experience"
        | "skills"
        | "contact"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      contact_kind: ["email", "github", "linkedin", "x", "website", "other"],
      experience_kind: ["work", "education"],
      project_source: ["github", "custom"],
      section_key: [
        "hero",
        "about",
        "projects",
        "experience",
        "skills",
        "contact",
      ],
    },
  },
} as const

