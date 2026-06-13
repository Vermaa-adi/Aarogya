import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  // Sign in as the patient
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'adityavrma123@gmail.com',
    password: 'test1234'
  });
  
  if (authErr) {
    console.log("Auth error:", authErr.message);
    // Try another password
    const { data: auth2, error: authErr2 } = await supabase.auth.signInWithPassword({
      email: 'adityavrma123@gmail.com',
      password: 'password123'
    });
    if (authErr2) {
      console.log("Auth error2:", authErr2.message);
      return;
    }
    console.log("Logged in with password123:", auth2.user.id);
  } else {
    console.log("Logged in:", auth.user.id);
  }

  // Now try to read patient_profiles
  const { data: profile, error: profileErr } = await supabase
    .from('patient_profiles')
    .select('id, name')
    .eq('user_id', (auth?.user || {}).id || '8b4215ef-5dc6-4990-a949-25fbf5422e88')
    .single();
    
  console.log("Profile:", profile, "Error:", profileErr);
  
  // Also try to read users
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', (auth?.user || {}).id || '8b4215ef-5dc6-4990-a949-25fbf5422e88')
    .single();
    
  console.log("User:", userRow, "Error:", userErr);
}
run();
