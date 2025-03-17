import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client instance for the entire app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQwNDU0MCwiZXhwIjoxOTI5NzY0NTQwfQ.CqR6-0JP5KVtVWNUQJPB4ia3On_CBLcvz_rCJO0bn-I';

// Log a warning in development but don't crash the app
if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && 
    (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    'Supabase credentials missing or using fallback values. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables for proper functionality.'
  );
}

// Initialize a single Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simplified helper to verify database access
export const verifyDatabaseAccess = async () => {
  try {
    // Simple database test query
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Database access check failed:", error.message);
      return { 
        success: false, 
        message: "Database access failed. Please sign in again." 
      };
    }
    
    return { 
      success: true, 
      message: "Database access verified" 
    };
  } catch (error) {
    console.error("Error during database access check:", error);
    return { 
      success: false, 
      message: "Error checking database access" 
    };
  }
};

// Legacy function for backward compatibility
export const verifySessionWithServer = async () => {
  try {
    // Get current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return { valid: false, session: null, error: error?.message || 'No session' };
    }
    
    return { valid: true, session: data.session, error: null };
  } catch (error) {
    return { valid: false, session: null, error: String(error) };
  }
};
