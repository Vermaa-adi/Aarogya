import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/Users/adityaverma/Desktop/Aarogya/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log("Users:", users.users.map(u => ({ id: u.id, email: u.email })));

  const { data: profiles } = await supabase.from('patient_profiles').select('*');
  console.log("Patient Profiles:", profiles);

  const { data: userRows } = await supabase.from('users').select('*');
  console.log("Public Users:", userRows);
}
run();
