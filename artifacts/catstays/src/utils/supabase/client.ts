import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      catteries: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string;
          logo_url: string | null;
          website_settings: Record<string, unknown>;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['catteries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['catteries']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          cattery_id: string;
          name: string;
          type: string;
          description: string | null;
          price_per_night: number;
          max_cats: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          cattery_id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      cats: {
        Row: {
          id: string;
          customer_id: string;
          cattery_id: string;
          name: string;
          breed: string | null;
          age: string | null;
          photo_url: string | null;
          medical_notes: string | null;
          dietary_requirements: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cats']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cats']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          cattery_id: string;
          customer_id: string | null;
          room_id: string | null;
          check_in: string;
          check_out: string;
          status: string;
          payment_status: string;
          total_amount: number | null;
          deposit_amount: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          cattery_id: string;
          description: string;
          amount: number;
          category: string | null;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
    };
  };
};
