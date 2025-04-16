import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uycbvhdwhqeiukvhjfwr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y2J2aGR3aHFlaXVrdmhqZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTUzODcsImV4cCI6MjA2MDM3MTM4N30.mBxbSpMiMXUm22ecETx6E6aFARzB-C3IjSHD3MrjAjs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
