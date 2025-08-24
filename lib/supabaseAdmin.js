// lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key for admin privileges on the server
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Export a properly named admin client so server code can import it
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
