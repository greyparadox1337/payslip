import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client for most operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypassing RLS and auth, useful for server-side actions 
// like checking wallet JWTs or updating user lock statuses.
export const getServiceSupabase = () => {
  if (!supabaseServiceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, supabaseServiceKey);
};
