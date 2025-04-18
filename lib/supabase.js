import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdgzvbrlihkfspppddbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZ3p2YnJsaWhrZnNwcHBkZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NzkzODgsImV4cCI6MjA2MDU1NTM4OH0.HL1JfgELNNv_XaupXe5hJOdziJ0B4RxPI_OsNlhA7BQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
