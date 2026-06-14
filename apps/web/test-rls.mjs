import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create anon client, log in, and try to read
const anonClient = createClient(supabaseUrl, supabaseKey);
const adminClient = createClient(supabaseUrl, srk);

async function run() {
  const { data: { session } } = await anonClient.auth.signInWithPassword({
    email: 'adityavrma123@gmail.com',
    password: 'password123' // assuming this is it, but if we don't know the pass, we can use admin to get session
  });
  
  if (!session) {
    console.log("Could not log in");
    // Get policies via admin
    const { data: policies, error } = await adminClient.rpc('exec_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'patient_profiles';" });
    if (error) console.log(error);
    else console.log("Policies:", policies);
    return;
  }
  
  console.log("Logged in");
  const { data: profile, error } = await anonClient.from('patient_profiles').select('*').single();
  console.log("Profile read as anon:", profile, "Error:", error);
}
run();
