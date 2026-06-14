import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .update({ is_verified: true })
    .eq('name', 'Sanchit Mittal')
    .select();
    
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Successfully verified:", data);
  }
}
run();
