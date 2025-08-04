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

// Network diagnostics function
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
  
  const tests = [];
  
  try {
    // Test 1: Basic connectivity to main URL
    console.log('Test 1: Basic connectivity...');
    const basicResponse = await fetch(supabaseUrl, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey || '',
      },
    });
    tests.push({ name: 'Basic connectivity', success: true, status: basicResponse.status });
    console.log('✅ Basic connectivity:', basicResponse.status, basicResponse.statusText);
    
    // Test 2: REST API endpoint
    console.log('Test 2: REST API endpoint...');
    const restResponse = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    tests.push({ name: 'REST API', success: true, status: restResponse.status });
    console.log('✅ REST API test:', restResponse.status, restResponse.statusText);
    
    // Test 3: Auth endpoint
    console.log('Test 3: Auth endpoint...');
    const authResponse = await fetch(supabaseUrl + '/auth/v1/settings', {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    tests.push({ name: 'Auth endpoint', success: true, status: authResponse.status });
    console.log('✅ Auth endpoint test:', authResponse.status, authResponse.statusText);
    
    // Test 4: Try a simple auth operation
    console.log('Test 4: Auth session check...');
    const sessionResponse = await supabase.auth.getSession();
    tests.push({ name: 'Session check', success: !sessionResponse.error, data: sessionResponse });
    console.log('✅ Session check:', sessionResponse.error ? 'Failed' : 'Success');
    
    return { success: true, tests };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    tests.push({ name: 'Connection test', success: false, error: errorMessage });
    return { success: false, error, tests };
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

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