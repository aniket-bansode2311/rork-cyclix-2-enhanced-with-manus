import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables check:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing');
  console.error('');
  console.error('🔧 Quick Fix:');
  console.error('1. Open the .env file in your project root');
  console.error('2. Replace the placeholder values with your actual Supabase credentials');
  console.error('3. Restart your development server');
  console.error('4. See QUICK_FIX_GUIDE.md for detailed instructions');
  
  throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          average_cycle_length: number;
          average_period_length: number;
          last_period_start: string | null;
          is_pregnancy_mode: boolean;
          birth_control_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          average_cycle_length?: number;
          average_period_length?: number;
          last_period_start?: string | null;
          is_pregnancy_mode?: boolean;
          birth_control_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          average_cycle_length?: number;
          average_period_length?: number;
          last_period_start?: string | null;
          is_pregnancy_mode?: boolean;
          birth_control_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cycles: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string | null;
          length: number | null;
          period_length: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date?: string | null;
          length?: number | null;
          period_length?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string | null;
          length?: number | null;
          period_length?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      period_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          flow: 'light' | 'medium' | 'heavy' | 'spotting';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          flow: 'light' | 'medium' | 'heavy' | 'spotting';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          flow?: 'light' | 'medium' | 'heavy' | 'spotting';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      symptom_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          symptom_id: string;
          intensity: number | null;
          custom_value: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          symptom_id: string;
          intensity?: number | null;
          custom_value?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          symptom_id?: string;
          intensity?: number | null;
          custom_value?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};