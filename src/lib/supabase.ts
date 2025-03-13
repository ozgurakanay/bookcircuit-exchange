
import { createClient } from '@supabase/supabase-js';

// Create a default fallback for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQwNDU0MCwiZXhwIjoxOTI5NzY0NTQwfQ.CqR6-0JP5KVtVWNUQJPB4ia3On_CBLcvz_rCJO0bn-I';

// Log a warning in development but don't crash the app
if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && 
    (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    'Supabase credentials missing or using fallback values. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables for proper functionality.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
