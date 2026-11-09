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
    PostgrestVersion: "14.15"
  }
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
      ai_credit_topups: {
        Row: {
          amount_usd: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          topped_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          topped_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          topped_at?: string
        }
        Relationships: []
      }
      ai_requests: {
        Row: {
          cache_read_tokens: number | null
          cache_write_tokens: number | null
          cost_usd: number | null
          created_at: string
          created_by: string | null
          duration_ms: number | null
          error: string | null
          id: string
          model: string
          quote_id: string | null
          request: Json | null
          response: Json | null
          step: string
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          model: string
          quote_id?: string | null
          request?: Json | null
          response?: Json | null
          step: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          model?: string
          quote_id?: string | null
          request?: Json | null
          response?: Json | null
          step?: string
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "v_quotes_list"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          ai_enabled: boolean
          ai_low_balance_usd: number
          battery_eff_lead: number
          battery_eff_lifepo4: number
          default_hsp: number
          default_iva_pct: number
          default_validity_days: number
          dod_lead: number
          dod_lifepo4: number
          id: number
          kwp_tolerance_pct: number
          number_prefix: string
          quote_footer: string | null
          quote_logo_mode: string
          quote_logo_url: string | null
          rate_mode: string
          system_efficiency: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_enabled?: boolean
          ai_low_balance_usd?: number
          battery_eff_lead?: number
          battery_eff_lifepo4?: number
          default_hsp?: number
          default_iva_pct?: number
          default_validity_days?: number
          dod_lead?: number
          dod_lifepo4?: number
          id?: number
          kwp_tolerance_pct?: number
          number_prefix?: string
          quote_footer?: string | null
          quote_logo_mode?: string
          quote_logo_url?: string | null
          rate_mode?: string
          system_efficiency?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_enabled?: boolean
          ai_low_balance_usd?: number
          battery_eff_lead?: number
          battery_eff_lifepo4?: number
          default_hsp?: number
          default_iva_pct?: number
          default_validity_days?: number
          dod_lead?: number
          dod_lifepo4?: number
          id?: number
          kwp_tolerance_pct?: number
          number_prefix?: string
          quote_footer?: string | null
          quote_logo_mode?: string
          quote_logo_url?: string | null
          rate_mode?: string
          system_efficiency?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      appliance_presets: {
        Row: {
          active: boolean
          hours_per_day: number
          id: string
          name: string
          sort_order: number
          use_factor: number
          watts: number
        }
        Insert: {
          active?: boolean
          hours_per_day: number
          id?: string
          name: string
          sort_order?: number
          use_factor?: number
          watts: number
        }
        Update: {
          active?: boolean
          hours_per_day?: number
          id?: string
          name?: string
          sort_order?: number
          use_factor?: number
          watts?: number
        }
        Relationships: []
      }
      assembly_rules: {
        Row: {
          active: boolean
          created_at: string
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string
          sort_order: number
          text: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          sort_order?: number
          text: string
        }
        Update: {
          active?: boolean
          created_at?: string
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          sort_order?: number
          text?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          cuit: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          cuit?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          cuit?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          active: boolean
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          province: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          province?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          province?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          fetched_at: string
          id: string
          notes: string | null
          source: string
          usd_to_ars: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          fetched_at?: string
          id?: string
          notes?: string | null
          source?: string
          usd_to_ars: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          fetched_at?: string
          id?: string
          notes?: string | null
          source?: string
          usd_to_ars?: number
        }
        Relationships: []
      }
      kit_items: {
        Row: {
          id: string
          kit_id: string
          product_id: string
          qty: number
          sort_order: number
        }
        Insert: {
          id?: string
          kit_id: string
          product_id: string
          qty: number
          sort_order?: number
        }
        Update: {
          id?: string
          kit_id?: string
          product_id?: string
          qty?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "v_kits_with_totals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_ars"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_options: {
        Row: {
          battery_kwh: number | null
          changes: Json
          code: string
          est_kwh_month: number | null
          id: string
          kind: string
          kit_id: string
          kwp: number | null
          name: string
          notes: string | null
          sort_order: number
        }
        Insert: {
          battery_kwh?: number | null
          changes?: Json
          code: string
          est_kwh_month?: number | null
          id?: string
          kind: string
          kit_id: string
          kwp?: number | null
          name: string
          notes?: string | null
          sort_order?: number
        }
        Update: {
          battery_kwh?: number | null
          changes?: Json
          code?: string
          est_kwh_month?: number | null
          id?: string
          kind?: string
          kit_id?: string
          kwp?: number | null
          name?: string
          notes?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_options_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_options_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "v_kits_with_totals"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          active: boolean
          battery_kwh: number
          battery_voltage: number | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          est_kwh_month: number | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"]
          id: string
          inverter_kw: number | null
          kwp: number
          name: string
          notes: string | null
          phases: string
          ref_kwh_month_max: number | null
          ref_kwh_month_min: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          battery_kwh?: number
          battery_voltage?: number | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          est_kwh_month?: number | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"]
          id?: string
          inverter_kw?: number | null
          kwp: number
          name: string
          notes?: string | null
          phases?: string
          ref_kwh_month_max?: number | null
          ref_kwh_month_min?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          battery_kwh?: number
          battery_voltage?: number | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          est_kwh_month?: number | null
          grid_type?: Database["public"]["Enums"]["grid_type_enum"]
          id?: string
          inverter_kw?: number | null
          kwp?: number
          name?: string
          notes?: string | null
          phases?: string
          ref_kwh_month_max?: number | null
          ref_kwh_month_min?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      price_imports: {
        Row: {
          codes_not_found: Json
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          rows_total: number
          rows_unchanged: number
          rows_updated: number
        }
        Insert: {
          codes_not_found?: Json
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          rows_total?: number
          rows_unchanged?: number
          rows_updated?: number
        }
        Update: {
          codes_not_found?: Json
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          rows_total?: number
          rows_unchanged?: number
          rows_updated?: number
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          prefix: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          prefix?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          prefix?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string | null
          description: string | null
          generic_properties: Json | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string
          name: string
          price_updated_at: string | null
          price_usd: number
          product_code: string
          short_desc: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          generic_properties?: Json | null
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          name: string
          price_updated_at?: string | null
          price_usd?: number
          product_code: string
          short_desc?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          generic_properties?: Json | null
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          name?: string
          price_updated_at?: string | null
          price_usd?: number
          product_code?: string
          short_desc?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          code: string
          description: string
          id: string
          product_id: string | null
          qty: number
          quote_id: string
          sort_order: number
          subtotal_usd: number | null
          unit_price_usd: number
        }
        Insert: {
          code: string
          description: string
          id?: string
          product_id?: string | null
          qty: number
          quote_id: string
          sort_order?: number
          subtotal_usd?: number | null
          unit_price_usd?: number
        }
        Update: {
          code?: string
          description?: string
          id?: string
          product_id?: string | null
          qty?: number
          quote_id?: string
          sort_order?: number
          subtotal_usd?: number | null
          unit_price_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_ars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "v_quotes_list"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          ai_summary: Json | null
          client_id: string
          client_notes: string | null
          created_at: string
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string
          input: Json
          is_current: boolean
          issued_at: string | null
          issued_by: string | null
          iva_pct: number
          iva_usd: number | null
          kit_id: string | null
          notes: string | null
          number: number | null
          pdf_path: string | null
          rate_date: string | null
          rate_source: string | null
          revision: number
          seller_id: string | null
          sizing: Json | null
          source_quote_id: string | null
          status: string
          subtotal_usd: number | null
          total_ars: number | null
          total_usd: number | null
          updated_at: string
          usd_ars: number | null
          valid_until: string | null
        }
        Insert: {
          ai_summary?: Json | null
          client_id: string
          client_notes?: string | null
          created_at?: string
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          input?: Json
          is_current?: boolean
          issued_at?: string | null
          issued_by?: string | null
          iva_pct?: number
          iva_usd?: number | null
          kit_id?: string | null
          notes?: string | null
          number?: number | null
          pdf_path?: string | null
          rate_date?: string | null
          rate_source?: string | null
          revision?: number
          seller_id?: string | null
          sizing?: Json | null
          source_quote_id?: string | null
          status?: string
          subtotal_usd?: number | null
          total_ars?: number | null
          total_usd?: number | null
          updated_at?: string
          usd_ars?: number | null
          valid_until?: string | null
        }
        Update: {
          ai_summary?: Json | null
          client_id?: string
          client_notes?: string | null
          created_at?: string
          grid_type?: Database["public"]["Enums"]["grid_type_enum"] | null
          id?: string
          input?: Json
          is_current?: boolean
          issued_at?: string | null
          issued_by?: string | null
          iva_pct?: number
          iva_usd?: number | null
          kit_id?: string | null
          notes?: string | null
          number?: number | null
          pdf_path?: string | null
          rate_date?: string | null
          rate_source?: string | null
          revision?: number
          seller_id?: string | null
          sizing?: Json | null
          source_quote_id?: string | null
          status?: string
          subtotal_usd?: number | null
          total_ars?: number | null
          total_usd?: number | null
          updated_at?: string
          usd_ars?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "v_kits_with_totals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "v_quotes_list"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          active: boolean
          created_at: string | null
          description: string | null
          id: string
          metadata: Json
          name: string
          permissions: Json
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          permissions?: Json
        }
        Update: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      solar_zones: {
        Row: {
          hsp_horizontal: number
          hsp_optimal: number
          id: string
          kind: string
          latitude: number | null
          name: string
          notes: string | null
          optimal_angle: number | null
          province: string
          sort_order: number
        }
        Insert: {
          hsp_horizontal: number
          hsp_optimal: number
          id?: string
          kind?: string
          latitude?: number | null
          name: string
          notes?: string | null
          optimal_angle?: number | null
          province: string
          sort_order?: number
        }
        Update: {
          hsp_horizontal?: number
          hsp_optimal?: number
          id?: string
          kind?: string
          latitude?: number | null
          name?: string
          notes?: string | null
          optimal_angle?: number | null
          province?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          home_page: string
          id: string
          notifications_enabled: boolean
          phone: string | null
          preferred_currency: string
          role_id: string
          theme: string | null
          timezone: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          home_page?: string
          id: string
          notifications_enabled?: boolean
          phone?: string | null
          preferred_currency?: string
          role_id: string
          theme?: string | null
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          home_page?: string
          id?: string
          notifications_enabled?: boolean
          phone?: string | null
          preferred_currency?: string
          role_id?: string
          theme?: string | null
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_ai_requests_list: {
        Row: {
          cache_read_tokens: number | null
          cache_write_tokens: number | null
          client_name: string | null
          cost_usd: number | null
          created_at: string | null
          created_by: string | null
          duration_ms: number | null
          error: string | null
          id: string | null
          model: string | null
          quote_id: string | null
          quote_number: string | null
          step: string | null
          tokens_in: number | null
          tokens_out: number | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "v_quotes_list"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ai_usage_summary: {
        Row: {
          balance_usd: number | null
          errors_count: number | null
          last_topup_at: string | null
          requests_count: number | null
          requests_month: number | null
          spent_month_usd: number | null
          spent_usd: number | null
          topups_usd: number | null
        }
        Relationships: []
      }
      v_clients_list: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          created_by: string | null
          cuit: string | null
          email: string | null
          id: string | null
          issued_count: number | null
          last_quote_at: string | null
          name: string | null
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          quotes_count: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_kits_with_totals: {
        Row: {
          active: boolean | null
          battery_kwh: number | null
          battery_voltage: number | null
          code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          est_kwh_month: number | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string | null
          inverter_kw: number | null
          items_count: number | null
          items_without_price: number | null
          kwp: number | null
          name: string | null
          notes: string | null
          phases: string | null
          ref_kwh_month_max: number | null
          ref_kwh_month_min: number | null
          sort_order: number | null
          total_usd: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_products_with_ars: {
        Row: {
          active: boolean | null
          category_id: string | null
          category_name: string | null
          category_prefix: string | null
          created_at: string | null
          current_exchange_rate: number | null
          description: string | null
          exchange_rate_date: string | null
          generic_properties: Json | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string | null
          name: string | null
          price_ars: number | null
          price_updated_at: string | null
          price_usd: number | null
          product_code: string | null
          short_desc: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      v_quotes_list: {
        Row: {
          ai_cost_usd: number | null
          ai_requests_count: number | null
          client_city: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          display_number: string | null
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string | null
          is_current: boolean | null
          issued_at: string | null
          items_count: number | null
          iva_pct: number | null
          kit_code: string | null
          kit_id: string | null
          kit_name: string | null
          number: number | null
          revision: number | null
          seller_id: string | null
          source_quote_id: string | null
          status: string | null
          subtotal_usd: number | null
          total_ars: number | null
          total_usd: number | null
          updated_at: string | null
          usd_ars: number | null
          valid_until: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "v_kits_with_totals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "v_quotes_list"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activate_user: { Args: { user_id: string }; Returns: undefined }
      apply_price_import: {
        Args: { p_file_name: string; p_rows: Json }
        Returns: Json
      }
      assert_active_user: { Args: never; Returns: undefined }
      create_quote_from_kit: {
        Args: {
          p_ai_summary?: Json
          p_client_id: string
          p_input?: Json
          p_kit_id: string
          p_option_codes?: string[]
          p_sizing?: Json
        }
        Returns: string
      }
      create_quote_revision: { Args: { p_quote_id: string }; Returns: string }
      current_exchange_rate: {
        Args: never
        Returns: {
          fetched_at: string
          id: string
          rate_date: string
          source: string
          usd_to_ars: number
        }[]
      }
      deactivate_user: { Args: { user_id: string }; Returns: undefined }
      duplicate_quote: {
        Args: { p_client_id?: string; p_quote_id: string }
        Returns: string
      }
      find_clients_by_phone: {
        Args: { p_exclude_id?: string; p_phone: string }
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          cuit: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_role: { Args: never; Returns: string }
      has_permission: {
        Args: { action: string; module: string }
        Returns: boolean
      }
      is_active_user: { Args: never; Returns: boolean }
      issue_quote: {
        Args: { p_iva_pct?: number; p_quote_id: string }
        Returns: {
          ai_summary: Json | null
          client_id: string
          client_notes: string | null
          created_at: string
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string
          input: Json
          is_current: boolean
          issued_at: string | null
          issued_by: string | null
          iva_pct: number
          iva_usd: number | null
          kit_id: string | null
          notes: string | null
          number: number | null
          pdf_path: string | null
          rate_date: string | null
          rate_source: string | null
          revision: number
          seller_id: string | null
          sizing: Json | null
          source_quote_id: string | null
          status: string
          subtotal_usd: number | null
          total_ars: number | null
          total_usd: number | null
          updated_at: string
          usd_ars: number | null
          valid_until: string | null
        }
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      kit_bom: {
        Args: { p_kit_id: string; p_option_codes?: string[] }
        Returns: {
          name: string
          price_usd: number
          product_code: string
          product_id: string
          qty: number
          sort_order: number
        }[]
      }
      link_ai_requests: {
        Args: { p_ids: string[]; p_quote_id: string }
        Returns: number
      }
      merge_clients: {
        Args: { p_keep_id: string; p_merge_ids: string[] }
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          cuit: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_phone: { Args: { phone: string }; Returns: string }
      normalize_product_code: { Args: { code: string }; Returns: string }
      product_usage: { Args: { p_product_id: string }; Returns: Json }
      quote_display_number: {
        Args: { q: Database["public"]["Tables"]["quotes"]["Row"] }
        Returns: string
      }
      save_quote_draft: {
        Args: { p_items: Json; p_patch: Json; p_quote_id: string }
        Returns: {
          ai_summary: Json | null
          client_id: string
          client_notes: string | null
          created_at: string
          grid_type: Database["public"]["Enums"]["grid_type_enum"] | null
          id: string
          input: Json
          is_current: boolean
          issued_at: string | null
          issued_by: string | null
          iva_pct: number
          iva_usd: number | null
          kit_id: string | null
          notes: string | null
          number: number | null
          pdf_path: string | null
          rate_date: string | null
          rate_source: string | null
          revision: number
          seller_id: string | null
          sizing: Json | null
          source_quote_id: string | null
          status: string
          subtotal_usd: number | null
          total_ars: number | null
          total_usd: number | null
          updated_at: string
          usd_ars: number | null
          valid_until: string | null
        }
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_my_theme: { Args: { p_theme: string }; Returns: undefined }
      suggest_kit_candidates: {
        Args: {
          p_battery_kwh?: number
          p_grid_type: Database["public"]["Enums"]["grid_type_enum"]
          p_kwp: number
          p_limit?: number
          p_phases?: string
        }
        Returns: {
          battery_kwh: number
          code: string
          est_kwh_month: number
          grid_type: Database["public"]["Enums"]["grid_type_enum"]
          inverter_kw: number
          items_without_price: number
          kit_id: string
          kwp: number
          kwp_diff_pct: number
          name: string
          phases: string
          total_usd: number
          within_tolerance: boolean
        }[]
      }
    }
    Enums: {
      grid_type_enum: "ON-GRID" | "OFF-GRID" | "HYBRID"
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
      grid_type_enum: ["ON-GRID", "OFF-GRID", "HYBRID"],
    },
  },
} as const
