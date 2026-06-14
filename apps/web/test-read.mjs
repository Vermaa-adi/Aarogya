import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'adityavrma123@gmail.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log("Auth error:", authError.message);
    return;
  }
  
  console.log("Logged in as:", authData.user.id);
  
  const { data, error } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();
    
  console.log("Profile:", data, "Error:", error);
}
run();
