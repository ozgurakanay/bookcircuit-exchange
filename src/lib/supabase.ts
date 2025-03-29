import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Authentication will not work properly.');
}

// Create the Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    // Increase fetch timeout
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Create a separate client for profile queries with even shorter timeout
export const profileClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Helper function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Simple health check query that just checks auth
    const { data, error } = await supabase.auth.getSession();
    
    // If we get a response at all, connection is working
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};
