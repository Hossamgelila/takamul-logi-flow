export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: string;
          filename: string;
          id: string;
          is_deleted: boolean;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: string;
          filename: string;
          id?: string;
          is_deleted?: boolean;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          filename?: string;
          id?: string;
          is_deleted?: boolean;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          base_currency: string;
          country: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          legal_name: string;
          trade_name: string | null;
          updated_at: string;
          vat_enabled: boolean;
        };
        Insert: {
          base_currency?: string;
          country?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          legal_name: string;
          trade_name?: string | null;
          updated_at?: string;
          vat_enabled?: boolean;
        };
        Update: {
          base_currency?: string;
          country?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          legal_name?: string;
          trade_name?: string | null;
          updated_at?: string;
          vat_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'companies_base_currency_fkey';
            columns: ['base_currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
        ];
      };
      currencies: {
        Row: {
          code: string;
          created_at: string;
          is_active: boolean;
          is_deleted: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          is_active?: boolean;
          is_deleted?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          is_active?: boolean;
          is_deleted?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          address: string | null;
          contact: string | null;
          country: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_deleted: boolean;
          name: string;
          phone: string | null;
          trn_vat_no: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          contact?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_deleted?: boolean;
          name: string;
          phone?: string | null;
          trn_vat_no?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          contact?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_deleted?: boolean;
          name?: string;
          phone?: string | null;
          trn_vat_no?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exchange_rates: {
        Row: {
          created_at: string;
          from_currency: string;
          id: string;
          is_deleted: boolean;
          rate: number;
          to_currency: string;
          updated_at: string;
          valid_from: string;
        };
        Insert: {
          created_at?: string;
          from_currency: string;
          id?: string;
          is_deleted?: boolean;
          rate: number;
          to_currency: string;
          updated_at?: string;
          valid_from?: string;
        };
        Update: {
          created_at?: string;
          from_currency?: string;
          id?: string;
          is_deleted?: boolean;
          rate?: number;
          to_currency?: string;
          updated_at?: string;
          valid_from?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exchange_rates_from_currency_fkey';
            columns: ['from_currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'exchange_rates_to_currency_fkey';
            columns: ['to_currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
        ];
      };
      expenses: {
        Row: {
          amount_foreign: number;
          amount_omr: number | null;
          category: string;
          created_at: string;
          currency: string;
          date: string;
          description: string | null;
          fx_rate_to_omr: number | null;
          id: string;
          is_deleted: boolean;
          is_pass_through: boolean;
          linked_invoice_id: string | null;
          trailer_id: string | null;
          truck_id: string | null;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          amount_foreign: number;
          amount_omr?: number | null;
          category: string;
          created_at?: string;
          currency?: string;
          date?: string;
          description?: string | null;
          fx_rate_to_omr?: number | null;
          id?: string;
          is_deleted?: boolean;
          is_pass_through?: boolean;
          linked_invoice_id?: string | null;
          trailer_id?: string | null;
          truck_id?: string | null;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          amount_foreign?: number;
          amount_omr?: number | null;
          category?: string;
          created_at?: string;
          currency?: string;
          date?: string;
          description?: string | null;
          fx_rate_to_omr?: number | null;
          id?: string;
          is_deleted?: boolean;
          is_pass_through?: boolean;
          linked_invoice_id?: string | null;
          trailer_id?: string | null;
          truck_id?: string | null;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_currency_fkey';
            columns: ['currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'expenses_linked_invoice_id_fkey';
            columns: ['linked_invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_linked_invoice_id_fkey';
            columns: ['linked_invoice_id'];
            isOneToOne: false;
            referencedRelation: 'v_invoice_totals';
            referencedColumns: ['invoice_id'];
          },
          {
            foreignKeyName: 'expenses_trailer_id_fkey';
            columns: ['trailer_id'];
            isOneToOne: false;
            referencedRelation: 'trailers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'trucks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'v_truck_performance';
            referencedColumns: ['truck_id'];
          },
          {
            foreignKeyName: 'expenses_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_elements_lookup: {
        Row: {
          category: string;
          code: string;
          created_at: string;
          default_tax_rate: number;
          id: string;
          is_deleted: boolean;
          label: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          code: string;
          created_at?: string;
          default_tax_rate?: number;
          id?: string;
          is_deleted?: boolean;
          label: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          code?: string;
          created_at?: string;
          default_tax_rate?: number;
          id?: string;
          is_deleted?: boolean;
          label?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          amount_foreign: number | null;
          amount_omr: number | null;
          created_at: string;
          currency: string | null;
          description: string | null;
          element_id: string;
          id: string;
          invoice_id: string;
          is_deleted: boolean;
          is_pass_through: boolean | null;
          qty: number;
          tax_rate: number;
          trailer_id: string | null;
          truck_id: string | null;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          amount_foreign?: number | null;
          amount_omr?: number | null;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          element_id: string;
          id?: string;
          invoice_id: string;
          is_deleted?: boolean;
          is_pass_through?: boolean | null;
          qty?: number;
          tax_rate?: number;
          trailer_id?: string | null;
          truck_id?: string | null;
          unit_price?: number;
          updated_at?: string;
        };
        Update: {
          amount_foreign?: number | null;
          amount_omr?: number | null;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          element_id?: string;
          id?: string;
          invoice_id?: string;
          is_deleted?: boolean;
          is_pass_through?: boolean | null;
          qty?: number;
          tax_rate?: number;
          trailer_id?: string | null;
          truck_id?: string | null;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_items_currency_fkey';
            columns: ['currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'invoice_items_element_id_fkey';
            columns: ['element_id'];
            isOneToOne: false;
            referencedRelation: 'invoice_elements_lookup';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'v_invoice_totals';
            referencedColumns: ['invoice_id'];
          },
          {
            foreignKeyName: 'invoice_items_trailer_id_fkey';
            columns: ['trailer_id'];
            isOneToOne: false;
            referencedRelation: 'trailers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_items_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'trucks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_items_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'v_truck_performance';
            referencedColumns: ['truck_id'];
          },
        ];
      };
      invoices: {
        Row: {
          created_at: string;
          currency: string;
          customer_id: string;
          due_date: string | null;
          fx_rate_to_omr: number | null;
          id: string;
          invoice_no: string;
          is_deleted: boolean;
          issue_date: string;
          notes: string | null;
          status: string;
          trip_mirror_reference_number: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          customer_id: string;
          due_date?: string | null;
          fx_rate_to_omr?: number | null;
          id?: string;
          invoice_no: string;
          is_deleted?: boolean;
          issue_date?: string;
          notes?: string | null;
          status?: string;
          trip_mirror_reference_number?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          customer_id?: string;
          due_date?: string | null;
          fx_rate_to_omr?: number | null;
          id?: string;
          invoice_no?: string;
          is_deleted?: boolean;
          issue_date?: string;
          notes?: string | null;
          status?: string;
          trip_mirror_reference_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_currency_fkey';
            columns: ['currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_trip_mirror_reference_number_fkey';
            columns: ['trip_mirror_reference_number'];
            isOneToOne: false;
            referencedRelation: 'trip_mirror';
            referencedColumns: ['reference_number'];
          },
        ];
      };
      maintenance_orders: {
        Row: {
          closed_at: string | null;
          created_at: string;
          id: string;
          is_deleted: boolean;
          mo_no: string;
          notes: string | null;
          opened_at: string;
          status: string;
          total_cost_omr: number | null;
          trailer_id: string | null;
          truck_id: string | null;
          type: string;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          mo_no: string;
          notes?: string | null;
          opened_at?: string;
          status?: string;
          total_cost_omr?: number | null;
          trailer_id?: string | null;
          truck_id?: string | null;
          type: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          mo_no?: string;
          notes?: string | null;
          opened_at?: string;
          status?: string;
          total_cost_omr?: number | null;
          trailer_id?: string | null;
          truck_id?: string | null;
          type?: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_orders_trailer_id_fkey';
            columns: ['trailer_id'];
            isOneToOne: false;
            referencedRelation: 'trailers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_orders_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'trucks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_orders_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'v_truck_performance';
            referencedColumns: ['truck_id'];
          },
          {
            foreignKeyName: 'maintenance_orders_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      receipts: {
        Row: {
          amount_foreign: number;
          amount_omr: number;
          created_at: string;
          currency: string;
          customer_id: string;
          date: string;
          id: string;
          invoice_id: string | null;
          is_deleted: boolean;
          method: string | null;
          ref: string | null;
          updated_at: string;
        };
        Insert: {
          amount_foreign: number;
          amount_omr: number;
          created_at?: string;
          currency?: string;
          customer_id: string;
          date?: string;
          id?: string;
          invoice_id?: string | null;
          is_deleted?: boolean;
          method?: string | null;
          ref?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_foreign?: number;
          amount_omr?: number;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          date?: string;
          id?: string;
          invoice_id?: string | null;
          is_deleted?: boolean;
          method?: string | null;
          ref?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'receipts_currency_fkey';
            columns: ['currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'receipts_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'receipts_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'receipts_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'v_invoice_totals';
            referencedColumns: ['invoice_id'];
          },
        ];
      };
      routes: {
        Row: {
          created_at: string;
          distance_km: number;
          estimated_duration_hours: number | null;
          from_country: string;
          from_place: string;
          id: string;
          is_active: boolean;
          is_deleted: boolean;
          name: string;
          notes: string | null;
          route_type: string | null;
          to_country: string;
          to_place: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          distance_km?: number;
          estimated_duration_hours?: number | null;
          from_country?: string;
          from_place: string;
          id?: string;
          is_active?: boolean;
          is_deleted?: boolean;
          name: string;
          notes?: string | null;
          route_type?: string | null;
          to_country?: string;
          to_place: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          distance_km?: number;
          estimated_duration_hours?: number | null;
          from_country?: string;
          from_place?: string;
          id?: string;
          is_active?: boolean;
          is_deleted?: boolean;
          name?: string;
          notes?: string | null;
          route_type?: string | null;
          to_country?: string;
          to_place?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trailers: {
        Row: {
          active: boolean;
          capacity_tons: number | null;
          created_at: string;
          id: string;
          is_deleted: boolean;
          ownership: string;
          plate_no: string;
          type: string | null;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          capacity_tons?: number | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          ownership: string;
          plate_no: string;
          type?: string | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          capacity_tons?: number | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          ownership?: string;
          plate_no?: string;
          type?: string | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trailers_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_mirror: {
        Row: {
          cargo_type: string | null;
          container_number: string | null;
          created_at: string;
          customer_id: string | null;
          driver_name: string | null;
          end_date: string | null;
          id: string;
          is_deleted: boolean;
          is_invoiced: boolean;
          km_distance: number | null;
          notes: string | null;
          reference_number: string;
          route_id: string | null;
          start_date: string | null;
          status: string;
          trailer_id: string | null;
          truck_id: string | null;
          updated_at: string;
          weight_tons: number | null;
        };
        Insert: {
          cargo_type?: string | null;
          container_number?: string | null;
          created_at?: string;
          customer_id?: string | null;
          driver_name?: string | null;
          end_date?: string | null;
          id?: string;
          is_deleted?: boolean;
          is_invoiced?: boolean;
          km_distance?: number | null;
          notes?: string | null;
          reference_number: string;
          route_id?: string | null;
          start_date?: string | null;
          status?: string;
          trailer_id?: string | null;
          truck_id?: string | null;
          updated_at?: string;
          weight_tons?: number | null;
        };
        Update: {
          cargo_type?: string | null;
          container_number?: string | null;
          created_at?: string;
          customer_id?: string | null;
          driver_name?: string | null;
          end_date?: string | null;
          id?: string;
          is_deleted?: boolean;
          is_invoiced?: boolean;
          km_distance?: number | null;
          notes?: string | null;
          reference_number?: string;
          route_id?: string | null;
          start_date?: string | null;
          status?: string;
          trailer_id?: string | null;
          truck_id?: string | null;
          updated_at?: string;
          weight_tons?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_mirror_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_mirror_route_id_fkey';
            columns: ['route_id'];
            isOneToOne: false;
            referencedRelation: 'routes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_mirror_trailer_id_fkey';
            columns: ['trailer_id'];
            isOneToOne: false;
            referencedRelation: 'trailers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_mirror_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'trucks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_mirror_truck_id_fkey';
            columns: ['truck_id'];
            isOneToOne: false;
            referencedRelation: 'v_truck_performance';
            referencedColumns: ['truck_id'];
          },
        ];
      };
      trucks: {
        Row: {
          active: boolean;
          capacity_tons: number | null;
          created_at: string;
          id: string;
          is_deleted: boolean;
          make: string | null;
          model: string | null;
          ownership: string;
          plate_no: string;
          updated_at: string;
          vendor_id: string | null;
          year: number | null;
        };
        Insert: {
          active?: boolean;
          capacity_tons?: number | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          make?: string | null;
          model?: string | null;
          ownership: string;
          plate_no: string;
          updated_at?: string;
          vendor_id?: string | null;
          year?: number | null;
        };
        Update: {
          active?: boolean;
          capacity_tons?: number | null;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          make?: string | null;
          model?: string | null;
          ownership?: string;
          plate_no?: string;
          updated_at?: string;
          vendor_id?: string | null;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trucks_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database['public']['Enums']['app_role'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database['public']['Enums']['app_role'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['app_role'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          address: string | null;
          contact: string | null;
          country: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_deleted: boolean;
          name: string;
          phone: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          contact?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_deleted?: boolean;
          name: string;
          phone?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          contact?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_deleted?: boolean;
          name?: string;
          phone?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_invoice_totals: {
        Row: {
          balance_omr: number | null;
          currency: string | null;
          customer_id: string | null;
          fx_rate_to_omr: number | null;
          invoice_id: string | null;
          invoice_no: string | null;
          pass_through_omr: number | null;
          receipts_omr: number | null;
          revenue_omr: number | null;
          total_omr: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_currency_fkey';
            columns: ['currency'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      v_truck_performance: {
        Row: {
          direct_expenses_omr: number | null;
          net_margin_omr: number | null;
          plate_no: string | null;
          revenue_omr: number | null;
          truck_id: string | null;
        };
        Insert: {
          direct_expenses_omr?: never;
          net_margin_omr?: never;
          plate_no?: string | null;
          revenue_omr?: never;
          truck_id?: string | null;
        };
        Update: {
          direct_expenses_omr?: never;
          net_margin_omr?: never;
          plate_no?: string | null;
          revenue_omr?: never;
          truck_id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_latest_rate: {
        Args: { p_from: string; p_to: string };
        Returns: number;
      };
      grant_admin_by_email: {
        Args: { p_email: string };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database['public']['Enums']['app_role'];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'admin' | 'moderator' | 'user';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ['admin', 'moderator', 'user'],
    },
  },
} as const;
