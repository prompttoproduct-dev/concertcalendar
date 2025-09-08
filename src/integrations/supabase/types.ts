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
      concerts: {
        Row: {
          artist: string
          created_at: string | null
          date: string
          description: string | null
          external_id: string | null
          genres: string[] | null
          id: string
          image_url: string | null
          price: string
          source: Database["public"]["Enums"]["source_type"] | null
          ticket_url: string | null
          time: string | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          artist: string
          created_at?: string | null
          date: string
          description?: string | null
          external_id?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          price?: string
          source?: Database["public"]["Enums"]["source_type"] | null
          ticket_url?: string | null
          time?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          artist?: string
          created_at?: string | null
          date?: string
          description?: string | null
          external_id?: string | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          price?: string
          source?: Database["public"]["Enums"]["source_type"] | null
          ticket_url?: string | null
          time?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concerts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          client_ip: string
          created_at: string
          event_type: string
          id: string
          payload_summary: Json | null
          severity: string
          source: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          client_ip: string
          created_at?: string
          event_type: string
          id?: string
          payload_summary?: Json | null
          severity: string
          source: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          client_ip?: string
          created_at?: string
          event_type?: string
          id?: string
          payload_summary?: Json | null
          severity?: string
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          borough: Database["public"]["Enums"]["borough_type"]
          capacity: number | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          borough: Database["public"]["Enums"]["borough_type"]
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          borough?: Database["public"]["Enums"]["borough_type"]
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      borough_type:
        | "manhattan"
        | "brooklyn"
        | "queens"
        | "bronx"
        | "staten_island"
      source_type: "manual" | "ticketmaster" | "eventbrite"
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
      borough_type: [
        "manhattan",
        "brooklyn",
        "queens",
        "bronx",
        "staten_island",
      ],
      source_type: ["manual", "ticketmaster", "eventbrite"],
    },
  },
} as const
