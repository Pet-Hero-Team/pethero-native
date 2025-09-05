export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      disease_tags: {
        Row: {
          created_at: string | null;
          id: string;
          tag_name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          tag_name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          tag_name?: string;
        };
        Relationships: [];
      };
      hospital_reviews: {
        Row: {
          content: string | null;
          created_at: string | null;
          hospital_id: string;
          id: string;
          rating: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          hospital_id: string;
          id?: string;
          rating: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          hospital_id?: string;
          id?: string;
          rating?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hospital_reviews_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          }
        ];
      };
      hospitals: {
        Row: {
          address: string | null;
          created_at: string | null;
          id: string;
          name: string;
          phone: string | null;
          rating: number | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          rating?: number | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          rating?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      hospitals_images: {
        Row: {
          created_at: string | null;
          hospital_id: string;
          id: string;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          hospital_id: string;
          id?: string;
          url: string;
        };
        Update: {
          created_at?: string | null;
          hospital_id?: string;
          id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hospitals_images_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_answers: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          pet_question_id: string;
          updated_at: string | null;
          vet_user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          pet_question_id: string;
          updated_at?: string | null;
          vet_user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          pet_question_id?: string;
          updated_at?: string | null;
          vet_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pet_answers_pet_question_id_fkey";
            columns: ["pet_question_id"];
            isOneToOne: false;
            referencedRelation: "pet_questions";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_health_records: {
        Row: {
          checkup_date: string;
          created_at: string | null;
          description: string | null;
          hospital_name: string | null;
          id: string;
          pet_id: string;
          updated_at: string | null;
        };
        Insert: {
          checkup_date: string;
          created_at?: string | null;
          description?: string | null;
          hospital_name?: string | null;
          id?: string;
          pet_id: string;
          updated_at?: string | null;
        };
        Update: {
          checkup_date?: string;
          created_at?: string | null;
          description?: string | null;
          hospital_name?: string | null;
          id?: string;
          pet_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pet_health_records_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_question_disease_tags: {
        Row: {
          created_at: string | null;
          disease_tag_id: string;
          id: string;
          pet_question_id: string;
        };
        Insert: {
          created_at?: string | null;
          disease_tag_id: string;
          id?: string;
          pet_question_id: string;
        };
        Update: {
          created_at?: string | null;
          disease_tag_id?: string;
          id?: string;
          pet_question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pet_question_disease_tags_disease_tag_id_fkey";
            columns: ["disease_tag_id"];
            isOneToOne: false;
            referencedRelation: "disease_tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pet_question_disease_tags_pet_question_id_fkey";
            columns: ["pet_question_id"];
            isOneToOne: false;
            referencedRelation: "pet_questions";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_question_images: {
        Row: {
          created_at: string | null;
          id: string;
          pet_question_id: string;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          pet_question_id: string;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          pet_question_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pet_question_images_pet_question_id_fkey";
            columns: ["pet_question_id"];
            isOneToOne: false;
            referencedRelation: "pet_questions";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_questions: {
        Row: {
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          created_at: string | null;
          description: string | null;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          description?: string | null;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          animal_type?: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          description?: string | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          birthday: string | null;
          category: Database["public"]["Enums"]["animal_type_enum"];
          created_at: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          birthday?: string | null;
          category: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          birthday?: string | null;
          category?: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          has_pet: boolean | null;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          has_pet?: boolean | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          has_pet?: boolean | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          address: string;
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          created_at: string | null;
          description: string | null;
          id: string;
          latitude: number;
          longitude: number;
          sighting_type: Database["public"]["Enums"]["sighting_type_enum"];
          title: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address: string;
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          description?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          sighting_type: Database["public"]["Enums"]["sighting_type_enum"];
          title: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string;
          animal_type?: Database["public"]["Enums"]["animal_type_enum"];
          created_at?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          sighting_type?: Database["public"]["Enums"]["sighting_type_enum"];
          title?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      reports_images: {
        Row: {
          created_at: string | null;
          id: string;
          report_id: string;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          report_id: string;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          report_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_images_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          }
        ];
      };
      rescue_tags: {
        Row: {
          created_at: string | null;
          id: string;
          rescue_id: string;
          tag_name: Database["public"]["Enums"]["tag_name_enum"];
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          rescue_id: string;
          tag_name: Database["public"]["Enums"]["tag_name_enum"];
        };
        Update: {
          created_at?: string | null;
          id?: string;
          rescue_id?: string;
          tag_name?: Database["public"]["Enums"]["tag_name_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "rescue_tags_rescue_id_fkey";
            columns: ["rescue_id"];
            isOneToOne: false;
            referencedRelation: "rescues";
            referencedColumns: ["id"];
          }
        ];
      };
      rescues: {
        Row: {
          address: string;
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          bounty: number | null;
          created_at: string | null;
          description: string | null;
          id: string;
          latitude: number;
          longitude: number;
          title: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address: string;
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          bounty?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          title: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string;
          animal_type?: Database["public"]["Enums"]["animal_type_enum"];
          bounty?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          title?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      rescues_images: {
        Row: {
          created_at: string | null;
          id: string;
          rescue_id: string;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          rescue_id: string;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          rescue_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rescues_images_rescue_id_fkey";
            columns: ["rescue_id"];
            isOneToOne: false;
            referencedRelation: "rescues";
            referencedColumns: ["id"];
          }
        ];
      };
      vet_review_tag_assignments: {
        Row: {
          created_at: string | null;
          id: string;
          vet_review_id: string;
          vet_review_tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          vet_review_id: string;
          vet_review_tag_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          vet_review_id?: string;
          vet_review_tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vet_review_tag_assignments_vet_review_id_fkey";
            columns: ["vet_review_id"];
            isOneToOne: false;
            referencedRelation: "vet_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vet_review_tag_assignments_vet_review_tag_id_fkey";
            columns: ["vet_review_tag_id"];
            isOneToOne: false;
            referencedRelation: "vet_review_tags";
            referencedColumns: ["id"];
          }
        ];
      };
      vet_review_tags: {
        Row: {
          created_at: string | null;
          id: string;
          tag_name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          tag_name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          tag_name?: string;
        };
        Relationships: [];
      };
      vet_reviews: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string;
          rating: number;
          updated_at: string | null;
          user_id: string;
          vet_user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          rating: number;
          updated_at?: string | null;
          user_id: string;
          vet_user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number;
          updated_at?: string | null;
          user_id?: string;
          vet_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vet_reviews_vet_user_id_fkey";
            columns: ["vet_user_id"];
            isOneToOne: false;
            referencedRelation: "vets";
            referencedColumns: ["user_id"];
          }
        ];
      };
      vets: {
        Row: {
          created_at: string | null;
          full_name: string;
          hospital_id: string | null;
          id: string;
          license_number: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          full_name: string;
          hospital_id?: string | null;
          id?: string;
          license_number?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          full_name?: string;
          hospital_id?: string | null;
          id?: string;
          license_number?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vets_hospital_id_fkey";
            columns: ["hospital_id"];
            isOneToOne: false;
            referencedRelation: "hospitals";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_reports_in_radius: {
        Args: { user_latitude: number; user_longitude: number };
        Returns: {
          id: string;
          title: string;
          description: string;
          address: string;
          animal_type: Database["public"]["Enums"]["animal_type_enum"];
          created_at: string;
          latitude: number;
          longitude: number;
          image: string;
          distance: number;
        }[];
      };
    };
    Enums: {
      animal_type_enum: "dog" | "cat" | "bird" | "minipet" | "reptile" | "other";
      image_type_enum: "report" | "rescue";
      sighting_type_enum: "sighted" | "protected";
      tag_name_enum: "겁이 많아요" | "장신구가 있어요" | "잡으려 하지 마세요" | "기타";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      animal_type_enum: ["dog", "cat", "bird", "minipet", "reptile", "other"],
      image_type_enum: ["report", "rescue"],
      sighting_type_enum: ["sighted", "protected"],
      tag_name_enum: ["겁이 많아요", "장신구가 있어요", "잡으려 하지 마세요", "기타"],
    },
  },
} as const;
